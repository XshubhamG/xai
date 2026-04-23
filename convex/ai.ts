"use node";

import { createOpenAI } from "@ai-sdk/openai";
import { generateText, type ModelMessage } from "ai";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { api, internal } from "./_generated/api";
import { action, type ActionCtx } from "./_generated/server";

const USER_TEXT_MAX = 32_000;
const HISTORY_LIMIT = 36;
const DEFAULT_CHAT_TITLE = "New chat";

export const completeTurn = action({
  args: {
    chatId: v.id("chats"),
    userText: v.string(),
    imageStorageIds: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.subject) {
      throw new Error("Unauthorized");
    }
    const userId = identity.subject;
    const trimmed = args.userText.trim();
    const hasImages = Boolean(args.imageStorageIds?.length);
    if (!trimmed && !hasImages) {
      throw new Error("Message required");
    }
    if (trimmed.length > USER_TEXT_MAX) {
      throw new Error("Message too long");
    }

    const displayText = trimmed || "(attachment)";

    await ctx.runMutation(internal.messages.insertUser, {
      userId,
      chatId: args.chatId,
      text: displayText,
      imageStorageIds: args.imageStorageIds,
    });

    const settings = await ctx.runQuery(api.settings.get, {});
    const history = await ctx.runQuery(internal.messages.listForModel, {
      userId,
      chatId: args.chatId,
      limit: HISTORY_LIMIT,
    });
    const chat = await ctx.runQuery(api.chats.get, { chatId: args.chatId });

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      await ctx.runMutation(internal.messages.insertAssistant, {
        userId,
        chatId: args.chatId,
        text:
          "Add OPENROUTER_API_KEY in the Convex dashboard (this deployment’s environment) to enable replies.",
      });
      return { ok: false as const, reason: "missing_api_key" };
    }

    const openrouter = createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
      headers: {
        "HTTP-Referer": process.env.SITE_URL ?? "http://localhost:3000",
        "X-Title": "xai",
      },
    });

    const modelId = settings.modelId ?? "openai/gpt-4o-mini";

    const system = [
      settings.systemPrompt,
      "",
      `Personality / tone: ${settings.personality}`,
    ].join("\n");

    const imageUrls = args.imageStorageIds?.length
      ? await ctx.runQuery(internal.files.listOwnedStorageUrls, {
          userId,
          storageIds: args.imageStorageIds,
        })
      : [];

    const modelMessages: ModelMessage[] = [];

    for (let i = 0; i < history.length; i++) {
      const m = history[i]!;
      const isLast = i === history.length - 1;
      if (m.role === "system") {
        continue;
      }
      if (m.role === "assistant") {
        modelMessages.push({
          role: "assistant",
          content: m.text,
        });
        continue;
      }
      if (m.role === "user") {
        if (isLast && imageUrls.length > 0) {
          const content: Array<
            | { type: "text"; text: string }
            | { type: "image"; image: URL }
          > = [];
          if (trimmed) {
            content.push({ type: "text", text: trimmed });
          }
          for (const u of imageUrls) {
            content.push({ type: "image", image: new URL(u) });
          }
          modelMessages.push({
            role: "user",
            content: content.length ? content : [{ type: "text", text: " " }],
          });
        } else {
          modelMessages.push({
            role: "user",
            content: m.text,
          });
        }
      }
    }

    try {
      const result = await generateText({
        model: openrouter.chat(modelId),
        system,
        messages: modelMessages,
        maxOutputTokens: 4096,
      });
      await ctx.runMutation(internal.messages.insertAssistant, {
        userId,
        chatId: args.chatId,
        text: result.text,
      });
      if (chat?.title === DEFAULT_CHAT_TITLE) {
        await maybeGenerateChatTitle({
          ctx,
          chatId: args.chatId,
          openrouter,
          modelId,
          userText: trimmed || displayText,
          assistantText: result.text,
        });
      }
      return { ok: true as const };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Model request failed.";
      await ctx.runMutation(internal.messages.insertAssistant, {
        userId,
        chatId: args.chatId,
        text: `Error: ${message}`,
      });
      return { ok: false as const, reason: "model_error" as const };
    }
  },
});

async function maybeGenerateChatTitle({
  ctx,
  chatId,
  openrouter,
  modelId,
  userText,
  assistantText,
}: {
  ctx: ActionCtx;
  chatId: Id<"chats">;
  openrouter: ReturnType<typeof createOpenAI>;
  modelId: string;
  userText: string;
  assistantText: string;
}) {
  try {
    const result = await generateText({
      model: openrouter.chat(modelId),
      system:
        "Write a concise chat title using 3 to 6 words. No quotes. No trailing punctuation.",
      messages: [
        {
          role: "user",
          content: `User message:\n${userText}\n\nAssistant reply:\n${assistantText}`,
        },
      ],
      maxOutputTokens: 24,
    });

    const title = result.text
      .replace(/["']/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80);

    if (!title) {
      return;
    }

    await ctx.runMutation(api.chats.updateTitle, {
      chatId,
      title,
    });
  } catch {
    // Title generation should never break the main reply flow.
  }
}

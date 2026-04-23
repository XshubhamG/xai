import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { getUserIdOrNull, requireUserId } from "./lib/requireUser";

const TEXT_MAX = 32_000;

export const listByChat = query({
  args: {
    chatId: v.id("chats"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { chatId, limit }) => {
    const userId = await getUserIdOrNull(ctx);
    if (!userId) {
      return [];
    }
    const chat = await ctx.db.get(chatId);
    if (!chat || chat.userId !== userId) {
      return [];
    }
    const take = Math.min(Math.max(limit ?? 80, 1), 200);
    return await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", chatId))
      .order("asc")
      .take(take);
  },
});

export const search = query({
  args: {
    query: v.string(),
    chatId: v.optional(v.id("chats")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserIdOrNull(ctx);
    if (!userId) {
      return [];
    }
    const trimmed = args.query.trim();
    if (!trimmed) {
      return [];
    }
    if (trimmed.length > 200) {
      throw new Error("Search query is too long");
    }
    const limit = Math.min(args.limit ?? 32, 64);
    const base = ctx.db
      .query("messages")
      .withSearchIndex("search_text", (q) => {
        let chain = q.search("text", trimmed).eq("userId", userId);
        if (args.chatId) {
          chain = chain.eq("chatId", args.chatId);
        }
        return chain;
      });
    return await base.take(limit);
  },
});

export const listForModel = internalQuery({
  args: {
    userId: v.string(),
    chatId: v.id("chats"),
    limit: v.number(),
  },
  handler: async (ctx, { userId, chatId, limit }) => {
    const chat = await ctx.db.get(chatId);
    if (!chat || chat.userId !== userId) {
      return [];
    }
    const rows = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", chatId))
      .order("desc")
      .take(limit);
    return rows.reverse();
  },
});

export const insertUser = internalMutation({
  args: {
    userId: v.string(),
    chatId: v.id("chats"),
    text: v.string(),
    partsJson: v.optional(v.string()),
    imageStorageIds: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const trimmed = args.text.trim();
    if (!trimmed) {
      throw new Error("Message cannot be empty");
    }
    if (trimmed.length > TEXT_MAX) {
      throw new Error("Message too long");
    }
    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== args.userId) {
      throw new Error("Chat not found");
    }
    const id = await ctx.db.insert("messages", {
      chatId: args.chatId,
      userId: args.userId,
      role: "user",
      text: trimmed,
      partsJson: args.partsJson,
      imageStorageIds: args.imageStorageIds,
    });
    await ctx.db.patch(args.chatId, { updatedAt: Date.now() });
    return id;
  },
});

export const insertAssistant = internalMutation({
  args: {
    userId: v.string(),
    chatId: v.id("chats"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== args.userId) {
      throw new Error("Chat not found");
    }
    const body = args.text.slice(0, TEXT_MAX);
    const id = await ctx.db.insert("messages", {
      chatId: args.chatId,
      userId: args.userId,
      role: "assistant",
      text: body,
    });
    await ctx.db.patch(args.chatId, { updatedAt: Date.now() });
    return id;
  },
});

export const removeLastAssistant = internalMutation({
  args: {
    userId: v.string(),
    chatId: v.id("chats"),
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const msg = await ctx.db.get(args.messageId);
    if (!msg || msg.userId !== args.userId || msg.chatId !== args.chatId) {
      return;
    }
    if (msg.role !== "assistant") {
      return;
    }
    await ctx.db.delete(args.messageId);
  },
});

export const truncateAfter = internalMutation({
  args: {
    userId: v.string(),
    chatId: v.id("chats"),
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== args.userId) {
      throw new Error("Chat not found");
    }
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();

    const index = messages.findIndex((m) => m._id === args.messageId);
    if (index === -1) {
      return;
    }

    const toDelete = messages.slice(index);
    for (const m of toDelete) {
      await ctx.db.delete(m._id);
    }
  },
});

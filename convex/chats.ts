import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserIdOrNull, requireUserId } from "./lib/requireUser";

const TITLE_MAX = 200;
const MODEL_MAX = 200;

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserIdOrNull(ctx);
    if (!userId) {
      return [];
    }
    return await ctx.db
      .query("chats")
      .withIndex("by_user_updated", (q) => q.eq("userId", userId))
      .order("desc")
      .take(100);
  },
});

export const get = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, { chatId }) => {
    const userId = await requireUserId(ctx);
    const chat = await ctx.db.get(chatId);
    if (!chat || chat.userId !== userId) {
      return null;
    }
    return chat;
  },
});

export const create = mutation({
  args: {
    title: v.optional(v.string()),
    modelId: v.optional(v.string()),
  },
  handler: async (ctx, { title, modelId }) => {
    const userId = await requireUserId(ctx);
    const safeTitle = (title ?? "New chat").slice(0, TITLE_MAX);
    const now = Date.now();
    return await ctx.db.insert("chats", {
      userId,
      title: safeTitle,
      modelId: modelId?.slice(0, MODEL_MAX),
      updatedAt: now,
    });
  },
});

export const updateTitle = mutation({
  args: {
    chatId: v.id("chats"),
    title: v.string(),
  },
  handler: async (ctx, { chatId, title }) => {
    const userId = await requireUserId(ctx);
    const chat = await ctx.db.get(chatId);
    if (!chat || chat.userId !== userId) {
      throw new Error("Chat not found");
    }
    await ctx.db.patch(chatId, {
      title: title.slice(0, TITLE_MAX),
      updatedAt: Date.now(),
    });
  },
});

export const updateModel = mutation({
  args: {
    chatId: v.id("chats"),
    modelId: v.string(),
  },
  handler: async (ctx, { chatId, modelId }) => {
    const userId = await requireUserId(ctx);
    const chat = await ctx.db.get(chatId);
    if (!chat || chat.userId !== userId) {
      throw new Error("Chat not found");
    }
    await ctx.db.patch(chatId, {
      modelId: modelId.slice(0, MODEL_MAX),
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { chatId: v.id("chats") },
  handler: async (ctx, { chatId }) => {
    const userId = await requireUserId(ctx);
    const chat = await ctx.db.get(chatId);
    if (!chat || chat.userId !== userId) {
      throw new Error("Chat not found");
    }
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", chatId))
      .collect();
    for (const m of messages) {
      await ctx.db.delete(m._id);
    }
    await ctx.db.delete(chatId);
  },
});

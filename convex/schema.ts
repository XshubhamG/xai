import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  chats: defineTable({
    userId: v.string(),
    title: v.string(),
    updatedAt: v.number(),
  }).index("by_user_updated", ["userId", "updatedAt"]),

  uploadAssets: defineTable({
    storageId: v.id("_storage"),
    userId: v.string(),
    createdAt: v.number(),
  })
    .index("by_storage", ["storageId"])
    .index("by_user_created", ["userId", "createdAt"]),

  messages: defineTable({
    chatId: v.id("chats"),
    userId: v.string(),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system"),
    ),
    text: v.string(),
    partsJson: v.optional(v.string()),
    imageStorageIds: v.optional(v.array(v.id("_storage"))),
  })
    .index("by_chat", ["chatId"])
    .index("by_user", ["userId"])
    .searchIndex("search_text", {
      searchField: "text",
      filterFields: ["userId", "chatId"],
    }),

  userSettings: defineTable({
    userId: v.string(),
    systemPrompt: v.string(),
    personality: v.string(),
    modelId: v.string(),
    themePreference: v.optional(
      v.union(v.literal("system"), v.literal("light"), v.literal("dark")),
    ),
  }).index("by_user", ["userId"]),
});

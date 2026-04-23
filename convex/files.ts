import { v } from "convex/values";
import { internalQuery, mutation } from "./_generated/server";
import { requireUserId } from "./lib/requireUser";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUserId(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const registerUpload = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("uploadAssets")
      .withIndex("by_storage", (q) => q.eq("storageId", storageId))
      .unique();

    if (existing) {
      if (existing.userId !== userId) {
        throw new Error("Upload already belongs to another user");
      }
      return existing._id;
    }

    return await ctx.db.insert("uploadAssets", {
      storageId,
      userId,
      createdAt: Date.now(),
    });
  },
});

/** Used by actions; file URLs are not secrets but must be resolved inside a query. */
export const getStorageUrl = internalQuery({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});

export const listOwnedStorageUrls = internalQuery({
  args: {
    userId: v.string(),
    storageIds: v.array(v.id("_storage")),
  },
  handler: async (ctx, { userId, storageIds }) => {
    const urls: string[] = [];

    for (const storageId of storageIds) {
      const asset = await ctx.db
        .query("uploadAssets")
        .withIndex("by_storage", (q) => q.eq("storageId", storageId))
        .unique();

      if (!asset || asset.userId !== userId) {
        throw new Error("Attachment not found");
      }

      const url = await ctx.storage.getUrl(storageId);
      if (!url) {
        throw new Error("Attachment unavailable");
      }
      urls.push(url);
    }

    return urls;
  },
});

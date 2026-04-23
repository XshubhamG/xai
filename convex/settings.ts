import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUserId } from "./lib/requireUser";

const PROMPT_MAX = 16_000;
const PERSONALITY_MAX = 4000;
const MODEL_MAX = 200;

const DEFAULT_SYSTEM = "You are a concise, helpful assistant.";
const DEFAULT_PERSONALITY = "Neutral, clear, and friendly.";
const DEFAULT_MODEL = "openai/gpt-4o-mini";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (existing) {
      return existing;
    }
    return {
      userId,
      systemPrompt: DEFAULT_SYSTEM,
      personality: DEFAULT_PERSONALITY,
      modelId: DEFAULT_MODEL,
      themePreference: undefined as
        | "system"
        | "light"
        | "dark"
        | undefined,
    };
  },
});

export const upsert = mutation({
  args: {
    systemPrompt: v.optional(v.string()),
    personality: v.optional(v.string()),
    modelId: v.optional(v.string()),
    themePreference: v.optional(
      v.union(v.literal("system"), v.literal("light"), v.literal("dark")),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    const systemPrompt = (args.systemPrompt ?? DEFAULT_SYSTEM).slice(
      0,
      PROMPT_MAX,
    );
    const personality = (args.personality ?? DEFAULT_PERSONALITY).slice(
      0,
      PERSONALITY_MAX,
    );
    const modelId = (args.modelId ?? DEFAULT_MODEL).slice(0, MODEL_MAX);
    if (existing) {
      await ctx.db.patch(existing._id, {
        systemPrompt,
        personality,
        modelId,
        themePreference: args.themePreference ?? existing.themePreference,
      });
      return existing._id;
    }
    return await ctx.db.insert("userSettings", {
      userId,
      systemPrompt,
      personality,
      modelId,
      themePreference: args.themePreference,
    });
  },
});

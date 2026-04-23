import { query } from "./_generated/server";

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.auth.getUserIdentity();
  },
});

import type { ActionCtx, MutationCtx, QueryCtx } from "../_generated/server";

export async function requireUserId(
  ctx: QueryCtx | MutationCtx | ActionCtx,
): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }
  return identity.subject;
}

export async function getUserIdOrNull(
  ctx: QueryCtx | MutationCtx | ActionCtx,
): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  return identity?.subject ?? null;
}

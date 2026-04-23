import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { components } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import authConfig from "../auth.config";
import schema from "./schema";

export const authComponent = createClient<DataModel, typeof schema>(
  components.betterAuth,
  {
    local: { schema },
    verbose: false,
  },
);

function authEnv() {
  const secret = process.env.BETTER_AUTH_SECRET;
  const baseURL = process.env.BETTER_AUTH_URL ?? process.env.SITE_URL;
  return { secret, baseURL };
}

/**
 * Used by the adapter (`getAuthTables(createAuthOptions({}))`) at module analysis time,
 * when deployment env vars may be unavailable — placeholders must not be relied on at runtime.
 */
export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
  const { secret, baseURL } = authEnv();
  return {
    appName: "xai",
    baseURL: baseURL?.trim() || "http://localhost:3000",
    secret: secret?.trim() || "__configure_BETTER_AUTH_SECRET__",
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
    },
    plugins: [convex({ authConfig })],
  } satisfies BetterAuthOptions;
};

export const options = createAuthOptions({} as GenericCtx<DataModel>);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  const { secret, baseURL } = authEnv();
  if (!secret?.trim()) {
    throw new Error(
      "BETTER_AUTH_SECRET is missing. Set it for this Convex deployment: bunx convex env set BETTER_AUTH_SECRET \"$(openssl rand -base64 32)\"",
    );
  }
  if (!baseURL?.trim()) {
    throw new Error(
      "BETTER_AUTH_URL or SITE_URL is missing. Example: bunx convex env set BETTER_AUTH_URL http://localhost:3000",
    );
  }
  return betterAuth({
    ...createAuthOptions(ctx),
    secret,
    baseURL,
  });
};

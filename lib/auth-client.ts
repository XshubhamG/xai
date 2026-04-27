import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const baseURL = process.env.NEXT_PUBLIC_SITE_URL
  ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth`
  : typeof window !== "undefined"
    ? `${window.location.origin}/api/auth`
    : "http://localhost:3000/api/auth";

export const authClient = createAuthClient({
  baseURL,
  plugins: [convexClient()],
});

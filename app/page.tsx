"use client";

import Link from "next/link";
import { ChatCircle } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-provider";

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-2 font-heading text-lg font-medium">
          <ChatCircle className="size-7" weight="duotone" />
          xai
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Sign up</Link>
          </Button>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-20 text-center">
        <h1 className="font-heading text-balance text-3xl font-medium tracking-tight sm:text-4xl">
          Multimodal chat on Convex
        </h1>
        <p className="text-muted-foreground max-w-lg text-balance text-sm leading-relaxed sm:text-base">
          OpenRouter-backed models, email login, full-text search over your
          messages, and per-user system prompt and personality.
        </p>
        <Button size="lg" asChild>
          <Link href="/chat">Open chat</Link>
        </Button>
      </main>
    </div>
  );
}

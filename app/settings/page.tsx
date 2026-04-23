"use client";

import { ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { ThemeToggle } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { MODEL_SUGGESTIONS } from "@/lib/models";

type SettingsFormInit = Pick<
  Doc<"userSettings">,
  "systemPrompt" | "personality" | "modelId" | "userId"
> & { _id?: Doc<"userSettings">["_id"] };

function SettingsFormBody({
  initial,
  onSave,
}: {
  initial: SettingsFormInit;
  onSave: (values: {
    systemPrompt: string;
    personality: string;
    modelId: string;
  }) => Promise<void>;
}) {
  const [systemPrompt, setSystemPrompt] = useState(initial.systemPrompt);
  const [personality, setPersonality] = useState(initial.personality);
  const [modelId, setModelId] = useState(initial.modelId);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    await onSave({
      systemPrompt,
      personality,
      modelId,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardDescription>Model and OpenRouter</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="model">Model ID</Label>
            <Input
              id="model"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              placeholder="openai/gpt-4o-mini"
              autoComplete="off"
            />
            <p className="text-muted-foreground text-xs">
              Use any{" "}
              <a
                className="underline"
                href="https://openrouter.ai/models"
                target="_blank"
                rel="noreferrer"
              >
                OpenRouter model id
              </a>
              . API key is stored in Convex env, not here.
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                  Pick a preset
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72">
                <DropdownMenuRadioGroup value={modelId} onValueChange={setModelId}>
                  {MODEL_SUGGESTIONS.map((m) => (
                    <DropdownMenuRadioItem key={m} value={m}>
                      {m}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Agent behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="system">System prompt</Label>
            <Textarea
              id="system"
              rows={6}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="min-h-[140px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="personality">Personality / tone</Label>
            <Textarea
              id="personality"
              rows={3}
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
            />
            <p className="text-muted-foreground text-xs">
              Appended to the system message so the model keeps a consistent
              voice.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit">Save</Button>
        {saved ? (
          <span className="text-muted-foreground text-sm">Saved.</span>
        ) : null}
      </div>
    </form>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const viewer = useQuery(api.users.viewer);
  const settings = useQuery(api.settings.get, viewer ? {} : "skip");
  const upsert = useMutation(api.settings.upsert);

  if (viewer === undefined || settings === undefined) {
    return (
      <div className="text-muted-foreground flex min-h-svh items-center justify-center text-sm">
        Loading…
      </div>
    );
  }

  if (viewer === null) {
    router.replace("/sign-in");
    return null;
  }

  const formKey = `${settings.userId}-${"_id" in settings ? settings._id : "defaults"}`;

  return (
    <div className="bg-background mx-auto min-h-svh max-w-2xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/chat" aria-label="Back to chat">
            <ArrowLeft className="size-5" weight="bold" />
          </Link>
        </Button>
        <h1 className="font-heading flex-1 text-xl font-medium">Settings</h1>
        <ThemeToggle />
      </div>

      <SettingsFormBody
        key={formKey}
        initial={settings}
        onSave={async (values) => {
          await upsert(values);
        }}
      />

      <div className="mt-10 border-t pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            void authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  router.push("/sign-in");
                  router.refresh();
                },
              },
            });
          }}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}

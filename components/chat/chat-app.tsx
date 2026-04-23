"use client";

import {
  ChatCircle,
  ChatsTeardrop,
  Image as ImageIcon,
  MagnifyingGlass,
  PaperPlaneRight,
  Plus,
  SignOut,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ThemeToggle } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function ChatApp() {
  const router = useRouter();
  const viewer = useQuery(api.users.viewer);
  const chats = useQuery(api.chats.list, viewer ? {} : "skip");
  const [activeChatId, setActiveChatId] = useState<Id<"chats"> | null>(null);
  const effectiveChatId = useMemo(() => {
    if (!viewer || !chats?.length) {
      return null;
    }
    if (activeChatId && chats.some((chat) => chat._id === activeChatId)) {
      return activeChatId;
    }
    return chats[0]!._id;
  }, [activeChatId, chats, viewer]);
  const messages = useQuery(
    api.messages.listByChat,
    effectiveChatId
      ? { chatId: effectiveChatId, limit: 120 }
      : "skip",
  );

  const createChat = useMutation(api.chats.create);
  const completeTurn = useAction(api.ai.completeTurn);
  const genUpload = useMutation(api.files.generateUploadUrl);
  const registerUpload = useMutation(api.files.registerUpload);

  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [images, setImages] = useState<Id<"_storage">[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQ.trim()), 320);
    return () => clearTimeout(t);
  }, [searchQ]);

  const searchHits = useQuery(
    api.messages.search,
    viewer && debouncedSearch.length > 0
      ? { query: debouncedSearch, limit: 24 }
      : "skip",
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length, pending]);

  const activeChat = useMemo(() => {
    if (!chats || !effectiveChatId) {
      return null;
    }
    return chats.find((c) => c._id === effectiveChatId) ?? null;
  }, [chats, effectiveChatId]);

  async function onSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
          router.refresh();
        },
      },
    });
  }

  const onPickImage = useCallback(
    async (file: File | null) => {
      if (!file || !viewer) {
        return;
      }
      const uploadUrl = await genUpload();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      const data = (await res.json()) as { storageId?: Id<"_storage"> };
      const sid = data.storageId;
      if (sid) {
        await registerUpload({ storageId: sid });
        setImages((prev) => [...prev, sid]);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [genUpload, registerUpload, viewer],
  );

  async function onSend() {
    if (!viewer || !effectiveChatId || pending) {
      return;
    }
    const text = draft.trim();
    if (!text && images.length === 0) {
      return;
    }
    setPending(true);
    setDraft("");
    const toSend = [...images];
    setImages([]);
    try {
      await completeTurn({
        chatId: effectiveChatId,
        userText: text,
        imageStorageIds: toSend.length ? toSend : undefined,
      });
    } finally {
      setPending(false);
    }
  }

  async function onNewChat() {
    if (!viewer) {
      return;
    }
    const id = await createChat({});
    setActiveChatId(id);
  }

  if (viewer === undefined) {
    return (
      <div className="text-muted-foreground flex min-h-svh items-center justify-center p-8 text-sm">
        Loading…
      </div>
    );
  }

  if (viewer === null) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-8">
        <p className="text-muted-foreground text-sm">
          Sign in to use the chat.
        </p>
        <Button asChild>
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-svh w-full flex-col md:flex-row">
      <aside className="border-border/80 hidden h-svh w-72 shrink-0 flex-col border-r md:flex">
        <div className="flex items-center gap-2 border-b px-3 py-3">
          <ChatsTeardrop className="size-5" weight="duotone" />
          <span className="font-heading font-medium">Chats</span>
        </div>
        <ChatSidebarList
          chats={chats ?? []}
          activeChatId={activeChatId}
          onSelect={setActiveChatId}
          onNew={onNewChat}
        />
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="border-border/80 flex flex-wrap items-center gap-2 border-b px-3 py-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <ChatsTeardrop className="size-5" weight="bold" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-border/80 border-b px-4 py-3 text-left">
                <SheetTitle className="font-heading text-base">Chats</SheetTitle>
              </SheetHeader>
              <ChatSidebarList
                chats={chats ?? []}
                activeChatId={activeChatId}
                onSelect={(id) => {
                  setActiveChatId(id);
                }}
                onNew={onNewChat}
              />
            </SheetContent>
          </Sheet>

          <div className="flex min-w-0 flex-1 items-center gap-2">
            <ChatCircle className="text-muted-foreground size-5 shrink-0" weight="duotone" />
            <h1 className="font-heading truncate text-base font-medium">
              {activeChat?.title ?? "Select or start a chat"}
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <div className="relative hidden max-w-[220px] items-center sm:flex">
              <MagnifyingGlass className="text-muted-foreground absolute left-2 size-4" />
              <Input
                aria-label="Search messages"
                placeholder="Search…"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                className="h-9 pl-8"
              />
            </div>
            <Button variant="outline" size="icon" asChild title="Settings">
              <Link href="/settings">
                <span className="sr-only">Settings</span>
                <span aria-hidden className="text-xs font-medium">
                  ⚙
                </span>
              </Link>
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={onSignOut} title="Sign out">
              <SignOut className="size-5" weight="bold" />
            </Button>
          </div>
        </header>

        {debouncedSearch.length > 0 ? (
          <div className="border-border/80 bg-muted/30 max-h-40 border-b px-3 py-2">
            <p className="text-muted-foreground mb-2 text-xs">
              Results ({searchHits?.length ?? 0})
            </p>
            <ScrollArea className="h-24 pr-2">
              <ul className="space-y-1 text-sm">
                {(searchHits ?? []).map((m) => (
                  <li key={m._id}>
                    <button
                      type="button"
                      className="hover:bg-muted/80 w-full rounded-md px-2 py-1 text-left"
                      onClick={() => {
                        setActiveChatId(m.chatId);
                        setSearchQ("");
                        setDebouncedSearch("");
                      }}
                    >
                      <span className="text-muted-foreground line-clamp-2">
                        {m.text}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        ) : null}

        <ScrollArea className="min-h-0 flex-1">
          <div className="mx-auto max-w-3xl space-y-4 px-3 py-4">
            {(messages ?? []).map((m) => (
              <div
                key={m._id}
                className={cn(
                  "flex",
                  m.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed wrap-break-word",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  {m.text}
                  {m.imageStorageIds?.length ? (
                    <p className="text-muted-foreground mt-1 text-xs">
                      {m.imageStorageIds.length} attachment(s)
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <footer className="border-border/80 bg-background/80 supports-backdrop-filter:bg-background/60 sticky bottom-0 border-t px-3 py-3 backdrop-blur">
          {!effectiveChatId ? (
            <p className="text-muted-foreground text-center text-sm">
              Create a chat to start messaging.
            </p>
          ) : (
            <div className="mx-auto flex max-w-3xl flex-col gap-2">
              {images.length > 0 ? (
                <p className="text-muted-foreground text-xs">
                  {images.length} image(s) ready to send
                </p>
              ) : null}
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => void onPickImage(e.target.files?.[0] ?? null)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="size-5" weight="bold" />
                </Button>
                <Textarea
                  rows={3}
                  placeholder="Message…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="min-h-[80px] flex-1 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void onSend();
                    }
                  }}
                />
                <Button
                  type="button"
                  size="icon"
                  className="shrink-0 self-end"
                  disabled={pending}
                  onClick={() => void onSend()}
                  title="Send"
                >
                  <PaperPlaneRight className="size-5" weight="fill" />
                </Button>
              </div>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}

function ChatSidebarList({
  chats,
  activeChatId,
  onSelect,
  onNew,
}: {
  chats: Array<{ _id: Id<"chats">; title: string; updatedAt: number }>;
  activeChatId: Id<"chats"> | null;
  onSelect: (id: Id<"chats">) => void;
  onNew: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="p-2">
        <Button className="w-full gap-1" variant="secondary" onClick={onNew}>
          <Plus className="size-4" weight="bold" />
          New chat
        </Button>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <ul className="space-y-0.5 px-2 pb-4">
          {chats.map((c) => (
            <li key={c._id}>
              <button
                type="button"
                onClick={() => onSelect(c._id)}
                className={cn(
                  "hover:bg-muted/80 w-full rounded-md px-2 py-2 text-left text-sm",
                  activeChatId === c._id && "bg-muted",
                )}
              >
                <span className="line-clamp-2">{c.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}

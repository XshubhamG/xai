"use client";

import {
  ArrowsClockwise,
  ChatCircle,
  ChatsTeardrop,
  Check,
  Copy,
  DotsThree,
  Export,
  Image as ImageIcon,
  MagnifyingGlass,
  PaperPlaneRight,
  Plus,
  SignOut,
  ThumbsDown,
  ThumbsUp,
  Trash,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { MessageMarkdown } from "@/components/chat/message-markdown";
import { ThemeToggle } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { DEFAULT_MODEL_ID, MODEL_SUGGESTIONS } from "@/lib/models";
import { cn } from "@/lib/utils";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      title="Copy"
      className="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1 transition-colors"
      onClick={onCopy}
    >
      {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
    </button>
  );
}

export function ChatApp() {
  const router = useRouter();
  const viewer = useQuery(api.users.viewer);
  const chats = useQuery(api.chats.list, viewer ? {} : "skip");
  const settings = useQuery(api.settings.get, viewer ? {} : "skip");
  const [activeChatId, setActiveChatId] = useState<Id<"chats"> | null>(null);
  const [draftModelId, setDraftModelId] = useState<string | null>(null);
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
    effectiveChatId ? { chatId: effectiveChatId, limit: 120 } : "skip",
  );

  const createChat = useMutation(api.chats.create);
  const updateChatModel = useMutation(api.chats.updateModel);
  const completeTurn = useAction(api.ai.completeTurn);
  const regenerate = useAction(api.ai.regenerate);
  const removeChat = useMutation(api.chats.remove);
  const genUpload = useMutation(api.files.generateUploadUrl);
  const registerUpload = useMutation(api.files.registerUpload);

  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [images, setImages] = useState<Id<"_storage">[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQ.trim()), 320);
    return () => clearTimeout(t);
  }, [searchQ]);

  const searchHits = useQuery(
    api.messages.search,
    viewer && debouncedSearch.length > 0
      ? { query: debouncedSearch, limit: 10 }
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

  const selectedModelId =
    activeChat?.modelId ?? draftModelId ?? settings?.modelId ?? DEFAULT_MODEL_ID;

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
    if (!viewer || pending) {
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
      let chatId = effectiveChatId;
      if (!chatId) {
        chatId = await createChat({ modelId: selectedModelId });
        setActiveChatId(chatId);
      }
      await completeTurn({
        chatId,
        userText: text,
        imageStorageIds: toSend.length ? toSend : undefined,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setPending(false);
    }
  }

  async function onNewChat() {
    if (!viewer) {
      return;
    }
    const id = await createChat({ modelId: selectedModelId });
    setActiveChatId(id);
  }

  async function onSelectModel(modelId: string) {
    if (activeChat) {
      await updateChatModel({ chatId: activeChat._id, modelId });
      return;
    }
    setDraftModelId(modelId);
  }

  async function onRegenerate(messageId: Id<"messages">) {
    if (!effectiveChatId || pending) return;
    setPending(true);
    try {
      await regenerate({ chatId: effectiveChatId, messageId });
    } finally {
      setPending(false);
    }
  }

  async function onDeleteChat(chatId: Id<"chats">) {
    if (!viewer) return;
    const isDeletingActive = chatId === activeChatId;
    await removeChat({ chatId });
    if (isDeletingActive) {
      setActiveChatId(null);
    }
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
        <p className="text-muted-foreground text-sm">Sign in to use the chat.</p>
        <Button asChild>
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </div>
    );
  }

  const isEmpty = !messages || messages.length === 0;

  return (
    <div className="bg-background flex min-h-svh w-full max-w-full overflow-x-hidden flex-col md:flex-row">
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
          onDelete={onDeleteChat}
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
                onDelete={onDeleteChat}
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="max-w-44 justify-between">
                  <span className="truncate">{selectedModelId}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuRadioGroup
                  value={selectedModelId}
                  onValueChange={(value) => {
                    void onSelectModel(value);
                  }}
                >
                  {MODEL_SUGGESTIONS.map((modelId) => (
                    <DropdownMenuRadioItem key={modelId} value={modelId}>
                      {modelId}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              className="text-muted-foreground relative hidden h-9 w-full max-w-[220px] justify-start rounded-[0.5rem] text-sm font-normal sm:flex"
              onClick={() => setSearchOpen(true)}
            >
              <MagnifyingGlass className="mr-2 size-4" />
              <span>Search messages…</span>
              <kbd className="bg-muted pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-6 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>

            <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
              <CommandInput
                placeholder="Search all messages…"
                value={searchQ}
                onValueChange={setSearchQ}
              />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                {searchHits && searchHits.length > 0 && (
                  <CommandGroup heading="Results">
                    {searchHits.map((m) => (
                      <CommandItem
                        key={m._id}
                        onSelect={() => {
                          setActiveChatId(m.chatId);
                          setSearchOpen(false);
                          setSearchQ("");
                        }}
                      >
                        <ChatCircle className="mr-2 size-4" />
                        <span className="line-clamp-1">{m.text}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </CommandDialog>

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

        <ScrollArea className="min-h-0 flex-1">
          {isEmpty ? (
            <div className="flex min-h-[calc(100svh-120px)] flex-col items-center justify-center px-6">
              <div className="mb-8 flex flex-col items-center gap-4 text-center">
                <ChatCircle className="text-muted-foreground size-12" weight="duotone" />
                <h2 className="font-heading text-2xl font-medium">How can I help you today?</h2>
              </div>
              <ChatInput
                isCentered
                images={images}
                draft={draft}
                setDraft={setDraft}
                pending={pending}
                onSend={onSend}
                onPickImage={onPickImage}
                fileInputRef={fileInputRef}
              />
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-8 px-3 py-4 pb-20">
              {(messages ?? []).map((m) => (
                <div
                  key={m._id}
                  className={cn("flex flex-col gap-2", m.role === "user" ? "items-end" : "items-start")}
                >
                  <div
                    className={cn(
                      "text-sm leading-relaxed break-words overflow-wrap-anywhere",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground max-w-[85%] rounded-2xl px-3 py-2"
                        : "text-foreground w-full",
                    )}
                  >
                    {m.role === "assistant" ? (
                      <div className="space-y-4">
                        <MessageMarkdown>{m.text}</MessageMarkdown>
                        <div className="flex items-center gap-1.5 pt-2">
                          <CopyButton text={m.text} />
                          <button
                            title="Good response"
                            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1 transition-colors"
                          >
                            <ThumbsUp className="size-4" />
                          </button>
                          <button
                            title="Bad response"
                            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1 transition-colors"
                          >
                            <ThumbsDown className="size-4" />
                          </button>
                          <button
                            title="Share"
                            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1 transition-colors"
                          >
                            <Export className="size-4" />
                          </button>
                          <button
                            title="Regenerate"
                            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1 transition-colors disabled:opacity-50"
                            disabled={pending}
                            onClick={() => void onRegenerate(m._id)}
                          >
                            <ArrowsClockwise className={cn("size-4", pending && "animate-spin")} />
                          </button>
                          <button
                            title="More"
                            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1 transition-colors"
                          >
                            <DotsThree className="size-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    )}
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
          )}
        </ScrollArea>

        {!isEmpty && (
          <footer className="border-border/80 bg-background/80 supports-backdrop-filter:bg-background/60 sticky bottom-0 border-t px-3 py-3 backdrop-blur">
            {!effectiveChatId ? (
              <p className="text-muted-foreground text-center text-sm">
                Create a chat to start messaging.
              </p>
            ) : (
              <ChatInput
                images={images}
                draft={draft}
                setDraft={setDraft}
                pending={pending}
                onSend={onSend}
                onPickImage={onPickImage}
                fileInputRef={fileInputRef}
              />
            )}
          </footer>
        )}
      </div>
    </div>
  );
}

function ChatInput({
  isCentered = false,
  images,
  draft,
  setDraft,
  pending,
  onSend,
  onPickImage,
  fileInputRef,
}: {
  isCentered?: boolean;
  images: Id<"_storage">[];
  draft: string;
  setDraft: (v: string) => void;
  pending: boolean;
  onSend: () => void;
  onPickImage: (file: File | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className={cn("flex w-full flex-col gap-2", isCentered ? "max-w-2xl" : "mx-auto max-w-3xl")}>
      {images.length > 0 ? (
        <p className="text-muted-foreground text-xs">{images.length} image(s) ready to send</p>
      ) : null}
      <div className={cn("flex gap-2", isCentered && "items-end")}>
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
          className="shrink-0"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="size-5" weight="bold" />
        </Button>
        <Textarea
          rows={isCentered ? 4 : 3}
          placeholder="Message…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className={cn(
            "flex-1 resize-none",
            isCentered ? "min-h-[120px] text-base" : "min-h-[80px]",
          )}
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
  );
}


function ChatSidebarList({
  chats,
  activeChatId,
  onSelect,
  onNew,
  onDelete,
}: {
  chats: Array<{ _id: Id<"chats">; title: string; updatedAt: number }>;
  activeChatId: Id<"chats"> | null;
  onSelect: (id: Id<"chats">) => void;
  onNew: () => void;
  onDelete: (id: Id<"chats">) => void;
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
            <li key={c._id} className="group relative">
              <button
                type="button"
                onClick={() => onSelect(c._id)}
                className={cn(
                  "hover:bg-muted/80 w-full rounded-md px-2 py-2 pr-8 text-left text-sm",
                  activeChatId === c._id && "bg-muted",
                )}
              >
                <span className="line-clamp-2">{c.title}</span>
              </button>
              <button
                type="button"
                title="Delete chat"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(c._id);
                }}
                className="text-muted-foreground hover:text-destructive absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}

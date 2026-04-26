"use client";

import {
  ArrowsClockwise,
  ChatCircle,
  ChatsTeardrop,
  Check,
  Compass,
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
    <div className="landing-shell flex h-svh w-full max-w-full overflow-hidden flex-col md:flex-row selection:bg-primary/20">
      <aside className="border-border/50 hidden h-svh w-72 shrink-0 flex-col border-r md:flex bg-card/20 backdrop-blur-md">
        <div className="flex items-center gap-3 border-b border-border/40 px-5 py-4 bg-background/40">
          <div className="landing-badge flex size-8 items-center justify-center rounded-lg shadow-sm">
            <ChatsTeardrop className="size-5 text-primary" weight="duotone" />
          </div>
          <span className="font-heading font-semibold tracking-tight text-foreground/80">Threads</span>
        </div>
        <ChatSidebarList
          chats={chats ?? []}
          activeChatId={activeChatId}
          onSelect={setActiveChatId}
          onNew={onNewChat}
          onDelete={onDeleteChat}
        />
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col relative">
        <header className="sticky top-0 z-50 flex items-center gap-2 border-b border-border/40 bg-background/80 px-4 py-2.5 backdrop-blur-xl shadow-sm">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden hover:bg-primary/10 hover:text-primary">
                <ChatsTeardrop className="size-5" weight="duotone" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-card/95 backdrop-blur-xl border-r-border/50">
              <SheetHeader className="border-b border-border/50 px-4 py-4 text-left">
                <SheetTitle className="font-heading text-lg flex items-center gap-2">
                   <ChatsTeardrop className="size-6 text-primary" weight="duotone" />
                   Chats
                </SheetTitle>
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

          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="landing-badge hidden sm:flex size-8 items-center justify-center rounded-lg shadow-sm">
               <ChatCircle className="size-5 text-primary" weight="duotone" />
            </div>
            <h1 className="font-heading truncate text-base font-semibold tracking-tight text-foreground/90">
              {activeChat?.title ?? "Select or start a chat"}
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 px-3 border-border/60 bg-background/50 backdrop-blur-md hover:bg-muted/80 font-medium rounded-xl">
                  <span className="truncate max-w-[120px]">{selectedModelId}</span>
                  <div className="ml-2 size-1.5 rounded-full bg-hl-green shadow-[0_0_8px_rgba(141,161,1,0.5)]"></div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-1.5 rounded-xl border-border/50 shadow-xl bg-popover/95 backdrop-blur-xl">
                <DropdownMenuRadioGroup
                  value={selectedModelId}
                  onValueChange={(value) => {
                    void onSelectModel(value);
                  }}
                >
                  {MODEL_SUGGESTIONS.map((modelId) => (
                    <DropdownMenuRadioItem key={modelId} value={modelId} className="rounded-lg py-2 cursor-pointer">
                      {modelId}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant="outline"
              size="sm"
              className="text-muted-foreground relative hidden h-9 w-10 md:w-48 justify-start rounded-xl border-border/60 bg-background/50 backdrop-blur-md px-3 font-normal sm:flex hover:bg-muted/80 transition-colors"
              onClick={() => setSearchOpen(true)}
            >
              <MagnifyingGlass className="size-4 md:mr-2" />
              <span className="hidden md:inline">Search messages…</span>
              <kbd className="bg-muted pointer-events-none absolute right-[0.4rem] top-[0.4rem] hidden h-5.5 select-none items-center gap-1 rounded border border-border/50 px-1.5 font-mono text-[9px] font-bold opacity-80 sm:flex">
                ⌘K
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
            <div className="flex min-h-[calc(100svh-140px)] flex-col items-center justify-center px-6">
              <div className="mb-10 flex flex-col items-center gap-5 text-center">
                <div className="landing-badge flex size-16 items-center justify-center rounded-2xl shadow-lg border-primary/20 bg-primary/5">
                  <ChatCircle className="size-10 text-primary" weight="duotone" />
                </div>
                <div className="space-y-2">
                  <h2 className="font-heading text-3xl font-semibold tracking-tight">How can I help you today?</h2>
                  <p className="text-muted-foreground font-medium">Start a new conversation or select a thread from the sidebar.</p>
                </div>
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
            <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 pb-32">
              {(messages ?? []).map((m) => (
                <div
                  key={m._id}
                  className={cn("flex flex-col gap-3", m.role === "user" ? "items-end" : "items-start")}
                >
                  <div
                    className={cn(
                      "transition-all duration-300",
                      m.role === "user"
                        ? "landing-message shadow-sm self-end rounded-2xl rounded-tr-sm max-w-[85%] md:max-w-[80%] border-transparent bg-[#9fb67e] text-[#2f363d]"
                        : "self-start w-full text-foreground/90",
                    )}
                  >
                    {m.role === "assistant" ? (
                      <div className="space-y-4 py-2">
                        <MessageMarkdown>{m.text}</MessageMarkdown>
                        <div className="flex items-center gap-1 pt-3 border-t border-border/10 opacity-50 hover:opacity-100 transition-opacity">
                          <CopyButton text={m.text} />
                          <button
                            title="Good response"
                            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1.5 transition-colors"
                          >
                            <ThumbsUp className="size-4" />
                          </button>
                          <button
                            title="Bad response"
                            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1.5 transition-colors"
                          >
                            <ThumbsDown className="size-4" />
                          </button>
                          <button
                            title="Share"
                            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1.5 transition-colors"
                          >
                            <Export className="size-4" />
                          </button>
                          <button
                            title="Regenerate"
                            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1.5 transition-colors disabled:opacity-50"
                            disabled={pending}
                            onClick={() => void onRegenerate(m._id)}
                          >
                            <ArrowsClockwise className={cn("size-4", pending && "animate-spin")} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-base font-medium">{m.text}</p>
                    )}
                    {m.imageStorageIds?.length ? (
                      <div className="mt-3 pt-3 border-t border-black/10 flex flex-wrap gap-2">
                        {m.imageStorageIds.map((sid) => (
                          <div key={sid} className="bg-black/10 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-black/80">
                            Attachment
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
              {pending && (
                <div className="flex flex-col gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-2.5 py-3">
                    <div className="flex gap-1.5">
                      <div className="size-1.5 rounded-full bg-primary/50 animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="size-1.5 rounded-full bg-primary/50 animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="size-1.5 rounded-full bg-primary/50 animate-bounce"></div>
                    </div>
                    <span className="text-xs font-semibold tracking-wide text-muted-foreground/60 uppercase">Thinking</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>

        <footer className="absolute bottom-0 left-0 right-0 z-20 p-4 md:p-6 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none">
          <div className="mx-auto max-w-4xl pointer-events-auto">
            {!isEmpty && (
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
          </div>
        </footer>
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
    <div className={cn("flex w-full flex-col gap-3", isCentered ? "max-w-2xl" : "w-full")}>
      <div className="relative">
        {images.length > 0 && (
          <div className="absolute -top-12 left-0 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2">
            {images.map((id) => (
              <div key={id} className="bg-primary/10 text-primary border border-primary/20 backdrop-blur-md rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <ImageIcon className="size-3" weight="bold" />
                Image Ready
              </div>
            ))}
          </div>
        )}
        
        <div className={cn(
          "bg-card/80 backdrop-blur-xl border border-border/60 rounded-2xl p-2 flex flex-col gap-2 shadow-xl shadow-black/5 transition-all duration-300 focus-within:border-primary/40 focus-within:shadow-primary/5",
          isCentered ? "p-3" : "p-2"
        )}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void onPickImage(e.target.files?.[0] ?? null)}
          />
          
          <Textarea
            rows={isCentered ? 4 : 1}
            placeholder="Message xai..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className={cn(
              "flex-1 resize-none bg-transparent border-none focus-visible:ring-0 text-foreground placeholder:text-muted-foreground/60 font-medium px-3 py-2",
              isCentered ? "min-h-[120px] text-lg" : "min-h-[44px] text-base",
            )}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void onSend();
              }
            }}
          />
          
          <div className="flex items-center justify-between px-1 pb-1">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                title="Upload Image"
              >
                <ImageIcon className="size-5" weight="duotone" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 rounded-xl text-muted-foreground hover:text-hl-aqua hover:bg-hl-aqua/10 transition-colors"
                title="Discovery"
              >
                <Compass className="size-5" weight="duotone" />
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              {draft.length > 0 && (
                <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest hidden sm:block">
                  {draft.length} chars
                </span>
              )}
              <Button
                type="button"
                size="icon"
                className="size-9 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                disabled={pending || (!draft.trim() && images.length === 0)}
                onClick={() => void onSend()}
                title="Send Message"
              >
                <PaperPlaneRight className="size-5" weight="fill" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {!isCentered && (
        <div className="flex items-center justify-center gap-4 text-[9px] text-muted-foreground/50 uppercase tracking-[0.2em] font-bold px-4">
           <span>OpenRouter</span>
           <div className="size-1 rounded-full bg-border/60"></div>
           <span>Multimodal</span>
           <div className="size-1 rounded-full bg-border/60"></div>
           <span>Search-ready</span>
        </div>
      )}
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
      <div className="p-4">
        <Button className="w-full gap-2 rounded-xl shadow-md shadow-primary/10 font-semibold" variant="secondary" onClick={onNew}>
          <Plus className="size-4" weight="bold" />
          New Thread
        </Button>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <ul className="space-y-1 px-3 pb-6">
          {chats.map((c) => (
            <li key={c._id} className="group relative">
              <button
                type="button"
                onClick={() => onSelect(c._id)}
                className={cn(
                  "hover:bg-muted/60 w-full rounded-xl px-3 py-2.5 pr-10 text-left text-sm transition-all duration-200",
                  activeChatId === c._id ? "bg-primary/10 text-primary font-semibold ring-1 ring-primary/20 shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="line-clamp-1">{c.title}</span>
              </button>
              <button
                type="button"
                title="Delete chat"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(c._id);
                }}
                className="text-muted-foreground hover:text-destructive absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 opacity-0 transition-all group-hover:opacity-100 hover:bg-destructive/10"
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

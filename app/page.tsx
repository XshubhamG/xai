"use client";

import Link from "next/link";
import {
  ArrowRight,
  ChatCircle,
  ChatsTeardrop,
  Compass,
  MagnifyingGlass,
  Sliders,
  Sparkle,
  Robot,
  LockKey
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-provider";

export default function HomePage() {
  return (
    <div className="landing-shell flex min-h-svh flex-col selection:bg-primary/20">
      <header className="sticky top-0 z-50 mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 sm:px-8 lg:px-10 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm">
        <div className="flex items-center gap-3 font-heading text-lg font-medium tracking-tight sm:text-xl">
          <div className="landing-badge flex size-10 items-center justify-center rounded-xl shadow-sm">
            <ChatCircle className="size-6 text-primary" weight="duotone" />
          </div>
          <div className="flex flex-col">
            <span className="leading-tight">xai</span>
            <span className="font-sans text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground/80">
              Workspace
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground font-medium" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
          <Button className="rounded-full px-5 shadow-md shadow-primary/10" asChild>
            <Link href="/sign-up">Sign up</Link>
          </Button>
          <div className="pl-2 border-l border-border/50">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full px-6 sm:px-8 lg:px-10 overflow-hidden">
        {/* HERO SECTION */}
        <section className="flex flex-col items-center text-center max-w-4xl mx-auto mt-20 sm:mt-28 mb-20 space-y-8 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
          
          <div className="landing-badge inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest text-primary shadow-sm border-primary/20 bg-primary/5">
            <Sparkle weight="duotone" className="size-4" />
            <span>Thoughtful AI Design</span>
          </div>
          
          <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] font-semibold tracking-tight text-balance leading-[1.05] drop-shadow-sm">
            A calmer home for <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-primary to-hl-aqua bg-clip-text text-transparent">serious AI work.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl text-balance leading-relaxed font-medium">
            xai gives your conversations structure: multimodal chat, searchable history,
            and personalized model behavior in a workspace that feels composed instead of noisy.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 w-full sm:w-auto">
            <Button size="lg" className="rounded-full px-8 h-14 text-base font-semibold shadow-xl shadow-primary/20 w-full sm:w-auto group transition-all hover:scale-105" asChild>
              <Link href="/chat">
                Open workspace <ArrowRight weight="bold" className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-base font-semibold bg-background/50 backdrop-blur-md w-full sm:w-auto hover:bg-muted/80 transition-colors" asChild>
              <Link href="/sign-up">Create free account</Link>
            </Button>
          </div>
        </section>

        {/* MOCKUP SECTION */}
        <section className="relative mx-auto w-full max-w-5xl mb-32 md:mb-40 perspective-[2000px]">
          <div className="landing-preview rounded-2xl md:rounded-3xl overflow-hidden border border-border/60 shadow-2xl transition-transform duration-700 hover:rotate-x-[2deg] hover:rotate-y-[-1deg]">
            {/* Window Header */}
            <div className="bg-muted/80 border-b border-border/50 px-4 py-3 flex items-center justify-between backdrop-blur-md">
              <div className="flex gap-2">
                <div className="size-3.5 rounded-full bg-hl-red/90 shadow-sm"></div>
                <div className="size-3.5 rounded-full bg-hl-yellow/90 shadow-sm"></div>
                <div className="size-3.5 rounded-full bg-hl-green/90 shadow-sm"></div>
              </div>
              <div className="flex items-center gap-2 bg-background/60 px-4 py-1.5 rounded-md text-xs text-muted-foreground font-semibold font-sans shadow-inner border border-border/30">
                <LockKey weight="bold" className="size-3" />
                xai.workspace
              </div>
              <div className="w-16"></div> {/* Spacer for centering */}
            </div>
            
            {/* Window Body */}
            <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] h-[450px] md:h-[550px] bg-background/40 backdrop-blur-xl">
              {/* Sidebar */}
              <div className="hidden md:flex flex-col border-r border-border/50 p-4 gap-6 bg-card/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80 px-3 py-2">
                    <ChatCircle weight="duotone" className="size-5 text-primary" />
                    Recent Threads
                  </div>
                  <div className="space-y-0.5 mt-2">
                    {[
                      { title: "Project architecture", active: true },
                      { title: "Postgres optimization", active: false },
                      { title: "Refactoring generic types", active: false },
                      { title: "Landing page copy", active: false }
                    ].map((chat, i) => (
                       <div key={i} className={`text-sm py-2.5 px-3 rounded-lg cursor-pointer truncate transition-colors ${chat.active ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}`}>
                         {chat.title}
                       </div>
                    ))}
                  </div>
                </div>

                <div className="mt-auto space-y-1">
                   <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80 px-3 py-2">
                      <Sliders weight="duotone" className="size-5 text-hl-orange" />
                      Settings
                   </div>
                </div>
              </div>
              
              {/* Main Chat Area */}
              <div className="flex flex-col h-full relative">
                <div className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col gap-6">
                  <div className="flex items-center justify-center pb-2">
                     <div className="bg-muted/80 px-4 py-1 rounded-full text-[10px] font-bold text-foreground/60 border border-border/50 uppercase tracking-widest backdrop-blur-md">
                        Today, 10:42 AM
                     </div>
                  </div>
                  <div className="landing-message self-start shadow-sm border-border/60 rounded-2xl rounded-bl-sm max-w-[85%] md:max-w-[80%] bg-card/60 backdrop-blur-md px-5 py-4 text-foreground/90">
                    Summarize the project direction and keep the tone concise.
                  </div>
                  <div className="landing-message self-end shadow-xl rounded-2xl rounded-tr-sm max-w-[85%] md:max-w-[80%] bg-primary text-primary-foreground border-transparent px-5 py-4 leading-relaxed">
                    I can help with that. I'll keep the response structured, searchable,
                    and aligned with your saved preferences. The core focus is on creating a distraction-free, high-utility workspace for serious engineering work.
                  </div>
                </div>
                
                {/* Input Bar */}
                <div className="p-5 pt-2 mt-auto bg-gradient-to-t from-background via-background/90 to-transparent">
                  <div className="bg-card/80 backdrop-blur-md border border-border/60 rounded-2xl p-2.5 flex items-center gap-3 shadow-lg shadow-black/5">
                    <Button variant="ghost" size="icon" className="size-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10">
                       <Compass weight="duotone" className="size-6" />
                    </Button>
                    <div className="flex-1 text-base text-muted-foreground/70 font-medium px-2">
                       Message xai...
                    </div>
                    <Button size="icon" className="size-10 rounded-xl bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors">
                      <ArrowRight weight="bold" className="size-5" />
                    </Button>
                  </div>
                  <div className="text-center mt-3 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                    OpenRouter • Multimodal • Search-ready
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Ambient Glow */}
          <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[110%] bg-gradient-to-tr from-primary/20 via-hl-aqua/10 to-hl-purple/20 blur-[80px] opacity-60 rounded-[4rem]"></div>
        </section>

        {/* BENTO GRID FEATURES SECTION */}
        <section className="max-w-6xl mx-auto w-full mb-32 md:mb-40 space-y-10">
          <div className="text-center mb-12 space-y-4">
             <div className="landing-kicker mx-auto">Why xai?</div>
             <h2 className="font-heading text-3xl md:text-5xl font-semibold tracking-tight text-balance">
               Designed for focus and continuity.
             </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 - Searchable (Spans 2 columns) */}
            <Card className="landing-panel md:col-span-2 relative overflow-hidden group min-h-[320px] rounded-3xl border-border/50">
              <CardContent className="p-8 md:p-10 flex flex-col h-full justify-between z-10 relative">
                <div className="space-y-4 max-w-md">
                   <div className="landing-badge w-14 h-14 flex items-center justify-center rounded-2xl mb-8 shadow-sm">
                      <MagnifyingGlass weight="duotone" className="size-7 text-primary" />
                   </div>
                   <h3 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight">Searchable history</h3>
                   <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                     Return to old ideas quickly with lightning-fast full-text search across your entire chat history. Never lose a valuable snippet or architecture decision again.
                   </p>
                </div>
                {/* Abstract decorative element */}
                <div className="absolute right-0 bottom-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 translate-x-1/4 translate-y-1/4 pointer-events-none">
                  <MagnifyingGlass weight="fill" className="w-[300px] h-[300px] text-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Feature 2 - Multimodal */}
            <Card className="landing-panel relative overflow-hidden group min-h-[320px] rounded-3xl border-border/50">
              <CardContent className="p-8 md:p-10 flex flex-col h-full z-10 relative">
                <div className="space-y-4">
                   <div className="landing-badge w-14 h-14 flex items-center justify-center rounded-2xl mb-8 shadow-sm">
                      <Compass weight="duotone" className="size-7 text-hl-aqua" />
                   </div>
                   <h3 className="font-heading text-xl md:text-2xl font-semibold tracking-tight">Multimodal</h3>
                   <p className="text-muted-foreground leading-relaxed">
                     Move between text and image inputs smoothly without breaking the flow of the conversation.
                   </p>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3 - Personalized */}
            <Card className="landing-panel relative overflow-hidden group min-h-[320px] rounded-3xl border-border/50">
              <CardContent className="p-8 md:p-10 flex flex-col h-full z-10 relative">
                <div className="space-y-4">
                   <div className="landing-badge w-14 h-14 flex items-center justify-center rounded-2xl mb-8 shadow-sm">
                      <Sliders weight="duotone" className="size-7 text-hl-orange" />
                   </div>
                   <h3 className="font-heading text-xl md:text-2xl font-semibold tracking-tight">Personalized</h3>
                   <p className="text-muted-foreground leading-relaxed">
                     Tune model choice, personality, and system guidance around how you actually work.
                   </p>
                </div>
              </CardContent>
            </Card>

            {/* Feature 4 - OpenRouter (Spans 2 columns) */}
            <Card className="landing-panel md:col-span-2 relative overflow-hidden group min-h-[320px] rounded-3xl border-border/50 bg-gradient-to-br from-card/80 to-hl-purple/5">
              <CardContent className="p-8 md:p-10 flex flex-col h-full justify-between z-10 relative">
                <div className="space-y-4 max-w-md">
                   <div className="landing-badge w-14 h-14 flex items-center justify-center rounded-2xl mb-8 shadow-sm">
                      <Robot weight="duotone" className="size-7 text-hl-purple" />
                   </div>
                   <h3 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight">OpenRouter Integration</h3>
                   <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                     Access top-tier models effortlessly. Switch between Claude 3.5 Sonnet, GPT-4o, and powerful open-source models depending on your task's needs.
                   </p>
                </div>
                {/* Abstract decorative element */}
                <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-40 transition-all duration-700 group-hover:scale-105 pointer-events-none">
                   <div className="grid grid-cols-3 gap-3">
                     {[...Array(9)].map((_, i) => (
                        <div key={i} className={`w-8 h-8 rounded-lg ${i % 2 === 0 ? 'bg-hl-purple/40' : 'bg-primary/40'} backdrop-blur-sm`}></div>
                     ))}
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* BOTTOM CTA SECTION */}
        <section className="max-w-5xl mx-auto w-full text-center mb-24 md:mb-32 space-y-8 bg-card/40 border border-border/60 p-10 md:p-16 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-hl-aqua/10 blur-[80px] rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full"></div>
          
          <div className="relative z-10 space-y-8">
            <div className="landing-badge inline-flex items-center justify-center size-20 rounded-3xl mx-auto shadow-lg shadow-primary/20 bg-background/80 backdrop-blur-xl">
              <ChatsTeardrop weight="duotone" className="size-10 text-primary" />
            </div>
            <div className="space-y-4">
              <h2 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight text-balance">
                Ready to elevate your AI workflow?
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto text-balance leading-relaxed">
                Join the thoughtful AI movement. Create an account today and experience a calmer, more productive environment for your best ideas.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Button size="lg" className="rounded-full px-10 h-14 text-lg font-semibold shadow-xl shadow-primary/25 w-full sm:w-auto hover:scale-105 transition-transform" asChild>
                <Link href="/sign-up">Get started for free</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-8 mt-auto bg-background/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-2 font-heading font-medium text-foreground/80">
              <ChatCircle weight="duotone" className="size-5 text-primary" />
              <span>xai workspace</span>
           </div>
           <p className="text-sm text-muted-foreground font-medium">
             © {new Date().getFullYear()} xai. Built for serious work.
           </p>
        </div>
      </footer>
    </div>
  );
}

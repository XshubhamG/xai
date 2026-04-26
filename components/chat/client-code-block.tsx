"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";
import { useTheme } from "next-themes";

import { getHighlighter, everforestDark, everforestLight } from "@/lib/theme/shiki";

interface ClientCodeBlockProps {
  code: string;
  lang?: string;
}

export function ClientCodeBlock({ code, lang = "text" }: ClientCodeBlockProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    let isMounted = true;

    async function highlight() {
      try {
        const highlighter = await getHighlighter();
        if (!isMounted) return;

        const highlightedHtml = highlighter.codeToHtml(code.trim(), {
          lang,
          themes: {
            dark: everforestDark.name!,
            light: everforestLight.name!,
          },
          defaultColor: resolvedTheme === "dark" ? "dark" : "light",
        });

        if (isMounted) {
          setHtml(highlightedHtml);
        }
      } catch (error) {
        console.error("Shiki highlighting failed:", error);
      }
    }

    void highlight();
    return () => {
      isMounted = false;
    };
  }, [code, lang, resolvedTheme]);

  const onCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group my-6 overflow-hidden rounded-2xl border border-border/40 bg-card/40 backdrop-blur-md shadow-xl shadow-black/5">
      <div className="flex items-center justify-between border-b border-border/40 bg-muted/20 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-primary/40"></div>
          <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em]">
            {lang}
          </span>
        </div>
        <button
          onClick={onCopy}
          className="text-muted-foreground hover:text-primary flex items-center gap-2 text-xs font-semibold transition-all hover:bg-primary/5 px-2 py-1 rounded-lg"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-primary" weight="bold" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" weight="bold" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="relative overflow-x-auto p-4 text-sm leading-relaxed">
        {html ? (
          <div
            dangerouslySetInnerHTML={{ __html: html }}
            className="[&_pre]:!m-0 [&_pre]:!bg-transparent [&_pre]:!p-0"
          />
        ) : (
          <pre className="m-0 bg-transparent p-0">
            <code className="bg-transparent p-0">{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}

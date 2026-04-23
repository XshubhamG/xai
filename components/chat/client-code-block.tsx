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
    <div className="group my-4 overflow-hidden rounded-xl border border-border/80 bg-background/50">
      <div className="flex items-center justify-between border-b border-border/80 bg-muted/30 px-4 py-2">
        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          {lang}
        </span>
        <button
          onClick={onCopy}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs transition-colors"
        >
          {copied ? (
            <>
              <Check className="size-3.5" weight="bold" />
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

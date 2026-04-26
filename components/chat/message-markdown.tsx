"use client";

import React, { createContext, useContext } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import { ClientCodeBlock } from "./client-code-block";

type MessageMarkdownProps = {
  children: string;
};

const CodeBlockContext = createContext(false);

function CodeComponent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"code">) {
  const isBlock = useContext(CodeBlockContext);
  const match = /language-(\w+)/.exec(className || "");
  const lang = match ? match[1] : undefined;

  if (isBlock) {
    return (
      <ClientCodeBlock
        code={String(children).replace(/\n$/, "")}
        lang={lang || "text"}
      />
    );
  }

  return (
    <code className={className} {...props}>
      {children}
    </code>
  );
}

function PreComponent({ children }: React.ComponentPropsWithoutRef<"pre">) {
  return (
    <CodeBlockContext.Provider value={true}>
      {children}
    </CodeBlockContext.Provider>
  );
}

export function MessageMarkdown({ children }: MessageMarkdownProps) {
  return (
    <div className="max-w-none text-base leading-relaxed text-foreground/90 
      [&_a]:text-primary [&_a]:font-semibold [&_a]:underline [&_a:hover]:text-primary/80 
      [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:bg-primary/5 [&_blockquote]:py-2 [&_blockquote]:pl-4 [&_blockquote]:rounded-r-lg 
      [&_code]:rounded-md [&_code]:bg-hl-bg-dim/50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm 
      [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:mb-4 [&_h1]:mt-6
      [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-4 [&_h2]:mt-6
      [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-3 [&_h3]:mt-5
      [&_h4]:text-base [&_h4]:font-semibold [&_h4]:mb-3 [&_h4]:mt-5
      [&_li]:mt-1 
      [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-2 
      [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 
      [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 
      [&_td]:border [&_td]:border-border/40 [&_td]:px-3 [&_td]:py-2 
      [&_th]:border [&_th]:border-border/40 [&_th]:bg-muted/50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold
      [&_p]:mb-4 last:[&_p]:mb-0
      ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          pre: PreComponent,
          code: CodeComponent,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

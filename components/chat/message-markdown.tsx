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
    <div className="max-w-none space-y-3 text-sm leading-7 [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_code]:rounded-md [&_code]:bg-background/70 [&_code]:px-1.5 [&_code]:py-0.5 [&_li]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-1 [&_p]:whitespace-pre-wrap [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1.5 [&_th]:border [&_th]:border-border [&_th]:bg-background/60 [&_th]:px-2 [&_th]:py-1.5 [&_ul]:list-disc [&_ul]:space-y-1">
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

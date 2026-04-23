"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MessageMarkdownProps = {
  children: string;
};

export function MessageMarkdown({ children }: MessageMarkdownProps) {
  return (
    <div className="max-w-none space-y-3 text-sm leading-7 [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_code]:rounded-md [&_code]:bg-background/70 [&_code]:px-1.5 [&_code]:py-0.5 [&_li]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-1 [&_p]:whitespace-pre-wrap [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border/80 [&_pre]:bg-background/70 [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1.5 [&_th]:border [&_th]:border-border [&_th]:bg-background/60 [&_th]:px-2 [&_th]:py-1.5 [&_ul]:list-disc [&_ul]:space-y-1">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}

import { getHighlighter, everforestDark, everforestLight } from "@/lib/theme/shiki";

interface CodeBlockProps {
  code: string;
  lang?: string;
  showLineNumbers?: boolean;
}

export async function CodeBlock({
  code,
  lang = "typescript",
  showLineNumbers = false,
}: CodeBlockProps) {
  const highlighter = await getHighlighter();

  const html = highlighter.codeToHtml(code.trim(), {
    lang,
    themes: {
      dark: everforestDark.name!,
      light: everforestLight.name!,
    },
  });

  return (
    <div
      className={`group relative overflow-hidden rounded-lg border border-border ${showLineNumbers ? "[&_code_.line::before]:mr-4 [&_code_.line::before]:inline-block [&_code_.line::before]:w-4 [&_code_.line::before]:text-right [&_code_.line::before]:text-hl-grey0 [&_code_.line::before]:content-[counter(line)] [&_code]:counter-reset-[line] [&_code_.line]:counter-increment-[line]" : ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

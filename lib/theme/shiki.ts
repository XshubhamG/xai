import { createHighlighter, type Highlighter } from "shiki";
import { everforestDark, everforestLight } from "./everforest-shiki";

let highlighterPromise: Promise<Highlighter> | null = null;

export function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [everforestDark, everforestLight],
      langs: [
        "typescript",
        "javascript",
        "tsx",
        "jsx",
        "html",
        "css",
        "json",
        "markdown",
        "bash",
        "python",
        "rust",
        "go",
      ],
    });
  }
  return highlighterPromise;
}

export { everforestDark, everforestLight };

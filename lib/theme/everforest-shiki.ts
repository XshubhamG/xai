import type { ThemeRegistrationRaw } from "shiki";
import type { ForegroundPalette, BackgroundPalette } from "./everforest";
import { palettes } from "./everforest";

function buildTheme(
  name: string,
  type: "dark" | "light",
  bg: BackgroundPalette,
  fg: ForegroundPalette,
): ThemeRegistrationRaw {
  const settings = [
    {
      settings: {
        foreground: fg.fg,
        background: bg.bg0,
      },
    },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: fg.grey1, fontStyle: "italic" },
    },
    {
      scope: [
        "variable",
        "variable.other",
        "variable.parameter",
        "meta.object-literal.key",
      ],
      settings: { foreground: fg.fg },
    },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "meta.function-call",
      ],
      settings: { foreground: fg.green },
    },
    {
      scope: [
        "string",
        "string.quoted",
        "punctuation.definition.string",
      ],
      settings: { foreground: fg.aqua },
    },
    {
      scope: ["constant.character.escape", "string.regexp"],
      settings: { foreground: fg.green },
    },
    {
      scope: [
        "keyword",
        "keyword.control",
        "keyword.operator.expression",
        "storage.type",
      ],
      settings: { foreground: fg.red },
    },
    {
      scope: [
        "keyword.operator",
        "keyword.operator.assignment",
        "storage.modifier",
        "entity.name.tag",
      ],
      settings: { foreground: fg.orange },
    },
    {
      scope: [
        "entity.name.type",
        "support.type",
        "entity.other.inherited-class",
      ],
      settings: { foreground: fg.yellow },
    },
    {
      scope: [
        "constant.numeric",
        "constant.language",
        "variable.language",
        "support.constant",
        "entity.other.attribute-name",
      ],
      settings: { foreground: fg.purple },
    },
    {
      scope: [
        "constant.other",
        "support.variable",
        "meta.definition.variable",
      ],
      settings: { foreground: fg.aqua },
    },
    {
      scope: [
        "variable.other.property",
        "support.type.property-name",
        "punctuation.special",
      ],
      settings: { foreground: fg.blue },
    },
    {
      scope: [
        "punctuation",
        "punctuation.separator",
        "punctuation.terminator",
        "meta.brace",
      ],
      settings: { foreground: fg.grey1 },
    },
    {
      scope: [
        "entity.name.namespace",
        "entity.name.module",
        "support.module",
      ],
      settings: { foreground: fg.yellow },
    },
    {
      scope: ["markup.heading", "markup.bold"],
      settings: { foreground: fg.orange, fontStyle: "bold" },
    },
    {
      scope: ["markup.italic"],
      settings: { foreground: fg.red, fontStyle: "italic" },
    },
    {
      scope: ["markup.inline.raw", "markup.fenced_code"],
      settings: { foreground: fg.green },
    },
    {
      scope: ["markup.list"],
      settings: { foreground: fg.red },
    },
    {
      scope: ["markup.underline.link"],
      settings: { foreground: fg.blue, fontStyle: "underline" },
    },
  ];

  return {
    name,
    type,
    settings,
    colors: {
      "editor.background": bg.bg0,
      "editor.foreground": fg.fg,
      "editor.selectionBackground": bg.bg_visual,
      "editor.lineHighlightBackground": bg.bg1,
      "editorCursor.foreground": fg.fg,
      "editorWhitespace.foreground": bg.bg4,
      "editorLineNumber.foreground": fg.grey0,
      "editorLineNumber.activeForeground": fg.grey2,
      "editorBracketMatch.background": bg.bg3,
      "editorBracketMatch.border": bg.bg4,
    },
  };
}

export const everforestDark = buildTheme(
  "everforest-dark",
  "dark",
  palettes.dark.bg,
  palettes.dark.fg,
);

export const everforestLight = buildTheme(
  "everforest-light",
  "light",
  palettes.light.bg,
  palettes.light.fg,
);

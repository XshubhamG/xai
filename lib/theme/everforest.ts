export type Mode = "dark" | "light";

export interface BackgroundPalette {
  bg_dim: string;
  bg0: string;
  bg1: string;
  bg2: string;
  bg3: string;
  bg4: string;
  bg5: string;
  bg_visual: string;
  bg_red: string;
  bg_yellow: string;
  bg_green: string;
  bg_blue: string;
  bg_purple: string;
}

export interface ForegroundPalette {
  fg: string;
  red: string;
  orange: string;
  yellow: string;
  green: string;
  aqua: string;
  blue: string;
  purple: string;
  grey0: string;
  grey1: string;
  grey2: string;
  statusline1: string;
  statusline2: string;
  statusline3: string;
}

export interface Palette {
  bg: BackgroundPalette;
  fg: ForegroundPalette;
}

export const dark: Palette = {
  bg: {
    bg_dim: "#1E2326",
    bg0: "#272E33",
    bg1: "#2E383C",
    bg2: "#374145",
    bg3: "#414B50",
    bg4: "#495156",
    bg5: "#4F5B58",
    bg_visual: "#4C3743",
    bg_red: "#493B40",
    bg_yellow: "#45443C",
    bg_green: "#3C4841",
    bg_blue: "#384B55",
    bg_purple: "#463F48",
  },
  fg: {
    fg: "#D3C6AA",
    red: "#E67E80",
    orange: "#E69875",
    yellow: "#DBBC7F",
    green: "#A7C080",
    aqua: "#83C092",
    blue: "#7FBBB3",
    purple: "#D699B6",
    grey0: "#7A8478",
    grey1: "#859289",
    grey2: "#9DA9A0",
    statusline1: "#A7C080",
    statusline2: "#D3C6AA",
    statusline3: "#E67E80",
  },
};

export const light: Palette = {
  bg: {
    bg_dim: "#F2EFDF",
    bg0: "#FFFBEF",
    bg1: "#F8F5E4",
    bg2: "#F2EFDF",
    bg3: "#EDEADA",
    bg4: "#E8E5D5",
    bg5: "#BEC5B2",
    bg_visual: "#F0F2D4",
    bg_red: "#FFE7DE",
    bg_yellow: "#FEF2D5",
    bg_green: "#F3F5D9",
    bg_blue: "#ECF5ED",
    bg_purple: "#FCECED",
  },
  fg: {
    fg: "#5C6A72",
    red: "#F85552",
    orange: "#F57D26",
    yellow: "#DFA000",
    green: "#8DA101",
    aqua: "#35A77C",
    blue: "#3A94C5",
    purple: "#DF69BA",
    grey0: "#A6B0A0",
    grey1: "#939F91",
    grey2: "#829181",
    statusline1: "#93B259",
    statusline2: "#708089",
    statusline3: "#E66868",
  },
};

export const palettes: Record<Mode, Palette> = { dark, light };

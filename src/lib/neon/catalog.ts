import type { DesignElement, NeonDesign } from "./types";
import {
  lookupAccessory,
  lookupBackboard,
  lookupBackingColor,
  lookupColor,
  lookupFont,
  lookupShape,
  lookupTier,
} from "../admin";

/* ---------------- Neon colors ---------------- */

export interface NeonColor {
  id: string;
  name: string;
  hex: string;
  surcharge: number;
}

export const NEON_COLORS: NeonColor[] = [
  { id: "pink", name: "Hot Pink", hex: "#ff2e88", surcharge: 0 },
  { id: "red", name: "Neon Red", hex: "#ff4b4b", surcharge: 0 },
  { id: "orange", name: "Tangerine", hex: "#ff8a00", surcharge: 0 },
  { id: "yellow", name: "Lemon Glow", hex: "#ffe14d", surcharge: 0 },
  { id: "green", name: "Mint Neon", hex: "#39ff88", surcharge: 0 },
  { id: "cyan", name: "Ice Cyan", hex: "#00e5ff", surcharge: 0 },
  { id: "blue", name: "Electric Blue", hex: "#3a7bff", surcharge: 0 },
  { id: "purple", name: "Ultra Violet", hex: "#b24bff", surcharge: 0 },
  { id: "warmwhite", name: "Warm White", hex: "#fff3d6", surcharge: 0 },
];

/** Lookups consult the admin-managed catalog first (enabled entries only),
 * falling back to the built-in defaults above. */

export function getColor(id: string): NeonColor {
  return lookupColor(id) ?? NEON_COLORS[0]!;
}

/** Core (tube center) color — mixed toward white like a lit LED tube. */
export function coreColor(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const mix = (v: number) => Math.round(v + (255 - v) * 0.55);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

/* ---------------- Fonts ---------------- */

export interface NeonFont {
  id: string;
  name: string;
  family: string;
  weight: number;
  uppercase: boolean;
  /** tube-usage multiplier */
  factor: number;
}

export const NEON_FONTS: NeonFont[] = [
  { id: "dancing", name: "Neon Script", family: '"Dancing Script", cursive', weight: 700, uppercase: false, factor: 1 },
  { id: "vibes", name: "Signature", family: '"Great Vibes", cursive', weight: 400, uppercase: false, factor: 1.05 },
  { id: "pacifico", name: "Retro Wave", family: "Pacifico, cursive", weight: 400, uppercase: false, factor: 1.1 },
  { id: "poppins", name: "Bold Block", family: "Poppins, sans-serif", weight: 700, uppercase: true, factor: 1.3 },
  { id: "lobster", name: "Graffiti", family: "Lobster, cursive", weight: 400, uppercase: false, factor: 1.15 },
  { id: "caveat", name: "Handwritten", family: '"Caveat", cursive', weight: 700, uppercase: false, factor: 0.9 },
  { id: "monoton", name: "Tube Line", family: "Monoton, cursive", weight: 400, uppercase: true, factor: 1.5 },
  { id: "grotesk", name: "Modern Sans", family: '"Space Grotesk", sans-serif', weight: 700, uppercase: false, factor: 1.2 },
];

export function getFont(id: string): NeonFont {
  return lookupFont(id) ?? NEON_FONTS[0]!;
}

/* ---------------- Shapes ---------------- */

export interface NeonShape {
  id: string;
  name: string;
  /** svg paths on a 24x24 stroke grid */
  d: string[];
  circles?: { cx: number; cy: number; r: number }[];
  base: number;
}

export const NEON_SHAPES: NeonShape[] = [
  {
    id: "heart",
    name: "Heart",
    d: ["M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"],
    base: 900,
  },
  {
    id: "star",
    name: "Star",
    d: ["M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.907l-3.79 3.686a2.12 2.12 0 0 0-.611 1.878l.894 5.195a.53.53 0 0 1-.77.56l-4.618-2.428a2.12 2.12 0 0 0-1.963 0L6.28 21.42a.53.53 0 0 1-.77-.56l.894-5.195a2.12 2.12 0 0 0-.611-1.878L2.002 10.3a.53.53 0 0 1 .294-.907l5.166-.756a2.12 2.12 0 0 0 1.595-1.16z"],
    base: 1000,
  },
  {
    id: "zap",
    name: "Lightning",
    d: ["M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"],
    base: 800,
  },
  {
    id: "moon",
    name: "Moon",
    d: ["M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"],
    base: 800,
  },
  {
    id: "music",
    name: "Music Note",
    d: ["M9 18V5l12-2v13"],
    circles: [
      { cx: 6, cy: 18, r: 3 },
      { cx: 18, cy: 16, r: 3 },
    ],
    base: 900,
  },
  {
    id: "crown",
    name: "Crown",
    d: ["M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.735H5.81a1 1 0 0 1-.957-.735L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"],
    base: 1100,
  },
  {
    id: "gem",
    name: "Diamond",
    d: ["M6 3h12l4 6-10 13L2 9z", "M11 3 8 9l4 13 4-13-3-6", "M2 9h20"],
    base: 1000,
  },
  {
    id: "coffee",
    name: "Coffee Cup",
    d: ["M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1", "M7 2v2", "M11 2v2"],
    base: 1000,
  },
  {
    id: "gamepad",
    name: "Gamepad",
    d: [
      "M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z",
      "M6 11h4",
      "M8 9v4",
      "M15 12h.01",
      "M18 10h.01",
    ],
    base: 1200,
  },
  {
    id: "flower",
    name: "Flower",
    d: [
      "M12 5a3 3 0 1 1 3.057 3.246A3 3 0 0 1 18 12a3 3 0 1 1-2.943 3.754A3 3 0 1 1 12 19a3 3 0 1 1-3.057-3.246A3 3 0 1 1 6 12a3 3 0 1 1 2.943-3.754A3 3 0 0 1 12 5z",
      "M12 5v9",
    ],
    base: 1100,
  },
  {
    id: "infinity",
    name: "Infinity",
    d: ["M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z"],
    base: 1000,
  },
  {
    id: "smile",
    name: "Smiley",
    d: ["M8 14s1.5 2 4 2 4-2 4-2", "M9 9h.01", "M15 9h.01"],
    circles: [{ cx: 12, cy: 12, r: 10 }],
    base: 900,
  },
];

export function getShape(id: string): NeonShape {
  return lookupShape(id) ?? NEON_SHAPES[0]!;
}

/* ---------------- Size tiers ---------------- */

export interface SizeTier {
  id: string;
  name: string;
  widthIn: number;
  /** height / width ratio of the sign area */
  ratio: number;
  base: number;
}

export const SIZE_TIERS: SizeTier[] = [
  { id: "s", name: "Small", widthIn: 20, ratio: 0.75, base: 4500 },
  { id: "m", name: "Medium", widthIn: 30, ratio: 0.7, base: 7500 },
  { id: "l", name: "Large", widthIn: 40, ratio: 0.65, base: 11000 },
  { id: "xl", name: "Extra Large", widthIn: 60, ratio: 0.6, base: 18000 },
];

export function getTier(id: string): SizeTier {
  return lookupTier(id) ?? SIZE_TIERS[1]!;
}

/* ---------------- Backboards ---------------- */

export interface Backboard {
  id: string;
  name: string;
  cost: number;
  /** panel corner radius as fraction of sign height; null = shaped halo, no panel */
  radius: number | null;
  border: boolean;
}

export const BACKBOARDS: Backboard[] = [
  { id: "cut", name: "Cut to Shape", cost: 800, radius: 0.18, border: false },
  { id: "rectangle", name: "Rectangle Panel", cost: 1200, radius: 0.03, border: true },
  { id: "rounded", name: "Rounded Panel", cost: 1000, radius: 0.14, border: true },
  { id: "none", name: "No Backboard", cost: 0, radius: null, border: false },
];

export function getBackboard(id: string): Backboard {
  return lookupBackboard(id) ?? BACKBOARDS[0]!;
}

export interface BackingColor {
  id: string;
  name: string;
  hex: string;
  surcharge: number;
}

export const BACKING_COLORS: BackingColor[] = [
  { id: "clear", name: "Clear Acrylic", hex: "#1b1b22", surcharge: 0 },
  { id: "black", name: "Matte Black", hex: "#0d0d12", surcharge: 0 },
  { id: "white", name: "Gloss White", hex: "#e9e9ef", surcharge: 300 },
  { id: "mirror", name: "Mirror Finish", hex: "#3a3a44", surcharge: 600 },
];

export function getBackingColor(id: string): BackingColor {
  return lookupBackingColor(id) ?? BACKING_COLORS[0]!;
}

/* ---------------- Accessories ---------------- */

export interface Accessory {
  id: string;
  name: string;
  cost: number;
  desc: string;
}

export const ACCESSORIES: Accessory[] = [
  { id: "dimmer", name: "Dimmer Switch", cost: 1200, desc: "Adjust brightness from a soft glow to full power" },
  { id: "remote", name: "Remote Control", cost: 2200, desc: "Wireless on/off, brightness and modes" },
  { id: "kit", name: "Mounting Kit", cost: 0, desc: "Screws, standoffs and template — included free" },
];

export function getAccessory(id: string): Accessory | undefined {
  return lookupAccessory(id);
}

/* ---------------- Scenes ---------------- */

export interface Scene {
  id: string;
  name: string;
}

export const SCENES: Scene[] = [
  { id: "studio", name: "Studio Wall" },
  { id: "bedroom", name: "Bedroom" },
  { id: "cafe", name: "Café" },
  { id: "gaming", name: "Gaming Room" },
];

/* ---------------- Design helpers ---------------- */

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function makeTextElement(partial: Partial<DesignElement> = {}): DesignElement {
  return {
    id: uid(),
    type: "text",
    x: 50,
    y: 45,
    scale: 1,
    rotation: 0,
    color: "pink",
    text: "Your Text",
    fontId: "dancing",
    ...partial,
  };
}

export function makeShapeElement(partial: Partial<DesignElement> = {}): DesignElement {
  return {
    id: uid(),
    type: "shape",
    x: 50,
    y: 72,
    scale: 1,
    rotation: 0,
    color: "pink",
    shapeId: "heart",
    ...partial,
  };
}

export function starterDesign(): NeonDesign {
  return {
    name: "My Neon Sign",
    tierId: "m",
    elements: [
      makeTextElement({ text: "YOUR NAME", color: "pink", fontId: "dancing", y: 40 }),
      makeShapeElement({ shapeId: "heart", color: "pink", y: 66, scale: 0.9 }),
    ],
    backboardId: "cut",
    backingColorId: "clear",
    accessories: ["kit"],
    outdoor: false,
    sceneId: "studio",
  };
}

export function cloneDesign(d: NeonDesign): NeonDesign {
  return {
    ...d,
    elements: d.elements.map((e) => ({ ...e })),
    accessories: [...d.accessories],
  };
}

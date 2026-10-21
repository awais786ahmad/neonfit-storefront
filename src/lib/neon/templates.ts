import type { DesignElement, NeonDesign } from "./types";
import { cloneDesign, makeShapeElement, makeTextElement } from "./catalog";
import { adminTemplateStore, builtinDisabledStore } from "../admin";

export interface Template {
  slug: string;
  name: string;
  category: string;
  blurb: string;
  design: NeonDesign;
}

export const TEMPLATE_CATEGORIES = [
  "All",
  "Names",
  "Love & Wedding",
  "Gaming",
  "Business",
  "Quotes",
  "Fun",
];

function templateDesign(name: string, elements: DesignElement[]): NeonDesign {
  return {
    name,
    tierId: "m",
    elements,
    backboardId: "cut",
    backingColorId: "clear",
    accessories: ["kit"],
    outdoor: false,
    sceneId: "studio",
  };
}

function buildTemplates(): Template[] {
  return [
    {
      slug: "good-vibes",
      name: "Good Vibes",
      category: "Quotes",
      blurb: "The classic feel-good script sign for living rooms and studios.",
      design: templateDesign("Good Vibes", [
        makeTextElement({ text: "Good Vibes", color: "pink", fontId: "dancing", y: 42, scale: 1.05 }),
        makeShapeElement({ shapeId: "star", color: "yellow", x: 24, y: 66, scale: 0.55 }),
        makeShapeElement({ shapeId: "star", color: "yellow", x: 76, y: 66, scale: 0.55 }),
      ]),
    },
    {
      slug: "emma-name",
      name: "Personalized Name",
      category: "Names",
      blurb: "A custom name sign in cool ice cyan — perfect for bedrooms and nurseries.",
      design: templateDesign("Emma", [
        makeTextElement({ text: "Emma", color: "cyan", fontId: "vibes", y: 42, scale: 1.1 }),
        makeShapeElement({ shapeId: "heart", color: "cyan", x: 72, y: 64, scale: 0.6 }),
      ]),
    },
    {
      slug: "mr-and-mrs",
      name: "Mr & Mrs",
      category: "Love & Wedding",
      blurb: "Warm white script with a glowing heart — a wedding and anniversary favorite.",
      design: templateDesign("Mr & Mrs", [
        makeTextElement({ text: "Mr & Mrs", color: "warmwhite", fontId: "dancing", y: 40, scale: 1 }),
        makeShapeElement({ shapeId: "heart", color: "red", x: 50, y: 66, scale: 0.75 }),
      ]),
    },
    {
      slug: "game-on",
      name: "Game On",
      category: "Gaming",
      blurb: "Ultra violet block letters with a gamepad — built for battle stations.",
      design: templateDesign("Game On", [
        makeTextElement({ text: "GAME ON", color: "purple", fontId: "poppins", y: 38, scale: 0.95 }),
        makeShapeElement({ shapeId: "gamepad", color: "purple", x: 50, y: 64, scale: 0.9 }),
      ]),
    },
    {
      slug: "but-first-coffee",
      name: "But First Coffee",
      category: "Business",
      blurb: "A tangerine café sign that pairs perfectly with espresso machines.",
      design: templateDesign("But First Coffee", [
        makeTextElement({ text: "But First", color: "orange", fontId: "caveat", y: 30, scale: 0.8 }),
        makeTextElement({ text: "Coffee", color: "orange", fontId: "dancing", y: 52, scale: 1.05 }),
        makeShapeElement({ shapeId: "coffee", color: "orange", x: 76, y: 68, scale: 0.6 }),
      ]),
    },
    {
      slug: "stay-wild",
      name: "Stay Wild",
      category: "Quotes",
      blurb: "Retro wave script in mint neon with a crescent moon.",
      design: templateDesign("Stay Wild", [
        makeTextElement({ text: "Stay Wild", color: "green", fontId: "pacifico", y: 40, scale: 1 }),
        makeShapeElement({ shapeId: "moon", color: "green", x: 76, y: 22, scale: 0.6 }),
      ]),
    },
    {
      slug: "dream-big",
      name: "Dream Big",
      category: "Quotes",
      blurb: "Electric blue tube-lettering for desks, studios and kids' rooms.",
      design: templateDesign("Dream Big", [
        makeTextElement({ text: "Dream Big", color: "blue", fontId: "grotesk", y: 42, scale: 1 }),
        makeShapeElement({ shapeId: "star", color: "blue", x: 74, y: 66, scale: 0.6 }),
      ]),
    },
    {
      slug: "lets-rock",
      name: "Let's Rock",
      category: "Fun",
      blurb: "Graffiti script in neon red with a music note — party mode on.",
      design: templateDesign("Let's Rock", [
        makeTextElement({ text: "Let's Rock", color: "red", fontId: "lobster", y: 40, scale: 1 }),
        makeShapeElement({ shapeId: "music", color: "red", x: 78, y: 24, scale: 0.65 }),
      ]),
    },
    {
      slug: "open-sign",
      name: "Café Open Sign",
      category: "Business",
      blurb: "A glowing green OPEN sign in classic tube lettering for shopfronts.",
      design: templateDesign("Open", [
        makeTextElement({ text: "OPEN", color: "green", fontId: "monoton", y: 38, scale: 1 }),
        makeShapeElement({ shapeId: "infinity", color: "yellow", x: 50, y: 66, scale: 0.7 }),
      ]),
    },
    {
      slug: "love-you",
      name: "Love You",
      category: "Love & Wedding",
      blurb: "Hot pink script with twin hearts for anniversaries and gifting.",
      design: templateDesign("Love You", [
        makeTextElement({ text: "Love You", color: "pink", fontId: "dancing", y: 40, scale: 1.05 }),
        makeShapeElement({ shapeId: "heart", color: "pink", x: 26, y: 64, scale: 0.55 }),
        makeShapeElement({ shapeId: "heart", color: "red", x: 74, y: 64, scale: 0.4 }),
      ]),
    },
    {
      slug: "beer-oclock",
      name: "Beer O'Clock",
      category: "Fun",
      blurb: "Lemon-glow tube lettering for home bars and game rooms.",
      design: templateDesign("Beer O'Clock", [
        makeTextElement({ text: "BEER", color: "yellow", fontId: "poppins", y: 30, scale: 0.9 }),
        makeTextElement({ text: "O'Clock", color: "yellow", fontId: "dancing", y: 58, scale: 0.95 }),
      ]),
    },
    {
      slug: "nursery-star",
      name: "Twinkle Little Star",
      category: "Names",
      blurb: "A soft warm-white lullaby sign with a glowing star.",
      design: templateDesign("Twinkle", [
        makeTextElement({ text: "Twinkle Twinkle", color: "warmwhite", fontId: "caveat", y: 38, scale: 0.85 }),
        makeShapeElement({ shapeId: "star", color: "yellow", x: 50, y: 62, scale: 0.7 }),
      ]),
    },
  ];
}

// Built-in templates are built lazily: element ids use Math.random(), which is
// disallowed in Cloudflare Workers global scope at module evaluation.
let cached: Template[] | null = null;

/** Built-in templates, minus any the admin has disabled. */
/** Full built-in template list (including admin-disabled ones), for the admin panel. */
export function allBuiltinTemplates(): Template[] {
  if (!cached) cached = buildTemplates();
  return cached;
}

/** Built-in templates, minus any the admin has disabled. */
function builtinTemplates(): Template[] {
  if (!cached) cached = buildTemplates();
  const disabled = builtinDisabledStore.read();
  return disabled.length ? cached.filter((t) => !disabled.includes(t.slug)) : cached;
}

/** All customer-facing templates: admin-created designs first, then built-ins. */
export function allTemplates(): Template[] {
  const custom = adminTemplateStore
    .read()
    .filter((e) => e.enabled)
    .map((e) => ({ slug: e.slug, name: e.name, category: e.category, blurb: e.blurb, design: e.design }));
  return [...custom, ...builtinTemplates()];
}

/** Category filter list including any categories added by admin templates. */
export function allCategories(): string[] {
  const seen = new Set<string>(TEMPLATE_CATEGORIES.filter((c) => c !== "All"));
  for (const t of allTemplates()) seen.add(t.category);
  return ["All", ...seen];
}

export function getTemplate(slug: string): Template | undefined {
  return allTemplates().find((t) => t.slug === slug);
}

export function instantiateTemplate(t: Template): NeonDesign {
  return { ...cloneDesign(t.design), name: t.name, templateSlug: t.slug };
}

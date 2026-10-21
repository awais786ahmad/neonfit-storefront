import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  Copy,
  Layers,
  Redo2,
  RotateCcw,
  Ruler,
  Save,
  Shapes,
  ShoppingBag,
  Sparkles,
  Trash2,
  Type,
  Undo2,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NeonCanvas } from "@/components/NeonCanvas";
import { PageFade } from "@/components/Reveal";
import {
  SCENES,
  cloneDesign,
  makeShapeElement,
  makeTextElement,
  starterDesign,
  uid,
} from "@/lib/neon/catalog";
import {
  useAccessories,
  useBackingColors,
  useBackboards,
  useColors,
  useFonts,
  useShapes,
  useTiers,
} from "@/lib/admin";
import { designToCartItem } from "@/lib/neon/cart";
import { formatPrice, priceDesign } from "@/lib/neon/pricing";
import { getTemplate, instantiateTemplate } from "@/lib/neon/templates";
import {
  addToCart,
  cartStore,
  designStore,
  draftStore,
  saveDesign,
} from "@/lib/store";
import { cn } from "@/lib/utils";
import type { DesignElement, NeonDesign } from "@/lib/neon/types";

type EditorSearch = { template?: string | undefined; design?: string | undefined; item?: string | undefined };

export const Route = createFileRoute("/editor")({
  validateSearch: (search: Record<string, unknown>): EditorSearch => ({
    template: typeof search["template"] === "string" ? search["template"] : undefined,
    design: typeof search["design"] === "string" ? search["design"] : undefined,
    item: typeof search["item"] === "string" ? search["item"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Create Your Neon Sign — NeonFitter Editor" },
      { name: "description", content: "Design your custom LED neon sign live — text, fonts, colors, shapes, size and backboard with instant pricing." },
      { property: "og:title", content: "Create Your Neon Sign — NeonFitter Editor" },
      { property: "og:description", content: "Design your custom neon sign with live preview and instant pricing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Editor,
});

/** Resolve a starting design from URL params (saved design, cart item or template). */
function initialDesign(search: EditorSearch): NeonDesign | null {
  if (search.design) {
    const saved = designStore.read().find((d) => d.id === search.design);
    if (saved) return cloneDesign(saved.design);
  }
  if (search.item) {
    const item = cartStore.read().find((i) => i.id === search.item);
    if (item) return cloneDesign(item.design);
  }
  if (search.template) {
    const t = getTemplate(search.template);
    if (t) return instantiateTemplate(t);
  }
  return null;
}

function Editor() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const [design, setDesignState] = useState<NeonDesign>(
    () => initialDesign(search) ?? draftStore.read() ?? starterDesign(),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [historyTick, setHistoryTick] = useState(0);
  const [upload, setUpload] = useState<string | null>(null);

  const designRef = useRef(design);
  designRef.current = design;
  const past = useRef<NeonDesign[]>([]);
  const future = useRef<NeonDesign[]>([]);
  const pendingSnap = useRef<NeonDesign | null>(null);
  const loadedParam = useRef<string | null>(null);

  const selected = design.elements.find((e) => e.id === selectedId) ?? null;
  const price = priceDesign(design);
  // Editor options come from the admin-managed catalog (Story F)
  const fonts = useFonts();
  const colors = useColors();
  const shapes = useShapes();
  const tiers = useTiers();
  const boards = useBackboards();
  const backings = useBackingColors();
  const accessories = useAccessories();

  // Load the design a URL param points at, once per param value
  useEffect(() => {
    const key = search.design ?? search.item ?? search.template ?? null;
    if (!key || loadedParam.current === key) return;
    loadedParam.current = key;
    const d = initialDesign(search);
    if (d) {
      past.current = [];
      future.current = [];
      setDesignState(d);
      setSelectedId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.design, search.item, search.template]);

  // Autosave the working draft continuously
  useEffect(() => {
    draftStore.write(design);
  }, [design]);

  const update = useCallback((fn: (d: NeonDesign) => NeonDesign) => {
    past.current = [...past.current.slice(-49), designRef.current];
    future.current = [];
    setDesignState(fn(designRef.current));
    setHistoryTick((t) => t + 1);
  }, []);

  const undo = () => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current = [...future.current, designRef.current];
    setDesignState(prev);
    setHistoryTick((t) => t + 1);
  };

  const redo = () => {
    const next = future.current.pop();
    if (!next) return;
    past.current = [...past.current, designRef.current];
    setDesignState(next);
    setHistoryTick((t) => t + 1);
  };

  const onElementChange = useCallback((id: string, patch: Partial<DesignElement>) => {
    if (!pendingSnap.current) pendingSnap.current = designRef.current;
    setDesignState((d) => ({
      ...d,
      elements: d.elements.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }, []);

  const onCommit = useCallback(() => {
    if (pendingSnap.current) {
      past.current = [...past.current.slice(-49), pendingSnap.current];
      future.current = [];
      pendingSnap.current = null;
      setHistoryTick((t) => t + 1);
    }
  }, []);

  const addText = () => {
    const el = makeTextElement({ text: "Your Text", color: selected?.color ?? "pink", y: 42 });
    update((d) => ({ ...d, elements: [...d.elements, el] }));
    setSelectedId(el.id);
  };

  const addShape = (shapeId: string) => {
    const el = makeShapeElement({ shapeId, color: selected?.color ?? "pink", y: 68 });
    update((d) => ({ ...d, elements: [...d.elements, el] }));
    setSelectedId(el.id);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    update((d) => ({ ...d, elements: d.elements.filter((e) => e.id !== selectedId) }));
    setSelectedId(null);
  };

  const duplicateSelected = () => {
    if (!selected) return;
    const el = { ...selected, id: uid(), x: Math.min(92, selected.x + 6), y: Math.min(92, selected.y + 6) };
    update((d) => ({ ...d, elements: [...d.elements, el] }));
    setSelectedId(el.id);
  };

  const reorder = (dir: -1 | 1) => {
    if (!selectedId) return;
    update((d) => {
      const idx = d.elements.findIndex((e) => e.id === selectedId);
      const to = idx + dir;
      if (idx < 0 || to < 0 || to >= d.elements.length) return d;
      const els = [...d.elements];
      const [el] = els.splice(idx, 1);
      els.splice(to, 0, el!);
      return { ...d, elements: els };
    });
  };

  const saveDesignEntry = () => {
    saveDesign({
      id: uid(),
      design: cloneDesign(design),
      price: priceDesign(design).total,
      savedAt: Date.now(),
    });
    toast.success("Design saved", { description: "Find it any time from this browser." });
  };

  const addToCartAction = () => {
    addToCart(designToCartItem(cloneDesign(design)));
    toast.success("Added to cart", { description: design.name });
    navigate({ to: "/cart" });
  };

  const onUploadFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (JPG, PNG or sketch).");
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      toast.error("Image is too large", { description: "Please upload an image under 1.5 MB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = typeof reader.result === "string" ? reader.result : null;
      setUpload(url);
      if (url) update((d) => ({ ...d, uploadedImage: url }));
      toast.success("Sketch attached", {
        description: "Our design team reviews every uploaded design before production.",
      });
    };
    reader.readAsDataURL(file);
  };

  const canUndo = past.current.length > 0;
  const canRedo = future.current.length > 0;
  void historyTick; // re-render marker for undo/redo button state

  return (
    <PageFade className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-10">
      {/* top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild aria-label="Back to shop">
            <Link to="/shop"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <p className="eyebrow">Design editor</p>
            <Input
              value={design.name}
              onChange={(e) => setDesignState((d) => ({ ...d, name: e.target.value }))}
              className="h-9 w-48 border-transparent bg-transparent px-2 font-display text-lg font-semibold text-foreground sm:w-64"
              aria-label="Design name"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo} aria-label="Undo">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo} aria-label="Redo">
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => update(() => starterDesign())} aria-label="Reset design">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={saveDesignEntry}>
            <Save className="h-4 w-4" /> Save
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="overflow-hidden rounded-3xl border border-border shadow-neon"
        >
          <NeonCanvas
            design={design}
            editable
            selectedId={selectedId}
            onSelect={setSelectedId}
            onElementChange={onElementChange}
            onCommit={onCommit}
            className="aspect-[4/3] w-full"
          />
          <div className="flex items-center justify-between gap-2 border-t border-border bg-card/70 px-4 py-2.5">
            <p className="text-xs text-muted-foreground">
              Tap an element to select · drag to move · handles to resize &amp; rotate
            </p>
            {selected && (
              <p className="hidden text-xs font-medium text-primary sm:block">
                {selected.type === "text" ? "Text" : "Shape"} selected
              </p>
            )}
          </div>
        </motion.div>

        {/* control panel */}
        <div className="flex flex-col gap-4">
          <Tabs defaultValue="add" className="rounded-3xl border border-border bg-card p-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="add"><span className="flex items-center gap-1.5"><Shapes className="h-3.5 w-3.5" /> Add</span></TabsTrigger>
              <TabsTrigger value="style"><span className="flex items-center gap-1.5"><Type className="h-3.5 w-3.5" /> Style</span></TabsTrigger>
              <TabsTrigger value="sign"><span className="flex items-center gap-1.5"><Ruler className="h-3.5 w-3.5" /> Sign</span></TabsTrigger>
            </TabsList>

            {/* ADD */}
            <TabsContent value="add" className="mt-4 space-y-5">
              <div>
                <p className="text-sm font-semibold text-foreground">Add text</p>
                <Button variant="hero" size="sm" className="mt-2 w-full" onClick={addText}>
                  <Type className="h-4 w-4" /> Add a text line
                </Button>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Add shape</p>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {shapes.map((s) => (
                    <button
                      key={s.id}
                      title={s.name}
                      onClick={() => addShape(s.id)}
                      className="flex aspect-square items-center justify-center rounded-xl border border-border text-muted-foreground transition-all hover:border-primary/60 hover:text-primary"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <g stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                          {s.d.map((p, i) => <path key={i} d={p} />)}
                          {s.circles?.map((c, i) => <circle key={`c${i}`} cx={c.cx} cy={c.cy} r={c.r} />)}
                        </g>
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Upload your design</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Have a sketch or logo? Attach it — our team reviews every upload before production.
                </p>
                <Label
                  htmlFor="nf-upload"
                  className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
                >
                  <Upload className="h-4 w-4" /> {upload ? "Replace image" : "Upload sketch or logo"}
                  <input
                    id="nf-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => onUploadFile(e.target.files?.[0])}
                  />
                </Label>
                {upload && (
                  <div className="mt-2 flex items-center gap-3 rounded-xl border border-border bg-background p-2">
                    <img src={upload} alt="Uploaded design reference" className="h-12 w-12 rounded-lg object-cover" />
                    <p className="flex-1 text-xs text-muted-foreground">Attached to this design</p>
                    <Button variant="ghost" size="icon" aria-label="Remove upload" onClick={() => { setUpload(null); update((d) => { const next = { ...d }; delete next.uploadedImage; return next; }); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* STYLE */}
            <TabsContent value="style" className="mt-4 space-y-5">
              {!selected ? (
                <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                  Select an element on the sign to edit its text, color and size.
                </p>
              ) : (
                <>
                  {selected.type === "text" && (
                    <div>
                      <Label htmlFor="nf-text" className="text-sm font-semibold text-foreground">Text</Label>
                      <Input
                        id="nf-text"
                        value={selected.text ?? ""}
                        onChange={(e) => onElementChange(selected.id, { text: e.target.value })}
                        maxLength={24}
                        className="mt-2"
                        placeholder="Type your text"
                      />
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Sparkles className="h-3 w-3 text-primary" /> Up to 24 characters keeps the sign readable
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-semibold text-foreground">Neon color</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {colors.map((c) => (
                        <button
                          key={c.id}
                          title={c.name}
                          aria-label={c.name}
                          onClick={() => onElementChange(selected.id, { color: c.id })}
                          className={cn(
                            "h-8 w-8 rounded-full border-2 border-transparent transition-transform hover:scale-110",
                            selected.color === c.id && "border-foreground",
                          )}
                          style={{ background: c.hex, boxShadow: `0 0 12px ${c.hex}` }}
                        />
                      ))}
                    </div>
                  </div>

                  {selected.type === "text" && (
                    <div>
                      <p className="text-sm font-semibold text-foreground">Font</p>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {fonts.map((f) => (
                          <button
                            key={f.id}
                            onClick={() => onElementChange(selected.id, { fontId: f.id })}
                            className={cn(
                              "rounded-xl border border-border px-3 py-2.5 text-center transition-all hover:border-primary/60",
                              (selected.fontId ?? "dancing") === f.id && "border-primary bg-primary/10 shadow-neon",
                            )}
                            style={{ fontFamily: f.family, fontWeight: f.weight, textTransform: f.uppercase ? "uppercase" : "none" }}
                          >
                            <span className="text-base text-foreground">{f.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">Size</p>
                      <span className="text-xs text-muted-foreground">{Math.round(selected.scale * 100)}%</span>
                    </div>
                    <Slider
                      className="mt-3"
                      value={[selected.scale]}
                      min={0.4}
                      max={2.5}
                      step={0.05}
                      onValueChange={([v]) => onElementChange(selected.id, { scale: v ?? 1 })}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={duplicateSelected}><Copy className="h-4 w-4" /> Duplicate</Button>
                    <Button variant="outline" size="sm" onClick={() => reorder(1)}><Layers className="h-4 w-4" /> Forward</Button>
                    <Button variant="outline" size="sm" onClick={() => reorder(-1)}><Layers className="h-4 w-4 rotate-180" /> Back</Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={deleteSelected}>
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>

            {/* SIGN */}
            <TabsContent value="sign" className="mt-4 space-y-5">
              <div>
                <p className="text-sm font-semibold text-foreground">Size</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {tiers.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => update((d) => ({ ...d, tierId: t.id }))}
                      className={cn(
                        "rounded-xl border border-border px-3 py-2.5 text-center transition-all hover:border-primary/60",
                        design.tierId === t.id && "border-primary bg-primary/10 shadow-neon",
                      )}
                    >
                      <span className="block text-sm font-semibold text-foreground">{t.name}</span>
                      <span className="block text-[11px] text-muted-foreground">{t.widthIn}" wide</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">Backboard</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {boards.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => update((d) => ({ ...d, backboardId: b.id }))}
                      className={cn(
                        "rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary/60 hover:text-foreground",
                        design.backboardId === b.id && "border-primary bg-primary/10 text-primary",
                      )}
                    >
                      {b.name}
                      {b.cost > 0 && <span className="ml-1">+{formatPrice(b.cost)}</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">Backing finish</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {backings.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => update((d) => ({ ...d, backingColorId: c.id }))}
                      className={cn(
                        "flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary/60 hover:text-foreground",
                        design.backingColorId === c.id && "border-primary bg-primary/10 text-primary",
                      )}
                    >
                      <span className="h-3.5 w-3.5 rounded-full border border-border" style={{ background: c.hex }} />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">Preview scene</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {SCENES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => update((d) => ({ ...d, sceneId: s.id }))}
                      className={cn(
                        "rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary/60 hover:text-foreground",
                        design.sceneId === s.id && "border-primary bg-primary/10 text-primary",
                      )}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">Accessories</p>
                <div className="mt-2 space-y-2">
                  {accessories.map((a) => {
                    const checked = design.accessories.includes(a.id);
                    return (
                      <label
                        key={a.id}
                        className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5 transition-colors hover:border-primary/50"
                      >
                        <span>
                          <span className="block text-sm font-medium text-foreground">{a.name}</span>
                          <span className="block text-xs text-muted-foreground">{a.desc}</span>
                        </span>
                        <span className="flex items-center gap-3">
                          {a.cost > 0 && <span className="text-xs text-muted-foreground">+{formatPrice(a.cost)}</span>}
                          <Switch
                            checked={checked}
                            onCheckedChange={(v) =>
                              update((d) => ({
                                ...d,
                                accessories: v ? [...d.accessories, a.id] : d.accessories.filter((x) => x !== a.id),
                              }))
                            }
                          />
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border px-3 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Outdoor / weatherproof build</p>
                  <p className="text-xs text-muted-foreground">Sealed, brighter tubes for outdoors (+12%)</p>
                </div>
                <Switch checked={design.outdoor} onCheckedChange={(v) => update((d) => ({ ...d, outdoor: v }))} />
              </div>
            </TabsContent>
          </Tabs>

          {/* price + order */}
          <div className="rounded-3xl border border-primary/40 bg-card p-4 shadow-neon">
            <div className="flex items-baseline justify-between">
              <p className="eyebrow">Estimated total</p>
              <motion.p
                key={price.total}
                initial={{ scale: 1.08, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="text-2xl font-bold text-primary"
              >
                {formatPrice(price.total)}
              </motion.p>
            </div>
            <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto scroll-slim">
              {price.lines.map((l, i) => (
                <li key={i} className="flex justify-between text-xs text-muted-foreground">
                  <span>{l.label}</span>
                  <span className="text-foreground">{formatPrice(l.amount)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button variant="hero" onClick={addToCartAction}>
                <ShoppingBag className="h-4 w-4" /> Add to Cart
              </Button>
              <Button variant="outline" onClick={saveDesignEntry}>
                <Save className="h-4 w-4" /> Save design
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageFade>
  );
}

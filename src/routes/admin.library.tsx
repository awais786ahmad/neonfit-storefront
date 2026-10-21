import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Palette, Type, Shapes as ShapesIcon, Ruler, Square, Layers, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { PageFade } from "@/components/Reveal";
import {
  adminCatalogStore,
  useAdminCatalog,
  type AdminAccessory,
  type AdminBackboard,
  type AdminBacking,
  type AdminCatalogState,
  type AdminColor,
  type AdminFont,
  type AdminShape,
  type AdminTier,
} from "@/lib/admin";
import { uid } from "@/lib/neon/catalog";

export const Route = createFileRoute("/admin/library")({
  head: () => ({
    meta: [
      { title: "Editor Library — NeonFitter Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLibrary,
});

/** Replace the admin catalog with the result of a mutation. */
function setCatalog(mutate: (cat: AdminCatalogState) => AdminCatalogState) {
  adminCatalogStore.write(mutate(adminCatalogStore.read()));
}

function toggleEntry(key: keyof AdminCatalogState, id: string, enabled: boolean) {
  setCatalog((cat) => ({
    ...cat,
    [key]: (cat[key] as { id: string; enabled: boolean }[]).map((e) => (e.id === id ? { ...e, enabled } : e)),
  }) as AdminCatalogState);
}

const TABS = [
  { value: "fonts", label: "Fonts", icon: Type },
  { value: "colors", label: "Neon Colors", icon: Palette },
  { value: "shapes", label: "Shapes", icon: ShapesIcon },
  { value: "tiers", label: "Sizes", icon: Ruler },
  { value: "backboards", label: "Backboards", icon: Square },
  { value: "backingColors", label: "Backing", icon: Layers },
  { value: "accessories", label: "Accessories", icon: Sparkles },
] as const;

function AdminLibrary() {
  const catalog = useAdminCatalog();

  return (
    <PageFade className="space-y-6">
      <div>
        <p className="eyebrow">Editor library</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">Editor Library</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Everything customers can pick in the design editor. Disable an option to hide it, or add
          new fonts, colors, shapes and parts — changes appear in the editor instantly.
        </p>
      </div>

      <Tabs defaultValue="fonts">
        <TabsList className="scroll-slim flex w-full justify-start gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="shrink-0 gap-1.5">
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="fonts" className="mt-4">
          <FontsTab fonts={catalog.fonts} />
        </TabsContent>
        <TabsContent value="colors" className="mt-4">
          <ColorsTab colors={catalog.colors} />
        </TabsContent>
        <TabsContent value="shapes" className="mt-4">
          <ShapesTab shapes={catalog.shapes} />
        </TabsContent>
        <TabsContent value="tiers" className="mt-4">
          <TiersTab tiers={catalog.tiers} />
        </TabsContent>
        <TabsContent value="backboards" className="mt-4">
          <BackboardsTab backboards={catalog.backboards} />
        </TabsContent>
        <TabsContent value="backingColors" className="mt-4">
          <BackingTab backings={catalog.backingColors} />
        </TabsContent>
        <TabsContent value="accessories" className="mt-4">
          <AccessoriesTab accessories={catalog.accessories} />
        </TabsContent>
      </Tabs>
    </PageFade>
  );
}

function EntryRow({ enabled, onToggle, children }: { enabled: boolean; onToggle: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
      <div className="min-w-0 flex-1">{children}</div>
      <Switch checked={enabled} onCheckedChange={onToggle} aria-label="Show in editor" />
    </div>
  );
}

function AddForm({ title, children, onAdd }: { title: string; children: React.ReactNode; onAdd: () => void }) {
  return (
    <div className="mt-4 rounded-3xl border border-dashed border-border bg-card/50 p-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
      <Button variant="hero" size="sm" className="mt-3" onClick={onAdd}>
        <Plus className="h-3.5 w-3.5" /> Add
      </Button>
    </div>
  );
}

/* ---------------- Fonts ---------------- */

function FontsTab({ fonts }: { fonts: AdminFont[] }) {
  const [form, setForm] = useState({ name: "", family: "", weight: "700", factor: "1" });

  function add() {
    const name = form.name.trim();
    const family = form.family.trim();
    if (!name || !family) {
      toast.error("Font needs a name and a CSS font family");
      return;
    }
    setCatalog((c) => ({
      ...c,
      fonts: [
        ...c.fonts,
        { id: slugId(name), name, family, weight: Number(form.weight) || 700, uppercase: false, factor: Number(form.factor) || 1, enabled: true },
      ],
    }));
    setForm({ name: "", family: "", weight: "700", factor: "1" });
    toast.success("Font added — it is now selectable in the editor");
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Tip: use a font family your storefront loads (Google Fonts), e.g. &quot;Pacifico&quot;, cursive.
      </p>
      {fonts.map((f) => (
        <EntryRow key={f.id} enabled={f.enabled} onToggle={(v) => toggleEntry("fonts", f.id, v)}>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <span className="text-base text-primary" style={{ fontFamily: f.family, fontWeight: f.weight }}>
              {f.uppercase ? f.name.toUpperCase() : f.name}
            </span>
            <span className="text-xs text-muted-foreground">{f.family}</span>
            <Badge variant="outline" className="rounded-full text-[10px]">
              tube ×{f.factor}
            </Badge>
          </div>
        </EntryRow>
      ))}
      <AddForm title="Add a font" onAdd={add}>
        <Field label="Display name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Neon Script" /></Field>
        <Field label="CSS font family"><Input value={form.family} onChange={(e) => setForm({ ...form, family: e.target.value })} placeholder='"Pacifico", cursive' /></Field>
        <Field label="Weight"><Input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} /></Field>
        <Field label="Tube usage ×"><Input type="number" step="0.05" value={form.factor} onChange={(e) => setForm({ ...form, factor: e.target.value })} /></Field>
      </AddForm>
    </div>
  );
}

/* ---------------- Colors ---------------- */

function ColorsTab({ colors }: { colors: AdminColor[] }) {
  const [form, setForm] = useState({ name: "", hex: "#ff2e88", surcharge: "0" });

  function add() {
    const name = form.name.trim();
    if (!name || !/^#[0-9a-fA-F]{6}$/.test(form.hex)) {
      toast.error("Color needs a name and a #rrggbb hex value");
      return;
    }
    setCatalog((c) => ({
      ...c,
      colors: [...c.colors, { id: slugId(name), name, hex: form.hex, surcharge: Number(form.surcharge) || 0, enabled: true }],
    }));
    setForm({ name: "", hex: "#ff2e88", surcharge: "0" });
    toast.success("Neon color added");
  }

  return (
    <div className="space-y-2">
      {colors.map((c) => (
        <EntryRow key={c.id} enabled={c.enabled} onToggle={(v) => toggleEntry("colors", c.id, v)}>
          <div className="flex flex-wrap items-center gap-3">
            <span className="neon-dot h-5 w-5 rounded-full" style={{ backgroundColor: c.hex, boxShadow: `0 0 10px ${c.hex}` }} />
            <span className="text-sm font-medium text-foreground">{c.name}</span>
            <span className="font-mono text-xs text-muted-foreground">{c.hex}</span>
            {c.surcharge > 0 && <Badge variant="outline" className="rounded-full text-[10px]">+Rs {c.surcharge}</Badge>}
          </div>
        </EntryRow>
      ))}
      <AddForm title="Add a neon color" onAdd={add}>
        <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ice Blue" /></Field>
        <Field label="Hex value"><Input value={form.hex} onChange={(e) => setForm({ ...form, hex: e.target.value })} placeholder="#39d5ff" /></Field>
        <Field label="Surcharge (Rs)"><Input type="number" value={form.surcharge} onChange={(e) => setForm({ ...form, surcharge: e.target.value })} /></Field>
      </AddForm>
    </div>
  );
}

/* ---------------- Shapes ---------------- */

function ShapePreview({ shape }: { shape: AdminShape }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-primary" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {shape.d.map((p, i) => (
        <path key={i} d={p} />
      ))}
      {shape.circles?.map((c, i) => (
        <circle key={`c${i}`} cx={c.cx} cy={c.cy} r={c.r} />
      ))}
    </svg>
  );
}

function ShapesTab({ shapes }: { shapes: AdminShape[] }) {
  const [form, setForm] = useState({ name: "", d: "", base: "800" });

  function add() {
    const name = form.name.trim();
    const paths = form.d.split("\n").map((p) => p.trim()).filter(Boolean);
    if (!name || paths.length === 0) {
      toast.error("Shape needs a name and at least one SVG path");
      return;
    }
    setCatalog((c) => ({ ...c, shapes: [...c.shapes, { id: slugId(name), name, d: paths, base: Number(form.base) || 800, enabled: true }] }));
    setForm({ name: "", d: "", base: "800" });
    toast.success("Shape added");
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        SVG paths on a 24×24 stroke grid (like Lucide icons), one path per line.
      </p>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {shapes.map((s) => (
          <EntryRow key={s.id} enabled={s.enabled} onToggle={(v) => toggleEntry("shapes", s.id, v)}>
            <div className="flex items-center gap-3">
              <ShapePreview shape={s} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{s.name}</p>
                <Badge variant="outline" className="mt-0.5 rounded-full text-[10px]">from Rs {s.base}</Badge>
              </div>
            </div>
          </EntryRow>
        ))}
      </div>
      <AddForm title="Add a shape" onAdd={add}>
        <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Crown" /></Field>
        <Field label="Base price (Rs)"><Input type="number" value={form.base} onChange={(e) => setForm({ ...form, base: e.target.value })} /></Field>
        <div className="sm:col-span-2 lg:col-span-2">
          <Field label="SVG paths (one per line)">
            <Textarea value={form.d} onChange={(e) => setForm({ ...form, d: e.target.value })} rows={3} placeholder={"M3 5h18\nM8 12h8"} className="font-mono text-xs" />
          </Field>
        </div>
      </AddForm>
    </div>
  );
}

/* ---------------- Sizes ---------------- */

function TiersTab({ tiers }: { tiers: AdminTier[] }) {
  const [form, setForm] = useState({ name: "", widthIn: "25", ratio: "0.7", base: "6000" });

  function add() {
    const name = form.name.trim();
    if (!name) {
      toast.error("Size tier needs a name");
      return;
    }
    setCatalog((c) => ({
      ...c,
      tiers: [
        ...c.tiers,
        { id: slugId(name), name, widthIn: Number(form.widthIn) || 25, ratio: Number(form.ratio) || 0.7, base: Number(form.base) || 6000, enabled: true },
      ],
    }));
    setForm({ name: "", widthIn: "25", ratio: "0.7", base: "6000" });
    toast.success("Size tier added");
  }

  return (
    <div className="space-y-2">
      {tiers.map((t) => (
        <EntryRow key={t.id} enabled={t.enabled} onToggle={(v) => toggleEntry("tiers", t.id, v)}>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-foreground">{t.name}</span>
            <span className="text-xs text-muted-foreground">{t.widthIn}&quot; wide · ratio {t.ratio}</span>
            <Badge variant="outline" className="rounded-full text-[10px]">from Rs {t.base.toLocaleString()}</Badge>
          </div>
        </EntryRow>
      ))}
      <AddForm title="Add a size tier" onAdd={add}>
        <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="X-Large" /></Field>
        <Field label="Width (inches)"><Input type="number" value={form.widthIn} onChange={(e) => setForm({ ...form, widthIn: e.target.value })} /></Field>
        <Field label="Height ratio"><Input type="number" step="0.05" value={form.ratio} onChange={(e) => setForm({ ...form, ratio: e.target.value })} /></Field>
        <Field label="Base price (Rs)"><Input type="number" value={form.base} onChange={(e) => setForm({ ...form, base: e.target.value })} /></Field>
      </AddForm>
    </div>
  );
}

/* ---------------- Backboards ---------------- */

function BackboardsTab({ backboards }: { backboards: AdminBackboard[] }) {
  const [form, setForm] = useState({ name: "", cost: "1000", radius: "0.1", border: false, halo: false });

  function add() {
    const name = form.name.trim();
    if (!name) {
      toast.error("Backboard needs a name");
      return;
    }
    setCatalog((c) => ({
      ...c,
      backboards: [
        ...c.backboards,
        {
          id: slugId(name),
          name,
          cost: Number(form.cost) || 0,
          radius: form.halo ? null : Number(form.radius) || 0.03,
          border: !form.halo && form.border,
          enabled: true,
        },
      ],
    }));
    setForm({ name: "", cost: "1000", radius: "0.1", border: false, halo: false });
    toast.success("Backboard added");
  }

  return (
    <div className="space-y-2">
      {backboards.map((b) => (
        <EntryRow key={b.id} enabled={b.enabled} onToggle={(v) => toggleEntry("backboards", b.id, v)}>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-foreground">{b.name}</span>
            <span className="text-xs text-muted-foreground">{b.radius === null ? "shaped halo (no panel)" : `panel · corners ${b.radius}`}</span>
            <Badge variant="outline" className="rounded-full text-[10px]">Rs {b.cost.toLocaleString()}</Badge>
          </div>
        </EntryRow>
      ))}
      <AddForm title="Add a backboard" onAdd={add}>
        <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Hexagon Panel" /></Field>
        <Field label="Cost (Rs)"><Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} /></Field>
        <Field label="Corner radius"><Input type="number" step="0.01" value={form.radius} onChange={(e) => setForm({ ...form, radius: e.target.value })} /></Field>
        <div className="flex flex-col justify-end gap-2 pb-1 text-xs text-muted-foreground">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.border} onChange={(e) => setForm({ ...form, border: e.target.checked })} /> Border line
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.halo} onChange={(e) => setForm({ ...form, halo: e.target.checked })} /> Shaped halo (no panel)
          </label>
        </div>
      </AddForm>
    </div>
  );
}

/* ---------------- Backing colors ---------------- */

function BackingTab({ backings }: { backings: AdminBacking[] }) {
  const [form, setForm] = useState({ name: "", hex: "#1b1b22", surcharge: "0" });

  function add() {
    const name = form.name.trim();
    if (!name || !/^#[0-9a-fA-F]{6}$/.test(form.hex)) {
      toast.error("Backing needs a name and a #rrggbb hex value");
      return;
    }
    setCatalog((c) => ({
      ...c,
      backingColors: [...c.backingColors, { id: slugId(name), name, hex: form.hex, surcharge: Number(form.surcharge) || 0, enabled: true }],
    }));
    setForm({ name: "", hex: "#1b1b22", surcharge: "0" });
    toast.success("Backing finish added");
  }

  return (
    <div className="space-y-2">
      {backings.map((b) => (
        <EntryRow key={b.id} enabled={b.enabled} onToggle={(v) => toggleEntry("backingColors", b.id, v)}>
          <div className="flex flex-wrap items-center gap-3">
            <span className="h-5 w-5 rounded-md border border-border" style={{ backgroundColor: b.hex }} />
            <span className="text-sm font-medium text-foreground">{b.name}</span>
            {b.surcharge > 0 && <Badge variant="outline" className="rounded-full text-[10px]">+Rs {b.surcharge}</Badge>}
          </div>
        </EntryRow>
      ))}
      <AddForm title="Add a backing finish" onAdd={add}>
        <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Frosted" /></Field>
        <Field label="Hex value"><Input value={form.hex} onChange={(e) => setForm({ ...form, hex: e.target.value })} /></Field>
        <Field label="Surcharge (Rs)"><Input type="number" value={form.surcharge} onChange={(e) => setForm({ ...form, surcharge: e.target.value })} /></Field>
      </AddForm>
    </div>
  );
}

/* ---------------- Accessories ---------------- */

function AccessoriesTab({ accessories }: { accessories: AdminAccessory[] }) {
  const [form, setForm] = useState({ name: "", cost: "500", desc: "" });

  function add() {
    const name = form.name.trim();
    if (!name) {
      toast.error("Accessory needs a name");
      return;
    }
    setCatalog((c) => ({
      ...c,
      accessories: [...c.accessories, { id: slugId(name), name, cost: Number(form.cost) || 0, desc: form.desc.trim(), enabled: true }],
    }));
    setForm({ name: "", cost: "500", desc: "" });
    toast.success("Accessory added");
  }

  return (
    <div className="space-y-2">
      {accessories.map((a) => (
        <EntryRow key={a.id} enabled={a.enabled} onToggle={(v) => toggleEntry("accessories", a.id, v)}>
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-sm font-medium text-foreground">{a.name}</span>
            <span className="text-xs text-muted-foreground">{a.desc}</span>
            <Badge variant="outline" className="rounded-full text-[10px]">Rs {a.cost.toLocaleString()}</Badge>
          </div>
        </EntryRow>
      ))}
      <AddForm title="Add an accessory" onAdd={add}>
        <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Remote Dimmer" /></Field>
        <Field label="Cost (Rs)"><Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} /></Field>
        <div className="sm:col-span-2">
          <Field label="Short description"><Input value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Wireless brightness control" /></Field>
        </div>
      </AddForm>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function slugId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "opt-" + uid().slice(0, 4);
}

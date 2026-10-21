import { createFileRoute } from "@tanstack/react-router";
import { useSyncExternalStore, useState } from "react";
import { toast } from "sonner";
import { Copy, Package, Pencil, Plus, Shapes, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { NeonCanvas } from "@/components/NeonCanvas";
import { PageFade } from "@/components/Reveal";
import {
  adminTemplateStore,
  builtinDisabledStore,
  setBuiltinTemplateEnabled,
  useAdminTemplates,
  type AdminTemplateEntry,
} from "@/lib/admin";
import { cloneDesign, makeTextElement, uid } from "@/lib/neon/catalog";
import { allBuiltinTemplates, TEMPLATE_CATEGORIES, type Template } from "@/lib/neon/templates";
import type { NeonDesign } from "@/lib/neon/types";

export const Route = createFileRoute("/admin/catalog")({
  head: () => ({
    meta: [
      { title: "Products & Templates — NeonFitter Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminCatalog,
});

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "template";
}

function defaultDesign(name: string): NeonDesign {
  return {
    name,
    tierId: "m",
    elements: [makeTextElement({ text: "YOUR TEXT", color: "pink", fontId: "dancing" })],
    backboardId: "cut",
    backingColorId: "clear",
    accessories: ["kit"],
    outdoor: false,
    sceneId: "studio",
  };
}

interface TemplateForm {
  name: string;
  category: string;
  blurb: string;
  startFrom: string;
}

function emptyForm(): TemplateForm {
  return { name: "", category: "Names", blurb: "", startFrom: "blank" };
}

function AdminCatalog() {
  const customEntries = useAdminTemplates();
  const builtins = allBuiltinTemplates();
  const disabledBuiltins = useDisabledBuiltins();
  const allTemplatesForCopy: { slug: string; name: string; design: NeonDesign }[] = [
    ...customEntries.map((e) => ({ slug: e.slug, name: e.name, design: e.design })),
    ...builtins.map((t) => ({ slug: t.slug, name: t.name, design: t.design })),
  ];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TemplateForm>(emptyForm());
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  }

  function openEdit(entry: AdminTemplateEntry) {
    setEditingId(entry.id);
    setForm({ name: entry.name, category: entry.category, blurb: entry.blurb, startFrom: entry.slug });
    setDialogOpen(true);
  }

  function saveTemplate() {
    const name = form.name.trim();
    if (!name) {
      toast.error("Give the design a name first");
      return;
    }
    const category = form.category.trim() || "Names";
    if (editingId) {
      adminTemplateStore.write(
        customEntries.map((e) =>
          e.id === editingId ? { ...e, name, category, blurb: form.blurb.trim() } : e,
        ),
      );
      toast.success("Design updated");
    } else {
      const source = allTemplatesForCopy.find((t) => t.slug === form.startFrom);
      const design = source ? cloneDesign(source.design) : defaultDesign(name);
      design.name = name;
      const entry: AdminTemplateEntry = {
        id: uid(),
        slug: `${slugify(name)}-${uid().slice(0, 4)}`,
        name,
        category,
        blurb: form.blurb.trim(),
        design,
        enabled: true,
      };
      adminTemplateStore.write([entry, ...customEntries]);
      toast.success("Ready-made design created", { description: "Customers can now find it in Shop Designs." });
    }
    setDialogOpen(false);
  }

  function toggleCustom(id: string, enabled: boolean) {
    adminTemplateStore.write(customEntries.map((e) => (e.id === id ? { ...e, enabled } : e)));
  }

  function duplicate(entry: AdminTemplateEntry) {
    const copy: AdminTemplateEntry = {
      ...entry,
      id: uid(),
      slug: `${entry.slug}-copy-${uid().slice(0, 4)}`,
      name: `${entry.name} (Copy)`,
      enabled: false,
    };
    adminTemplateStore.write([copy, ...customEntries]);
    toast.success("Design duplicated", { description: "The copy is hidden until you enable it." });
  }

  function remove(id: string) {
    adminTemplateStore.write(customEntries.filter((e) => e.id !== id));
    setDeleteId(null);
    toast.success("Design deleted");
  }

  return (
    <PageFade className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">Products &amp; Templates</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            The ready-made designs customers can customize in the shop. Duplicate a design to make your
            own version, or create a new one from blank.
          </p>
        </div>
        <Button variant="hero" onClick={openCreate}>
          <Plus className="h-4 w-4" /> New design
        </Button>
      </div>

      {/* custom designs */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          <Shapes className="h-4 w-4 text-primary" /> Your designs
        </h2>
        {customEntries.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center">
            <Package className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium text-foreground">No custom designs yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create one from blank, or duplicate any built-in template below.
            </p>
            <Button variant="hero" size="sm" className="mt-4" onClick={openCreate}>
              <Plus className="h-3.5 w-3.5" /> New design
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {customEntries.map((entry) => (
              <div key={entry.id} className="flex flex-col rounded-3xl border border-border bg-card p-4">
                <div className="glow-stage relative overflow-hidden rounded-2xl border border-border">
                  <NeonCanvas design={entry.design} className="aspect-[4/3] w-full" />
                </div>
                <div className="mt-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{entry.name}</p>
                    <Badge variant="secondary" className="mt-1 rounded-full text-[10px]">{entry.category}</Badge>
                  </div>
                  <Switch
                    checked={entry.enabled}
                    onCheckedChange={(v) => toggleCustom(entry.id, v)}
                    aria-label={`Show ${entry.name} to customers`}
                  />
                </div>
                {entry.blurb && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{entry.blurb}</p>}
                <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-3">
                  <Button variant="ghost" size="sm" className="h-7 flex-1 text-xs" onClick={() => openEdit(entry)}>
                    <Pencil className="h-3 w-3" /> Details
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 flex-1 text-xs" onClick={() => duplicate(entry)}>
                    <Copy className="h-3 w-3" /> Duplicate
                  </Button>
                  <AlertDialog open={deleteId === entry.id} onOpenChange={(o) => !o && setDeleteId(null)}>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => setDeleteId(entry.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete “{entry.name}”?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This permanently removes the design from the shop. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => remove(entry.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* built-in templates */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          <Package className="h-4 w-4 text-primary" /> Built-in designs
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {builtins.map((t) => (
            <BuiltinCard key={t.slug} template={t} disabled={disabledBuiltins.includes(t.slug)} onToggle={setBuiltinTemplateEnabled} onDuplicate={duplicateBuiltin} />
          ))}
        </div>
      </section>

      {/* create / edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit design details" : "New ready-made design"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the name, category and shop description."
                : "Start from blank or copy an existing design, then set how it appears in the shop."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="nf-tpl-name">Name</Label>
              <Input
                id="nf-tpl-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Happy Birthday"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="nf-tpl-cat">Category</Label>
              <Input
                id="nf-tpl-cat"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                list="nf-tpl-cats"
                placeholder="Names, Love & Wedding, Gaming…"
                className="mt-1.5"
              />
              <datalist id="nf-tpl-cats">
                {TEMPLATE_CATEGORIES.filter((c) => c !== "All").map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <Label htmlFor="nf-tpl-blurb">Shop description</Label>
              <Textarea
                id="nf-tpl-blurb"
                value={form.blurb}
                onChange={(e) => setForm((f) => ({ ...f, blurb: e.target.value }))}
                rows={2}
                placeholder="One line that sells the design…"
                className="mt-1.5"
              />
            </div>
            {!editingId && (
              <div>
                <Label htmlFor="nf-tpl-start">Start from</Label>
                <select
                  id="nf-tpl-start"
                  value={form.startFrom}
                  onChange={(e) => setForm((f) => ({ ...f, startFrom: e.target.value }))}
                  className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                >
                  <option value="blank">Blank (one editable text line)</option>
                  {allTemplatesForCopy.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      Copy of “{t.name}”
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="hero" onClick={saveTemplate}>{editingId ? "Save changes" : "Create design"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageFade>
  );
}

function useDisabledBuiltins(): string[] {
  return useSyncExternalStore(builtinDisabledStore.subscribe, builtinDisabledStore.read, () => []);
}

function duplicateBuiltin(t: Template) {
  const entry: AdminTemplateEntry = {
    id: uid(),
    slug: `${t.slug}-copy-${uid().slice(0, 4)}`,
    name: `${t.name} (Copy)`,
    category: t.category,
    blurb: t.blurb,
    design: cloneDesign(t.design),
    enabled: false,
  };
  adminTemplateStore.write([entry, ...adminTemplateStore.read()]);
  toast.success("Design duplicated", { description: "Find it under “Your designs” and enable it when ready." });
}

function BuiltinCard({
  template,
  disabled,
  onToggle,
  onDuplicate,
}: {
  template: Template;
  disabled: boolean;
  onToggle: (slug: string, enabled: boolean) => void;
  onDuplicate: (t: Template) => void;
}) {
  return (
    <div className={`flex flex-col rounded-3xl border border-border bg-card p-4 ${disabled ? "opacity-60" : ""}`}>
      <div className="glow-stage relative overflow-hidden rounded-2xl border border-border">
        <NeonCanvas design={template.design} className="aspect-[4/3] w-full" />
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{template.name}</p>
          <Badge variant="secondary" className="mt-1 rounded-full text-[10px]">{template.category}</Badge>
        </div>
        <Switch checked={!disabled} onCheckedChange={(v) => onToggle(template.slug, v)} aria-label={`Show ${template.name} to customers`} />
      </div>
      {disabled && <p className="mt-2 text-xs text-destructive">Hidden from customers</p>}
      <div className="mt-3 border-t border-border pt-3">
        <Button variant="ghost" size="sm" className="h-7 w-full text-xs" onClick={() => onDuplicate(template)}>
          <Copy className="h-3 w-3" /> Duplicate to customize
        </Button>
      </div>
    </div>
  );
}

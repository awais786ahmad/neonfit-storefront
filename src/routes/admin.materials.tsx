import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, ArrowDownCircle, ArrowUpCircle, Boxes, History, PackagePlus, Trash2 } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageFade } from "@/components/Reveal";
import {
  addMaterial,
  deleteMaterial,
  recordMovement,
  reservedQty,
  updateMaterial,
  useMaterials,
  useMovements,
  useReservations,
  type Material,
  type StockMovement,
} from "@/lib/admin";

export const Route = createFileRoute("/admin/materials")({
  head: () => ({
    meta: [
      { title: "Materials — NeonFitter Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminMaterials,
});

const MOVEMENT_LABELS: Record<StockMovement["type"], string> = {
  purchase: "Purchase (stock in)",
  usage: "Production usage",
  adjustment: "Adjustment",
  damage: "Damaged / lost",
};

function AdminMaterials() {
  const materials = useMaterials();
  const movements = useMovements();
  const reservations = useReservations();

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", unit: "", supplier: "", unitCost: "", stock: "0", lowThreshold: "5" });
  const [moveFor, setMoveFor] = useState<Material | null>(null);
  const [moveForm, setMoveForm] = useState({ type: "usage", qty: "1", note: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function add() {
    const name = form.name.trim();
    const unit = form.unit.trim();
    if (!name || !unit) {
      toast.error("Material needs a name and a unit (e.g. roll, sheet)");
      return;
    }
    addMaterial({
      name,
      unit,
      supplier: form.supplier.trim(),
      unitCost: Number(form.unitCost) || 0,
      stock: Number(form.stock) || 0,
      lowThreshold: Number(form.lowThreshold) || 0,
    });
    setForm({ name: "", unit: "", supplier: "", unitCost: "", stock: "0", lowThreshold: "5" });
    setAddOpen(false);
    toast.success("Material added");
  }

  function record() {
    if (!moveFor) return;
    const qty = Number(moveForm.qty);
    if (!qty || qty <= 0) {
      toast.error("Enter a quantity first");
      return;
    }
    recordMovement(moveFor.id, moveForm.type as StockMovement["type"], qty, moveForm.note.trim());
    setMoveFor(null);
    setMoveForm({ type: "usage", qty: "1", note: "" });
    toast.success("Stock movement recorded");
  }

  const lowStock = materials.filter((m) => m.stock < m.lowThreshold);

  return (
    <PageFade className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Inventory</p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">Materials</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            LED flex, acrylic, power supplies and everything production needs. Stock updates as you
            record purchases and production usage, and low items get flagged here.
          </p>
        </div>
        <Button variant="hero" onClick={() => setAddOpen(true)}>
          <PackagePlus className="h-4 w-4" /> Add material
        </Button>
      </div>

      {lowStock.length > 0 && (
        <div className="flex items-start gap-3 rounded-3xl border border-destructive/40 bg-destructive/10 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">
            Low stock: {lowStock.map((m) => `${m.name} (${m.stock} ${m.unit})`).join(", ")}
          </p>
        </div>
      )}

      {materials.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center">
          <Boxes className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium text-foreground">No materials yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Add your supplies, or load sample data from Settings.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          <div className="scroll-slim overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Material</th>
                  <th className="px-4 py-3 font-semibold">Supplier</th>
                  <th className="px-4 py-3 text-right font-semibold">Unit cost</th>
                  <th className="px-4 py-3 text-right font-semibold">Stock</th>
                  <th className="px-4 py-3 text-right font-semibold">Reserved</th>
                  <th className="px-4 py-3 text-right font-semibold">Available</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((m) => {
                  const reserved = reservedQty(m.id, reservations);
                  const low = m.stock < m.lowThreshold;
                  return (
                    <tr key={m.id} className="border-b border-border/60 last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{m.name}</p>
                        <p className="text-xs text-muted-foreground">per {m.unit} · alert below {m.lowThreshold}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{m.supplier || "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <EditableCost material={m} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {m.stock} {m.unit}
                        {low && <Badge variant="destructive" className="ml-2 rounded-full text-[10px]">Low</Badge>}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{reserved}</td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">{m.stock - reserved}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setMoveFor(m)}>
                            <ArrowDownCircle className="h-3 w-3" /> Movement
                          </Button>
                          <AlertDialog open={deleteId === m.id} onOpenChange={(o) => !o && setDeleteId(null)}>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 text-destructive" aria-label={`Delete ${m.name}`} onClick={() => setDeleteId(m.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete “{m.name}”?</AlertDialogTitle>
                                <AlertDialogDescription>Removes the material and its movement history.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => { deleteMaterial(m.id); setDeleteId(null); toast.success("Material deleted"); }}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* movement history */}
      <section className="rounded-3xl border border-border bg-card p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <History className="h-4 w-4 text-primary" /> Recent movements
        </p>
        {movements.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No stock movements recorded yet.</p>
        ) : (
          <ul className="mt-3 space-y-2.5">
            {movements.slice(0, 12).map((mv) => {
              const mat = materials.find((m) => m.id === mv.materialId);
              const incoming = mv.type === "purchase";
              return (
                <li key={mv.id} className="flex flex-wrap items-center gap-2 text-sm">
                  {incoming ? (
                    <ArrowUpCircle className="h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <ArrowDownCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="font-medium text-foreground">{mat?.name ?? mv.materialId}</span>
                  <Badge variant="outline" className="rounded-full text-[10px]">{MOVEMENT_LABELS[mv.type]}</Badge>
                  <span className={incoming ? "text-primary" : "text-muted-foreground"}>
                    {incoming ? "+" : "−"}
                    {mv.qty} {mat?.unit}
                  </span>
                  {mv.note && <span className="text-xs text-muted-foreground">· {mv.note}</span>}
                  <span className="ml-auto text-xs text-muted-foreground">{new Date(mv.at).toLocaleDateString()}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* add material dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add material</DialogTitle>
            <DialogDescription>Track cost, supplier and stock for a production material.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="nf-mat-name">Name</Label>
              <Input id="nf-mat-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="LED Neon Flex (10m roll)" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="nf-mat-unit">Unit</Label>
              <Input id="nf-mat-unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="roll" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="nf-mat-supplier">Supplier</Label>
              <Input id="nf-mat-supplier" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="GlowSource Ltd" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="nf-mat-cost">Unit cost (Rs)</Label>
              <Input id="nf-mat-cost" type="number" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="nf-mat-stock">Opening stock</Label>
              <Input id="nf-mat-stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="mt-1.5" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="nf-mat-low">Low-stock alert threshold</Label>
              <Input id="nf-mat-low" type="number" value={form.lowThreshold} onChange={(e) => setForm({ ...form, lowThreshold: e.target.value })} className="mt-1.5" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="hero" onClick={add}>Add material</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* movement dialog */}
      <Dialog open={moveFor !== null} onOpenChange={(o) => !o && setMoveFor(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Record movement</DialogTitle>
            <DialogDescription>{moveFor?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Type</Label>
              <Select value={moveForm.type} onValueChange={(v) => setMoveForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger className="mt-1.5 w-full" aria-label="Movement type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(MOVEMENT_LABELS) as StockMovement["type"][]).map((t) => (
                    <SelectItem key={t} value={t}>{MOVEMENT_LABELS[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="nf-mv-qty">Quantity ({moveFor?.unit})</Label>
              <Input id="nf-mv-qty" type="number" min={1} value={moveForm.qty} onChange={(e) => setMoveForm((f) => ({ ...f, qty: e.target.value }))} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="nf-mv-note">Note</Label>
              <Input id="nf-mv-note" value={moveForm.note} onChange={(e) => setMoveForm((f) => ({ ...f, note: e.target.value }))} placeholder="Optional reason" className="mt-1.5" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMoveFor(null)}>Cancel</Button>
            <Button variant="hero" onClick={record}>Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageFade>
  );
}

function EditableCost({ material }: { material: Material }) {
  const [value, setValue] = useState(String(material.unitCost));

  function save() {
    const cost = Number(value);
    if (!cost || cost < 0 || cost === material.unitCost) return;
    updateMaterial(material.id, { unitCost: cost });
    toast.success("Cost updated", { description: "Previous cost kept in the cost history." });
  }

  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-muted-foreground">Rs</span>
      <Input
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        className="h-8 w-24 text-right"
        aria-label={`Unit cost of ${material.name}`}
      />
    </span>
  );
}

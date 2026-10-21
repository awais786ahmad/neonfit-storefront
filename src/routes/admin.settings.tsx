import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Database, Download, Lock, LogOut, RefreshCcw, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageFade } from "@/components/Reveal";
import { loadDemoData, lockAdmin, resetAllData, setAdminPassword, useAdminUnlocked } from "@/lib/admin";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [{ title: "Settings — NeonFitter Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const unlocked = useAdminUnlocked();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  if (!unlocked) {
    return (
      <PageFade className="rounded-3xl border border-border bg-card px-6 py-10 text-center">
        <Lock className="mx-auto h-8 w-8 text-primary" />
        <h1 className="mt-3 text-lg font-semibold text-foreground">Admin locked</h1>
        <p className="mt-1 text-sm text-muted-foreground">Unlock the admin panel to change settings.</p>
        <Button variant="hero" size="sm" className="mt-4" asChild>
          <Link to="/admin">Go to admin</Link>
        </Button>
      </PageFade>
    );
  }

  function changePassword() {
    if (password.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setAdminPassword(password);
    setPassword("");
    setConfirm("");
    toast.success("Admin password updated");
  }

  return (
    <PageFade className="space-y-6">
      <div>
        <p className="eyebrow">Store settings</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">Settings</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Admin password, demo data and store reset live here.
        </p>
      </div>

      <section className="rounded-3xl border border-border bg-card p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" /> Admin password
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Used to unlock the admin panel on this device. Store data stays in this browser.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <Field label="New password">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-56" />
          </Field>
          <Field label="Confirm password">
            <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" className="w-56" />
          </Field>
          <Button variant="hero" size="sm" onClick={changePassword}>
            Update password
          </Button>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Database className="h-4 w-4 text-primary" /> Demo data
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Load sample orders, materials and a return request to explore the admin panel before real
          orders arrive. This replaces existing orders and materials.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (window.confirm("Replace current orders and materials with demo data?")) {
                loadDemoData();
                toast.success("Demo data loaded");
              }
            }}
          >
            <Download className="h-3.5 w-3.5" /> Load demo data
          </Button>
          <Button variant="ghost" size="sm" onClick={lockAdmin}>
            <LogOut className="h-3.5 w-3.5" /> Lock admin
          </Button>
        </div>
      </section>

      <section className="rounded-3xl border border-destructive/40 bg-destructive/5 p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <RefreshCcw className="h-4 w-4 text-destructive" /> Danger zone
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Clears every stored order, design, cart, admin catalog and material record from this
          browser. This cannot be undone.
        </p>
        <Button
          variant="destructive"
          size="sm"
          className="mt-4"
          onClick={() => {
            if (window.confirm("Delete ALL store data on this device? This cannot be undone.")) {
              resetAllData();
              window.location.href = "/";
            }
          }}
        >
          Reset all store data
        </Button>
      </section>
    </PageFade>
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

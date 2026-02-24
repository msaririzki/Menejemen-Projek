"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateProject } from "@/hooks/use-projects";
import { toast } from "sonner";

export function CreateProjectDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [step, setStep] = useState<"form" | "share">("form");

  const createProject = useCreateProject();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Nama projek wajib diisi");
      return;
    }

    try {
      const project = await createProject.mutateAsync({
        name: name.trim(),
        description: description.trim(),
      });

      const link = `${window.location.origin}/invite/${project.invite_code}`;
      setInviteLink(link);
      setStep("share");
      toast.success("Projek berhasil dibuat! 🎉");
    } catch {
      toast.error("Gagal membuat projek");
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteLink);
    toast.success("Link invite disalin ke clipboard!");
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setName("");
      setDescription("");
      setInviteLink("");
      setStep("form");
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="glass-solid sm:max-w-md border-white/10 rounded-2xl">
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg">Buat Projek Baru</DialogTitle>
              <DialogDescription>
                Buat projek baru dan undang teman-teman untuk berkolaborasi.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Projek</Label>
                <Input
                  id="name"
                  placeholder="Contoh: Website E-Commerce"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/5 border-white/10 rounded-xl"
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi (opsional)</Label>
                <Textarea
                  id="description"
                  placeholder="Deskripsikan projek ini secara singkat..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-white/5 border-white/10 rounded-xl resize-none"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreate}
                disabled={createProject.isPending}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 cursor-pointer"
              >
                {createProject.isPending ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Membuat...
                  </span>
                ) : (
                  "Buat Projek"
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg">🎉 Projek Dibuat!</DialogTitle>
              <DialogDescription>
                Bagikan link invite ini kepada teman-teman untuk bergabung.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center gap-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="bg-white/5 border-white/10 rounded-xl text-xs"
                />
                <Button
                  onClick={handleCopy}
                  variant="secondary"
                  className="shrink-0 rounded-xl cursor-pointer"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                  Salin
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleClose}
                className="w-full rounded-xl cursor-pointer"
                variant="secondary"
              >
                Tutup & Buka Dashboard
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

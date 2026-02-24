"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTask } from "@/hooks/use-tasks";
import type { Profile } from "@/lib/types";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface AddTaskFormProps {
  projectId: string;
  members: { profile?: Profile | null }[];
}

export function AddTaskForm({ projectId, members }: AddTaskFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const createTask = useCreateTask();

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Judul tugas wajib diisi");
      return;
    }

    try {
      await createTask.mutateAsync({
        projectId,
        title: title.trim(),
        description: description.trim(),
        assignedTo: assignedTo && assignedTo !== "unassigned" ? assignedTo : null,
      });

      setTitle("");
      setDescription("");
      setAssignedTo("");
      setIsOpen(false);
      toast.success("Tugas berhasil ditambahkan! ✨");
    } catch {
      toast.error("Gagal menambah tugas");
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence>
        {!isOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Button
              variant="ghost"
              onClick={() => setIsOpen(true)}
              className="w-full h-10 border border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 rounded-xl text-muted-foreground text-sm cursor-pointer"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Tambah Tugas
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-xl p-3 space-y-3"
          >
            <Input
              placeholder="Judul tugas..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white/5 border-white/10 rounded-xl h-9 text-sm"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
            />
            <Textarea
              placeholder="Deskripsi singkat (opsional)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white/5 border-white/10 rounded-xl resize-none text-sm"
              rows={2}
            />
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-9 text-sm">
                <SelectValue placeholder="Tugaskan ke..." />
              </SelectTrigger>
              <SelectContent className="glass-solid border-white/10 rounded-xl">
                <SelectItem value="unassigned">Belum ditugaskan</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.profile?.id} value={m.profile?.id || ""}>
                    {m.profile?.full_name || m.profile?.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={createTask.isPending}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-xs cursor-pointer"
              >
                {createTask.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsOpen(false);
                  setTitle("");
                  setDescription("");
                  setAssignedTo("");
                }}
                className="rounded-xl text-xs cursor-pointer"
              >
                Batal
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

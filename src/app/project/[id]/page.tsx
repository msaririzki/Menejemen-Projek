"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { KanbanBoard } from "@/components/kanban/board";
import { TaskFiltersBar, type TaskFilters } from "@/components/kanban/task-filters";
import { OnlineAvatars } from "@/components/online-avatars";
import { NotificationBell } from "@/components/notification-bell";
import { useTasks } from "@/hooks/use-tasks";
import { useProjectMembers, useCurrentUser } from "@/hooks/use-members";
import { useRealtimeTasks, useRealtimeMembers, useOnlinePresence } from "@/hooks/use-realtime";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Project } from "@/lib/types";

export default function ProjectWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const supabase = createClient();

  const [project, setProject] = useState<Project | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [filters, setFilters] = useState<TaskFilters>({
    search: "",
    assignee: "all",
    status: "all",
  });

  const { data: tasks = [], isLoading: tasksLoading } = useTasks(projectId);
  const { data: members = [], isLoading: membersLoading } = useProjectMembers(projectId);
  const { data: currentUser } = useCurrentUser();

  // Real-time subscriptions
  useRealtimeTasks(projectId);
  useRealtimeMembers(projectId);
  useOnlinePresence(projectId, currentUser?.id || "", {
    name: currentUser?.full_name || "",
    avatar: currentUser?.avatar_url || "",
  });

  // Fetch project info
  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error || !data) {
        router.push("/dashboard");
        return;
      }
      setProject(data);
      setProjectLoading(false);
    };

    fetchProject();
  }, [projectId, router, supabase]);

  const handleCopyInviteLink = async () => {
    if (!project) return;
    const link = `${window.location.origin}/invite/${project.invite_code}`;
    await navigator.clipboard.writeText(link);
    toast.success("Link invite disalin ke clipboard!");
  };

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-dots">
        <nav className="glass-strong border-b border-white/5 h-16" />
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <Skeleton className="h-8 w-64 bg-white/5 mb-4" />
          <Skeleton className="h-4 w-96 bg-white/5" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dots">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass-strong border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="shrink-0 rounded-xl cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Button>
            <div className="min-w-0">
              <h1 className="font-semibold text-sm truncate">{project?.name}</h1>
              <p className="text-[10px] text-muted-foreground truncate">
                {project?.description || "Tanpa deskripsi"}
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2.5">
            {/* Online Members */}
            {!membersLoading && <OnlineAvatars members={members} />}

            {/* Notification Bell */}
            <NotificationBell />

            {/* Invite Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyInviteLink}
              className="rounded-xl text-xs gap-1.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.014-3.68a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.343 8.49" />
              </svg>
              <span className="hidden sm:inline">Invite</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-4 flex-wrap"
        >
          <Badge variant="secondary" className="rounded-lg text-xs gap-1.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            {members.length + 1} anggota
          </Badge>
          <Badge variant="secondary" className="rounded-lg text-xs gap-1.5">
            📋 {tasks.length} tugas
          </Badge>
          <Badge variant="secondary" className="rounded-lg text-xs gap-1.5 text-emerald-400">
            ✅ {tasks.filter((t) => t.status === "done").length} selesai
          </Badge>
        </motion.div>

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-5"
        >
          <TaskFiltersBar
            filters={filters}
            onFiltersChange={setFilters}
            members={members}
          />
        </motion.div>

        {/* Kanban Board */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <KanbanBoard
            tasks={tasks}
            projectId={projectId}
            members={members}
            isLoading={tasksLoading}
            filters={filters}
          />
        </motion.div>
      </main>
    </div>
  );
}

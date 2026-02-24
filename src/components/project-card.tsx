"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import type { ProjectWithDetails } from "@/lib/types";

interface ProjectCardProps {
  project: ProjectWithDetails;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const router = useRouter();
  const progress =
    project.task_stats.total > 0
      ? Math.round(
          (project.task_stats.done / project.task_stats.total) * 100
        )
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Card
        className="glass card-hover cursor-pointer p-5 rounded-2xl group"
        onClick={() => router.push(`/project/${project.id}`)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate group-hover:text-blue-400 transition-colors">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          <Badge
            variant="secondary"
            className="ml-2 shrink-0 text-[10px] rounded-lg"
          >
            {project.member_count} anggota
          </Badge>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progres</span>
            <span className="font-medium">
              {project.task_stats.done}/{project.task_stats.total} tugas
            </span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, delay: index * 0.08 + 0.3, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
          <span className="text-[10px] text-muted-foreground/60">
            {new Date(project.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-blue-400 transition-colors">
            Buka
            <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

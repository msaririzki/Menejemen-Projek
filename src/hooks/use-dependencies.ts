import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";
import type { TaskWithAssignee } from "@/lib/types";

export interface TaskDependency {
  id: string;
  project_id: string;
  task_id: string;
  depends_on_task_id: string;
  created_at: string;
  dependent_task?: TaskWithAssignee; // optional, untuk referensi ke task sumber
  blocking_task?: TaskWithAssignee; // optional, untuk referensi ke task yang memblokir
}

export function useTaskDependencies(projectId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["dependencies", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_dependencies")
        .select(`
          *,
          dependent_task:tasks!task_dependencies_task_id_fkey(*),
          blocking_task:tasks!task_dependencies_depends_on_task_id_fkey(*)
        `)
        .eq("project_id", projectId);

      if (error) throw error;
      return (data as TaskDependency[]) || [];
    },
    enabled: !!projectId,
  });
}

export function useRealtimeDependencies(projectId: string) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`dependencies-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "task_dependencies",
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["dependencies", projectId],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient, supabase]);
}

export function useAddDependency() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      taskId,
      dependsOnTaskId,
    }: {
      projectId: string;
      taskId: string;
      dependsOnTaskId: string;
    }) => {
      const { data, error } = await supabase
        .from("task_dependencies")
        .insert({
          project_id: projectId,
          task_id: taskId,
          depends_on_task_id: dependsOnTaskId,
        })
        .select()
        .single();

      if (error) {
        // Handle unique constraint error gracefully if needed
        if (error.code === '23505') {
          throw new Error("Dependensi ini sudah ada.");
        }
        throw error;
      }
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["dependencies", variables.projectId],
      });
    },
  });
}

export function useRemoveDependency() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      projectId,
    }: {
      id: string; // id dari row dependency
      projectId: string;
    }) => {
      const { error } = await supabase
        .from("task_dependencies")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["dependencies", variables.projectId],
      });
    },
  });
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useLogActivity } from "@/hooks/use-activities";
import type { TaskWithAssignee, TaskStatus } from "@/lib/types";

export function useTasks(projectId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["tasks", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          assignee:profiles!tasks_assigned_to_fkey(*),
          creator:profiles!tasks_created_by_fkey(*),
          completer:profiles!tasks_completed_by_fkey(*)
        `)
        .eq("project_id", projectId)
        .order("position", { ascending: true });

      if (error) throw error;
      return (data as TaskWithAssignee[]) || [];
    },
    enabled: !!projectId,
  });
}

export function useCreateTask() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const logActivity = useLogActivity();

  return useMutation({
    mutationFn: async ({
      projectId,
      title,
      description,
      assignedTo,
    }: {
      projectId: string;
      title: string;
      description?: string;
      assignedTo?: string | null;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Ambil posisi terbesar untuk status todo
      const { data: lastTask } = await supabase
        .from("tasks")
        .select("position")
        .eq("project_id", projectId)
        .eq("status", "todo")
        .order("position", { ascending: false })
        .limit(1)
        .single();

      const position = (lastTask?.position || 0) + 1;

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          project_id: projectId,
          title,
          description: description || "",
          assigned_to: assignedTo || null,
          created_by: user.id,
          status: "todo",
          position,
        })
        .select(`
          *,
          assignee:profiles!tasks_assigned_to_fkey(*),
          creator:profiles!tasks_created_by_fkey(*)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tasks", variables.projectId],
      });
      // Fire and forget log activity
      logActivity.mutate({
        projectId: variables.projectId,
        action: "create_task",
        targetId: data?.id,
        targetName: variables.title,
      });
    },
  });
}

export function useUpdateTask() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const logActivity = useLogActivity();

  return useMutation({
    mutationFn: async ({
      taskId,
      projectId,
      updates,
    }: {
      taskId: string;
      projectId: string;
      updates: {
        title?: string;
        description?: string;
        status?: TaskStatus;
        assigned_to?: string | null;
        completed_by?: string | null;
        completion_note?: string;
        position?: number;
      };
    }) => {
      const { data: { user } } = await supabase.auth.getUser();

      // Auto-assign user yang drag ke "Sedang Dikerjakan" jika belum ada assignee
      if (updates.status === 'in_progress') {
        // Cek apakah task saat ini belum punya assignee
        const { data: currentTask } = await supabase
          .from("tasks")
          .select("assigned_to")
          .eq("id", taskId)
          .single();

        if (currentTask && !currentTask.assigned_to && user) {
          updates.assigned_to = user.id;
        }
      }

      // Auto-set completed_by saat status berubah ke done
      if (updates.status === 'done' && !updates.completed_by) {
        if (user) updates.completed_by = user.id;
      }
      // Clear completed_by jika status bukan done
      if (updates.status && updates.status !== 'done') {
        updates.completed_by = null;
      }

      const { data, error } = await supabase
        .from("tasks")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", taskId)
        .select(`
          *,
          assignee:profiles!tasks_assigned_to_fkey(*),
          creator:profiles!tasks_created_by_fkey(*),
          completer:profiles!tasks_completed_by_fkey(*)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    // Optimistic update: langsung update cache tanpa tunggu server
    onMutate: async (variables) => {
      // Cancel pending refetches
      await queryClient.cancelQueries({
        queryKey: ["tasks", variables.projectId],
      });

      // Snapshot state sebelumnya (untuk rollback jika gagal)
      const previousTasks = queryClient.getQueryData<TaskWithAssignee[]>([
        "tasks",
        variables.projectId,
      ]);

      // Update cache langsung
      queryClient.setQueryData<TaskWithAssignee[]>(
        ["tasks", variables.projectId],
        (old) =>
          old?.map((task) =>
            task.id === variables.taskId
              ? { ...task, ...variables.updates }
              : task
          ) ?? []
      );

      return { previousTasks };
    },
    // Rollback jika server gagal
    onError: (_err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(
          ["tasks", variables.projectId],
          context.previousTasks
        );
      }
    },
    // Sync dengan server setelah selesai (baik sukses maupun gagal)
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tasks", variables.projectId],
      });
    },
    onSuccess: (data, variables, context) => {
      // Menentukan aksi spesifik: move atau sekadar update
      if (data && context?.previousTasks) {
        const prevTask = context.previousTasks.find(t => t.id === variables.taskId);
        if (prevTask && prevTask.status !== data.status) {
           logActivity.mutate({
            projectId: variables.projectId,
            action: "move_task",
            targetId: data.id,
            targetName: data.title,
            details: { from: prevTask.status, to: data.status }
          });
        } else {
           logActivity.mutate({
            projectId: variables.projectId,
            action: "update_task",
            targetId: data.id,
            targetName: data.title,
          });
        }
      }
    }
  });
}

export function useDeleteTask() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const logActivity = useLogActivity();

  return useMutation({
    mutationFn: async ({
      taskId,
      projectId,
    }: {
      taskId: string;
      projectId: string;
    }) => {
      // Fetch the task title first so we can log its name
      const { data: task } = await supabase.from('tasks').select('title').eq('id', taskId).single();

      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;
      return { taskId, title: task?.title || 'Unknown Task' };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tasks", variables.projectId], // this should be variables.projectId but we don't have projectId if we don't return it
      });

      logActivity.mutate({
        projectId: variables.projectId,
        action: "delete_task",
        targetId: data.taskId,
        targetName: data.title,
      });
    },
  });
}

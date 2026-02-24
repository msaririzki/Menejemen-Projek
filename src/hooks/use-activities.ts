import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";
import type { Profile } from "@/lib/types";

export interface ProjectActivity {
  id: string;
  project_id: string;
  user_id: string;
  action: string;
  target_id: string | null;
  target_name: string | null;
  details: any | null;
  created_at: string;
  profile?: Profile;
}

// Format Action Text
export const getActionText = (action: string, targetName: string | null, details: any | null) => {
  switch (action) {
    case "create_task":
      return `membuat tugas baru "${targetName}"`;
    case "update_task":
      return `memperbarui tugas "${targetName}"`;
    case "move_task":
      return `memindahkan tugas "${targetName}" dari ${details?.from || 'Unknown'} ke ${details?.to || 'Unknown'}`;
    case "delete_task":
      return `menghapus tugas "${targetName}"`;
    case "add_comment":
      return `memberi komentar pada tugas "${targetName}"`;
    default:
      return `melakukan aksi ${action} pada "${targetName}"`;
  }
};

export function useActivities(projectId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["activities", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_activities")
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(50); // Mencegah load terlalu banyak data awalnya

      if (error) throw error;
      return (data as ProjectActivity[]) || [];
    },
    enabled: !!projectId,
  });
}

// Hook untuk Real-time
export function useRealtimeActivities(projectId: string) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`activities-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "project_activities",
          filter: `project_id=eq.${projectId}`,
        },
        async (payload) => {
          // Fetch profil manual jika ada aktivitas baru (karena payload.new hanya berisi row table)
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", payload.new.user_id)
            .single();

          const newActivity = {
            ...payload.new,
            profile: profileData,
          } as ProjectActivity;

          queryClient.setQueryData(
            ["activities", projectId],
            (old: ProjectActivity[] | undefined) => {
              if (!old) return [newActivity];
              // Tambah ke paling atas (index 0)
              return [newActivity, ...old];
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient, supabase]);
}

export function useLogActivity() {
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      action,
      targetId,
      targetName,
      details,
    }: {
      projectId: string;
      action: string;
      targetId?: string;
      targetName?: string;
      details?: any;
    }) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("project_activities")
        .insert({
          project_id: projectId,
          user_id: userData.user.id,
          action,
          target_id: targetId,
          target_name: targetName,
          details,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });
}

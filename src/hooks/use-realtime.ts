"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useRealtimeTasks(projectId: string) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`tasks-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          // Invalidate dan refetch tasks saat ada perubahan
          queryClient.invalidateQueries({
            queryKey: ["tasks", projectId],
          });
          // Juga invalidate projects untuk update progress bar
          queryClient.invalidateQueries({
            queryKey: ["projects"],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient, supabase]);
}

export function useRealtimeMembers(projectId: string) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`members-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_members",
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["members", projectId],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient, supabase]);
}

export function useOnlinePresence(projectId: string, userId: string, userInfo: { name: string; avatar: string }) {
  const supabase = createClient();

  useEffect(() => {
    if (!projectId || !userId) return;

    const channel = supabase.channel(`presence-${projectId}`, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        // Presence state synced
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: userId,
            name: userInfo.name,
            avatar: userInfo.avatar,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, userId, userInfo.name, userInfo.avatar, supabase]);
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/lib/types";
import { useEffect, useCallback } from "react";
import { toast } from "sonner";

export function useNotifications() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) throw error;
      return (data as Notification[]) || [];
    },
  });
}

export function useUnreadCount() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false);

      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 30000, // refresh tiap 30 detik
  });
}

export function useMarkAsRead() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId?: string) => {
      if (notificationId) {
        const { error } = await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", notificationId);
        if (error) throw error;
      } else {
        // Mark all as read
        const { error } = await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("is_read", false);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useSendNotification() {
  const supabase = createClient();

  return useCallback(
    async ({
      userIds,
      projectId,
      type,
      title,
      message,
    }: {
      userIds: string[];
      projectId: string;
      type: Notification["type"];
      title: string;
      message: string;
    }) => {
      if (userIds.length === 0) return;

      const notifications = userIds.map((userId) => ({
        user_id: userId,
        project_id: projectId,
        type,
        title,
        message,
        is_read: false,
      }));

      await supabase.from("notifications").insert(notifications);
    },
    [supabase]
  );
}

export function useRealtimeNotifications() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    let userId: string | null = null;

    const setup = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      userId = user.id;

      const channel = supabase
        .channel("notifications-realtime")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const notif = payload.new as Notification;
            // Toast popup
            toast(notif.title, {
              description: notif.message,
              duration: 5000,
            });
            // Refresh data
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
          }
        )
        .subscribe();

      return channel;
    };

    const channelPromise = setup();

    return () => {
      channelPromise.then((channel) => {
        if (channel) supabase.removeChannel(channel);
      });
    };
  }, [queryClient, supabase]);
}

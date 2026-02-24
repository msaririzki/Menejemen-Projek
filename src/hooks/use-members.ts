"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { ProjectMember } from "@/lib/types";

export function useProjectMembers(projectId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["members", projectId],
    queryFn: async () => {
      // Ambil members + profile info
      const { data, error } = await supabase
        .from("project_members")
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq("project_id", projectId)
        .order("joined_at", { ascending: true });

      if (error) throw error;
      return (data as (ProjectMember & { profile: ProjectMember["profile"] })[]) || [];
    },
    enabled: !!projectId,
  });
}

export function useCurrentUser() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      return profile;
    },
  });
}

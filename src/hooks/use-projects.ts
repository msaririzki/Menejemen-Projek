"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { nanoid } from "nanoid";
import type { Project } from "@/lib/types";

export function useProjects() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      // Ambil semua projek yang user ikuti
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Projek yang dimiliki
      const { data: ownedProjects } = await supabase
        .from("projects")
        .select("*")
        .eq("owner_id", user.id);

      // Projek yang diikuti
      const { data: memberships } = await supabase
        .from("project_members")
        .select("project_id")
        .eq("user_id", user.id);

      const memberProjectIds = memberships?.map((m) => m.project_id) || [];

      let memberProjects: Project[] = [];
      if (memberProjectIds.length > 0) {
        const { data } = await supabase
          .from("projects")
          .select("*")
          .in("id", memberProjectIds);
        memberProjects = data || [];
      }

      // Gabungkan dan hilangkan duplikat
      const allProjects = [...(ownedProjects || []), ...memberProjects];
      const uniqueProjects = allProjects.filter(
        (project, index, self) =>
          index === self.findIndex((p) => p.id === project.id)
      );

      // Ambil statistik untuk setiap projek
      const projectsWithStats = await Promise.all(
        uniqueProjects.map(async (project) => {
          const { count: memberCount } = await supabase
            .from("project_members")
            .select("*", { count: "exact", head: true })
            .eq("project_id", project.id);

          const { data: tasks } = await supabase
            .from("tasks")
            .select("status")
            .eq("project_id", project.id);

          const total = tasks?.length || 0;
          const done = tasks?.filter((t) => t.status === "done").length || 0;

          return {
            ...project,
            member_count: (memberCount || 0) + 1, // +1 untuk owner
            task_stats: { total, done },
          };
        })
      );

      return projectsWithStats;
    },
  });
}

export function useCreateProject() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
    }: {
      name: string;
      description: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const invite_code = nanoid(12);

      const { data, error } = await supabase
        .from("projects")
        .insert({
          name,
          description,
          owner_id: user.id,
          invite_code,
        })
        .select()
        .single();

      if (error) throw error;

      // Tambahkan owner sebagai member dengan role "owner"
      await supabase.from("project_members").insert({
        project_id: data.id,
        user_id: user.id,
        role: "owner",
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useJoinProject() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteCode: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Cari projek berdasarkan invite code
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("invite_code", inviteCode)
        .single();

      if (projectError || !project) throw new Error("Projek tidak ditemukan");
      if (project.owner_id === user.id) throw new Error("Kamu sudah menjadi pemilik projek ini");

      // Cek apakah sudah jadi member
      const { data: existing } = await supabase
        .from("project_members")
        .select("id")
        .eq("project_id", project.id)
        .eq("user_id", user.id)
        .single();

      if (existing) throw new Error("Kamu sudah bergabung di projek ini");

      // Tambahkan sebagai member
      const { error } = await supabase.from("project_members").insert({
        project_id: project.id,
        user_id: user.id,
        role: "member",
      });

      if (error) throw error;
      return project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

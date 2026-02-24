"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useJoinProject } from "@/hooks/use-projects";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const inviteCode = params.code as string;
  const supabase = createClient();

  const [project, setProject] = useState<{ id: string; name: string; description: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const joinProject = useJoinProject();

  useEffect(() => {
    const checkAuthAndFetchProject = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);

      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch project by invite code ONLY if authenticated
      const { data } = await supabase
        .from("projects")
        .select("id, name, description")
        .eq("invite_code", inviteCode)
        .single();

      setProject(data);
      setLoading(false);
    };

    checkAuthAndFetchProject();
  }, [inviteCode, supabase]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/invite/${inviteCode}`,
      },
    });
  };

  const handleJoin = async () => {
    try {
      const project = await joinProject.mutateAsync(inviteCode);
      toast.success(`Berhasil bergabung ke ${project.name}! 🎉`);
      router.push(`/project/${project.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal bergabung";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-grid">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[120px] animate-float" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[120px] animate-float" style={{ animationDelay: "3s" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 px-4 w-full max-w-md"
      >
        <Card className="glass-strong rounded-2xl p-8 text-center border-white/10">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-12 rounded-2xl mx-auto bg-white/5" />
              <Skeleton className="h-6 w-48 mx-auto bg-white/5" />
              <Skeleton className="h-4 w-64 mx-auto bg-white/5" />
              <Skeleton className="h-10 w-full bg-white/5 rounded-xl" />
            </div>
          ) : !isAuthenticated ? (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white">Ayo Bergabung!</h2>
              <p className="text-sm text-muted-foreground">
                Daftar atau masuk dengan akun Google kamu untuk melanjutkan dan melihat undangan proyek ini.
              </p>
              <Button
                onClick={handleLogin}
                className="w-full rounded-xl h-11 bg-white hover:bg-gray-100 text-zinc-900 font-medium gap-2 cursor-pointer mt-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Masuk dengan Google
              </Button>
            </div>
          ) : !project ? (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white">Link Tidak Valid</h2>
              <p className="text-sm text-muted-foreground">
                Link invite ini tidak ditemukan atau kamu tidak memiliki akses.
              </p>
              <Button
                onClick={() => router.push("/dashboard")}
                variant="secondary"
                className="rounded-xl cursor-pointer w-full mt-2"
              >
                Kembali ke Dashboard
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Kamu diundang untuk bergabung ke
                </p>
                <h2 className="text-xl font-bold gradient-text">{project.name}</h2>
                {project.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {project.description}
                  </p>
                )}
              </div>

              <Button
                onClick={handleJoin}
                disabled={joinProject.isPending}
                className="w-full rounded-xl h-11 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 font-medium cursor-pointer"
              >
                {joinProject.isPending ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Bergabung...
                  </span>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                    </svg>
                    Bergabung
                  </>
                )}
              </Button>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

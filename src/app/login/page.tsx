"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function LoginPage() {
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-grid">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px] animate-float" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-violet-500/10 blur-[120px] animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute -bottom-40 left-1/3 w-[400px] h-[400px] rounded-full bg-emerald-500/8 blur-[120px] animate-float" style={{ animationDelay: "4s" }} />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-8 px-6"
      >
        {/* Logo / Brand */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight">
            Pro<span className="gradient-text">Sync</span>
          </span>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-strong rounded-2xl p-8 md:p-12 max-w-lg w-full text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Kelola Projek<br />
            <span className="gradient-text">Bersama Tim</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mb-8 max-w-sm mx-auto leading-relaxed">
            Platform manajemen projek real-time yang modern untuk kolaborasi tim IT. 
            Buat projek, undang anggota, dan pantau progres secara instan.
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: "⚡", label: "Real-time" },
              { icon: "🎯", label: "Kanban Board" },
              { icon: "👥", label: "Kolaborasi" },
            ].map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                className="glass rounded-xl p-3"
              >
                <span className="text-xl mb-1 block">{feature.icon}</span>
                <span className="text-xs text-muted-foreground">{feature.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Google Login Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.9 }}
          >
            <Button
              onClick={handleGoogleLogin}
              size="lg"
              className="w-full h-12 rounded-xl bg-white hover:bg-gray-100 text-zinc-900 font-medium text-sm gap-3 transition-all duration-300 hover:shadow-lg hover:shadow-white/10 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Masuk dengan Google
            </Button>
          </motion.div>

          <p className="text-xs text-muted-foreground mt-4">
            Gratis, tanpa kartu kredit. Langsung mulai berkolaborasi.
          </p>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.1 }}
          className="text-xs text-muted-foreground/60"
        >
          Dibuat dengan ❤️ untuk tim IT Indonesia
        </motion.p>
      </motion.div>
    </div>
  );
}

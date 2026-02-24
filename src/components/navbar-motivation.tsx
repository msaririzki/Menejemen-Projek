"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const QUOTES = [
  "Setiap baris kode membawamu lebih dekat ke solusi.",
  "Bug itu cuma fitur yang sedang menyamar.",
  "Istirahat sebentar, ngopi dulu baru ngoding lagi!",
  "Kamu hebat hari ini. Lanjutkan kerjamu!",
  "Jangan lupa bernapas, error ini pasti ketemu jalan keluarnya.",
  "Satu commit demi satu commit, jadilah projek yang besar.",
  "Tetap semangat! Projek ini bakalan keren mampus.",
  "Eror bukan akhir dunia, cuma ngajak kamu berpikir lebih kreatif.",
  "Coding itu seni, kamu adalah senimannya.",
  "Selesaikan satu per satu, jangan buru-buru.",
  "Pikiran yang tenang menghasilkan kode yang efisien.",
  "Kegagalan kode hari ini adalah keberhasilan hari esok.",
  "Tidak ada developer yang sempurna, yang ada hanya yang pantang menyerah.",
  "Semangat puasanya! Ngoding saat puasa itu dobel lho pahalanya.",
  "Lapar? Sabar, sebentar lagi Maghrib. Sambil nunggu, fix satu bug yuk!",
  "Wahai programmer, ingat ini bulan suci, jaga emosi lihat error merah.",
  "Tidur orang puasa itu ibadah, tapi bekerja (ngoding) pahalanya lebih besar!",
  "Puasa bukan alasan bermalas-malasan, semangat terus buat tim!",
  "Satu bug berhasil di-fix = satu ujian kesabaran berhasil dilewati.",
  "Ayo selesaikan ini biar tarawihnya tenang nanti malam.",
  "Berbukalah dengan yang manis, pusinglah dengan yang error.",
  "Semoga keberkahan bulan Ramadhan mengalir dalam setiap baris kodemu."
];

export function NavbarMotivation() {
  const [showBanner, setShowBanner] = useState(false);
  const [bannerQuote, setBannerQuote] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Logika 20 detik tab aktif untuk marquee banner
  useEffect(() => {
    if (!mounted) return;
    let timer: NodeJS.Timeout;

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        timer = setTimeout(() => {
          setBannerQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
          setShowBanner(true);
        }, 20000); // Tampil setelah 20 detik aktif
      } else {
        setShowBanner(false);
        clearTimeout(timer);
      }
    };

    handleVisibility(); // Cek saat pertama kali load
    document.addEventListener("visibilitychange", handleVisibility);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [mounted]);

  if (!mounted || !showBanner || !bannerQuote) return null;

  return (
    <div className="flex-1 min-w-0 px-6 hidden md:flex items-center overflow-hidden marquee-container">
      <AnimatePresence>
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="w-full relative flex items-center h-full pointer-events-none"
        >
          <span className="animate-marquee-scroll text-sm font-medium tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400 drop-shadow-sm">
            ✨ {bannerQuote} ✨
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

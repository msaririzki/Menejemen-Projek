"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

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

export function MotivationalWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sembunyikan component utama dari halaman auth/landing
  if (pathname === "/login" || pathname?.startsWith("/invite") || pathname === "/") {
    return null;
  }

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // baris
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // kolom
      [0, 4, 8], [2, 4, 6],            // diagonal
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every((square) => square !== null);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!xIsNext && !winner && !isDraw && isGameOpen) {
      const botTimeout = setTimeout(() => {
        makeBotMove(board);
      }, 500);
      return () => clearTimeout(botTimeout);
    }
  }, [xIsNext, winner, isDraw, board, isGameOpen]);

  // Return early setelah hook!
  if (!mounted) return null;

  const makeBotMove = (currentBoard: (string | null)[]) => {
    const emptyIndices = currentBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];
    if (emptyIndices.length === 0) return;
    
    let moveIdx: number | null = null;

    // 1. Coba menang
    for (const idx of emptyIndices) {
      const boardCopy = [...currentBoard];
      boardCopy[idx] = 'O';
      if (calculateWinner(boardCopy) === 'O') {
        moveIdx = idx;
        break;
      }
    }

    // 2. Coba block lawan (X)
    if (moveIdx === null) {
      for (const idx of emptyIndices) {
        const boardCopy = [...currentBoard];
        boardCopy[idx] = 'X';
        if (calculateWinner(boardCopy) === 'X') {
          moveIdx = idx;
          break;
        }
      }
    }

    // 3. Gerak random
    if (moveIdx === null) {
      moveIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    const newBoard = [...currentBoard];
    newBoard[moveIdx] = 'O';
    setBoard(newBoard);
    setXIsNext(true);
  };

  const handleClick = (i: number) => {
    if (winner || board[i] || !xIsNext) return; // Hanya X yang bisa klik
    const newBoard = [...board];
    newBoard[i] = "X";
    setBoard(newBoard);
    setXIsNext(false);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  return (
    <>
      {/* Floating Widget (Tic-Tac-Toe) */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(10px)" }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="pointer-events-auto bg-black/60 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl shadow-2xl w-80 mb-2 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-10 translate-x-10 -translate-y-10" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl -z-10 -translate-x-10 translate-y-10" />

              {!isGameOpen ? (
                <div className="flex flex-col gap-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center mx-auto mb-2 ring-1 ring-white/10 shadow-inner">
                    <span className="text-3xl">🎮</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white/90">Waktunya Refreshing!</h3>
                  <p className="text-sm text-white/60">Lagi capek ngoding? Istirahat sejenak dan main Tic-Tac-Toe melawan bot pro kami.</p>
                  
                  <Button 
                    onClick={() => setIsGameOpen(true)}
                    className="mt-2 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-400 hover:to-violet-400 text-white rounded-xl border-0 cursor-pointer shadow-lg shadow-blue-500/20 transition-all font-medium py-5"
                  >
                    Mulai Bermain
                  </Button>
                </div>
              ) : (
              <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center w-full mb-5 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-gradient-to-br from-blue-400 to-violet-400 bg-clip-text text-transparent font-bold">Tic-Tac-Toe</span>
                  </div>
                  <button onClick={() => setIsGameOpen(false)} className="text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-1.5 transition-colors cursor-pointer">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                
                <div className="text-sm mb-5 font-medium px-4 py-1.5 rounded-full bg-white/5 border border-white/5">
                  {winner ? (
                     <span className="text-emerald-400 drop-shadow-sm">Pemenang: {winner}! 🎉</span>
                  ) : isDraw ? (
                     <span className="text-amber-400 drop-shadow-sm">Seri! Coba lagi! 🤝</span>
                  ) : (
                    <span className="text-white/80">Giliran: <strong className={`text-lg ml-1 drop-shadow-sm ${xIsNext ? "text-blue-400" : "text-violet-400"}`}>{xIsNext ? "X" : "O"}</strong></span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-5 p-2 rounded-2xl bg-black/40 border border-white/5 shadow-inner">
                  {board.map((cell, i) => (
                    <button
                      key={i}
                      onClick={() => handleClick(i)}
                      className={`w-16 h-16 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-3xl font-black transition-all cursor-pointer shadow-sm
                        ${cell === 'X' ? 'text-blue-400 shadow-blue-500/20' : cell === 'O' ? 'text-violet-400 shadow-violet-500/20' : ''}
                        ${!cell && !winner ? 'active:scale-95' : ''}
                      `}
                    >
                      {cell && (
                        <motion.span
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          {cell}
                        </motion.span>
                      )}
                    </button>
                  ))}
                </div>

                <Button 
                  onClick={resetGame}
                  variant="ghost"
                  className="text-sm text-white/70 hover:text-white hover:bg-white/10 cursor-pointer rounded-xl h-10 w-full transition-all"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                  Main Ulang
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-2xl shadow-blue-500/30 flex items-center justify-center p-0 cursor-pointer border border-white/20 relative group"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-blue-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
        
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="relative z-10">
            <svg className="w-7 h-7 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.866 8.21 8.21 0 003 2.48z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
            </svg>
            {/* Notification dot */}
            <span className="absolute top-0 right-0 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          </div>
        )}
      </motion.button>
      </div>
    </>
  );
}

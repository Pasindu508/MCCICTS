"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

interface MenuOverlayProps {
  onClose: () => void;
}

const menuItems = [
  { id: "01", label: "Home", href: "/" },
  { id: "02", label: "About", href: "/about" },
  { id: "03", label: "Projects", href: "/projects" },
  { id: "04", label: "Events", href: "/events" },
  { id: "05", label: "Team", href: "/team" },
  { id: "06", label: "Register", href: "/register" },
];

export default function MenuOverlay({ onClose }: MenuOverlayProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 10);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const ms = String(date.getMilliseconds()).padStart(3, "0");
    return `${hours}:${minutes}:${seconds}.${ms}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-2xl text-white flex flex-col scrollbar-hide"
    >
      <div className="flex flex-col h-screen">
        <div className="container mx-auto w-full flex flex-col justify-between flex-1 relative px-4 sm:px-6 py-6">
          {/* Header - Aligned with Navbar */}
          <div className="flex justify-between items-center h-12">
              <div className="flex flex-col gap-1">
                <Link 
                  href="/" 
                  onClick={onClose}
                  className="text-white text-sm font-bold tracking-[0.2em] cursor-pointer" 
                  style={{ fontFamily: "'Azonix', sans-serif" }}
                >
                  MCCICTS
                </Link>
              </div>
            <button 
              onClick={onClose}
              className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-white/60 hover:text-white transition-colors font-medium py-2"
            >
              Close
            </button>
          </div>

          {/* Floating tagline below logo area */}
          <div className="absolute top-24 left-4 sm:left-6 hidden sm:block">
            <span className="text-[7px] sm:text-[8px] uppercase tracking-[0.25em] text-white/40">
              Innovating Education | Empowering Students | Mayurapada Central College
            </span>
          </div>

        {/* Main Menu Items */}
        <div className="flex-1 flex items-center px-4 md:px-8 py-8">
          <nav className="flex flex-col gap-2 md:gap-4">
            {menuItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 40, rotateX: -15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ 
                  delay: 0.2 + idx * 0.08, 
                  duration: 1.2, 
                  ease: [0.16, 1, 0.3, 1] 
                }}
                className="group flex items-baseline gap-4 md:gap-8 perspective-1000"
              >
                <span className="text-[8px] md:text-[9px] font-mono text-white/20 group-hover:text-white/40 transition-colors w-6 md:w-8">
                  {item.id}
                </span>
                <Link 
                  href={item.href}
                  onClick={onClose}
                  className="text-4xl sm:text-5xl md:text-[65px] font-extralight tracking-tighter leading-[0.9] group-hover:translate-x-4 transition-transform duration-700 ease-out"
                >
                  {item.label}
                </Link>
              </motion.div>
              ))}
            </nav>
          </div>

          {/* Decorative Image */}
          <div className="absolute right-[5%] sm:right-[8%] top-1/2 -translate-y-1/2 w-[40%] sm:w-[35%] aspect-square pointer-events-none hidden md:block">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 40, rotate: 5 }}
              animate={{ 
                opacity: 0.8, 
                scale: 1, 
                x: 0,
                rotate: 0,
                y: [0, -20, 0] 
              }}
              transition={{ 
                opacity: { duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 },
                scale: { duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 },
                rotate: { duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 },
                x: { duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 },
                y: {
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              className="w-full h-full relative"
            >
              <img 
                src="/menu-overlay.webp" 
                alt="Decorative Visual" 
                className="w-full h-full object-contain mix-blend-lighten opacity-80"
              />
              {/* Soft glow behind the image */}
              <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-[100px] -z-10" />
            </motion.div>
          </div>

          {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-8 sm:gap-0">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-4 sm:gap-6 text-[7px] sm:text-[8px] uppercase tracking-[0.2em] text-white/40">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/risk" className="hover:text-white transition-colors">Risk Disclosure</Link>
            </div>
          </div>
          
          <div className="flex flex-col items-start sm:items-end gap-1">
              <span className="text-[7px] sm:text-[8px] uppercase tracking-[0.2em] text-white/30">Local Time | SL</span>
              <span className="text-2xl sm:text-3xl md:text-[48px] font-extralight tabular-nums tracking-tighter leading-none">
                {formatTime(time)}
              </span>
              <span className="text-[7px] sm:text-[8px] text-white/10 mt-2 sm:mt-4 uppercase tracking-widest">© 2026 MCCICTS</span>
            </div>
        </div>
      </div>
    </div>
    </motion.div>
  );
}

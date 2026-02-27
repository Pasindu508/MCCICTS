"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import MenuOverlay from "./MenuOverlay";

export default function TeamHero() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  return (
    <section className="relative h-[70vh] bg-black p-4 md:p-6 overflow-hidden flex flex-col">
      <header className="relative z-20 flex justify-between items-center px-4 py-1">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-white text-sm font-bold tracking-[0.2em] cursor-pointer relative z-[110]"
            style={{ fontFamily: "'Azonix', sans-serif" }}
          >
            MCCICTS
          </Link>
        </div>
        <div
          onClick={() => setIsMenuOpen(true)}
          className="text-[10px] uppercase tracking-[0.3em] text-white/60 hover:text-white cursor-pointer transition-colors font-medium"
        >
          Menu
        </div>
      </header>

      <AnimatePresence mode="wait">
        {isMenuOpen && (
          <MenuOverlay key="team-menu" onClose={() => setIsMenuOpen(false)} />
        )}
      </AnimatePresence>

      <div className="flex-1 relative mt-2 bg-[#05070a] border border-white/5 rounded-[32px] md:rounded-[40px] overflow-hidden flex flex-col justify-center px-6 sm:px-12 md:px-24 group">
        <div className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 w-full max-w-4xl h-[40%] md:h-[60%] bg-gradient-to-t from-[#001a4d] via-[#000a1f]/40 to-transparent opacity-100 blur-[80px] md:blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 via-transparent to-transparent opacity-50 pointer-events-none" />

        <div className="relative z-10 max-w-2xl text-center md:text-left mx-auto md:mx-0">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white leading-tight mb-4 md:mb-6"
          >
            Leaders of the <br className="hidden sm:block" />
            <span className="text-white/40 italic">ICT Society.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-white/40 text-xs sm:text-sm md:text-base font-light leading-relaxed max-w-md mb-6 md:mb-8 mx-auto md:mx-0"
          >
            A multidisciplinary team dedicated to pushing the boundaries of
            technology and student innovation.
          </motion.p>
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[35%] aspect-square pointer-events-none hidden lg:block mr-12 md:mr-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{
              duration: 1.2,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.5,
            }}
            className="w-full h-full relative"
          >
            <img
              src="/astronaut_in_space.webp"
              alt="Team Visual"
              className="w-full h-full object-contain opacity-50 mix-blend-lighten"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}


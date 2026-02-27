"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import MenuOverlay from "../layout/MenuOverlay";

interface ProjectsHeroProps {
  title: string;
  subtitle?: string;
}

export default function ProjectsHero({ title, subtitle }: ProjectsHeroProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <section className="relative h-[60vh] bg-black p-4 md:p-6 overflow-hidden flex flex-col">
      {/* Header inside the Hero */}
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
          <MenuOverlay key="projects-menu" onClose={() => setIsMenuOpen(false)} />
        )}
      </AnimatePresence>

      {/* Main Content Container */}
      <div className="flex-1 relative mt-2 bg-[#05070a] border border-white/5 rounded-[32px] md:rounded-[40px] overflow-hidden flex flex-col justify-center px-6 sm:px-12 md:px-24 group">
        {/* Blue Glow Effect */}
        <div className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 w-full max-w-4xl h-[40%] md:h-[60%] bg-gradient-to-t from-[#001a4d] via-[#000a1f]/40 to-transparent opacity-100 blur-[80px] md:blur-[120px] pointer-events-none" />
        
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 via-transparent to-transparent opacity-50 pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl text-center md:text-left mx-auto md:mx-0">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl font-light tracking-tight leading-[1.1] text-white mb-4 md:mb-6"
          >
            {title}
          </motion.h1>

          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-white/40 text-sm sm:text-base md:text-lg font-light leading-relaxed max-w-2xl mb-6 md:mb-8 mx-auto md:mx-0"
            >
              {subtitle}
            </motion.p>
          )}
        </div>

        {/* Decorative elements - subtle code-like patterns or grid */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none hidden lg:block opacity-20">
          <div className="h-full w-full bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:32px_32px] [mask-image:linear-gradient(to_left,white,transparent)]" />
        </div>
      </div>
    </section>
  );
}

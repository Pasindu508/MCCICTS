"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import MenuOverlay from "./MenuOverlay";

export default function Hero() {
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
    <section className="relative h-screen bg-black p-4 md:p-6 overflow-hidden flex flex-col">
      {/* Header inside the Hero */}
      <header className="relative z-20 flex justify-between items-center px-4 py-2">
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
          <MenuOverlay key="hero-menu" onClose={() => setIsMenuOpen(false)} />
        )}
      </AnimatePresence>

      {/* Main Content Container */}
      <div className="flex-1 relative mt-2 bg-[#05070a] border border-white/5 rounded-[32px] md:rounded-[40px] overflow-hidden flex flex-col justify-center px-6 sm:px-12 md:px-24 group">
        {/* Blue Glow Effect (Bottom to Top, Middle) */}
        <div className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 w-full max-w-4xl h-[40%] md:h-[60%] bg-gradient-to-t from-[#001a4d] via-[#000a1f]/40 to-transparent opacity-100 blur-[80px] md:blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-full max-w-2xl h-[25%] md:h-[35%] bg-gradient-to-t from-[#002b5c]/60 to-transparent opacity-80 blur-[60px] md:blur-[80px] pointer-events-none" />
        
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 via-transparent to-transparent opacity-50 pointer-events-none" />
        
        {/* Border Light Effect */}
        <div className="absolute inset-0 border border-white/5 rounded-[32px] md:rounded-[40px] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl text-center md:text-left mx-auto md:mx-0">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[1.1] text-white mb-6 md:mb-8"
          >
            Mayurapada Central College <br className="hidden lg:block" />
            <span className="text-white/80">ICT Society</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-white/40 text-xs sm:text-sm md:text-base font-light leading-relaxed max-w-md mb-8 md:mb-12 mx-auto md:mx-0"
          >
            Empowering the next generation of digital leaders through innovation, technology, and collaborative learning at Mayurapada Central College.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <button className="w-full sm:w-auto px-10 py-3.5 rounded-full border border-white/10 text-white text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-white hover:text-black transition-all duration-500 bg-white/5 backdrop-blur-sm relative group overflow-hidden">
              <span className="relative z-10">Learn More</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </motion.div>
        </div>

        {/* Astronaut Image */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[45%] aspect-square pointer-events-none hidden lg:block mr-12 md:mr-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
            className="w-full h-full relative"
          >
            <motion.div
              animate={{ 
                y: [0, -20, 0],
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                ease: "easeInOut",
              }}
              className="w-full h-full will-change-transform"
            >
              <img 
                src="/astronaut_in_space.webp" 
                alt="Astronaut" 
                className="w-full h-full object-contain opacity-70 mix-blend-lighten select-none"
                decoding="async"
                loading="eager"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Footer text inside container */}
        <div className="absolute bottom-12 right-12 md:right-24 text-[9px] uppercase tracking-[0.3em] text-white/20 font-medium">
          Innovating for a digital future
        </div>
      </div>
    </section>
  );
}

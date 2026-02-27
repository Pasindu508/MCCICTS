"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import MenuOverlay from "./MenuOverlay";

const navLinks = [
  { name: "About", href: "#about" },
  { name: "Team", href: "#team" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          scrolled ? "bg-background/80 backdrop-blur-md py-3 sm:py-4 border-b border-white/10" : "bg-transparent py-4 sm:py-6"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center">
          <Link href="/" className="text-lg sm:text-xl font-heading tracking-tighter flex items-center gap-2 group relative z-[110]">
            <span className="w-7 h-7 sm:w-8 sm:h-8 bg-accent rounded-sm flex items-center justify-center text-white text-[10px] sm:text-xs font-bold transition-transform group-hover:scale-110">ICT</span>
            <span className="font-bold tracking-widest text-white/90 group-hover:text-white transition-colors text-sm sm:text-base" style={{ fontFamily: "'Azonix', sans-serif" }}>MCCICTS</span>
          </Link>

          {/* Desktop Links */}
          <div className="flex items-center gap-4 sm:gap-8">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-white/60 hover:text-white transition-colors font-medium py-2"
            >
              Menu
            </button>
            <Link
              href="/register"
              className="hidden sm:block px-4 sm:px-5 py-2 bg-white text-black text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold hover:bg-accent hover:text-white transition-all"
            >
              Join Now
            </Link>
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {isMenuOpen && (
          <MenuOverlay key="menu-overlay" onClose={() => setIsMenuOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

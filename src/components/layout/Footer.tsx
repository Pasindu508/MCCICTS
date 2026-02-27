"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { MouseEvent, useRef } from "react";

export default function Footer() {
  const pathname = usePathname();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const maskImage = useMotionTemplate`
    radial-gradient(
      circle 150px at ${mouseX}px ${mouseY}px,
      white 0%,
      transparent 100%
    )
  `;

  function handleMouseMove({ clientX, clientY }: MouseEvent) {
    if (!containerRef.current) return;
    const { left, top } = containerRef.current.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <footer className="bg-black pt-16 pb-4 px-6 md:pt-20 md:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {!pathname.startsWith("/register") && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative bg-[#05070a] border border-white/5 rounded-[32px] md:rounded-[40px] p-8 sm:p-12 md:p-24 flex flex-col items-center text-center mb-16 md:mb-24 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent opacity-50 pointer-events-none" />
            
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-light tracking-tight text-white mb-6 md:mb-8 relative z-10">
              Join the MCCICTS
            </h2>
            
            <p className="text-white/40 text-xs sm:text-sm md:text-base font-light leading-relaxed max-w-xl mb-8 md:mb-12 relative z-10">
              Empowering the next generation of digital leaders through innovation, technology, and collaborative learning at Mayurapada Central College.
            </p>
            
            <Link
              href="/register"
              className="w-full sm:w-auto px-10 py-3.5 rounded-full border border-white/10 text-white text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-white hover:text-black transition-all duration-500 bg-white/5 backdrop-blur-sm relative z-10 group overflow-hidden flex items-center justify-center"
            >
              <span className="relative z-10">Join Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </motion.div>
        )}

        {/* Footer Links & Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 md:mb-16 gap-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-white text-sm font-bold tracking-[0.2em]" style={{ fontFamily: "'Azonix', sans-serif" }}>
              MCCICTS
            </Link>
            <p className="text-white/20 text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-medium">
              © {new Date().getFullYear()} MCCICTS
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-x-6 md:gap-x-8 gap-y-3 md:gap-y-4">
            {[
              { label: "Home", href: "/" },
              { label: "Projects", href: "/projects" },
              { label: "Events", href: "/events" },
              { label: "Team", href: "/team" },
            ].map((link) => (
              <Link 
                key={link.label} 
                href={link.href} 
                className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-medium hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
            
            <div className="w-[1px] h-3 bg-white/10 hidden md:block" />

            {[
              { label: "About", href: "/about" },
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
            ].map((link) => (
              <Link 
                key={link.label} 
                href={link.href} 
                className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-medium hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Large Background Text */}
        <Link 
          href="/"
          className="relative w-full select-none pb-0 group/footer-text cursor-pointer flex justify-center items-center overflow-visible block"
          onMouseMove={handleMouseMove}
        >
          <div 
            ref={containerRef}
            className="relative flex justify-center items-center"
          >
            {/* Base Layer (Static Grey Outline) */}
            <h2 className="text-[8vw] md:text-[10vw] tracking-[0.05em] leading-none whitespace-nowrap text-transparent flex-shrink-0" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.1)', fontFamily: "'Azonix', sans-serif" }}>
              MCCICTS
            </h2>

            {/* Animated Spotlight Layer (Blue Outline) */}
            <motion.div
              className="absolute inset-0 pointer-events-none opacity-0 group-hover/footer-text:opacity-100 transition-opacity duration-300 flex justify-center items-center overflow-visible"
              style={{
                WebkitMaskImage: maskImage,
                maskImage: maskImage,
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
              }}
            >
              <h2 className="text-[8vw] md:text-[10vw] tracking-[0.05em] leading-none whitespace-nowrap text-transparent flex-shrink-0" style={{ WebkitTextStroke: '1.5px rgba(29, 78, 216, 0.8)', fontFamily: "'Azonix', sans-serif" }}>
                MCCICTS
              </h2>
            </motion.div>
          </div>
        </Link>
      </div>
    </footer>
  );
}

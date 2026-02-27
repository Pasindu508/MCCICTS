"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function About() {
  return (
    <section id="about" className="relative bg-black py-16 px-6 md:py-20 md:px-12 overflow-hidden">
      <div className="container mx-auto text-center mb-12">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl font-light tracking-tight text-white mb-4"
        >
          Our Mission
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-white/40 text-[12px] md:text-[14px] font-light tracking-wide"
        >
          Bridging the gap between students and the digital future.
        </motion.p>
      </div>

      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 relative">
        {/* Left Card: The Challenge */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative group h-[340px] sm:h-[380px] md:h-[420px] bg-[#050505] border border-white/5 rounded-[24px] p-6 sm:p-8 md:p-10 flex flex-col justify-between overflow-hidden"
        >
          {/* Dark Overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/60 z-[5] pointer-events-none" />

          <div className="relative z-10">
            <span className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] text-white/20 font-bold mb-4 md:mb-6 block">
              The Digital Gap
            </span>
            <h3 className="text-lg sm:text-xl md:text-[24px] font-light text-white leading-[1.2] max-w-[280px]">
              Limited access to modern technology.
            </h3>
          </div>

          <div className="relative z-10 mt-auto">
            <p className="text-white/30 text-[10px] sm:text-[11px] md:text-[13px] font-light leading-[1.6] max-w-[340px]">
              Many students face barriers in accessing the latest digital tools and learning resources. 
              Traditional education often lacks the hands-on experience needed for the rapidly evolving 
              tech landscape.
            </p>
          </div>

          {/* Abstract Blue Shape (Right Side) */}
          <div className="absolute right-0 top-0 w-full h-full pointer-events-none opacity-80">
            <motion.div 
              animate={{ 
                y: [0, -20, 0],
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] md:w-[400px] md:h-[400px]"
            >
              <div className="relative w-full h-full">
                <div className="absolute inset-0 bg-blue-600/10 blur-[60px] md:blur-[100px] rounded-full" />
                <Image 
                  src="/9Ja6elFnIS50sMeqqzr4Qj.png"
                  alt="Abstract tech shape"
                  fill
                  className="object-contain mix-blend-screen opacity-90 scale-125 translate-x-1/3 md:translate-x-1/2"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Card: The Solution */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative group h-[340px] sm:h-[380px] md:h-[420px] bg-[#050505] border border-white/5 rounded-[24px] p-6 sm:p-8 md:p-10 flex flex-col justify-between overflow-hidden"
        >
          {/* Dark Overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/60 z-[5] pointer-events-none" />

          <div className="relative z-10">
            <span className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] text-white/20 font-bold mb-4 md:mb-6 block">
              The ICT Solution
            </span>
            <h3 className="text-lg sm:text-xl md:text-[24px] font-light text-white leading-[1.2] max-w-[280px]">
              Practical learning and innovative community.
            </h3>
          </div>

          <div className="relative z-10 mt-auto">
            <p className="text-white/30 text-[10px] sm:text-[11px] md:text-[13px] font-light leading-[1.6] max-w-[340px]">
              We provide a collaborative platform where students can learn, build, and innovate together. 
              Our community fosters practical skills and creative thinking through hands-on projects 
              and mentorship.
            </p>
          </div>

          {/* Abstract Blue Shape (Left Side) */}
          <div className="absolute left-0 top-0 w-full h-full pointer-events-none opacity-80">
            <motion.div 
              animate={{ 
                y: [0, -20, 0],
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[280px] h-[280px] md:w-[400px] md:h-[400px]"
            >
              <div className="relative w-full h-full">
                <div className="absolute inset-0 bg-blue-600/10 blur-[100px] rounded-full" />
                <Image 
                  src="/9Ja6elFnIS50sMeqqzr4Qj.png"
                  alt="Abstract digital shape"
                  fill
                  className="object-contain mix-blend-screen opacity-90 scale-125 -translate-x-1/2"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

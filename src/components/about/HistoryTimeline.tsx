"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";

const milestones = [
  {
    year: "2017",
    title: "Foundation & Institutional Research",
    description: "MCCICTS was founded with a focus on institutional technological research. During this phase, we developed and programmed high-performance systems for our community.",
  },
  {
    year: "2019",
    title: "Algorithm Development",
    description: "Intensive research and development phase focused on creating robust algorithmic strategies. Implementation of comprehensive backtesting frameworks and risk management systems.",
  },
  {
    year: "2021",
    title: "Global Connectivity",
    description: "Expanding our reach to a global proprietary network. A timeline of systematic evolution and digital transformation across multiple platforms.",
  },
];

export default function HistoryTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section className="py-20 bg-black px-6 md:px-12 lg:px-24 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-light text-white mb-4 tracking-tight">Our History</h2>
          <p className="text-white/40 text-sm md:text-base font-light leading-relaxed max-w-2xl">
            From a focused research initiative to a global proprietary trading firm. 
            A timeline of systematic evolution.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start relative">
          {/* Left Column: Timeline */}
          <div ref={containerRef} className="space-y-20 relative z-10">
            {/* Background Line */}
            <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-white/10" />
            
            {/* Animated Scrolling Line */}
            <motion.div 
              style={{ scaleY }}
              className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-blue-400 to-blue-600 origin-top shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            />

            {milestones.map((milestone, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative pl-8"
              >
                {/* Year */}
                <span className="text-4xl md:text-5xl font-light tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-blue-500 to-blue-900 mb-4 block">
                  {milestone.year}
                </span>
                
                {/* Title */}
                <h3 className="text-lg md:text-xl text-white font-light mb-3 tracking-wide">
                  {milestone.title}
                </h3>
                
                {/* Description */}
                <p className="text-white/30 text-sm md:text-base font-light leading-relaxed max-w-lg">
                  {milestone.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Right Column: Astronaut Image */}
          <div className="hidden lg:block sticky top-24 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full aspect-square flex items-center justify-center"
            >
              <img 
                src="/astronaut_in_space.webp" 
                alt="Our History Visual" 
                className="w-full h-full object-contain opacity-80 mix-blend-lighten"
              />
              {/* Background Glow */}
              <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-[120px] -z-10" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}


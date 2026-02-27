"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const metrics = [
  {
    title: "Project Output",
    metric: "50+",
    description: "Diverse digital projects built by our members across various domains.",
  },
  {
    title: "Student Members",
    metric: "200+",
    description: "A growing community of passionate learners and innovators.",
  },
  {
    title: "Success Rate",
    metric: "95%",
    description: "Project completion rate with focus on high-quality standards.",
  },
  {
    title: "Annual Events",
    metric: "12+",
    description: "Workshops, seminars, and competitions held throughout the year.",
  },
];

export default function Performance() {
  return (
    <section className="bg-black py-12 px-6 md:py-16 md:px-12 overflow-hidden border-t border-white/5">
      <div className="container mx-auto max-w-[1400px]">
        {/* Header section */}
        <div className="mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[32px] md:text-[40px] font-light tracking-tight text-white mb-4 leading-[1.1]"
          >
            Society Impact
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/30 text-[14px] font-light leading-relaxed max-w-xl"
          >
            Measuring our growth and contribution to the digital empowerment of students. 
            From individual skill building to collective project success, we strive for excellence 
            in every initiative.
          </motion.p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((m, index) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#080808] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col h-[280px] sm:h-[320px] group relative overflow-hidden"
            >
              {/* Subtle blue background glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/0 group-hover:bg-blue-500/5 blur-[80px] sm:blur-[100px] transition-colors duration-700 pointer-events-none" />
              
              <h3 className="text-white/80 text-[13px] sm:text-[14px] font-medium z-10">{m.title}</h3>
              
              <div className="flex-grow flex items-center justify-center z-10">
                <span className="text-[56px] sm:text-[64px] md:text-[80px] font-extralight tracking-tighter bg-gradient-to-b from-blue-500 via-blue-800 to-black bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-700">
                  {m.metric}
                </span>
              </div>
              
              <p className="text-white/30 text-[10px] sm:text-[11px] leading-relaxed font-light z-10">
                {m.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <div className="flex justify-end gap-3">
          <button className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center text-white/20 hover:text-white hover:border-white/20 transition-all bg-[#080808]">
            <ChevronLeft size={20} />
          </button>
          <button className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center text-white/20 hover:text-white hover:border-white/20 transition-all bg-[#080808]">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}

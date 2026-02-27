"use client";

import { motion } from "framer-motion";

export default function AboutDetails() {
  return (
    <section className="py-16 bg-black px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-light text-white mb-4 tracking-tight">About Us</h2>
          <p className="text-white/40 text-xs md:text-sm font-light leading-relaxed max-w-3xl">
            Operating at the intersection of advanced mathematics, cutting-edge technology, and 
            digital innovation. We develop proprietary systems that use research and logic to 
            identify and capture opportunities across the technological landscape with absolute 
            consistency.
          </p>
        </motion.div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative bg-[#050505] border border-white/5 rounded-[24px] p-8 md:p-10 h-[380px] md:h-[450px] flex flex-col justify-between overflow-hidden"
          >
            <div className="relative z-10">
              <h3 className="text-white/80 text-base md:text-lg font-light tracking-wide">Vision & Precision</h3>
            </div>
            
            <div className="relative z-10 flex justify-center">
              <span className="text-[60px] md:text-[100px] font-light tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-blue-500 via-blue-700 to-black/80">
                2024
              </span>
            </div>

            <div className="relative z-10">
              <p className="text-white/30 text-[12px] md:text-[13px] font-light leading-relaxed max-w-md">
                MCCICTS represents the convergence of student-led innovation and 
                cutting-edge information technology. Since our founding, we have focused on 
                high-integrity digital education, developing and implementing robust 
                systems for our community.
              </p>
            </div>

            {/* Subtle Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group relative bg-[#050505] border border-white/5 rounded-[24px] p-8 md:p-10 h-[380px] md:h-[450px] flex flex-col justify-between overflow-hidden"
          >
            <div className="relative z-10">
              <h3 className="text-white/80 text-base md:text-lg font-light tracking-wide">Logic Over Emotion</h3>
            </div>
            
            <div className="relative z-10 flex justify-center">
              <span className="text-[40px] md:text-[60px] font-light tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-blue-500 via-blue-700 to-black/80">
                PHILOSOPHY
              </span>
            </div>

            <div className="relative z-10">
              <p className="text-white/30 text-[12px] md:text-[13px] font-light leading-relaxed max-w-md">
                In the world of technology, there is no room for guesswork. Our proprietary 
                approach eliminates bias by relying entirely on systematic execution. Every 
                project is determined by models refined through research, ensuring 
                absolute consistency.
              </p>
            </div>

            {/* Subtle Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

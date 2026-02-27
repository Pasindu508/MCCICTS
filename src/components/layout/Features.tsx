"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Features() {
  return (
    <section className="bg-black py-12 px-6 md:py-16 md:px-12 overflow-hidden">
      <div className="container mx-auto max-w-[1400px]">
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[32px] md:text-[40px] font-light tracking-tight text-white mb-4 leading-[1.1]"
            >
              Empowering Digital Creators
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-white/30 text-[14px] font-light leading-relaxed max-w-xl"
            >
              The ICT Society of Mayurapada Central College is a hub for innovation. We provide students with 
              the tools, mentorship, and community needed to master modern technology and build projects 
              that make a difference in the digital world.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-2"
          >
            <button className="px-8 py-2 border border-white/10 rounded-full text-[12px] text-white/60 hover:text-white hover:border-white/20 transition-all bg-white/5 backdrop-blur-sm">
              Join the Society
            </button>
          </motion.div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:auto-rows-[150px]">
          
          {/* Row 1-2, Col 1: Web Development */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="sm:col-span-2 md:col-span-1 md:row-span-2 bg-[#080808] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col relative overflow-hidden group min-h-[340px] sm:min-h-0"
          >
            <div className="relative z-10">
              <h3 className="text-white/80 text-[13px] sm:text-[14px] font-medium mb-2 sm:mb-3">Web Development</h3>
              <p className="text-white/30 text-[10px] sm:text-[11px] leading-relaxed font-light">
                Learn to build modern, responsive websites using the latest frameworks like React 
                and Next.js. Master front-end and back-end development through hands-on projects.
              </p>
            </div>
            <div className="mt-auto relative h-[160px] sm:h-[180px] w-full translate-y-6 sm:translate-y-8 group-hover:translate-y-2 sm:group-hover:translate-y-4 transition-transform duration-700 pointer-events-none">
              <Image 
                src="/9ol1ZE6Hw-P9uukfYJk_HB.png"
                alt="Unified Market Sync"
                fill
                className="object-contain object-bottom scale-[1.3] sm:scale-150"
              />
            </div>
          </motion.div>

          {/* Row 1, Col 2: UI/UX Design */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="sm:col-span-1 md:col-span-1 md:row-span-1 bg-[#080808] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col justify-between min-h-[160px] sm:min-h-0"
          >
            <h3 className="text-white/80 text-[13px] sm:text-[14px] font-medium mb-2">UI/UX Design</h3>
            <p className="text-white/30 text-[10px] sm:text-[11px] leading-relaxed font-light">
              Create intuitive and beautiful digital experiences. Learn the principles of user-centered 
              design and master tools like Figma and Adobe XD.
            </p>
          </motion.div>

          {/* Row 1, Col 3: Cyber Security */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="sm:col-span-1 md:col-span-1 md:row-span-1 bg-[#080808] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group min-h-[160px] sm:min-h-0"
          >
            {/* Blue atmospheric glow */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-500/10 blur-[80px] md:blur-[100px] rounded-full group-hover:bg-blue-500/20 transition-colors duration-700" />
            
            <h3 className="text-white/80 text-[13px] sm:text-[14px] font-medium z-10 mb-2">Cyber Security</h3>
            <p className="text-white/30 text-[10px] sm:text-[11px] leading-relaxed font-light z-10">
              Understand the importance of digital safety. Learn how to protect data, 
              identify vulnerabilities, and promote ethical technology practices.
            </p>
          </motion.div>

          {/* Row 1-2, Col 4: Phone Mockup */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="sm:col-span-2 md:col-span-1 md:row-span-2 bg-[#080808] border border-white/5 rounded-3xl overflow-hidden relative group h-[400px] sm:h-auto"
          >
            {/* Subtle blue accent glow */}
            <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-blue-500/10 to-transparent z-10 pointer-events-none" />
            
            <Image 
              src="/8J0pkzEwqAS7UanNTWK4dA.png"
              alt="Fyndex Mobile"
              fill
              className="object-cover object-center scale-[1.3] group-hover:scale-[1.25] transition-transform duration-700"
            />
          </motion.div>

          {/* Row 2-3, Col 2-3: Large App Mockup */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="sm:col-span-2 md:col-span-2 md:row-span-2 bg-[#080808] border border-white/5 rounded-3xl overflow-hidden relative group h-[300px] sm:h-auto"
          >
            {/* Central blue atmospheric glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/5 blur-[150px] pointer-events-none" />
            
            <Image 
              src="/aoio2hj94JYfdteHP-f4a8.png"
              alt="Fyndex Dashboard"
              fill
              className="object-cover group-hover:scale-[1.03] transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none" />
          </motion.div>

          {/* Row 3-4, Col 1: Project Progress */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="sm:col-span-2 md:col-span-1 md:row-span-2 bg-[#080808] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col relative overflow-hidden group min-h-[340px] sm:min-h-0"
          >
            {/* Subtle blue corner glow */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="mb-auto relative h-[180px] sm:h-full w-full group-hover:scale-[1.05] transition-transform duration-700 pointer-events-none">
              <Image 
                src="/bFSre9DWqcf4q5RzCVg_PS.png"
                alt="Project Progress"
                fill
                className="object-contain object-top scale-110 sm:scale-125"
              />
            </div>
            <p className="text-white/30 text-[10px] sm:text-[11px] leading-relaxed font-light mt-4 z-10">
              Track project milestones and development progress in real-time.
            </p>
          </motion.div>

          {/* Row 3, Col 4: MCC ICT Logo */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="sm:col-span-1 md:col-span-1 md:row-span-1 bg-[#080808] border border-white/5 rounded-3xl flex items-center justify-center p-6 sm:p-8 group relative overflow-hidden min-h-[140px] sm:min-h-0"
          >
            {/* Blue logo accent glow */}
            <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors duration-700" />
            
            <div 
              className="text-[24px] sm:text-[32px] font-bold tracking-[0.2em] text-white/90 group-hover:text-white transition-all duration-500 uppercase z-10 select-none text-center"
              style={{ fontFamily: "'Azonix', sans-serif" }}
            >
              MCCICTS
            </div>
          </motion.div>

          {/* Row 4, Col 2: Collaborative Learning */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            className="sm:col-span-1 md:col-span-1 md:row-span-1 bg-[#080808] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group min-h-[160px] sm:min-h-0"
          >
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/5 blur-[80px] rounded-full" />
            <h3 className="text-white/80 text-[13px] sm:text-[14px] font-medium z-10 mb-2">Collaborative Learning</h3>
            <p className="text-white/30 text-[10px] sm:text-[11px] leading-relaxed font-light z-10">
              Engage in peer-to-peer learning and mentorship. Share knowledge and build together.
            </p>
          </motion.div>

          {/* Row 4, Col 3-4: Systematic Risk Management */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="sm:col-span-2 md:col-span-2 md:row-span-1 bg-[#080808] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col justify-between group overflow-hidden relative min-h-[180px] sm:min-h-0"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none" />
            <h3 className="text-white/80 text-[13px] sm:text-[14px] font-medium mb-2">Systematic Risk Management</h3>
            <p className="text-white/30 text-[10px] sm:text-[11px] leading-relaxed font-light max-w-md">
              Automated safety protocols built into the core. Configure hard stops, position 
              limits, and exposure thresholds to ensure systematic adherence to your risk 
              management framework.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

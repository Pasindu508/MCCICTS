"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
  title?: string;
  subtitle?: string;
}

export default function Section({ children, id, className = "", title, subtitle }: SectionProps) {
  return (
    <section id={id} className={`py-12 sm:py-20 px-4 sm:px-6 md:py-32 ${className}`}>
      <div className="container mx-auto">
        {(title || subtitle) && (
          <div className="mb-10 sm:mb-16 md:mb-24">
            {subtitle && (
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-accent text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold block mb-3 sm:mb-4"
              >
                {subtitle}
              </motion.span>
            )}
            {title && (
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-2xl sm:text-4xl md:text-5xl font-heading tracking-tight"
              >
                {title}
              </motion.h2>
            )}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-[1px] bg-white/10 w-full mt-6 sm:mt-8 origin-left"
            />
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}

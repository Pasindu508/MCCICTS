"use client";

import { motion } from "framer-motion";

const techStack = [
  "Python", "JavaScript", "React", "Next.js", "Java", "PHP", "MySQL", "Arduino", "IoT", "Cybersecurity", "Firebase", "TypeScript", "Tailwind CSS", "Git"
];

const architectureCards = [
  {
    title: "Project Development",
    description: "Student-led initiatives building real-world digital solutions and software applications."
  },
  {
    title: "Technical Training",
    description: "Continuous learning pathways in software engineering, networking, and emerging AI technologies."
  },
  {
    title: "Digital Literacy",
    description: "Empowering the school community through specialized ICT awareness and educational programs."
  },
  {
    title: "Collaboration",
    description: "Connecting passionate students with industry mentors and collaborative peer networks."
  }
];

export function ProjectTechStack() {
  // Triple the items to ensure smooth infinite loop
  const duplicatedTech = [...techStack, ...techStack, ...techStack];

  return (
    <section className="py-20 bg-black overflow-hidden border-t border-white/5 relative">
      <div className="w-full px-6 md:px-12 lg:px-24 flex flex-col md:flex-row items-center gap-10 md:gap-16">
        {/* Left Title */}
        <div className="flex-shrink-0">
          <h2 className="text-white/70 text-lg md:text-xl font-light tracking-tight whitespace-nowrap">
            Technologies & Tools powering our edge.
          </h2>
        </div>

        {/* Marquee Container */}
        <div className="flex-1 relative overflow-hidden h-16 md:h-24 flex items-center">
          {/* Left Gradient Fade */}
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black via-black/90 to-transparent z-20" />
          
          <motion.div 
            className="flex gap-12 md:gap-16 items-center whitespace-nowrap"
            animate={{
              x: ["0%", "-33.33%"]
            }}
            transition={{
              duration: 40,
              ease: "linear",
              repeat: Infinity
            }}
          >
            {duplicatedTech.map((tech, i) => (
              <span 
                key={i} 
                className="text-white/10 text-4xl md:text-6xl font-extralight italic tracking-[0.1em] uppercase select-none"
              >
                {tech}
              </span>
            ))}
          </motion.div>

          {/* Right Gradient Fade */}
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black via-black/90 to-transparent z-20" />
        </div>
      </div>
    </section>
  );
}

export function ProjectArchitecture() {
  return (
    <section className="py-24 bg-black px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-light text-white mb-8 tracking-tight"
          >
            Society Ecosystem
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/40 text-lg font-light max-w-3xl leading-relaxed"
          >
            The ICT Society of Mayurapada Central College is powered by a robust digital framework designed 
            to foster innovation and technical excellence. Our unified architecture integrates student-led 
            development, collaborative learning environments, and administrative efficiency to prepare 
            the next generation of ICT leaders in Sri Lanka.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {architectureCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#050505] border border-white/5 rounded-[24px] p-8 h-[240px] flex flex-col justify-between group hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 blur-3xl transition-colors duration-700 pointer-events-none" />
              <h3 className="text-white/80 text-xl font-light relative z-10">{card.title}</h3>
              <p className="text-white/30 text-sm font-light leading-relaxed relative z-10">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}



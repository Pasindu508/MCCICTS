"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// Partners marquee: sponsored companies worldwide (display only)
const partners = [
  "Google",
  "Microsoft",
  "Apple",
  "Amazon",
  "Meta",
  "NVIDIA",
  "IBM",
  "Intel",
  "Samsung",
  "Adobe",
  "Oracle",
  "Cisco",
  "Tesla",
  "Netflix",
  "Uber",
  "Airbnb",
  "Stripe",
  "Shopify",
  "Cloudflare",
  "SpaceX"
];

interface ContentItem {
  name: string;
  value?: string;
  unit?: string;
  size?: string;
  color?: string;
  icon?: string; // Change to string for specific icon names
  isHighlighted?: boolean;
}

interface InfrastructureCard {
  title: string;
  label: string;
  symbol?: string;
  content?: ContentItem[];
  avg?: string;
  version?: string;
  code?: string[];
  status?: { name: string; type: string }[];
  footer: string;
}

const infrastructureCards: InfrastructureCard[] = [
  {
    title: "Innovation",
    label: "TECHNOLOGY STACK",
    content: [
      { name: "REACT", value: "18", unit: "V", icon: "react" },
      { name: "NEXT.JS", value: "14", unit: "V", icon: "nextjs" },
      { name: "TAILWIND", value: "3.4", unit: "V", icon: "tailwind" },
      { name: "TYPESCRIPT", value: "5.3", unit: "V", icon: "typescript" },
      { name: "FRAMER", value: "11", unit: "V", icon: "framer" },
    ],
    footer: "Utilizing modern web technologies to build future-ready solutions.",
    avg: "2026"
  },
  {
    title: "Impact",
    label: "PROJECT METRICS",
    symbol: "MCC/ICT",
    content: [
      { name: "WEB DEVELOPMENT", size: "12", color: "text-white/40" },
      { name: "MOBILE APPS", size: "8", color: "text-white/40" },
      { name: "UI/UX DESIGN", size: "15", color: "text-white/40" },
      { name: "AI/ML PROJECTS", size: "5", color: "text-blue-500", isHighlighted: true },
      { name: "GRAPHIC DESIGN", size: "20", color: "text-white/40" },
      { name: "ROBOTICS", size: "4", color: "text-white/40" },
      { name: "CYBERSECURITY", size: "6", color: "text-white/40" },
    ],
    footer: "Empowering students to build impactful digital projects."
  },
  {
    title: "Initiative",
    label: "LEARNING MODULES",
    version: "V1.0.0",
    code: [
      "def learn_ict():",
      "  skills = ['Coding', 'Design', 'Security']",
      "  for skill in skills:",
      "    practice(skill)",
      "    innovate()",
      "",
      "if student_ready:",
      "  learn_ict()",
      ""
    ],
    footer: "Organizing regular sessions to foster digital literacy."
  },
  {
    title: "Security",
    label: "CYBER SAFETY VERIFICATION",
    status: [
      { name: "Checking digital safety protocols", type: "text" },
      { name: "PASSWORD_POLICY: ENFORCED", type: "code" },
      { name: "2FA_VERIFICATION: ACTIVE", type: "code" },
      { name: "PHISHING_AWARENESS: HIGH", type: "code" },
      { name: "/ DATA_PRIVACY: SECURE", type: "code" }
    ],
    footer: "Promoting digital safety and ethical technology practices."
  }
];

function TechIcon({ type }: { type: string }) {
  switch (type) {
    case "react":
      return (
        <div className="w-3 h-3 flex items-center justify-center bg-[#61DAFB]/10 rounded-sm">
          <div className="w-1.5 h-1.5 bg-[#61DAFB] rounded-full animate-pulse" />
        </div>
      );
    case "nextjs":
      return (
        <div className="w-3 h-3 flex items-center justify-center bg-white/10 rounded-sm">
          <div className="w-1.5 h-1.5 bg-white rounded-full" />
        </div>
      );
    case "tailwind":
      return (
        <div className="w-3 h-3 flex items-center justify-center bg-[#38BDF8]/10 rounded-sm">
          <div className="w-1.5 h-1.5 bg-[#38BDF8] rotate-45" />
        </div>
      );
    case "typescript":
      return (
        <div className="w-3 h-3 flex items-center justify-center bg-[#3178C6]/10 rounded-sm">
          <div className="w-1.5 h-1.5 bg-[#3178C6] rounded-sm" />
        </div>
      );
    case "framer":
      return (
        <div className="w-3 h-3 flex items-center justify-center bg-[#0055FF]/10 rounded-sm">
          <div className="w-1.5 h-1.5 bg-[#0055FF] rotate-180" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
        </div>
      );
    default:
      return null;
  }
}

function TypingCode({ lines }: { lines: string[] }) {
  const [displayLines, setDisplayLines] = useState<string[]>(lines.map(() => ""));
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true });
  const [iteration, setIteration] = useState(0);
  
  useEffect(() => {
    if (isInView) {
      let currentLine = 0;
      let currentChar = 0;
      
      const typeInterval = setInterval(() => {
        if (currentLine >= lines.length) {
          clearInterval(typeInterval);
          // Wait 3 seconds then reset to loop
          setTimeout(() => {
            setDisplayLines(lines.map(() => ""));
            setIteration(prev => prev + 1);
          }, 3000);
          return;
        }

        const targetLine = lines[currentLine];
        if (currentChar < targetLine.length) {
          setDisplayLines(prev => {
            const next = [...prev];
            next[currentLine] = targetLine.substring(0, currentChar + 1);
            return next;
          });
          currentChar++;
        } else {
          currentLine++;
          currentChar = 0;
        }
      }, 60); // Slower typing speed

      return () => clearInterval(typeInterval);
    }
  }, [isInView, lines, iteration]);

  return (
    <div ref={containerRef} className="space-y-1 text-blue-400/80 text-[8px] md:text-[9px]">
      {displayLines.map((line, i) => (
        <div key={i} className="flex gap-2 md:gap-4">
          <span className="text-white/10 w-3 md:w-4 text-right select-none">{i + 1}</span>
          <span className={line && line.trim() === "" ? "h-3 md:h-4" : "whitespace-pre"}>
            {line}
            {i === displayLines.findIndex((l, idx) => l.length < (lines[idx]?.length || 0)) && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-1 h-2.5 md:h-3.5 bg-blue-500 ml-0.5 align-middle"
              />
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

function LiveValue({ value, unit }: { value: string; unit?: string }) {
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const val = parseInt(value);
      const fluctuation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
      setDisplayValue((val + fluctuation).toString());
    }, 2000 + Math.random() * 3000);
    
    return () => clearInterval(interval);
  }, [value]);

  return (
    <div className="flex items-center gap-1">
      <motion.span 
        key={displayValue}
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        className="text-white font-bold"
      >
        {displayValue}
      </motion.span>
      {unit && <span className="text-white/20 text-[8px]">{unit}</span>}
    </div>
  );
}

function LoadingSlash() {
  const [frame, setFrame] = useState(0);
  const frames = ["/", "-", "\\", "|"];

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(prev => (prev + 1) % frames.length);
    }, 150);
    return () => clearInterval(interval);
  }, [frames.length]);

  return <span className="text-blue-500/50 inline-block w-3">{frames[frame]}</span>;
}

function TerminalOutput({ status }: { status: { name: string; type: string }[] }) {
  const [displayItems, setDisplayItems] = useState<{ name: string; type: string }[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true });

  useEffect(() => {
    if (isInView && status.length > 0) {
      if (currentIdx < status.length) {
        const timeout = setTimeout(() => {
          setDisplayItems(prev => [...prev, status[currentIdx]]);
          setCurrentIdx(prev => prev + 1);
        }, 800);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setDisplayItems([]);
          setCurrentIdx(0);
        }, 5000);
        return () => clearTimeout(timeout);
      }
    }
  }, [isInView, currentIdx, status]);

  return (
    <div ref={containerRef} className="space-y-2 font-mono text-[9px]">
      {displayItems.map((item, i) => {
        if (!item) return null;
        return (
          <motion.div
            key={i + item.name}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex gap-2"
          >
            <span className="text-blue-500/50 select-none">
              {i === displayItems.length - 1 && currentIdx < status.length ? <LoadingSlash /> : ">"}
            </span>
            <span className={item.type === 'text' ? 'text-white/40 italic' : 'text-white'}>
              {item.name}
              {i === displayItems.length - 1 && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="inline-block w-1 h-2.5 bg-white/50 ml-1"
                />
              )}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function Infrastructure() {
  return (
    <section className="relative bg-black py-12 px-6 md:py-16 md:px-12 overflow-hidden">
      <div className="container mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-10 mb-16 border-b border-white/5 pb-6">
        <div className="w-full md:w-auto text-white/80 text-sm sm:text-base font-light tracking-tight text-center md:text-left whitespace-nowrap">
          Sponsored Companies Worldwide.
        </div>
        <div className="relative w-full overflow-hidden py-3 md:py-4 h-16 md:h-24 flex items-center">
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black via-black/90 to-transparent z-20" />
          <motion.div 
            className="flex gap-12 md:gap-16 items-center whitespace-nowrap will-change-transform select-none pointer-events-none"
            animate={{ x: ["0%", "-33.33%"] }}
            transition={{ duration: 70, ease: "linear", repeat: Infinity }}
          >
            {[...partners, ...partners, ...partners].map((tech, i) => (
              <span 
                key={tech + i} 
                className="text-white/10 text-4xl md:text-6xl font-extralight italic tracking-[0.1em] uppercase"
              >
                {tech}
              </span>
            ))}
          </motion.div>
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black via-black/90 to-transparent z-20" />
        </div>
      </div>

      <div className="container mx-auto mb-12 text-center md:text-left">
        <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white mb-4">
          Initiatives & Infrastructure
        </h2>
        <p className="text-white/40 text-[11px] sm:text-xs md:text-sm font-light leading-relaxed max-w-lg mx-auto md:mx-0">
          The technical foundation behind our society: modern tech stacks, collaborative 
          development environments, and automated project management.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {infrastructureCards.map((card, idx) => (
          <div key={idx} className="bg-white/[0.01] border border-white/5 rounded-[24px] p-6 md:p-8 flex flex-col h-[340px] sm:h-[380px] md:h-[400px] hover:bg-white/[0.02] transition-colors duration-500 group">
            <h3 className="text-lg sm:text-xl md:text-2xl font-light text-white mb-6 md:mb-8 tracking-tight group-hover:translate-x-1 transition-transform duration-500">{card.title}</h3>
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold">{card.label}</span>
              {card.version && <span className="text-[8px] md:text-[9px] font-mono text-white/20">{card.version}</span>}
              {card.symbol && <span className="text-[8px] md:text-[9px] font-mono text-white/20 uppercase">{card.symbol}</span>}
            </div>

            <div className="flex-1 font-mono text-[8px] sm:text-[9px] md:text-[10px] overflow-hidden">
              {card.title === "Liquidity" && (
                <div className="flex justify-between mb-3 text-[7px] md:text-[8px] text-white/20 font-bold tracking-widest border-b border-white/5 pb-1.5">
                  <span>PRICE</span>
                  <span>SIZE</span>
                </div>
              )}

              {card.content && (
                <div className="space-y-2.5 md:space-y-3">
                  {card.content.map((item, i) => (
                    <div key={i} className={`flex justify-between items-center ${item.color || 'text-white/80'}`}>
                      <div className="flex items-center gap-2 md:gap-3">
                        {item.icon && <TechIcon type={item.icon} />}
                        {item.isHighlighted && <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />}
                        <span className={item.isHighlighted ? "text-blue-500 font-bold" : ""}>{item.name}</span>
                        {item.isHighlighted && <span className="text-blue-500/40 text-[7px] md:text-[8px]">↑</span>}
                      </div>
                      {item.value && (
                        <LiveValue value={item.value} unit="MS" />
                      )}
                      {item.size && <span className="text-white/60">{item.size}</span>}
                    </div>
                  ))}
                  {card.avg && (
                    <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
                      <span className="text-white/30 uppercase tracking-[0.3em] text-[7px] md:text-[8px] font-bold">CLUSTER AVG</span>
                      <LiveValue value={card.avg} unit="MS" />
                    </div>
                  )}
                </div>
              )}

              {card.code && <TypingCode lines={card.code} />}
              {card.status && <TerminalOutput status={card.status} />}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5">
              <p className="text-white/40 text-[9px] md:text-[10px] leading-relaxed font-light">
                {card.footer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

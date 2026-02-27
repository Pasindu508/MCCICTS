"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

type TeamMember = {
  id?: string;
  name: string;
  role: string;
  image: string;
  bio?: string;
  order?: number;
};

type TeamProps = {
  hideHeading?: boolean;
};

export default function Team({ hideHeading = false }: TeamProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const teamRef = collection(db, "teamMembers");
        const teamQuery = query(teamRef, orderBy("order", "asc"));
        const snapshot = await getDocs(teamQuery);

        const data: TeamMember[] = snapshot.docs
          .map((docSnap) => {
            const docData = docSnap.data() as Record<string, unknown>;
            return {
              id: docSnap.id,
              name: (docData.name as string) ?? "",
              role: (docData.role as string) ?? "",
              image: (docData.image as string) ?? "",
              bio: docData.bio as string | undefined,
              order: docData.order as number | undefined,
            };
          })
          .filter((member) => member.name && member.role && member.image);

        setMembers(data);
      } catch (error) {
        console.error("Error fetching team members:", error);
        setMembers([]);
      }
    };

    fetchTeam();
  }, []);

  const teamToRender = members;

  if (teamToRender.length === 0) {
    return null;
  }

  return (
    <section
      id="team"
      className="relative bg-black py-12 px-6 md:py-16 md:px-12 overflow-hidden"
    >
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto relative z-10">
        {!hideHeading && (
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8 text-center md:text-left">
            <div className="max-w-2xl mx-auto md:mx-0">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white leading-tight"
              >
                Leaders of the <br className="hidden sm:block" />
                <span className="text-white/40 italic">ICT Society.</span>
              </motion.h2>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-white/30 text-[10px] sm:text-xs md:text-sm font-light tracking-wide max-w-xs leading-relaxed mx-auto md:mx-0"
            >
              A multidisciplinary team dedicated to pushing the boundaries of
              technology and student innovation.
            </motion.p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {teamToRender.map((member, index) => (
            <motion.div
              key={member.id ?? index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              className="group relative h-[340px] sm:h-[380px] bg-[#080808] border border-white/5 rounded-[24px] overflow-hidden flex flex-col justify-end p-6 sm:p-8 hover:border-white/10 transition-all duration-500"
            >
              {/* Image Container with Parallax-like effect on hover */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover grayscale opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-700" />
              </div>

              {/* Content Overlay */}
              <div className="relative z-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                <div className="flex items-center gap-2 mb-3 overflow-hidden">
                  <div className="w-8 h-[1px] bg-blue-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-700 delay-100" />
                  <span className="text-blue-500 text-[9px] uppercase tracking-[0.3em] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-200">
                    {member.role}
                  </span>
                </div>
                
                <h3 className="text-white text-xl font-light tracking-tight mb-2">
                  {member.name.split(' ').map((n, i) => (
                    <span key={i} className={i === 1 ? "font-medium" : ""}>{n} </span>
                  ))}
                </h3>

                <p className="text-white/20 text-[10px] leading-relaxed max-w-[180px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-300">
                  {member.bio ||
                    `Leading strategic initiatives and technological breakthroughs in ${member.role.toLowerCase()}.`}
                </p>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-blue-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

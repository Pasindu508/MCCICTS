"use client";

import { useEffect, useState } from "react";
import Section from "./Section";
import { motion } from "framer-motion";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

type HomeProject = {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl?: string;
};

export default function Projects() {
  const [projects, setProjects] = useState<HomeProject[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsRef = collection(db, "projects");
        const projectsQuery = query(projectsRef, orderBy("year", "desc"));
        const snapshot = await getDocs(projectsQuery);

        const data: HomeProject[] = snapshot.docs.map((docSnap) => {
          const docData = docSnap.data() as Record<string, unknown>;
          return {
            id: docSnap.id,
            title: (docData.title as string) ?? "",
            category: (docData.category as string) ?? "",
            description: (docData.description as string) ?? "",
            imageUrl: docData.imageUrl as string | undefined,
          };
        });

        setProjects(data.filter((project) => project.title && project.category));
      } catch (error) {
        console.error("Error fetching home projects:", error);
        setProjects([]);
      }
    };

    fetchProjects();
  }, []);

  const visibleProjects = projects.slice(0, 4);

  return (
    <Section id="projects" subtitle="Portfolio" title="Society Projects">
      {visibleProjects.length === 0 ? (
        <div className="border border-dashed border-white/10 rounded-[24px] p-8 text-center">
          <p className="text-secondary text-xs sm:text-sm">
            Projects will appear here once they are published.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {visibleProjects.map((project, index) => (
            <motion.div
              key={project.id}
              whileHover={{ y: -10 }}
              className="group relative bg-[#0a0a0a] border border-white/10 overflow-hidden"
            >
              <div className="aspect-video relative overflow-hidden">
                {project.imageUrl ? (
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 opacity-60 group-hover:opacity-100"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-blue-500/5 blur-2xl group-hover:bg-blue-500/20 transition-colors duration-700" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80" />
              </div>
              
              <div className="p-6 sm:p-8 relative">
                <span className="text-accent text-[9px] sm:text-[10px] uppercase tracking-[0.3em] font-bold mb-2 sm:mb-3 block">
                  {project.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-heading mb-3 sm:mb-4">
                  {project.title}
                </h3>
                <p className="text-secondary text-xs sm:text-sm mb-6 sm:mb-8 leading-relaxed">
                  {project.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Section>
  );
}

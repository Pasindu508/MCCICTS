"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";
import ProjectsHero from "@/components/projects/ProjectsHero";
import { ProjectDetailSkeleton } from "@/components/projects/ProjectSkeleton";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";

interface ProjectData {
  title: string;
  description: string;
  category: string;
  year: string;
  content: string;
  imageUrl?: string;
  technologies?: string[];
}

export default function ProjectPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        // Option 1: Try getting by document ID (if document ID is the slug)
        const docRef = doc(db, "projects", slug);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProject(docSnap.data() as ProjectData);
        } else {
          const projectsRef = collection(db, "projects");
          const q = query(projectsRef, where("slug", "==", slug));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            setProject(querySnapshot.docs[0].data() as ProjectData);
          }
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProject();
    }
  }, [slug]);

  if (loading) {
    return (
      <PageTransition>
        <main className="min-h-screen bg-black">
          <ProjectsHero title="Loading..." subtitle="Fetching project details" />
          <ProjectDetailSkeleton />
          <Footer />
        </main>
      </PageTransition>
    );
  }

  if (!project) {
    return (
      <PageTransition>
        <main className="min-h-screen bg-black flex flex-col items-center justify-center">
          <h1 className="text-4xl text-white font-light mb-4">Project Not Found</h1>
          <p className="text-white/40 mb-8">The project you&apos;re looking for doesn&apos;t exist.</p>
          <Footer />
        </main>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-black">
        <ProjectsHero 
          title={project.title} 
          subtitle={project.category}
        />
        
        <section className="py-24 px-6 md:px-12 lg:px-24">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex flex-wrap gap-4 mb-12">
                <div className="relative px-6 py-3 rounded-full bg-[#05070a]/80 backdrop-blur-sm overflow-hidden">
                  <div className="flex items-center gap-4">
                    <div className="h-6 w-[1px] bg-white/10" />
                    <div>
                      <span className="text-white/40 text-[10px] md:text-xs uppercase tracking-[0.26em] block mb-0.5">
                        Year
                      </span>
                      <span className="text-white font-light text-sm md:text-base">
                        {project.year}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="relative px-6 py-3 rounded-full bg-[#05070a]/80 backdrop-blur-sm overflow-hidden">
                  <div className="flex items-center gap-4">
                    <div className="h-6 w-[1px] bg-white/10" />
                    <div>
                      <span className="text-white/40 text-[10px] md:text-xs uppercase tracking-[0.26em] block mb-0.5">
                        Category
                      </span>
                      <span className="text-white font-light text-sm md:text-base">
                        {project.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-xl md:text-2xl text-white/80 font-light leading-relaxed mb-12">
                  {project.description}
                </p>
                
                {project.imageUrl && (
                  <div className="aspect-video rounded-[32px] overflow-hidden mb-12 border border-white/5">
                    <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="text-white/60 font-light leading-relaxed space-y-6">
                  {project.content.split('\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>

                {project.technologies && (
                  <div className="mt-16">
                    <h3 className="text-white text-xl font-light mb-6">Technologies Used</h3>
                    <div className="flex flex-wrap gap-3">
                      {project.technologies.map((tech) => (
                        <span key={tech} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/60">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </main>
    </PageTransition>
  );
}

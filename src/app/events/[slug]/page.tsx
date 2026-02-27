"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { motion } from "framer-motion";
import ProjectsHero from "@/components/projects/ProjectsHero";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";

interface EventData {
  title: string;
  description: string;
  category: string;
  year: string;
  content?: string;
  date?: string;
  imageUrl?: string;
}

export default function EventPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const docRef = doc(db, "events", slug);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setEvent(docSnap.data() as EventData);
        } else {
          const eventsRef = collection(db, "events");
          const q = query(eventsRef, where("slug", "==", slug));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            setEvent(querySnapshot.docs[0].data() as EventData);
          }
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchEvent();
    }
  }, [slug]);

  if (loading) {
    return (
      <PageTransition>
        <main className="min-h-screen bg-black">
          <ProjectsHero title="Loading..." subtitle="Fetching event details" />
          <Footer />
        </main>
      </PageTransition>
    );
  }

  if (!event) {
    return (
      <PageTransition>
        <main className="min-h-screen bg-black flex flex-col items-center justify-center">
          <h1 className="text-4xl text-white font-light mb-4">Event Not Found</h1>
          <p className="text-white/40 mb-8">
            The event you&apos;re looking for doesn&apos;t exist.
          </p>
          <Footer />
        </main>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-black">
        <ProjectsHero title={event.title} subtitle={event.category} />

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
                        {event.year}
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
                        {event.category}
                      </span>
                    </div>
                  </div>
                </div>
                {event.date && (
                  <div className="relative px-6 py-3 rounded-full bg-[#05070a]/80 backdrop-blur-sm overflow-hidden">
                    <div className="flex items-center gap-4">
                      <div className="h-6 w-[1px] bg-white/10" />
                      <div>
                        <span className="text-white/40 text-[10px] md:text-xs uppercase tracking-[0.26em] block mb-0.5">
                          Date
                        </span>
                        <span className="text-white font-light text-sm md:text-base">
                          {event.date}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="prose prose-invert max-w-none">
                {event.imageUrl && (
                  <div className="aspect-video rounded-[32px] overflow-hidden mb-12 border border-white/5">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {event.content && (
                  <div
                    className="text-white/60 font-light leading-relaxed space-y-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_table]:mt-4 [&_table]:mb-4 [&_th]:font-medium"
                    dangerouslySetInnerHTML={{ __html: event.content }}
                  />
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

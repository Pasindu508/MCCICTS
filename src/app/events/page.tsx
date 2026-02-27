"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";
import Link from "next/link";
import ProjectsHero from "@/components/projects/ProjectsHero";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";

interface Event {
  id: string;
  slug?: string;
  title: string;
  description: string;
  category: string;
  year: string;
  date?: string;
  imageUrl?: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const eventsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Event[];

        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <PageTransition>
      <main className="min-h-screen bg-black">
        <ProjectsHero
          title="Our Events."
          subtitle="Explore the key events, workshops, and hackathons hosted by the MCCICTS throughout the year."
        />

        <section className="py-20 px-6 md:px-12 lg:px-24">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-[24px] bg-[#050505] border border-white/5 h-64"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event, idx) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="group"
                  >
                    <Link href={`/events/${event.slug || event.id}`}>
                      <div className="relative aspect-[16/10] overflow-hidden rounded-[24px] bg-[#050505] border border-white/5 mb-6">
                        {event.imageUrl ? (
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full bg-blue-500/5 blur-2xl group-hover:bg-blue-500/20 transition-colors duration-700" />
                          </div>
                        )}
                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                          <span className="px-3 py-1 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-[10px] uppercase tracking-widest text-white/60">
                            {event.category}
                          </span>
                          {event.date && (
                            <span className="px-3 py-1 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-[10px] uppercase tracking-widest text-white/50">
                              {event.date}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="px-2">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-light text-white group-hover:text-blue-400 transition-colors">
                            {event.title}
                          </h3>
                          <span className="text-xs font-mono text-white/20">
                            {event.year}
                          </span>
                        </div>
                        <p className="text-sm text-white/40 font-light leading-relaxed line-clamp-2">
                          {event.description}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}

                {events.length === 0 && !loading && (
                  <div className="col-span-full py-24 text-center border border-dashed border-white/10 rounded-[32px]">
                    <p className="text-white/20 italic font-light">
                      No events found in the collection.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <Footer />
      </main>
    </PageTransition>
  );
}

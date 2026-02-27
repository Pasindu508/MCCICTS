"use client";

import { useEffect, useState } from "react";
import Section from "./Section";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

type HomeEvent = {
  id: string;
  title: string;
  description: string;
  location?: string;
  year?: string;
  date?: string;
};

export default function Events() {
  const [events, setEvents] = useState<HomeEvent[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsRef = collection(db, "events");
        const eventsQuery = query(eventsRef, orderBy("year", "desc"));
        const snapshot = await getDocs(eventsQuery);

        const data: HomeEvent[] = snapshot.docs.map((docSnap) => {
          const docData = docSnap.data() as Record<string, unknown>;
          return {
            id: docSnap.id,
            title: (docData.title as string) ?? "",
            description: (docData.description as string) ?? "",
            location: docData.location as string | undefined,
            year: docData.year as string | undefined,
            date: docData.date as string | undefined,
          };
        });

        setEvents(data.filter((event) => event.title));
      } catch (error) {
        console.error("Error fetching home events:", error);
        setEvents([]);
      }
    };

    fetchEvents();
  }, []);

  const visibleEvents = events.slice(0, 4);

  return (
    <Section id="events" subtitle="Calendar" title="Upcoming Engagements">
      {visibleEvents.length === 0 ? (
        <div className="border border-dashed border-white/10 rounded-[24px] p-8 text-center">
          <p className="text-secondary text-xs sm:text-sm">
            Events will appear here once they are published.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group flex flex-col lg:flex-row items-start lg:items-center justify-between p-6 sm:p-8 border border-white/5 hover:border-accent/30 hover:bg-white/[0.02] transition-all"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 mb-4 lg:mb-0">
                <div className="text-left sm:text-center min-w-[80px]">
                  <span className="text-accent text-[10px] sm:text-xs font-mono block mb-1">
                    {event.year || ""}
                  </span>
                  <span className="text-lg sm:text-xl font-heading text-white">
                    {event.date || "TBA"}
                  </span>
                </div>
                <div className="h-12 w-[1px] bg-white/10 hidden sm:block" />
                <div>
                  <h3 className="text-lg sm:text-xl font-heading mb-1">
                    {event.title}
                  </h3>
                  {event.location && (
                    <span className="text-secondary text-[10px] sm:text-xs uppercase tracking-widest">
                      {event.location}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="max-w-md lg:mx-8">
                <p className="text-secondary text-xs sm:text-sm leading-relaxed">
                  {event.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Section>
  );
}

"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import PageTransition from "@/components/layout/PageTransition";
import Footer from "@/components/layout/Footer";
import { FileUpload } from "@/components/ui/file-upload";

interface Registration {
  id: string;
  fullName: string;
  email: string;
  gradeClass: string;
  admissionNumber?: string;
  contactNumber: string;
  interests?: string[];
   documents?: { name: string; url: string }[];
  reason: string;
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  };
  handled?: boolean;
}

interface Project {
  id: string;
  slug?: string;
  title: string;
  description: string;
  category: string;
  year: string;
  imageUrl?: string;
  content?: string;
  technologies?: string[];
}

interface AdminEvent {
  id: string;
  slug?: string;
  title: string;
  description: string;
  category: string;
  year: string;
  date?: string;
  imageUrl?: string;
  content?: string;
}

interface AdminTeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  bio?: string;
  order?: number;
}

type AdminTab = "registrations" | "projects" | "events" | "team" | "settings";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const RichTextEditor = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;
    const el = editorRef.current;
    if (document.activeElement === el) return;
    if (value) {
      if (el.innerHTML !== value) {
        el.innerHTML = value;
      }
    } else if (el.innerHTML) {
      el.innerHTML = "";
    }
  }, [value]);

  const applyCommand = (command: string, valueArg?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    if (typeof document === "undefined") return;
    document.execCommand(command, false, valueArg);
    onChange(editorRef.current.innerHTML);
  };

  const insertTable = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const html =
      '<table style="border-collapse:collapse;width:100%"><thead><tr><th style="border:1px solid rgba(255,255,255,0.2);padding:4px">Header 1</th><th style="border:1px solid rgba(255,255,255,0.2);padding:4px">Header 2</th></tr></thead><tbody><tr><td style="border:1px solid rgba(255,255,255,0.2);padding:4px">Cell 1</td><td style="border:1px solid rgba(255,255,255,0.2);padding:4px">Cell 2</td></tr></tbody></table>';
    if (typeof document !== "undefined") {
      document.execCommand("insertHTML", false, html);
    } else {
      editorRef.current.innerHTML += html;
    }
    onChange(editorRef.current.innerHTML);
  };

  const insertLink = () => {
    if (typeof document === "undefined") return;
    const url = window.prompt("Enter link URL");
    if (!url) return;
    applyCommand("createLink", url);
  };

  const insertImage = () => {
    if (typeof document === "undefined") return;
    const url = window.prompt("Enter image URL");
    if (!url) return;
    applyCommand("insertImage", url);
  };

  const clearFormatting = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerText;
    editorRef.current.innerHTML = html;
    onChange(editorRef.current.innerHTML);
  };

  const insertHorizontalRule = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    if (typeof document === "undefined") return;
    document.execCommand("insertHorizontalRule");
    onChange(editorRef.current.innerHTML);
  };

  const applyFontSize = (size: string) => {
    applyCommand("fontSize", size);
  };

  const applySuperscript = () => {
    applyCommand("superscript");
  };

  const applySubscript = () => {
    applyCommand("subscript");
  };

  const undo = () => {
    applyCommand("undo");
  };

  const redo = () => {
    applyCommand("redo");
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    onChange(editorRef.current.innerHTML);
  };

  const showPlaceholder = !value;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 rounded-xl bg-black/80 border border-white/10 px-3 py-2">
        <button
          type="button"
          onClick={undo}
          className="px-2 py-1 rounded-lg text-xs uppercase tracking-[0.18em] border border-white/15 text-white/80 hover:border-white/40 hover:text-white"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={redo}
          className="px-2 py-1 rounded-lg text-xs uppercase tracking-[0.18em] border border-white/15 text-white/80 hover:border-white/40 hover:text-white"
        >
          Redo
        </button>
        <button
          type="button"
          onClick={() => applyCommand("bold")}
          className="px-2 py-1 rounded-lg text-xs uppercase tracking-[0.18em] border border-white/15 text-white/80 hover:border-white/40 hover:text-white"
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => applyCommand("italic")}
          className="px-2 py-1 rounded-lg text-xs uppercase tracking-[0.18em] border border-white/15 text-white/80 hover:border-white/40 hover:text-white"
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => applyCommand("underline")}
          className="px-2 py-1 rounded-lg text-xs uppercase tracking-[0.18em] border border-white/15 text-white/80 hover:border-white/40 hover:text-white"
        >
          Underline
        </button>
        <button
          type="button"
          onClick={() => applyCommand("strikeThrough")}
          className="px-2 py-1 rounded-lg text-xs uppercase tracking-[0.18em] border border-white/15 text-white/80 hover:border-white/40 hover:text-white"
        >
          Strike
        </button>
        <button
          type="button"
          onClick={() => applyCommand("formatBlock", "H2")}
          className="px-2 py-1 rounded-lg text-xs uppercase tracking-[0.18em] border border-white/15 text-white/80 hover:border-white/40 hover:text-white"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => applyCommand("formatBlock", "H3")}
          className="px-2 py-1 rounded-lg text-xs uppercase tracking-[0.18em] border border-white/15 text-white/80 hover:border-white/40 hover:text-white"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => applyCommand("insertUnorderedList")}
          className="px-2 py-1 rounded-lg text-xs uppercase tracking-[0.18em] border border-white/15 text-white/80 hover:border-white/40 hover:text-white"
        >
          Bullet
        </button>
        <button
          type="button"
          onClick={() => applyCommand("insertOrderedList")}
          className="px-2 py-1 rounded-lg text-xs uppercase tracking-[0.18em] border border-white/15 text-white/80 hover:border-white/40 hover:text-white"
        >
          Numbered
        </button>
        <button
          type="button"
          onClick={() => applyCommand("justifyLeft")}
          className="px-2 py-1 rounded-lg text-xs uppercase tracking-[0.18em] border border-white/15 text-white/80 hover:border-white/40 hover:text-white"
        >
          Left
        </button>
        <button
          type="button"
          onClick={() => applyCommand("justifyCenter")}
          className="px-2 py-1 rounded-lg text-xs uppercase tracking-[0.18em] border border-white/15 text-white/80 hover:border-white/40 hover:text-white"
        >
          Center
        </button>
        <button
          type="button"
          onClick={() => applyCommand("justifyRight")}
          className="px-2 py-1 rounded-lg text-xs uppercase tracking-[0.18em] border border-white/15 text-white/80 hover:border-white/40 hover:text-white"
        >
          Right
        </button>
        <button
          type="button"
          onClick={() => applyCommand("justifyFull")}
          className="px-2 py-1 rounded-lg text-xs uppercase tracking-[0.18em] border border-white/15 text-white/80 hover:border-white/40 hover:text-white"
        >
          Justify
        </button>
        <button
          type="button"
          onClick={() => applyCommand("formatBlock", "BLOCKQUOTE")}
          className="px-2 py-1 rounded-lg text-xs uppercase tracking-[0.18em] border border-white/15 text-white/80 hover:border-white/40 hover:text-white"
        >
          Quote
        </button>
        <button
          type="button"
          onClick={() => applyCommand("formatBlock", "PRE")}
          className="px-2 py-1 rounded-lg text-xs uppercase tracking-[0.18em] border border-white/15 text-white/80 hover:border-white/40 hover:text-white"
        >
          Code
        </button>
        <button
          type="button"
          onClick={applySuperscript}
          className="px-2 py-1 rounded-lg text-xs uppercase tracking-[0.18em] border border-white/15 text-white/80 hover:border-white/40 hover:text-white"
        >
          Sup
        </button>
        <button
          type="button"
          onClick={applySubscript}
          className="px-2 py-1 rounded-lg text-xs uppercase tracking-[0.18em] border border-white/15 text-white/80 hover-border-white/40 hover:text-white"
        >
          Sub
        </button>
        <button
          type="button"
          onClick={insertLink}
          className="px-2 py-1 rounded-lg text-xs uppercase tracking-[0.18em] border border-white/15 text-white/80 hover:border-white/40 hover:text-white"
        >
          Link
        </button>
        <button
          type="button"
          onClick={insertImage}
          className="px-2 py-1 rounded-lg text-xs uppercase tracking-[0.18em] border border-white/15 text-white/80 hover:border-white/40 hover:text-white"
        >
          Image
        </button>
        <button
          type="button"
          onClick={insertTable}
          className="px-2 py-1 rounded-lg text-xs uppercase tracking-[0.18em] border border-white/15 text-white/80 hover:border-white/40 hover:text-white"
        >
          Table
        </button>
        <button
          type="button"
          onClick={insertHorizontalRule}
          className="px-2 py-1 rounded-lg text-xs uppercase tracking-[0.18em] border border-white/15 text-white/80 hover:border-white/40 hover:text-white"
        >
          Line
        </button>
        <input
          type="color"
          aria-label="Text color"
          className="h-7 w-7 rounded border border-white/25 bg-transparent cursor-pointer"
          onChange={(e) => applyCommand("foreColor", e.target.value)}
        />
        <input
          type="color"
          aria-label="Highlight color"
          className="h-7 w-7 rounded border border-white/25 bg-transparent cursor-pointer"
          onChange={(e) => applyCommand("hiliteColor", e.target.value)}
        />
        <select
          aria-label="Font size"
          className="h-8 rounded border border-white/25 bg-black/60 text-[10px] uppercase tracking-[0.18em] text-white/70 px-2"
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) {
              applyFontSize(e.target.value);
              e.target.value = "";
            }
          }}
        >
          <option value="">Size</option>
          <option value="2">Small</option>
          <option value="3">Normal</option>
          <option value="4">Large</option>
          <option value="5">XL</option>
        </select>
        <button
          type="button"
          onClick={clearFormatting}
          className="px-2 py-1 rounded-lg text-xs uppercase tracking-[0.18em] border border-white/15 text-red-300/80 hover:border-red-400 hover:text-red-200"
        >
          Clear
        </button>
      </div>
      <div className="relative">
        {showPlaceholder && placeholder && (
          <div className="pointer-events-none absolute inset-x-4 top-2.5 text-sm text-white/20">
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          className="w-full min-h-[160px] rounded-xl bg-black/60 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/40 prose prose-invert max-w-none"
          contentEditable
          onInput={handleInput}
        />
      </div>
    </div>
  );
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("registrations");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [savingProject, setSavingProject] = useState(false);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [savingEvent, setSavingEvent] = useState(false);
  const [teamMembers, setTeamMembers] = useState<AdminTeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [savingTeamMember, setSavingTeamMember] = useState(false);
  const [acceptanceBody, setAcceptanceBody] = useState("");
  const [acceptanceLoading, setAcceptanceLoading] = useState(true);
  const [acceptanceSaving, setAcceptanceSaving] = useState(false);

  const [backgroundAudioUrl, setBackgroundAudioUrl] = useState("");
  const [backgroundAudioFile, setBackgroundAudioFile] = useState<File | null>(
    null
  );
  const [backgroundAudioLoading, setBackgroundAudioLoading] = useState(true);
  const [backgroundAudioSaving, setBackgroundAudioSaving] = useState(false);

  const [newProjectSlug, setNewProjectSlug] = useState("");
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectCategory, setNewProjectCategory] = useState("");
  const [newProjectYear, setNewProjectYear] = useState("");
  const [newProjectContent, setNewProjectContent] = useState("");
  const [newProjectTechnologies, setNewProjectTechnologies] = useState("");
  const [newProjectImageFile, setNewProjectImageFile] = useState<File | null>(
    null
  );
  const [slugTouched, setSlugTouched] = useState(false);

  const [newEventSlug, setNewEventSlug] = useState("");
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventCategory, setNewEventCategory] = useState("");
  const [newEventYear, setNewEventYear] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventContent, setNewEventContent] = useState("");
  const [newEventImageFile, setNewEventImageFile] = useState<File | null>(null);
  const [eventSlugTouched, setEventSlugTouched] = useState(false);

  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamRole, setNewTeamRole] = useState("");
  const [newTeamImageFile, setNewTeamImageFile] = useState<File | null>(null);
  const [newTeamBio, setNewTeamBio] = useState("");
  const [newTeamOrder, setNewTeamOrder] = useState<string>("");

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "registrations"));
        const data = querySnapshot.docs.map((d) => {
          const raw = d.data() as Omit<Registration, "id">;
          return {
            id: d.id,
            ...raw,
          };
        });

        data.sort(
          (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );

        setRegistrations(data);
      } catch (error) {
        console.error("Error fetching registrations:", error);
      } finally {
        setRegistrationsLoading(false);
      }
    };

    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        const data = querySnapshot.docs.map((d) => {
          const raw = d.data() as Omit<Project, "id">;
          return {
            id: d.id,
            ...raw,
          };
        });

        data.sort((a, b) => a.title.localeCompare(b.title));

        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setProjectsLoading(false);
      }
    };

    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const data = querySnapshot.docs.map((d) => {
          const raw = d.data() as Omit<AdminEvent, "id">;
          return {
            id: d.id,
            ...raw,
          };
        });

        data.sort((a, b) => a.title.localeCompare(b.title));

        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setEventsLoading(false);
      }
    };

    const fetchTeamMembers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "teamMembers"));
        const data: AdminTeamMember[] = snapshot.docs.map((d) => {
          const raw = d.data() as Omit<AdminTeamMember, "id">;
          return {
            id: d.id,
            ...raw,
          };
        });

        data.sort((a, b) => (a.order || 0) - (b.order || 0));
        setTeamMembers(data);
      } catch (error) {
        console.error("Error fetching team members:", error);
      } finally {
        setTeamLoading(false);
      }
    };

    const fetchAcceptanceLetter = async () => {
      try {
        const ref = doc(db, "settings", "acceptanceLetter");
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
          const data = snapshot.data() as { body?: string };
          if (data.body && typeof data.body === "string") {
            setAcceptanceBody(data.body);
            return;
          }
        }
        setAcceptanceBody(
          "We are pleased to inform you that your application to join the MCCICTS has been accepted. We are excited to have you as a member of the ICT Society.\n\nPlease stay tuned for further details about upcoming meetings, events, and projects. Make sure to check your school announcements or email for official updates.\n\nBest regards,\nMCCICTS Committee"
        );
      } catch (error) {
        console.error("Error fetching acceptance letter:", error);
      } finally {
        setAcceptanceLoading(false);
      }
    };

    const fetchBackgroundAudio = async () => {
      try {
        const ref = doc(db, "settings", "backgroundAudio");
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
          const data = snapshot.data() as { url?: string };
          if (data.url && typeof data.url === "string") {
            setBackgroundAudioUrl(data.url);
          }
        }
      } catch (error) {
        console.error("Error fetching background audio:", error);
      } finally {
        setBackgroundAudioLoading(false);
      }
    };

    fetchRegistrations();
    fetchProjects();
    fetchEvents();
    fetchTeamMembers();
    fetchAcceptanceLetter();
    fetchBackgroundAudio();
  }, []);

  const handleDeleteRegistration = async (id: string) => {
    try {
      await deleteDoc(doc(db, "registrations", id));
      setRegistrations((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Error deleting registration:", error);
    }
  };

  const handleToggleRegistrationHandled = async (registration: Registration) => {
    try {
      const nextHandled = !registration.handled;
      await updateDoc(doc(db, "registrations", registration.id), {
        handled: nextHandled,
      });
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === registration.id ? { ...r, handled: nextHandled } : r
        )
      );
    } catch (error) {
      console.error("Error updating registration:", error);
    }
  };

  const handleCreateProject = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newProjectSlug || !newProjectTitle) {
      return;
    }

    try {
      setSavingProject(true);

      const slug = newProjectSlug.trim();
      const technologies =
        newProjectTechnologies
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean) || [];

      let imageUrl: string | undefined;

      if (newProjectImageFile) {
        const imageRef = ref(
          storage,
          `projects/${slug}/${Date.now()}-${newProjectImageFile.name}`
        );
        const snapshot = await uploadBytes(imageRef, newProjectImageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      await setDoc(doc(db, "projects", slug), {
        slug,
        title: newProjectTitle.trim(),
        description: newProjectDescription.trim(),
        category: newProjectCategory.trim(),
        year: newProjectYear.trim(),
        imageUrl,
        content: newProjectContent.trim(),
        technologies,
        createdAt: serverTimestamp(),
      });

      const projectsSnapshot = await getDocs(collection(db, "projects"));
      const data = projectsSnapshot.docs.map((d) => {
        const raw = d.data() as Omit<Project, "id">;
        return {
          id: d.id,
          ...raw,
        };
      });

      data.sort((a, b) => a.title.localeCompare(b.title));
      setProjects(data);

      setNewProjectSlug("");
      setNewProjectTitle("");
      setNewProjectDescription("");
      setNewProjectCategory("");
      setNewProjectYear("");
      setNewProjectContent("");
      setNewProjectTechnologies("");
      setNewProjectImageFile(null);
      setSlugTouched(false);
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setSavingProject(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteDoc(doc(db, "projects", id));
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleTitleChange = (value: string) => {
    setNewProjectTitle(value);
    if (!slugTouched) {
      setNewProjectSlug(slugify(value));
    }
  };

  const handleEventTitleChange = (value: string) => {
    setNewEventTitle(value);
    if (!eventSlugTouched) {
      setNewEventSlug(slugify(value));
    }
  };

  const handleCreateEvent = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newEventSlug || !newEventTitle) {
      return;
    }

    try {
      setSavingEvent(true);

      const slug = newEventSlug.trim();

      let imageUrl: string | undefined;

      if (newEventImageFile) {
        const imageRef = ref(
          storage,
          `events/${slug}/${Date.now()}-${newEventImageFile.name}`
        );
        const snapshot = await uploadBytes(imageRef, newEventImageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const eventData: {
        slug: string;
        title: string;
        description: string;
        category: string;
        year: string;
        date: string;
        content: string;
        createdAt: unknown;
        imageUrl?: string;
      } = {
        slug,
        title: newEventTitle.trim(),
        description: newEventDescription.trim(),
        category: newEventCategory.trim(),
        year: newEventYear.trim(),
        date: newEventDate.trim(),
        content: newEventContent.trim(),
        createdAt: serverTimestamp(),
      };

      if (imageUrl) {
        eventData.imageUrl = imageUrl;
      }

      await setDoc(doc(db, "events", slug), eventData);

      const eventsSnapshot = await getDocs(collection(db, "events"));
      const data = eventsSnapshot.docs.map((d) => {
        const raw = d.data() as Omit<AdminEvent, "id">;
        return {
          id: d.id,
          ...raw,
        };
      });

      data.sort((a, b) => a.title.localeCompare(b.title));
      setEvents(data);

      setNewEventSlug("");
      setNewEventTitle("");
      setNewEventDescription("");
      setNewEventCategory("");
      setNewEventYear("");
      setNewEventDate("");
      setNewEventContent("");
      setNewEventImageFile(null);
      setEventSlugTouched(false);
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setSavingEvent(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteDoc(doc(db, "events", id));
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleSaveTeamMember = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newTeamName.trim() || !newTeamRole.trim() || !newTeamImageFile) {
      return;
    }

    try {
      setSavingTeamMember(true);

      const order = newTeamOrder.trim()
        ? Number.parseInt(newTeamOrder.trim(), 10)
        : undefined;

      const refDoc = doc(collection(db, "teamMembers"));

      let imageUrl: string | undefined;

      if (newTeamImageFile) {
        const imageRef = ref(
          storage,
          `team/${refDoc.id}/${Date.now()}-${newTeamImageFile.name}`
        );
        const snapshot = await uploadBytes(imageRef, newTeamImageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      await setDoc(refDoc, {
        name: newTeamName.trim(),
        role: newTeamRole.trim(),
        image: imageUrl,
        bio: newTeamBio.trim() || undefined,
        order,
      });

      const snapshot = await getDocs(collection(db, "teamMembers"));
      const data: AdminTeamMember[] = snapshot.docs.map((d) => {
        const raw = d.data() as Omit<AdminTeamMember, "id">;
        return {
          id: d.id,
          ...raw,
        };
      });

      data.sort((a, b) => (a.order || 0) - (b.order || 0));
      setTeamMembers(data);

      setNewTeamName("");
      setNewTeamRole("");
      setNewTeamImageFile(null);
      setNewTeamBio("");
      setNewTeamOrder("");
    } catch (error) {
      console.error("Error saving team member:", error);
    } finally {
      setSavingTeamMember(false);
    }
  };

  const handleDeleteTeamMember = async (id: string) => {
    try {
      await deleteDoc(doc(db, "teamMembers", id));
      setTeamMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      console.error("Error deleting team member:", error);
    }
  };

  const handleSaveBackgroundAudio = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!backgroundAudioFile && !backgroundAudioUrl.trim()) {
      return;
    }

    try {
      setBackgroundAudioSaving(true);

      let url = backgroundAudioUrl.trim() || undefined;

      if (backgroundAudioFile) {
        const audioRef = ref(
          storage,
          `settings/background-audio/${Date.now()}-${backgroundAudioFile.name}`
        );
        const snapshot = await uploadBytes(audioRef, backgroundAudioFile);
        url = await getDownloadURL(snapshot.ref);
      }

      await setDoc(
        doc(db, "settings", "backgroundAudio"),
        {
          url,
        },
        { merge: true }
      );

      setBackgroundAudioUrl(url ?? "");
      setBackgroundAudioFile(null);
    } catch (error) {
      console.error("Error saving background audio:", error);
    } finally {
      setBackgroundAudioSaving(false);
    }
  };

  const handleRemoveBackgroundAudio = async () => {
    if (!backgroundAudioUrl) {
      return;
    }

    try {
      setBackgroundAudioSaving(true);

      await setDoc(
        doc(db, "settings", "backgroundAudio"),
        {
          url: null,
        },
        { merge: true }
      );

      setBackgroundAudioUrl("");
      setBackgroundAudioFile(null);
    } catch (error) {
      console.error("Error removing background audio:", error);
    } finally {
      setBackgroundAudioSaving(false);
    }
  };

  const handleSaveAcceptanceLetter = async () => {
    if (!acceptanceBody.trim()) {
      return;
    }

    try {
      setAcceptanceSaving(true);
      await setDoc(
        doc(db, "settings", "acceptanceLetter"),
        {
          body: acceptanceBody.trim(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error saving acceptance letter:", error);
    } finally {
      setAcceptanceSaving(false);
    }
  };

  return (
    <PageTransition>
      <main className="min-h-screen bg-black px-6 md:px-12 lg:px-24 pt-28 pb-20 flex flex-col">
        <section className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
          <div className="mb-10 md:mb-12">
            <p className="text-[11px] md:text-xs uppercase tracking-[0.35em] text-white/30 mb-4">
              MCCICTS ADMIN
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-white mb-3">
              Admin Panel
            </h1>
            <p className="text-white/40 text-sm md:text-base max-w-2xl leading-relaxed">
              Manage member registrations and showcase projects stored in Firebase.
            </p>
          </div>

          <div className="flex gap-3 mb-8">
            <button
              type="button"
              onClick={() => setActiveTab("registrations")}
              className={`px-5 py-2 rounded-full border text-[11px] uppercase tracking-[0.25em] transition-colors ${
                activeTab === "registrations"
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-white/60 border-white/15 hover:border-white/40"
              }`}
            >
              Registrations
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("projects")}
              className={`px-5 py-2 rounded-full border text-[11px] uppercase tracking-[0.25em] transition-colors ${
                activeTab === "projects"
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-white/60 border-white/15 hover:border-white/40"
              }`}
            >
              Projects
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("events")}
              className={`px-5 py-2 rounded-full border text-[11px] uppercase tracking-[0.25em] transition-colors ${
                activeTab === "events"
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-white/60 border-white/15 hover:border-white/40"
              }`}
            >
              Events
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("team")}
              className={`px-5 py-2 rounded-full border text-[11px] uppercase tracking-[0.25em] transition-colors ${
                activeTab === "team"
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-white/60 border-white/15 hover:border-white/40"
              }`}
            >
              Team
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`px-5 py-2 rounded-full border text-[11px] uppercase tracking-[0.25em] transition-colors ${
                activeTab === "settings"
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-white/60 border-white/15 hover:border-white/40"
              }`}
            >
              Settings
            </button>
          </div>

          <div className="flex-1">
            {activeTab === "registrations" && (
              <div className="space-y-4">
                <div className="bg-[#05070a] border border-white/5 rounded-[28px] md:rounded-[32px] p-6 md:p-8">
                  {registrationsLoading ? (
                    <p className="text-white/40 text-sm">Loading registrations...</p>
                  ) : registrations.length === 0 ? (
                    <p className="text-white/40 text-sm">
                      No registrations found in the collection.
                    </p>
                  ) : (
                    <div className="space-y-4 max-h-[540px] overflow-y-auto scrollbar-hide">
                      {registrations.map((registration) => (
                        <div
                          key={registration.id}
                          className="border border-white/10 rounded-2xl p-4 md:p-5 bg-black/40 flex flex-col md:flex-row md:items-start md:justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-white text-sm md:text-base font-medium">
                                {registration.fullName}
                              </h3>
                              <span className="text-[10px] uppercase tracking-[0.22em] px-2 py-1 rounded-full border border-white/10 text-white/50">
                                {registration.gradeClass}
                              </span>
                              {registration.handled && (
                                <span className="text-[10px] uppercase tracking-[0.22em] px-2 py-1 rounded-full bg-green-500/10 border border-green-500/40 text-green-300/90">
                                  Reviewed
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-white/50 break-all">
                              {registration.email} • {registration.contactNumber}
                            </p>
                            {registration.admissionNumber && (
                              <p className="text-[11px] text-white/40">
                                Admission No:{" "}
                                <span className="text-white/65">
                                  {registration.admissionNumber}
                                </span>
                              </p>
                            )}
                            {registration.interests && registration.interests.length > 0 && (
                              <p className="text-[11px] text-white/50">
                                Interests:{" "}
                                <span className="text-white/70">
                                  {registration.interests.join(", ")}
                                </span>
                              </p>
                            )}
                            {registration.documents && registration.documents.length > 0 && (
                              <div className="mt-2 space-y-1">
                                <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                                  Documents
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {registration.documents.map((doc, index) => (
                                    <a
                                      key={`${registration.id}-doc-${index}`}
                                      href={doc.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[11px] px-2.5 py-1 rounded-full border border-white/15 text-white/70 hover:border-white/50 hover:text-white transition-colors max-w-[220px] truncate"
                                      title={doc.name}
                                    >
                                      {doc.name}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                            <p className="text-xs text-white/60 mt-2 leading-relaxed">
                              {registration.reason}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 md:flex-col md:items-end md:gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleRegistrationHandled(registration)}
                              className="px-4 py-1.5 rounded-full border border-white/15 text-[10px] uppercase tracking-[0.22em] text-white/80 hover:border-white/40 transition-colors"
                            >
                              {registration.handled ? "Mark as pending" : "Mark as reviewed"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRegistration(registration.id)}
                              className="px-4 py-1.5 rounded-full border border-red-500/40 text-[10px] uppercase tracking-[0.22em] text-red-300/90 hover:bg-red-500/10 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-[#05070a] border border-white/5 rounded-[28px] md:rounded-[32px] p-6 md:p-8">
                  <h2 className="text-white text-lg font-light mb-3">
                    Acceptance letter content
                  </h2>
                  <p className="text-xs text-white/50 mb-4">
                    This text is shown to accepted applicants on the registration page
                    when they check their status with an email that has been marked as
                    reviewed.
                  </p>
                  <textarea
                    value={acceptanceBody}
                    onChange={(e) => setAcceptanceBody(e.target.value)}
                    rows={6}
                    className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 resize-none"
                    placeholder="Write the acceptance letter text here..."
                  />
                  <div className="flex justify-end mt-4">
                    <button
                      type="button"
                      disabled={acceptanceSaving || acceptanceLoading}
                      onClick={handleSaveAcceptanceLetter}
                      className="px-6 py-2.5 rounded-full border border-white/15 bg-white text-black text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-accent hover:text-white hover:border-accent transition-all duration-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {acceptanceSaving ? "Saving..." : "Save letter"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "projects" && (
              <div className="space-y-6">
                <div className="bg-[#05070a] border border-white/5 rounded-[28px] md:rounded-[32px] p-6 md:p-8">
                  <h2 className="text-white text-lg font-light mb-4">
                    Add new project
                  </h2>
                  <form
                    onSubmit={handleCreateProject}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
                  >
                    <div className="space-y-2">
                      <label className="text-white/60 text-xs uppercase tracking-[0.25em]">
                        Slug
                      </label>
                      <input
                        required
                        value={newProjectSlug}
                        onChange={(e) => {
                          setSlugTouched(true);
                          setNewProjectSlug(slugify(e.target.value));
                        }}
                        placeholder="ai-learning-assistant"
                        className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-white/60 text-xs uppercase tracking-[0.25em]">
                        Title
                      </label>
                      <input
                        required
                        value={newProjectTitle}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-white/60 text-xs uppercase tracking-[0.25em]">
                        Category
                      </label>
                      <input
                        required
                        value={newProjectCategory}
                        onChange={(e) => setNewProjectCategory(e.target.value)}
                        placeholder="Artificial Intelligence"
                        className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-white/60 text-xs uppercase tracking-[0.25em]">
                        Year
                      </label>
                      <input
                        required
                        value={newProjectYear}
                        onChange={(e) => setNewProjectYear(e.target.value)}
                        placeholder="2024"
                        className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-white/60 text-xs uppercase tracking-[0.25em]">
                        Short description
                      </label>
                      <textarea
                        required
                        value={newProjectDescription}
                        onChange={(e) => setNewProjectDescription(e.target.value)}
                        rows={3}
                        className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40 resize-none"
                        placeholder="Brief summary shown on the projects grid."
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-white/60 text-xs uppercase tracking-[0.25em]">
                        Detailed content
                      </label>
                      <textarea
                        value={newProjectContent}
                        onChange={(e) => setNewProjectContent(e.target.value)}
                        rows={5}
                        className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40 resize-none"
                        placeholder="Full project description. Use line breaks to separate paragraphs."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-white/60 text-xs uppercase tracking-[0.25em]">
                        Project image
                      </label>
                      <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                        <FileUpload
                          onChange={(files) =>
                            setNewProjectImageFile(files[0] ?? null)
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-white/60 text-xs uppercase tracking-[0.25em]">
                        Technologies
                      </label>
                      <input
                        value={newProjectTechnologies}
                        onChange={(e) => setNewProjectTechnologies(e.target.value)}
                        placeholder="Next.js, Firebase, Tailwind CSS"
                        className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40"
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={savingProject}
                        className="px-8 py-2.5 rounded-full border border-white/15 bg-white text-black text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-accent hover:text-white hover:border-accent transition-all duration-500 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {savingProject ? "Saving..." : "Save project"}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="bg-[#05070a] border border-white/5 rounded-[28px] md:rounded-[32px] p-6 md:p-8">
                  <h2 className="text-white text-lg font-light mb-4">
                    Existing projects
                  </h2>
                  {projectsLoading ? (
                    <p className="text-white/40 text-sm">Loading projects...</p>
                  ) : projects.length === 0 ? (
                    <p className="text-white/40 text-sm">
                      No projects found in the collection.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-[420px] overflow-y-auto scrollbar-hide">
                      {projects.map((project) => (
                        <div
                          key={project.id}
                          className="flex items-center justify-between gap-3 border border-white/10 rounded-2xl px-4 py-3 bg-black/40"
                        >
                          <div>
                            <p className="text-sm text-white">
                              {project.title}
                              <span className="text-xs text-white/40 ml-2">
                                ({project.year})
                              </span>
                            </p>
                            <p className="text-[11px] text-white/40">
                              {project.category} • /projects/{project.slug || project.id}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteProject(project.id)}
                            className="px-3 py-1.5 rounded-full border border-red-500/40 text-[10px] uppercase tracking-[0.22em] text-red-300/90 hover:bg-red-500/10 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "events" && (
              <div className="space-y-6">
                <div className="bg-[#05070a] border border-white/5 rounded-[28px] md:rounded-[32px] p-6 md:p-8">
                  <h2 className="text-white text-lg font-light mb-4">
                    Add new event
                  </h2>
                  <form
                    onSubmit={handleCreateEvent}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
                  >
                    <div className="space-y-2">
                      <label className="text-white/60 text-xs uppercase tracking-[0.25em]">
                        Slug
                      </label>
                      <input
                        required
                        value={newEventSlug}
                        onChange={(e) => {
                          setEventSlugTouched(true);
                          setNewEventSlug(slugify(e.target.value));
                        }}
                        placeholder="ict-orientation-day"
                        className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-white/60 text-xs uppercase tracking-[0.25em]">
                        Title
                      </label>
                      <input
                        required
                        value={newEventTitle}
                        onChange={(e) => handleEventTitleChange(e.target.value)}
                        className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-white/60 text-xs uppercase tracking-[0.25em]">
                        Category
                      </label>
                      <input
                        required
                        value={newEventCategory}
                        onChange={(e) => setNewEventCategory(e.target.value)}
                        placeholder="Workshop, Hackathon, Community"
                        className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-white/60 text-xs uppercase tracking-[0.25em]">
                        Year
                      </label>
                      <input
                        required
                        value={newEventYear}
                        onChange={(e) => setNewEventYear(e.target.value)}
                        placeholder="2024"
                        className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-white/60 text-xs uppercase tracking-[0.25em]">
                        Date
                      </label>
                      <input
                        value={newEventDate}
                        onChange={(e) => setNewEventDate(e.target.value)}
                        placeholder="2024-05-10"
                        className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-white/60 text-xs uppercase tracking-[0.25em]">
                        Short description
                      </label>
                      <textarea
                        required
                        value={newEventDescription}
                        onChange={(e) => setNewEventDescription(e.target.value)}
                        rows={3}
                        className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40 resize-none"
                        placeholder="Brief summary shown on the events grid."
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-white/60 text-xs uppercase tracking-[0.25em]">
                        Detailed content
                      </label>
                      <RichTextEditor
                        value={newEventContent}
                        onChange={setNewEventContent}
                        placeholder="Full event description with formatting, lists, tables, and colors."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-white/60 text-xs uppercase tracking-[0.25em]">
                        Event image
                      </label>
                      <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                        <FileUpload
                          onChange={(files) =>
                            setNewEventImageFile(files[0] ?? null)
                          }
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2 flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={savingEvent}
                        className="px-8 py-2.5 rounded-full border border-white/15 bg-white text-black text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-accent hover:text-white hover:border-accent transition-all duration-500 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {savingEvent ? "Saving..." : "Save event"}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="bg-[#05070a] border border-white/5 rounded-[28px] md:rounded-[32px] p-6 md:p-8">
                  <h2 className="text-white text-lg font-light mb-4">
                    Existing events
                  </h2>
                  {eventsLoading ? (
                    <p className="text-white/40 text-sm">Loading events...</p>
                  ) : events.length === 0 ? (
                    <p className="text-white/40 text-sm">
                      No events found in the collection.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-[420px] overflow-y-auto scrollbar-hide">
                      {events.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between gap-3 border border-white/10 rounded-2xl px-4 py-3 bg-black/40"
                        >
                          <div>
                            <p className="text-sm text-white">
                              {event.title}
                              <span className="text-xs text-white/40 ml-2">
                                ({event.year})
                              </span>
                            </p>
                            <p className="text-[11px] text-white/40">
                              {event.category}
                              {event.date ? ` • ${event.date}` : ""} • /events/
                              {event.slug || event.id}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteEvent(event.id)}
                            className="px-3 py-1.5 rounded-full border border-red-500/40 text-[10px] uppercase tracking-[0.22em] text-red-300/90 hover:bg-red-500/10 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "team" && (
              <div className="space-y-6">
                <div className="bg-[#05070a] border border-white/5 rounded-[28px] md:rounded-[32px] p-6 md:p-8">
                  <h2 className="text-white text-lg font-light mb-4">
                    Add team member
                  </h2>
                  <form
                    onSubmit={handleSaveTeamMember}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
                  >
                    <div className="space-y-2">
                      <label className="text-white/60 text-xs uppercase tracking-[0.25em]">
                        Name
                      </label>
                      <input
                        required
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        placeholder="Full name"
                        className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-white/60 text-xs uppercase tracking-[0.25em]">
                        Role
                      </label>
                      <input
                        required
                        value={newTeamRole}
                        onChange={(e) => setNewTeamRole(e.target.value)}
                        placeholder="President, Faculty Advisor, etc."
                        className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-white/60 text-xs uppercase tracking-[0.25em]">
                        Team image
                      </label>
                      <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                        <FileUpload
                          onChange={(files) =>
                            setNewTeamImageFile(files[0] ?? null)
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-white/60 text-xs uppercase tracking-[0.25em]">
                        Bio (optional)
                      </label>
                      <textarea
                        value={newTeamBio}
                        onChange={(e) => setNewTeamBio(e.target.value)}
                        rows={3}
                        className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40 resize-none"
                        placeholder="Short sentence shown on hover."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-white/60 text-xs uppercase tracking-[0.25em]">
                        Order (optional)
                      </label>
                      <input
                        type="number"
                        value={newTeamOrder}
                        onChange={(e) => setNewTeamOrder(e.target.value)}
                        placeholder="1, 2, 3..."
                        className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40"
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={savingTeamMember}
                        className="px-8 py-2.5 rounded-full border border-white/15 bg-white text-black text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-accent hover:text-white hover:border-accent transition-all duration-500 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {savingTeamMember ? "Saving..." : "Save member"}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="bg-[#05070a] border border-white/5 rounded-[28px] md:rounded-[32px] p-6 md:p-8">
                  <h2 className="text-white text-lg font-light mb-4">
                    Existing team
                  </h2>
                  {teamLoading ? (
                    <p className="text-white/40 text-sm">Loading team...</p>
                  ) : teamMembers.length === 0 ? (
                    <p className="text-white/40 text-sm">
                      No team members found in the collection.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-[420px] overflow-y-auto scrollbar-hide">
                      {teamMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between gap-3 border border-white/10 rounded-2xl px-4 py-3 bg-black/40"
                        >
                          <div>
                            <p className="text-sm text-white">
                              {member.name}
                              {typeof member.order === "number" && (
                                <span className="text-xs text-white/40 ml-2">
                                  #{member.order}
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-white/40">
                              {member.role}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteTeamMember(member.id)}
                            className="px-3 py-1.5 rounded-full border border-red-500/40 text-[10px] uppercase tracking-[0.22em] text-red-300/90 hover:bg-red-500/10 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <div className="bg-[#05070a] border border-white/5 rounded-[28px] md:rounded-[32px] p-6 md:p-8">
                  <h2 className="text-white text-lg font-light mb-3">
                    Background audio
                  </h2>
                  <p className="text-xs text-white/50 mb-4">
                    Upload an audio file to Firebase Storage and play it as the
                    site background music.
                  </p>
                  <form onSubmit={handleSaveBackgroundAudio} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-white/60 text-xs uppercase tracking-[0.25em]">
                        Audio file
                      </label>
                      <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                        <FileUpload
                          onChange={(files) =>
                            setBackgroundAudioFile(files[0] ?? null)
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-white/60 text-xs uppercase tracking-[0.25em]">
                        Current URL
                      </label>
                      {backgroundAudioLoading ? (
                        <p className="text-xs text-white/40">Loading...</p>
                      ) : backgroundAudioUrl ? (
                        <a
                          href={backgroundAudioUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 break-all"
                        >
                          {backgroundAudioUrl}
                        </a>
                      ) : (
                        <p className="text-xs text-white/40">
                          No background audio configured yet.
                        </p>
                      )}
                    </div>
                    <div className="flex justify-between items-center pt-1 gap-3">
                      <button
                        type="button"
                        disabled={!backgroundAudioUrl || backgroundAudioSaving}
                        onClick={handleRemoveBackgroundAudio}
                        className="px-5 py-2 rounded-full border border-red-500/40 text-[10px] uppercase tracking-[0.22em] text-red-300/90 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Remove audio
                      </button>
                      <button
                        type="submit"
                        disabled={backgroundAudioSaving}
                        className="px-8 py-2.5 rounded-full border border-white/15 bg-white text-black text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-accent hover:text-white hover:border-accent transition-all duration-500 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {backgroundAudioSaving ? "Saving..." : "Save audio"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </section>

        <Footer />
      </main>
    </PageTransition>
  );
}

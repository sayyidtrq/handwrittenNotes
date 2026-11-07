"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Bookmark,
  Check,
  Feather,
  Heart,
  ImagePlus,
  Images,
  LogOut,
  Mail,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Note = {
  id: string;
  author_id: string;
  title: string;
  body: string;
  created_at: string;
  paper: string;
};
type Profile = {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url?: string;
};
type Photo = {
  id: string;
  uploader_id: string;
  path: string;
  caption: string;
  url?: string;
  created_at: string;
};
type Section = "letters" | "saved" | "gallery" | "us";
const demoProfiles: Profile[] = [
  {
    id: "bf",
    username: "bf",
    display_name: "Me",
    bio: "I like to write. I like you more.",
  },
  {
    id: "gf",
    username: "gf",
    display_name: "You",
    bio: "There is always room for you here.",
  },
];
const demoNotes: Note[] = [
  {
    id: "1",
    author_id: "bf",
    title: "Please eat lunch today.",
    body: "I know you are busy today. Please make time for lunch.\n\nTell me about your day when you have time. I want to hear the hard parts too.",
    created_at: "2026-11-07T08:00:00+07:00",
    paper: "cream",
  },
  {
    id: "2",
    author_id: "bf",
    title: "I passed our little cafe.",
    body: "The one we went to when it rained. It looks the same. The seat in the corner is still there.\n\nCan we go there again soon?",
    created_at: "2026-11-06T18:00:00+07:00",
    paper: "pink",
  },
  {
    id: "3",
    author_id: "gf",
    title: "Songs for your way home.",
    body: "I added the song you wanted yesterday. The one you could only hum the start of.\n\nListen to song three first.",
    created_at: "2026-11-05T15:00:00+07:00",
    paper: "blue",
  },
];
const demoPhotos: Photo[] = [
  {
    id: "p1",
    uploader_id: "bf",
    path: "",
    url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=85",
    caption: "No rush to go home.",
    created_at: "2026-10-18",
  },
  {
    id: "p2",
    uploader_id: "gf",
    path: "",
    url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=85",
    caption: "One more coffee, then home.",
    created_at: "2026-10-12",
  },
  {
    id: "p3",
    uploader_id: "bf",
    path: "",
    url: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&q=85",
    caption: "The sky that evening.",
    created_at: "2026-10-05",
  },
];
const sampleTranslations: Record<string, string> = {
  "Suka nulis. Lebih suka kamu.": "I like to write. I like you more.",
  "Yang selalu punya tempat di sini.": "There is always room for you here.",
  "Jangan lupa makan, ya.": "Please eat lunch today.",
  "Aku tahu hari ini kamu sibuk. Tapi makan siangnya jangan dilewatin lagi.\n\nNanti kalau udah senggang, cerita ya. Aku mau denger bagian yang nyebelin juga.":
    "I know you are busy today. Please make time for lunch.\n\nTell me about your day when you have time. I want to hear the hard parts too.",
  "Tadi aku lewat tempat itu.": "I passed our little cafe.",
  "Warung yang waktu itu kita datengin pas hujan. Masih sama. Kursi di pojoknya juga masih ada.\n\nKapan-kapan ke sana lagi, yuk.":
    "The one we went to when it rained. It looks the same. The seat in the corner is still there.\n\nCan we go there again soon?",
  "Playlist buat jalan pulang.": "Songs for your way home.",
  "Aku masukin lagu yang kemarin kamu cari. Iya, yang kamu cuma inget nada depannya itu.\n\nDengerin nomor tiga dulu.":
    "I added the song you wanted yesterday. The one you could only hum the start of.\n\nListen to song three first.",
  "Nggak buru-buru pulang.": "No rush to go home.",
  "Satu lagi, habis itu pulang.": "One more coffee, then home.",
  "Langit sore itu.": "The sky that evening.",
  Aku: "Me",
  Kamu: "You",
};
function translateSample<T extends { id: string }>(item: T): T {
  const fields: Record<string, string[]> = {
    "1": ["title", "body"],
    "2": ["title", "body"],
    "3": ["title", "body"],
    p1: ["caption"],
    p2: ["caption"],
    p3: ["caption"],
    bf: ["display_name", "bio"],
    gf: ["display_name", "bio"],
  };
  const result = { ...item } as Record<string, unknown>;
  for (const key of fields[item.id] ?? []) {
    const value = result[key];
    if (typeof value === "string" && sampleTranslations[value])
      result[key] = sampleTranslations[value];
  }
  return result as T;
}
const newId = () =>
  "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      Number(c) ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))
    ).toString(16),
  );
const date = (s: string) =>
  new Date(s).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
const labels: Record<Section, string> = {
  letters: "Our letters",
  saved: "Favorites",
  gallery: "Gallery",
  us: "Us",
};
const icons = { letters: Mail, saved: Bookmark, gallery: Images, us: Users };

export default function Notebook() {
  const demo = !supabase;
  const [ready, setReady] = useState(false),
    [user, setUser] = useState<Profile | null>(null),
    [profiles, setProfiles] = useState<Profile[]>(demoProfiles);
  const [notes, setNotes] = useState<Note[]>(demoNotes),
    [photos, setPhotos] = useState<Photo[]>(demoPhotos),
    [favorites, setFavorites] = useState<string[]>(["1"]);
  const [section, setSection] = useState<Section>("letters"),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Note | null>(null),
    [editing, setEditing] = useState(false),
    [composer, setComposer] = useState(false);
  const [title, setTitle] = useState(""),
    [body, setBody] = useState(""),
    [paper, setPaper] = useState("cream");
  const [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [error, setError] = useState("");
  const [username, setUsername] = useState("bf"),
    [password, setPassword] = useState(""),
    [loginOpen, setLoginOpen] = useState(false);
  const [displayName, setDisplayName] = useState(""),
    [bio, setBio] = useState(""),
    [newPassword, setNewPassword] = useState("");
  const [caption, setCaption] = useState(""),
    [uploadOpen, setUploadOpen] = useState(false),
    [photoFile, setPhotoFile] = useState<File | null>(null);
  const [lightbox, setLightbox] = useState<Photo | null>(null),
    [deleteTarget, setDeleteTarget] = useState<Note | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const favoriteByUser = useRef<Record<string, string[]>>({
    bf: ["1"],
    gf: [],
  });
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [section]);

  async function load(uid: string) {
    if (!supabase) return;
    const results = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("favorites").select("note_id"),
      supabase
        .from("photos")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);
    for (const r of results) if (r.error) throw r.error;
    const p = results[0].data as Profile[];
    const me = p.find((x) => x.id === uid);
    if (!me)
      throw new Error(
        "This account is not bf or gf. Use one of those two accounts.",
      );
    setProfiles(p);
    setUser(me);
    setDisplayName(me.display_name);
    setBio(me.bio);
    setNotes(results[1].data as Note[]);
    setFavorites(results[2].data!.map((x) => x.note_id));
    const images = await Promise.all(
      (results[3].data as Photo[]).map(async (p) => {
        const { data } = await supabase!.storage
          .from("memories")
          .createSignedUrl(p.path, 3600);
        return { ...p, url: data?.signedUrl };
      }),
    );
    setPhotos(images);
  }
  useEffect(() => {
    if (demo) {
      try {
        const saved = localStorage.getItem("selembar-preview-v1");
        if (saved) {
          const s = JSON.parse(saved);
          s.notes = s.notes?.map(translateSample);
          s.photos = s.photos?.map(translateSample);
          s.profiles = s.profiles?.map(translateSample);
          setNotes(s.notes ?? demoNotes);
          setPhotos(s.photos ?? demoPhotos);
          setProfiles(s.profiles ?? demoProfiles);
          favoriteByUser.current = s.favoriteByUser ?? {
            bf: s.favorites ?? ["1"],
            gf: [],
          };
          const active =
            (s.profiles ?? demoProfiles).find(
              (p: Profile) => p.id === s.activeUser,
            ) ?? (s.profiles ?? demoProfiles)[0];
          setFavorites(favoriteByUser.current[active.id] ?? []);
          setUser(active);
        } else setUser(demoProfiles[0]);
      } catch {
        setUser(demoProfiles[0]);
      }
      setReady(true);
    } else {
      setNotes([]);
      setPhotos([]);
      setFavorites([]);
      supabase!.auth
        .getUser()
        .then(async ({ data }) => {
          if (data.user) await load(data.user.id);
        })
        .catch((e) => setError(e.message))
        .finally(() => setReady(true));
    }
  }, []);
  useEffect(() => {
    if (demo && ready) {
      try {
        if (user) favoriteByUser.current[user.id] = favorites;
        localStorage.setItem(
          "selembar-preview-v1",
          JSON.stringify({
            notes,
            photos,
            profiles,
            favorites,
            favoriteByUser: favoriteByUser.current,
            activeUser: user?.id,
          }),
        );
      } catch {
        setError("Browser storage is full. Delete some preview photos.");
      }
    }
  }, [notes, photos, profiles, favorites, ready, demo, user]);
  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name);
      setBio(user.bio);
    }
  }, [user]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);
  const modalOpen =
    composer ||
    !!selected ||
    uploadOpen ||
    !!lightbox ||
    loginOpen ||
    !!deleteTarget;
  useEffect(() => {
    const d = dialogRef.current;
    if (modalOpen && !d?.open) d?.showModal();
    else if (!modalOpen && d?.open) d.close();
  }, [modalOpen]);
  function close() {
    if (busy) return;
    if (
      composer &&
      (title.trim() || body.trim()) &&
      !window.confirm(
        "Close this letter? You will lose changes that you did not save.",
      )
    )
      return;
    setComposer(false);
    setSelected(null);
    setUploadOpen(false);
    setLightbox(null);
    setLoginOpen(false);
    setDeleteTarget(null);
    setError("");
  }
  function write(note?: Note) {
    setSelected(null);
    setEditing(!!note);
    setTitle(note?.title ?? "");
    setBody(note?.body ?? "");
    setPaper(note?.paper ?? "cream");
    setEditId(note?.id ?? "");
    setComposer(true);
  }
  const [editId, setEditId] = useState("");
  async function act(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (!user || !title.trim() || !body.trim()) return;
    await act(async () => {
      const n: Note = {
        id: editing ? editId : newId(),
        author_id: user.id,
        title: title.trim(),
        body: body.trim(),
        paper,
        created_at: new Date().toISOString(),
      };
      if (supabase) {
        const r = editing
          ? await supabase
              .from("notes")
              .update({ title: n.title, body: n.body, paper })
              .eq("id", editId)
              .select()
              .single()
          : await supabase.from("notes").insert(n).select().single();
        if (r.error) throw r.error;
        Object.assign(n, r.data);
      }
      setNotes((old) =>
        editing
          ? old.map((x) =>
              x.id === editId
                ? { ...x, title: n.title, body: n.body, paper }
                : x,
            )
          : [n, ...old],
      );
      setComposer(false);
      setNotice("Your letter is ready.");
    });
  }
  async function favorite(id: string) {
    if (!user) return;
    await act(async () => {
      const exists = favorites.includes(id);
      if (supabase) {
        const r = exists
          ? await supabase
              .from("favorites")
              .delete()
              .eq("note_id", id)
              .eq("member_id", user.id)
          : await supabase
              .from("favorites")
              .insert({ note_id: id, member_id: user.id });
        if (r.error) throw r.error;
      }
      setFavorites((f) => (exists ? f.filter((x) => x !== id) : [...f, id]));
    });
  }
  async function removeNote() {
    if (!deleteTarget) return;
    await act(async () => {
      if (supabase) {
        const { error } = await supabase
          .from("notes")
          .delete()
          .eq("id", deleteTarget.id);
        if (error) throw error;
      }
      setNotes((n) => n.filter((x) => x.id !== deleteTarget.id));
      setFavorites((f) => f.filter((x) => x !== deleteTarget.id));
      setDeleteTarget(null);
      setSelected(null);
      setNotice("Letter deleted.");
    });
  }
  async function login() {
    await act(async () => {
      if (demo) {
        const me = profiles.find((p) => p.username === username)!;
        setFavorites(favoriteByUser.current[me.id] ?? []);
        setUser(me);
        setLoginOpen(false);
        return;
      }
      const { data, error } = await supabase!.auth.signInWithPassword({
        email: `${username}@selembar.local`,
        password,
      });
      if (error) throw new Error("The username or password is incorrect.");
      await load(data.user.id);
      setLoginOpen(false);
      setPassword("");
    });
  }
  async function saveProfile() {
    await act(async () => {
      if (!user) return;
      if (supabase) {
        const { error } = await supabase
          .from("profiles")
          .update({ display_name: displayName.trim(), bio: bio.trim() })
          .eq("id", user.id);
        if (error) throw error;
        if (newPassword) {
          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          });
          if (error) throw error;
        }
      }
      const p = { ...user, display_name: displayName.trim(), bio: bio.trim() };
      setUser(p);
      setProfiles((all) => all.map((x) => (x.id === p.id ? p : x)));
      setNewPassword("");
      setNotice("Profile updated.");
    });
  }
  async function upload() {
    if (!photoFile || !user) return;
    await act(async () => {
      if (
        !["image/jpeg", "image/png", "image/webp"].includes(photoFile.type) ||
        photoFile.size > 5 * 1024 * 1024
      )
        throw new Error(
          "Choose a JPG, PNG, or WebP image. The size limit is 5 MB.",
        );
      const id = newId();
      const path = `${user.id}/${id}.${photoFile.type.split("/")[1]}`;
      let url = "";
      if (supabase) {
        const r = await supabase.storage
          .from("memories")
          .upload(path, photoFile);
        if (r.error) throw r.error;
        const { data } = await supabase.storage
          .from("memories")
          .createSignedUrl(path, 3600);
        url = data?.signedUrl ?? "";
      } else {
        if (photoFile.size > 1024 * 1024)
          throw new Error(
            "Choose a photo smaller than 1 MB for this local preview.",
          );
        url = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result as string);
          r.onerror = reject;
          r.readAsDataURL(photoFile);
        });
      }
      const p: Photo = {
        id,
        uploader_id: user.id,
        path,
        caption: caption.trim(),
        created_at: new Date().toISOString(),
      };
      if (supabase) {
        const { error } = await supabase.from("photos").insert(p);
        if (error) {
          await supabase.storage.from("memories").remove([path]);
          throw error;
        }
      }
      setPhotos((old) => [{ ...p, url }, ...old]);
      setUploadOpen(false);
      setCaption("");
      setPhotoFile(null);
      setNotice("Photo added.");
    });
  }
  async function deletePhoto(p: Photo) {
    if (!window.confirm("Delete this photo?")) return;
    await act(async () => {
      if (supabase) {
        const s = await supabase.storage.from("memories").remove([p.path]);
        if (s.error) throw s.error;
        const r = await supabase.from("photos").delete().eq("id", p.id);
        if (r.error) throw r.error;
      }
      setPhotos((a) => a.filter((x) => x.id !== p.id));
      setLightbox(null);
      setNotice("Photo deleted.");
    });
  }
  const visible = notes.filter(
    (n) =>
      (section !== "saved" || favorites.includes(n.id)) &&
      (filter === "all" ||
        (filter === "mine"
          ? n.author_id === user?.id
          : n.author_id !== user?.id)) &&
      `${n.title} ${n.body}`.toLowerCase().includes(search.toLowerCase()),
  );
  const author = (id: string) =>
    profiles.find((p) => p.id === id)?.display_name ?? "You";
  if (!ready)
    return (
      <main className="loading">
        <Feather />
        <span>Please wait while your letters load.</span>
      </main>
    );

  return (
    <div className="app">
      {demo && (
        <div className="preview-banner">
          <span>PREVIEW</span> Sample data in this browser only.
          <button
            onClick={() => {
              setUsername(user?.username === "bf" ? "gf" : "bf");
              setLoginOpen(true);
            }}
          >
            Try account {user?.username === "bf" ? "gf" : "bf"}{" "}
            <ArrowRight size={12} />
          </button>
        </div>
      )}
      <header className="topbar">
        <a className="brand" href="/" aria-label="Selembar home">
          <Feather size={25} />
          <span>
            selembar<span className="brand-dot">.</span>
          </span>
        </a>
        <nav aria-label="Main navigation">
          {(Object.keys(labels) as Section[]).map((key) => {
            const Icon = icons[key];
            return (
              <button
                key={key}
                className={section === key ? "nav-active" : ""}
                onClick={() => {
                  setSection(key);
                  setSearch("");
                  setFilter("all");
                }}
              >
                <Icon size={17} />
                {labels[key]}
              </button>
            );
          })}
        </nav>
        <button
          className="avatar"
          aria-label="Open profile"
          onClick={() => setSection("us")}
        >
          {user?.username ?? "♡"}
        </button>
      </header>
      {!user ? (
        <main className="login-page">
          <div className="envelope-scene">
            <Envelope />
          </div>
          <p className="eyebrow">JUST FOR US</p>
          <h1>
            A letter
            <br />
            for you.
          </h1>
          <p>Your letters are here. Log in to read them.</p>
          <button className="primary" onClick={() => setLoginOpen(true)}>
            Log in <ArrowRight size={16} />
          </button>
        </main>
      ) : (
        <main>
          {(section === "letters" || section === "saved") && (
            <>
              {section === "letters" ? (
                <section className="hero">
                  <div className="hero-copy">
                    <p className="eyebrow">
                      <span /> A LITTLE PLACE FOR US
                    </p>
                    <h1>
                      A little note,
                      <br />
                      <em>just for you.</em>
                    </h1>
                    <p className="hero-description">
                      The things I wanted to tell you.
                      <br />
                      The words you can read again later.
                    </p>
                    <button className="primary" onClick={() => write()}>
                      <Feather size={17} /> Write a letter{" "}
                      <ArrowRight size={17} />
                    </button>
                    <div className="hero-footnote">
                      <span className="handwritten">
                        a few words are enough.
                      </span>
                      <svg viewBox="0 0 65 35" aria-hidden="true">
                        <path d="M3 28 Q40 35 55 6 M44 10 L56 4 L58 17" />
                      </svg>
                    </div>
                  </div>
                  <div className="hero-art">
                    <div className="postmark">
                      FOR YOU<span>07 · 11 · 26</span>
                      <Heart size={17} />
                    </div>
                    <div className="peeking-letter">
                      <span>dear you,</span>
                      <p>
                        I like us.
                        <br />
                        Even on the
                        <br />
                        quiet days.
                      </p>
                      <span className="letter-sign">— me</span>
                    </div>
                    <Envelope />
                    <div className="art-caption">
                      <span className="tiny-star">✳</span> a small thing I want
                      to remember.
                    </div>
                    <div className="small-flower" aria-hidden="true">
                      ✳
                    </div>
                  </div>
                </section>
              ) : (
                <section className="page-heading">
                  <p className="eyebrow">HERE WHEN YOU NEED THEM</p>
                  <h1>
                    Your <em>favorites.</em>
                  </h1>
                  <p>Some letters are worth reading twice.</p>
                </section>
              )}
              <section className="letters-section">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">
                      {section === "saved"
                        ? "YOUR FAVORITES"
                        : "FROM ME, FROM YOU"}
                    </p>
                    <h2>
                      {section === "saved" ? "Favorite letters" : "Our letters"}
                      <span className="count">
                        {section === "saved" ? favorites.length : notes.length}
                      </span>
                    </h2>
                  </div>
                  <span className="section-aside">
                    take your time. <ArrowDown size={14} />
                  </span>
                </div>
                <div className="list-toolbar">
                  <div className="filters">
                    {[
                      ["all", "All"],
                      ["mine", "From me"],
                      ["theirs", "From you"],
                    ].map(([id, label]) => (
                      <button
                        key={id}
                        aria-pressed={filter === id}
                        onClick={() => setFilter(id)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <label className="search">
                    <Search size={16} />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search letters"
                      aria-label="Search letters"
                    />
                  </label>
                </div>
                <div className="notes-grid">
                  {visible.map((n, i) => (
                    <article
                      className={`note-card paper-${n.paper}`}
                      key={n.id}
                    >
                      <div className="note-meta">
                        <span>
                          {n.author_id === user.id ? "FROM ME" : "FROM YOU"}
                        </span>
                        <button
                          className={`icon-button ${favorites.includes(n.id) ? "is-saved" : ""}`}
                          disabled={busy}
                          aria-label={
                            favorites.includes(n.id)
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                          onClick={() => favorite(n.id)}
                        >
                          <Bookmark
                            size={18}
                            fill={
                              favorites.includes(n.id) ? "currentColor" : "none"
                            }
                          />
                        </button>
                      </div>
                      <button
                        className="note-open"
                        onClick={() => setSelected(n)}
                      >
                        <h3>{n.title}</h3>
                        <p>{n.body}</p>
                      </button>
                      <div className="note-footer">
                        <span>{date(n.created_at)}</span>
                        <button
                          aria-label={`Read ${n.title}`}
                          onClick={() => setSelected(n)}
                        >
                          <ArrowRight size={17} />
                        </button>
                      </div>
                      <span className="note-number">0{i + 1}</span>
                    </article>
                  ))}
                  {visible.length === 0 && (
                    <div className="empty">
                      <Mail />
                      <h3>
                        {search ? "No letters found." : "No letters here yet."}
                      </h3>
                      <p>
                        {search
                          ? "Try another word."
                          : section === "saved"
                            ? "Use the bookmark button to add a favorite."
                            : "You can start with one sentence."}
                      </p>
                      {section === "letters" && !search && (
                        <button className="text-button" onClick={() => write()}>
                          Write your first letter <ArrowRight size={16} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </section>
              {section === "letters" && (
                <section className="gallery-teaser">
                  <div className="teaser-copy">
                    <p className="eyebrow">MORE THAN WORDS</p>
                    <h2>
                      Remember
                      <br />
                      <em>this day?</em>
                    </h2>
                    <p>
                      A few photos I want
                      <br />
                      to keep here with you.
                    </p>
                    <button
                      className="text-button"
                      onClick={() => setSection("gallery")}
                    >
                      Open our gallery <ArrowRight size={17} />
                    </button>
                  </div>
                  <div className="teaser-photos">
                    {photos.slice(0, 2).map((p, i) => (
                      <div
                        className={`polaroid preview-photo photo-${i}`}
                        key={p.id}
                      >
                        <span className="tape" />
                        <img src={p.url} alt={p.caption} loading="lazy" />
                        <span>{p.caption}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
          {section === "gallery" && (
            <>
              <section className="page-heading gallery-heading">
                <p className="eyebrow">DAYS WE SPENT TOGETHER</p>
                <h1>
                  We were
                  <br />
                  <em>here together.</em>
                </h1>
                <p>Keep the photo, even if it is blurry. We know the story.</p>
                <button className="primary" onClick={() => setUploadOpen(true)}>
                  <ImagePlus size={18} /> Add a photo
                </button>
              </section>
              <div className="gallery-grid">
                {photos.map((p, i) => (
                  <button
                    className={`polaroid gallery-photo photo-${i % 3}`}
                    key={p.id}
                    onClick={() => setLightbox(p)}
                  >
                    <span className="tape" />
                    <img
                      src={p.url}
                      alt={p.caption || "A photo from our album"}
                      loading="lazy"
                    />
                    <span>{p.caption || "A day to remember."}</span>
                    <small>{date(p.created_at)}</small>
                  </button>
                ))}
                {photos.length === 0 && (
                  <div className="empty">
                    <Images />
                    <h3>Start our album.</h3>
                    <p>One photo is a good start.</p>
                  </div>
                )}
              </div>
              {demo && (
                <p className="stock-label">
                  Sample photos from Unsplash. Add your own photos here.
                </p>
              )}
            </>
          )}
          {section === "us" && (
            <>
              <section className="page-heading">
                <p className="eyebrow">TWO PEOPLE, ONE PLACE</p>
                <h1>
                  Me <em>&</em> you.
                </h1>
                <p>You can be yourself here.</p>
              </section>
              <div className="profile-layout">
                <div className="couple-card">
                  {profiles.map((p) => (
                    <div key={p.id} className="person">
                      <div className="profile-avatar">{p.username}</div>
                      <h2>{p.display_name}</h2>
                      <p className="handwritten">{p.bio}</p>
                    </div>
                  ))}
                  <Heart className="between-heart" size={23} />
                </div>
                <form
                  className="profile-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveProfile();
                  }}
                >
                  <h2>A little about you</h2>
                  <label>
                    Your name
                    <input
                      value={displayName}
                      maxLength={40}
                      required
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </label>
                  <label>
                    A few words about you
                    <textarea
                      value={bio}
                      maxLength={180}
                      rows={3}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </label>
                  {!demo && (
                    <label>
                      New password <span>(optional)</span>
                      <input
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </label>
                  )}
                  <button
                    className="primary"
                    disabled={busy || !displayName.trim()}
                  >
                    <Check size={17} /> Save changes
                  </button>
                  <button
                    className="text-button logout"
                    type="button"
                    onClick={() =>
                      act(async () => {
                        if (supabase) {
                          const r = await supabase.auth.signOut();
                          if (r.error) throw r.error;
                          setUser(null);
                          setNotes([]);
                          setPhotos([]);
                          setFavorites([]);
                        } else setLoginOpen(true);
                      })
                    }
                  >
                    <LogOut size={16} />
                    {demo ? "Switch preview account" : "Log out"}
                  </button>
                </form>
              </div>
            </>
          )}
          <footer>
            <span className="brand footer-brand">
              <Feather size={18} /> selembar.
            </span>
            <span>for you. from me.</span>
            <Heart size={13} />
          </footer>
        </main>
      )}
      {error && !modalOpen && (
        <div className="error-banner" role="alert">
          {error}
          <button aria-label="Close message" onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {notice && (
        <div className="toast" role="status">
          <Check size={16} />
          {notice}
        </div>
      )}
      <dialog
        ref={dialogRef}
        className={`dialog ${composer || selected ? "letter-dialog" : ""}`}
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <button
          className="close-dialog icon-button"
          aria-label="Close"
          disabled={busy}
          onClick={close}
        >
          <X size={22} />
        </button>
        {error && (
          <div className="inline-error" role="alert">
            {error}
          </div>
        )}
        {loginOpen && (
          <form
            className="modal-form"
            onSubmit={(e) => {
              e.preventDefault();
              login();
            }}
          >
            <Feather size={30} />
            <p className="eyebrow">JUST FOR US</p>
            <h2>{demo ? "Choose a preview account." : "Hello, you."}</h2>
            <p>
              {demo
                ? "This preview needs no password. Sample data stays in this browser."
                : "Log in to read your letters."}
            </p>
            <label>
              Username
              <select
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              >
                <option value="bf">bf</option>
                <option value="gf">gf</option>
              </select>
            </label>
            {!demo && (
              <label>
                Password
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
            )}
            <button className="primary" disabled={busy}>
              {busy ? "Please wait" : "Log in"}
              <ArrowRight size={17} />
            </button>
          </form>
        )}
        {composer && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <div className="composer-header">
              <p className="eyebrow">
                {editing ? "EDIT LETTER" : "A LETTER FOR YOU"}
              </p>
              <div className="paper-options" aria-label="Paper color">
                {["cream", "pink", "blue"].map((p) => (
                  <button
                    type="button"
                    key={p}
                    className={`swatch paper-${p}`}
                    aria-label={`${p} paper`}
                    aria-pressed={paper === p}
                    onClick={() => setPaper(p)}
                  >
                    {paper === p && <Check size={13} />}
                  </button>
                ))}
              </div>
            </div>
            <div className={`writing-paper paper-${paper}`}>
              <span className="handwritten dear">Dear you,</span>
              <input
                className="title-input"
                aria-label="Letter title"
                placeholder="Give your letter a title"
                maxLength={100}
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="body-input"
                aria-label="Letter text"
                placeholder="I was thinking about..."
                maxLength={10000}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              <span className="handwritten sign">
                from {user?.display_name.toLowerCase()}
              </span>
            </div>
            <div className="composer-footer">
              <span>
                {body.length.toLocaleString("en-GB")} / 10,000 · not saved yet
              </span>
              <button
                className="primary"
                disabled={busy || !title.trim() || !body.trim()}
              >
                {busy ? "Please wait" : "Save letter"}
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}
        {selected && !deleteTarget && (
          <>
            <div className={`reading-paper paper-${selected.paper}`}>
              <p className="eyebrow">{date(selected.created_at)}</p>
              <span className="handwritten dear">Dear you,</span>
              <h2>{selected.title}</h2>
              <p className="letter-body">{selected.body}</p>
              <span className="handwritten sign">
                from {author(selected.author_id).toLowerCase()}
              </span>
            </div>
            <div className="reading-actions">
              <button
                className="text-button"
                disabled={busy}
                onClick={() => favorite(selected.id)}
              >
                <Bookmark
                  size={17}
                  fill={
                    favorites.includes(selected.id) ? "currentColor" : "none"
                  }
                />
                {favorites.includes(selected.id)
                  ? "Remove from favorites"
                  : "Add to favorites"}
              </button>
              {selected.author_id === user?.id && (
                <div>
                  <button
                    className="icon-button"
                    aria-label="Edit letter"
                    onClick={() => write(selected)}
                  >
                    <Feather size={18} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label="Delete letter"
                    onClick={() => setDeleteTarget(selected)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
        {deleteTarget && (
          <div className="modal-form">
            <h2>Delete this letter?</h2>
            <p>
              “{deleteTarget.title}” will be deleted. You cannot undo this
              action.
            </p>
            <button className="primary" disabled={busy} onClick={removeNote}>
              Yes, delete this letter
            </button>
            <button
              className="text-button"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </button>
          </div>
        )}
        {uploadOpen && (
          <form
            className="modal-form"
            onSubmit={(e) => {
              e.preventDefault();
              upload();
            }}
          >
            <ImagePlus size={28} />
            <h2>Keep this photo.</h2>
            <label className="upload-zone">
              Choose one photo
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required
                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              />
              <span>JPG, PNG, WebP · limit: {demo ? "1" : "5"} MB</span>
            </label>
            <label>
              Photo caption
              <input
                placeholder="The day we..."
                maxLength={160}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </label>
            <button className="primary" disabled={busy || !photoFile}>
              {busy ? "Please wait" : "Add to gallery"}
              <ArrowRight size={17} />
            </button>
          </form>
        )}
        {lightbox && (
          <div className="lightbox">
            <img src={lightbox.url} alt={lightbox.caption} />
            <p className="handwritten">{lightbox.caption}</p>
            <span>{date(lightbox.created_at)}</span>
            {lightbox.uploader_id === user?.id && (
              <button
                className="text-button"
                disabled={busy}
                onClick={() => deletePhoto(lightbox)}
              >
                <Trash2 size={16} /> Delete photo
              </button>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
}

function Envelope() {
  return (
    <div className="envelope" aria-hidden="true">
      <div className="envelope-back" />
      <div className="envelope-fold left-fold" />
      <div className="envelope-fold right-fold" />
      <div className="envelope-bottom" />
      <div className="envelope-flap" />
      <div className="wax-seal">
        <span>
          <Feather size={29} strokeWidth={1} />
        </span>
      </div>
      <span className="envelope-address">for you, always.</span>
    </div>
  );
}

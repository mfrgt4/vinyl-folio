import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CATS } from "../data";
import { supabase } from "../supabase";

const line: React.CSSProperties = {
  flex: 1,
  background: "none",
  border: 0,
  borderBottom: "1px solid var(--ink)",
  font: "300 20px Inter",
  outline: 0,
};

type Thread = { id: string; title: string; author: string; cat: string; created_at: string };
type Post = { id: string; thread_id: string; author: string; content: string; created_at: string };

export default function Community() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [cat, setCat] = useState("All");
  const [openId, setOpenId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [title, setTitle] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [online, setOnline] = useState(1);

  // THÈME CHOISI POUR LA NOUVELLE DISCUSSION
  const THEMES = CATS.filter((c) => c !== "All");
  const [newCat, setNewCat] = useState(THEMES[0] ?? "General");

  // VRAI NOMBRE DE PERSONNES EN LIGNE - Supabase Presence
  useEffect(() => {
    const channel = supabase.channel("online-users", {
      config: { presence: { key: "user-" + Math.random().toString(36).slice(2) } },
    });
    channel
      .on("presence", { event: "sync" }, () => {
        setOnline(Object.keys(channel.presenceState()).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });
    return () => { supabase.removeChannel(channel); };
  }, []);

  // CHARGER LES DISCUSSIONS DEPUIS SUPABASE + TEMPS RÉEL
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("threads")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setThreads(data as Thread[]);
    };
    load();

    const ch = supabase
      .channel("threads-live")
      .on("postgres_changes" as any, { event: "INSERT", schema: "public", table: "threads" }, (p: any) => {
        setThreads((prev) => [p.new, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  // CHARGER LES MESSAGES DE LA CONV OUVERTE + TEMPS RÉEL
  useEffect(() => {
    if (!openId) return;
    const load = async () => {
      const { data } = await supabase
        .from("thread_posts")
        .select("*")
        .eq("thread_id", openId)
        .order("created_at", { ascending: true });
      if (data) setPosts(data as Post[]);
    };
    load();

    const ch = supabase
      .channel("posts-live-" + openId)
      .on("postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "thread_posts", filter: `thread_id=eq.${openId}` },
        (p: any) => setPosts((prev) => [...prev, p.new])
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [openId]);

  const t = threads.find((x) => x.id === openId);
  const filtered = threads.filter((x) => cat === "All" || x.cat === cat);

  const reply = async () => {
    if (!msg.trim() || !t) return;
    await supabase.from("thread_posts").insert({
      thread_id: t.id,
      author: pseudo.trim() || "vous",
      content: msg.trim(),
    });
    setMsg("");
  };

  const create = async () => {
    if (!title.trim()) return;
    const { data } = await supabase
      .from("threads")
      .insert({
        title: title.trim(),
        author: pseudo.trim() || "vous",
        cat: newCat,
      })
      .select()
      .single();
    setTitle("");
    if (data) setOpenId(data.id);
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("fr", { day: "2-digit", month: "2-digit" });

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <p className="mono"></p>
        <p className="mono">
          <span style={{ color: "var(--pink)" }}>●</span> {online} en ligne
        </p>
      </div>
      <h1 style={{ margin: "16px 0 32px" }}>COMMUNITY</h1>

      <AnimatePresence mode="wait">
        {/* LISTE - LE MENU : il disparaît quand tu ouvres une conv */}
        {!t ? (
          <motion.div
            key="l"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* FILTRES - visibles que dans la liste */}
            <div style={{ marginBottom: 24 }}>
              {CATS.map((c) => (
                <button
                  key={c}
                  className={"tag mono" + (c === cat ? " on" : "")}
                  onClick={() => setCat(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            <input
              placeholder="Ton pseudo…"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              style={{ ...line, maxWidth: 220, marginBottom: 24, fontSize: 16 }}
            />

            {filtered.map((x, k) => (
              <motion.button
                layout
                key={x.id}
                className="track"
                style={{ gridTemplateColumns: "40px 1fr auto" }}
                onClick={() => setOpenId(x.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: k * 0.05 }}
              >
                <span className="mono">{String(k + 1).padStart(2, "0")}</span>
                <span style={{ fontSize: 20, textAlign: "left" }}>
                  {x.title}
                  <br />
                  <span className="mono" style={{ opacity: 0.6 }}>
                    {x.author} · {x.cat}
                  </span>
                </span>
                <span className="mono">{fmtDate(x.created_at)}</span>
              </motion.button>
            ))}

            {filtered.length === 0 && (
              <p className="mono" style={{ padding: "16px 0" }}>
                Aucune discussion pour l'instant. Sois la première à en créer une.
              </p>
            )}

            {/* CRÉER UNE DISCUSSION - AVEC CHOIX DU THÈME */}
            <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap", alignItems: "flex-end" }}>
              <input
                aria-label="Nouveau sujet"
                placeholder="Nouvelle discussion…"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && create()}
                style={line}
              />
              <select
                aria-label="Thème de la discussion"
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                style={{
                  background: "none",
                  border: 0,
                  borderBottom: "1px solid var(--ink)",
                  font: "300 16px Inter",
                  padding: "6px 0",
                  color: "var(--ink)",
                  outline: 0,
                  cursor: "pointer",
                }}
              >
                {THEMES.map((th) => (
                  <option key={th} value={th}>{th}</option>
                ))}
              </select>
              <button className="btn" onClick={create}>
                Publier
              </button>
            </div>
            <p className="mono" style={{ marginTop: 8, opacity: 0.6 }}>
              Thème choisi : {newCat}
            </p>
          </motion.div>
        ) : (
          /* CONV SEULE - PAS DE MENU, QUE LA CONV */
          <motion.div
            key="c"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
          >
            <button className="mono" onClick={() => setOpenId(null)}>
              ← Index
            </button>
            <h2 style={{ fontSize: "clamp(32px,6vw,72px)", margin: "16px 0" }}>
              {t.title}
            </h2>
            <p className="mono" style={{ marginBottom: 16 }}>
              {t.author} · {t.cat}
            </p>

            {posts.length === 0 && (
              <p className="mono" style={{ padding: "12px 0" }}>
                Aucun message pour l'instant. Sois la première à répondre.
              </p>
            )}
            {posts.map((p, k) => (
              <motion.div
                key={p.id}
                className="track"
                style={{ gridTemplateColumns: "80px 1fr 60px" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: k * 0.05 }}
              >
                <span className="mono">{p.author}</span>
                <span>{p.content}</span>
                <span className="mono">{fmtDate(p.created_at)}</span>
              </motion.div>
            ))}

            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <input
                aria-label="Réponse"
                placeholder="Votre réponse…"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && reply()}
                style={line}
              />
              <button className="btn" onClick={reply}>
                Répondre
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLS } from "../hooks";
import { CATS, THREADS, Thread } from "../data";
import { supabase } from "../supabase";

const line: React.CSSProperties = {
  flex: 1,
  background: "none",
  border: 0,
  borderBottom: "1px solid var(--ink)",
  font: "300 20px Inter",
  outline: 0,
};

export default function Community() {
  const [threads, setThreads] = useLS<Thread[]>("vf-threads", THREADS);
  const [cat, setCat] = useState("All");
  const [openId, setOpenId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [title, setTitle] = useState("");
  const [typing, setTyping] = useState(false);
  const [online, setOnline] = useState(1);

  // VRAI NOMBRE DE PERSONNES EN LIGNE - Supabase Presence
  useEffect(() => {
    const channel = supabase.channel("online-users", {
      config: { presence: { key: "user-" + Math.random().toString(36).slice(2) } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setOnline(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const t = threads.find((x) => x.id === openId);

  useEffect(() => {
    // BroadcastChannel : "temps réel" entre onglets du même navigateur
    const bc = new BroadcastChannel("vf");
    bc.onmessage = () =>
      setThreads(JSON.parse(localStorage.getItem("vf-threads") || "[]"));
    return () => bc.close();
  }, []);

  const save = (n: Thread[]) => {
    setThreads(n);
    setTimeout(() => {
      const b = new BroadcastChannel("vf");
      b.postMessage(1);
      b.close();
    }, 80);
  };

  const reply = () => {
    if (!msg.trim() || !t) return;
    const d = new Date().toLocaleDateString("fr").slice(0, 5);
    save(
      threads.map((x) =>
        x.id === t.id
          ? { ...x, posts: [...x.posts, { a: "vous", t: msg, d }] }
          : x,
      ),
    );
    setMsg("");
    setTyping(true);
    setTimeout(() => setTyping(false), 1800);
  };

  const create = () => {
    if (!title.trim()) return;
    const id = "t" + Date.now();
    save([
      {
        id,
        title,
        author: "vous",
        cat: cat === "All" ? "General" : cat,
        date: new Date().toISOString().slice(0, 10),
        posts: [],
      },
      ...threads,
    ]);
    setTitle("");
    setOpenId(id);
  };

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <p className="mono"></p>
        <p className="mono">
          <span style={{ color: "var(--red)" }}>●</span> {online} en ligne
        </p>
      </div>
      <h1 style={{ margin: "16px 0 32px" }}>COMMUNITY</h1>
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
      <AnimatePresence mode="wait">
        {!t ? (
          <motion.div
            key="l"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {threads
              .filter((x) => cat === "All" || x.cat === cat)
              .map((x, k) => (
                <motion.button
                  layout
                  key={x.id}
                  className="track"
                  style={{ gridTemplateColumns: "40px 1fr auto auto" }}
                  onClick={() => setOpenId(x.id)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: k * 0.05 }}
                >
                  <span className="mono">{String(k + 1).padStart(2, "0")}</span>
                  <span style={{ fontSize: 20 }}>
                    {x.title}
                    <br />
                    <span className="mono">
                      {x.author} · {x.cat}
                    </span>
                  </span>
                  <span className="mono">{x.posts.length} rép.</span>
                  <span className="mono">{x.date}</span>
                </motion.button>
              ))}
            <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
              <input
                aria-label="Nouveau sujet"
                placeholder="Nouvelle discussion…"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={line}
              />
              <button className="btn" onClick={create}>
                Publier
              </button>
            </div>
          </motion.div>
        ) : (
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
            {t.posts.map((p, k) => (
              <motion.div
                key={k}
                className="track"
                style={{ gridTemplateColumns: "80px 1fr 60px" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: k * 0.08 }}
              >
                <span className="mono">{p.a}</span>
                <span>{p.t}</span>
                <span className="mono">{p.d}</span>
              </motion.div>
            ))}
            {typing && (
              <p className="mono" aria-live="polite">
                Quelqu’un écrit{" "}
                <motion.span
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  ●●●
                </motion.span>
              </p>
            )}
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
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useLS } from "../hooks";
import { Song } from "../data";
type St = "idle" | "loading" | "done";
type F = {
  title: string;
  artist: string;
  link: string;
  by: string;
  why: string;
};
export default function Submit() {
  const [songs, setSongs] = useLS<Song[]>("vf-songs", []);
  const [f, setF] = useState<F>({
    title: "",
    artist: "",
    link: "",
    by: "",
    why: "",
  });
  const [err, setErr] = useState<Record<string, string>>({});
  const [st, setSt] = useState<St>("idle");
  const set =
    (k: keyof F) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setF({ ...f, [k]: e.target.value });
  const submit = () => {
    const e: Record<string, string> = {};
    if (!f.title.trim()) e.title = "Titre requis";
    if (!f.artist.trim()) e.artist = "Artiste requis";
    if (!/^https?:\/\/.*(spotify|youtu|soundcloud)/i.test(f.link))
      e.link = "Lien Spotify / YouTube / SoundCloud requis";
    setErr(e);
    if (Object.keys(e).length) return;
    setSt("loading");
    setTimeout(() => {
      setSongs([
        ...songs,
        {
          id: "u" + Date.now(),
          title: f.title,
          artist: f.artist,
          link: f.link,
          by: f.by,
          dur: "—:——",
          color: "#873B43",
          status: "pending",
        },
      ]);
      setSt("done");
    }, 1400);
  };
  const Fld = (k: keyof F, label: string, area = false) => (
    <label className="field">
      <span className="mono">{label}</span>
      {area ? (
        <textarea rows={2} value={f[k]} onChange={set(k)} />
      ) : (
        <input value={f[k]} onChange={set(k)} aria-invalid={!!err[k]} />
      )}
      {err[k] && <span className="mono err">{err[k]}</span>}
    </label>
  );
  if (st === "done")
    return (
      <div
        className="page"
        style={{ display: "grid", placeItems: "center", textAlign: "center" }}
      >
        <div>
          <motion.div
            initial={{ x: -200, rotate: -360, opacity: 0 }}
            animate={{ x: 0, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 14 }}
            style={{
              width: 160,
              height: 160,
              borderRadius: "50%",
              background: "#111",
              margin: "0 auto 24px",
              display: "grid",
              placeItems: "center",
              color: "#fff",
              fontSize: 48,
            }}
          >
            ✓
          </motion.div>
          <h2>Track ajoutée</h2>
          <p className="mono" style={{ margin: "16px 0" }}>
            Elle rejoint la collection après validation
          </p>
          <Link className="btn" to="/a-decouvrir">
            Retour à Vos chansons
          </Link>
        </div>
      </div>
    );
  return (
    <div className="page">
      <Link className="mono" to="/a-decouvrir">
        ← Vos chansons
      </Link>
      <h1 style={{ margin: "20px 0 40px", fontSize: "clamp(48px,11vw,160px)" }}>
        SUBMIT
        <br />A TRACK
      </h1>
      <div className="split">
        <div>
          {Fld("title", "01 — Titre")}
          {Fld("artist", "02 — Artiste")}
          {Fld("link", "03 — Lien (Spotify / YouTube / SoundCloud)")}
          {Fld("by", "04 — Pseudo (facultatif)")}
          {Fld("why", "05 — Pourquoi ce choix ? (facultatif)", true)}
          <button
            className="btn"
            onClick={submit}
            disabled={st === "loading"}
            style={{ background: "var(--ink)", color: "#fff" }}
          >
            {st === "loading" ? (
              <motion.span
                style={{ display: "inline-block" }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
              >
                ◌
              </motion.span>
            ) : (
              "Envoyer →"
            )}
          </button>
        </div>
        <div
          aria-live="polite"
          style={{
            display: "flex",
            gap: 20,
            alignItems: "center",
            alignSelf: "start",
            position: "sticky",
            top: 100,
          }}
        >
          <div
            style={{
              position: "relative",
              width: 150,
              height: 150,
              borderRadius: "50%",
              background: "repeating-radial-gradient(#111 0 2px,#222 3px 4px)",
              animation: "spin 4s linear infinite",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "36%",
                borderRadius: "50%",
                background: "var(--red)",
              }}
            />
          </div>
          <div>
            <p className="mono">Aperçu</p>
            <p style={{ fontWeight: 500, fontSize: 22 }}>
              {f.title || "Titre"}
            </p>
            <p className="mono">
              {f.artist || "Artiste"}
              {f.by && ` · par ${f.by}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

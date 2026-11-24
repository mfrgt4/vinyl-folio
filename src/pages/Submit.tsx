import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";

type St = "idle" | "loading" | "done";
type F = { title: string; artist: string; by: string; why: string; };

export default function Submit() {
  const [f, setF] = useState<F>({ title: "", artist: "", by: "", why: "" });
  const [mp3File, setMp3File] = useState<File | null>(null);
  const [mp3Name, setMp3Name] = useState<string>("");
  const [mp3Duration, setMp3Duration] = useState<string>("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [err, setErr] = useState<Record<string, string>>({});
  const [st, setSt] = useState<St>("idle");

  const set = (k: keyof F) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.value });

  const onMp3 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".mp3") && file.type !== "audio/mpeg") {
      setErr({ mp3: "Il faut impérativement un fichier .mp3" });
      return;
    }
    if (file.size > 15 * 1024 * 1024) { setErr({ mp3: "MP3 trop lourd, max 15 Mo." }); return; }
    setErr({});
    setMp3File(file);
    setMp3Name(file.name);
    // Calcule la durée pour l'aperçu
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.onloadedmetadata = () => {
      const m = Math.floor(audio.duration / 60);
      const s = String(Math.floor(audio.duration % 60)).padStart(2, "0");
      setMp3Duration(`${m}:${s}`);
    };
  };

  const onCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setErr({ cover: "Choisis une image (jpg / png)." }); return; }
    if (file.size > 4 * 1024 * 1024) { setErr({ cover: "Image trop lourde, max 4 Mo." }); return; }
    setErr({});
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const submit = async () => {
    const e: Record<string, string> = {};
    if (!f.title.trim()) e.title = "Titre requis";
    if (!f.artist.trim()) e.artist = "Artiste requis";
    if (!mp3File) e.mp3 = "Le fichier MP3 est obligatoire";
    setErr(e);
    if (Object.keys(e).length) return;

    setSt("loading");

    // 1. Upload MP3 - OBLIGATOIRE
    const mp3Path = `${Date.now()}-${Math.random().toString(36).slice(2)}.mp3`;
    const { error: mp3Err } = await supabase.storage.from("tracks").upload(mp3Path, mp3File!);
    if (mp3Err) {
      setErr({ mp3: "Impossible d'envoyer le MP3, réessaie." });
      setSt("idle");
      return;
    }
    const audio_url = supabase.storage.from("tracks").getPublicUrl(mp3Path).data.publicUrl;

    // 2. Upload Cover - facultative
    let cover_url: string | null = null;
    if (coverFile) {
      const ext = coverFile.name.split(".").pop() || "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("covers").upload(path, coverFile);
      if (!upErr) cover_url = supabase.storage.from("covers").getPublicUrl(path).data.publicUrl;
    }

    // 3. Envoi proposition
    const { error } = await supabase.from("proposals").insert({
      id: "u" + Date.now(),
      title: f.title.trim(),
      artist: f.artist.trim(),
      link: null,
      by_name: f.by.trim() || null,
      why: f.why.trim() || null,
      cover_url,
      audio_url,
      created_at: Date.now(),
    });

    if (error) {
      setErr({ mp3: "Impossible d'envoyer, réessaie." });
      setSt("idle");
      return;
    }
    setSt("done");
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
      <div className="page" style={{ display: "grid", placeItems: "center", textAlign: "center" }}>
        <div>
          <motion.div
            initial={{ x: -200, rotate: -360, opacity: 0 }}
            animate={{ x: 0, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 14 }}
            style={{ width: 160, height: 160, borderRadius: "50%", background: "#111", margin: "0 auto 24px", display: "grid", placeItems: "center", color: "#fff", fontSize: 48 }}
          >✓</motion.div>
          <h2>Track ajoutée</h2>
          <p className="mono" style={{ margin: "16px 0" }}>Elle rejoint la collection, tout le monde peut l'écouter.</p>
          <Link className="btn" to="/a-decouvrir">Retour à Vos chansons</Link>
        </div>
      </div>
    );

  return (
    <div className="page">
      <Link className="mono" to="/a-decouvrir">← Vos chansons</Link>
      <h1 style={{ margin: "20px 0 40px", fontSize: "clamp(48px,11vw,160px)" }}>SUBMIT<br />A TRACK</h1>
      <div className="split">
        <div>
          {Fld("title", "01 — Titre")}
          {Fld("artist", "02 — Artiste")}
          {Fld("by", "03 — Pseudo (facultatif)")}
          {Fld("why", "04 — Pourquoi ce choix ? (facultatif)", true)}

          <label className="field">
            <span className="mono">05 — Fichier MP3 * obligatoire</span>
            <input type="file" accept=".mp3,audio/mpeg" onChange={onMp3} style={{ padding: "10px 0", border: 0 }} />
            {mp3Name && <span className="mono" style={{ display: "block", marginTop: 8 }}>{mp3Name}{mp3Duration ? ` · ${mp3Duration}` : ""}</span>}
            {err.mp3 && <span className="mono err">{err.mp3}</span>}
          </label>

          <label className="field">
            <span className="mono">06 — Cover</span>
            <input type="file" accept="image/*" onChange={onCover} style={{ padding: "10px 0", border: 0 }} />
            {err.cover && <span className="mono err">{err.cover}</span>}
            {coverPreview && (
              <img src={coverPreview} alt="Aperçu cover" style={{ width: 120, height: 120, objectFit: "cover", marginTop: 12, display: "block" }} />
            )}
          </label>

          <button className="btn" onClick={submit} disabled={st === "loading"} style={{ background: "var(--ink)", color: "#fff" }}>
            {st === "loading" ? (
              <motion.span style={{ display: "inline-block" }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}>◌</motion.span>
            ) : ("Envoyer →")}
          </button>
        </div>

        <div aria-live="polite" style={{ display: "flex", gap: 20, alignItems: "center", alignSelf: "start", position: "sticky", top: 100 }}>
          {coverPreview ? (
            <img src={coverPreview} alt="" style={{ width: 150, height: 150, objectFit: "cover", borderRadius: 8 }} />
          ) : (
            <div style={{ position: "relative", width: 150, height: 150, borderRadius: "50%", background: "repeating-radial-gradient(#111 0 2px,#222 3px 4px)", animation: "spin 4s linear infinite", flexShrink: 0 }}>
              <div style={{ position: "absolute", inset: "36%", borderRadius: "50%", background: "var(--red)" }} />
            </div>
          )}
          <div>
            <p className="mono">Aperçu</p>
            <p style={{ fontWeight: 500, fontSize: 22 }}>{f.title || "Titre"}</p>
            <p className="mono">{f.artist || "Artiste"}{f.by && ` · par ${f.by}`}</p>
            {mp3Duration && <p className="mono">Durée : {mp3Duration}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
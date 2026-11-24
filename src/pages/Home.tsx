import { useEffect } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { Link } from "react-router-dom";

export default function Home() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 120]);
  const s = useTransform(scrollY, [0, 600], [1, 1.15]);

  // EFFET SOURIS - le fond bouge légèrement avec la souris
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 20 });
  const sy = useSpring(my, { stiffness: 50, damping: 20 });
  const bgX = useTransform(sx, [-0.5, 0.5], [-18, 18]);
  const bgY = useTransform(sy, [-0.5, 0.5], [-12, 12]);

  // FORCER TOUT EN HAUT À L'ARRIVÉE SUR LA PAGE
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page" style={{ overflowX: "hidden", width: "100%", maxWidth: "100vw" }}>
      <section
        className="hero"
        style={{ justifyContent: "flex-end", paddingBottom: 60, overflow: "hidden" }}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width - 0.5);
          my.set((e.clientY - r.top) / r.height - 0.5);
        }}
      >
        {/* IMAGE DE FOND */}
        <motion.div
          style={{
            position: "absolute",
            inset: "-3%",
            y,
            scale: s,
            x: bgX,
            backgroundImage: "url('/images/hero.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* FILTRE SOMBRE + ROSE PAR-DESSUS */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(23,23,23,.55), rgba(23,23,23,.75)), radial-gradient(circle at 50% 50%, #BF215844, #171717 60%)",
          }}
        />

        {/* VINYLE GÉANT QUI TOURNE DERRIÈRE LE TITRE */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            left: "50%",
            bottom: -140,
            width: 620,
            height: 620,
            marginLeft: -310,
            borderRadius: "50%",
            opacity: 0.28,
            background:
              "repeating-radial-gradient(circle at center, #0a0a0a 0 2px, #1d1d1d 3px 4px)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,.08)",
          }}
        >
          {/* Étiquette centrale rose */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 150,
              height: 150,
              marginLeft: -75,
              marginTop: -75,
              borderRadius: "50%",
              background: "#BF2158",
              display: "grid",
              placeItems: "center",
            }}
          >
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#F5F4F0" }} />
          </div>
          {/* Reflet réaliste fixe */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background:
                "linear-gradient(115deg, transparent 42%, rgba(255,255,255,.18) 48%, rgba(255,255,255,.05) 52%, transparent 60%)",
            }}
          />
        </motion.div>

        {/* BALAYAGE DE LUMIÈRE ROSE QUI PASSE TOUTES LES 6s */}
        <motion.div
          animate={{ x: ["-30%", "130%"] }}
          transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: "22%",
            background:
              "linear-gradient(to right, transparent, rgba(191,33,88,.22), rgba(255,255,255,.12), transparent)",
            transform: "skewX(-18deg)",
            pointerEvents: "none",
          }}
        />

        {/* TEXTES EN BAS */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <p className="mono" style={{ color: "#fff", marginBottom: 20 }}>
            Plateforme musicale personnelle & collaborative
          </p>
          <h1 aria-label="Vinyl Folio">
            {"VINYL FOLIO".split("").map((c, i) => (
              <motion.span
                key={i}
                style={{ display: "inline-block", whiteSpace: "pre" }}
                initial={{ y: "110%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: 0.4 + i * 0.04,
                  duration: 0.8,
                  ease: [0.2, 0.8, 0.2, 1],
                }}
              >
                {c}
              </motion.span>
            ))}
          </h1>
          <div style={{ display: "flex", gap: 16, marginTop: 32 }}>
            <Link className="btn" to="/mes-musiques">
              Mes Musiques
            </Link>
            <Link className="btn" to="/ajouter">
              Ajouter une musique
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION À PROPOS - TITRE À CÔTÉ DU TEXTE, BLOC ENTIER CENTRÉ */}
      <section className="split" style={{ padding: "120px 0", maxWidth: 1050, margin: "0 auto", justifyContent: "center", alignItems: "center" }}>
        <motion.h2
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
        >
          Un univers.
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.15 }}
          style={{ alignSelf: "center" }}
        >
          <p className="mono">01 — À propos</p>
          <p style={{ maxWidth: 420, margin: "12px 0 24px" }}>
            Un site qui se parcourt comme une collection de disques. Ouvrez le
            livret, écoutez les morceaux partagés, rejoignez la conversation.
          </p>
          <Link className="btn" to="/a-propos">
            Ouvrir le livret
          </Link>
        </motion.div>
      </section>

      {/* BANDEAU PLEINE LARGEUR - SANS SCROLL HORIZONTAL */}
      <div
        className="marquee"
        aria-hidden
        style={{
          width: "calc(100% + 8vw)",
          marginLeft: "-4vw",
          overflow: "hidden",
        }}
      >
        <div>
          {Array(8)
            .fill(
              " Musique — Vinyle — Disque — Son — Playlist — Rythme — ",
            )
            .join("")}
        </div>
      </div>

      <section
        style={{
          background: "var(--ink)",
          color: "var(--paper)",
          margin: "80px -4vw -60px",
          padding: "100px 4vw",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          À ton tour.
        </motion.h2>
        <p style={{ maxWidth: 520, marginTop: 16, lineHeight: 1.6 }}>
          Un site pour découvrir des morceaux, partager tes sons préférés et en
          discuter avec les autres. Pas de compte, juste de la musique.
        </p>
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 32,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Link className="btn" to="/a-decouvrir">
            Découvrir
          </Link>
          <Link className="btn" to="/ajouter">
            Ajouter une musique
          </Link>
          <Link className="btn" to="/communaute">
            Communauté
          </Link>
        </div>
        <p className="mono" style={{ marginTop: 48, opacity: 0.6 }}>
          © Vinyl Folio — Fait avec créativité par Manon F.
        </p>
      </section>
    </div>
  );
}
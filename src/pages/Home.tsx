import { useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";

export default function Home() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 120]);
  const s = useTransform(scrollY, [0, 600], [1, 1.15]);

  // FORCER TOUT EN HAUT À L'ARRIVÉE SUR LA PAGE
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page" style={{ overflowX: "hidden", width: "100%", maxWidth: "100vw" }}>
      <section
        className="hero"
        style={{ justifyContent: "flex-end", paddingBottom: 60, overflow: "hidden" }}
      >
        {/* IMAGE DE FOND */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            y,
            scale: s,
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
      <section className="split" style={{ padding: "120px 0" }}>
        <motion.h2
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
        >
          Un univers,
          <br />
          des disques.
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.15 }}
          style={{ alignSelf: "end" }}
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
          © Vinyl Folio — Fait avec des disques & du son.
        </p>
      </section>
    </div>
  );
}
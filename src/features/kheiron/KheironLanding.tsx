"use client";

import { useEffect, useState } from "react";

import {
  KheironPlateauShow,
  KheironPosterShow,
  KheironVideoShow,
} from "@/features/kheiron/KheironCarousel";
import {
  KHEIRON_MEDIA,
  KHEIRON_PAYMENT_LINK,
  KHEIRON_STAGE,
  KHEIRON_START,
  whatsAppLink,
} from "@/features/kheiron/config";

const img = (file: string) => `${KHEIRON_MEDIA}/images/${file}`;
const vid = (file: string) => `${KHEIRON_MEDIA}/videos/${file}`;

const VIDEOS = [
  { src: vid("temoignage-lea.mp4"), poster: img("temoignage-lea.webp"), nom: "Léa" },
  { src: vid("temoignage-clement.mp4"), poster: img("temoignage-clement.webp"), nom: "Clément" },
  { src: vid("temoignage-chloe.mp4"), poster: img("temoignage-chloe.webp"), nom: "Chloé" },
  { src: vid("temoignage-maxime.mp4"), poster: img("temoignage-maxime.webp"), nom: "Maxime" },
  { src: vid("temoignage-klemence.mp4"), poster: img("temoignage-klemence.webp"), nom: "Klémence" },
  { src: vid("temoignage-caner.mp4"), poster: img("temoignage-caner.webp"), nom: "Caner" },
  { src: vid("temoignage-jean.mp4"), poster: img("temoignage-jean.webp"), nom: "Jean" },
];

const POSTERS = [
  ["affiche-60-minutes.webp", "Affiche de 60 minutes avec Kheiron : On n'éteindra pas la lumière", "60 minutes avec Kheiron", "Son spectacle de stand-up"],
  ["affiche-dragon.webp", "Affiche du spectacle Dragon de Kheiron", "Dragon", "Son spectacle d'improvisation"],
  ["affiche-nous-trois-ou-rien.webp", "Affiche du film Nous trois ou rien", "Nous trois ou rien", "Son premier film en tant que réalisateur"],
  ["affiche-mauvaises-herbes.webp", "Affiche du film Mauvaises Herbes", "Mauvaises Herbes", "Réalisateur et acteur, avec Catherine Deneuve"],
  ["affiche-brutus-vs-cesar.webp", "Affiche du film Brutus vs César", "Brutus vs César", "Réalisateur et acteur · Amazon Original"],
  ["affiche-history-telling.webp", "Affiche de History Telling au Théâtre Apollo", "History Telling", "Sa troupe de 15 humoristes, au Théâtre Apollo"],
  ["affiche-alba-et-sadaf.webp", "Affiche de la pièce Alba et Sadaf", "Alba et Sadaf", "Sa première pièce de théâtre"],
] as const;

const PLATEAU: [string, string][] = [
  ["plateau-01.webp", "Retour image sur le moniteur, avec le clap"],
  ["plateau-02.webp", "Comédiennes au retour image sur moniteur RED"],
  ["plateau-03.webp", "Opérateur steadicam en tournage extérieur"],
  ["plateau-04.webp", "Tournage dans une laverie"],
  ["plateau-05.webp", "Retour image sur le moniteur de contrôle"],
  ["plateau-06.webp", "Plateau en studio, face caméra"],
  ["plateau-07.webp", "Tournage avec fumée et machinerie"],
  ["plateau-08.webp", "Scène au moniteur, en intérieur"],
  ["plateau-09.webp", "Gros plan d'un comédien au moniteur"],
  ["plateau-10.webp", "Image extraite d'un tournage élève"],
  ["plateau-11.webp", "Cadreur à l'épaule en extérieur"],
  ["plateau-12.webp", "Caméra RED montée en voiture"],
  ["plateau-13.webp", "Direction d'acteur en studio"],
  ["plateau-14.webp", "Scène en voiture au moniteur"],
  ["plateau-15.webp", "Plateau en bureau, interview"],
  ["plateau-16.webp", "Image extraite d'un tournage élève"],
  ["plateau-17.webp", "Cadreur à l'épaule en intérieur"],
  ["plateau-18.webp", "Cadreur en extérieur"],
  ["plateau-19.webp", "Tournage d'une scène en intérieur"],
  ["plateau-20.webp", "Clap et prise en extérieur"],
  ["plateau-21.webp", "Image extraite d'un tournage élève"],
  ["plateau-22.webp", "Équipe et réflecteur en extérieur"],
  ["plateau-23.webp", "Plateau en studio, plusieurs moniteurs"],
  ["plateau-24.webp", "Comédienne en tournage"],
  ["plateau-25.webp", "Retour image en terrasse"],
  ["plateau-26.webp", "Cadreur caméra à l'épaule"],
  ["plateau-27.webp", "Image extraite d'un tournage élève"],
  ["plateau-28.webp", "Caméra en voiture, scène de nuit"],
  ["plateau-29.webp", "Préparation d'un plan de nuit"],
  ["plateau-30.webp", "Comédien au moniteur"],
  ["plateau-31.webp", "Retour image, scène de jeu de cartes"],
  ["plateau-32.webp", "Gros plan au moniteur"],
  ["plateau-33.webp", "Tournage en extérieur, voiture"],
  ["plateau-34.webp", "Préparation d'une scène en voiture"],
  ["plateau-35.webp", "Cadreur en couloir"],
];

const WA_INTRO = "Bonjour ! Je suis intéressé·e par la masterclass stand-up avec Kheiron 🎤 J'ai une question :";
const WA_CHIPS = [
  ["Je n'ai jamais fait de scène, c'est ok ?", "Bonjour ! Je n'ai jamais fait de scène, est-ce que la masterclass avec Kheiron est faite pour moi ?"],
  ["Le paiement en 3 fois ?", "Bonjour ! Comment fonctionne le paiement en 3 fois sans frais pour la masterclass avec Kheiron ?"],
  ["Il reste des places ?", "Bonjour ! Il reste des places pour la masterclass stand-up avec Kheiron ?"],
  ["Comment se passent les 4 jours ?", "Bonjour ! Pouvez-vous m'en dire plus sur le déroulé des 4 jours de la masterclass avec Kheiron ?"],
] as const;

type Gtag = (...args: unknown[]) => void;
type Fbq = (...args: unknown[]) => void;

function track(name: string, data: Record<string, string> = {}, eventId?: string) {
  const w = window as Window & { gtag?: Gtag; fbq?: Fbq };
  w.fbq?.("track", name, data, eventId ? { eventID: eventId } : undefined);
  w.gtag?.("event", name, data);
}

function newId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"] as const;

function readStore(key: string, storage: Storage = localStorage) {
  try {
    return JSON.parse(storage.getItem(key) || "null") as Record<string, string> | null;
  } catch {
    return null;
  }
}

function writeStore(key: string, value: unknown, storage: Storage = localStorage) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    /* navigation privée */
  }
}

function useCountdown() {
  const [short, setShort] = useState("quelques jours");
  const [clock, setClock] = useState({ j: "--", h: "--", m: "--" });

  useEffect(() => {
    const start = new Date(KHEIRON_START).getTime();
    const pad = (n: number) => String(n).padStart(2, "0");
    const tick = () => {
      const ms = Math.max(0, start - Date.now());
      const j = Math.floor(ms / 864e5);
      setClock({ j: String(j), h: pad(Math.floor(ms / 36e5) % 24), m: pad(Math.floor(ms / 6e4) % 60) });
      setShort(j > 0 ? `J-${j}` : "aujourd'hui");
    };
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, []);

  return { short, clock };
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="2.5" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" />
    </svg>
  );
}

function SeatsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 18v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6" />
      <path d="M4 18h16M7 10V6.5A2.5 2.5 0 0 1 9.5 4h5A2.5 2.5 0 0 1 17 6.5V10M7 18v2M17 18v2" />
    </svg>
  );
}

function StageIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 20h18M5 20V9l7-5 7 5v11" />
      <path d="M9 20v-5a3 3 0 0 1 6 0v5" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="6.5" width="13" height="11" rx="2" />
      <path d="m15.5 10.5 6-3.5v10l-6-3.5" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path fill="currentColor" d="M16 3C8.8 3 3 8.7 3 15.8c0 2.5.7 4.9 2 6.9L3 29l6.5-2c1.9 1 4.1 1.6 6.5 1.6 7.2 0 13-5.7 13-12.8S23.2 3 16 3zm0 23.3c-2.1 0-4.1-.6-5.8-1.7l-.4-.3-3.9 1.2 1.2-3.7-.3-.4a10.4 10.4 0 0 1-1.7-5.7C5.1 9.9 10 5.2 16 5.2s10.9 4.7 10.9 10.6S22 26.3 16 26.3zm6-7.9c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.2-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.4.3-.6.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.7s1.2 3.1 1.4 3.4c.2.2 2.4 3.6 5.7 5 .8.3 1.4.5 1.9.7.8.3 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z" />
    </svg>
  );
}

function Qualiopi({ className }: { className?: string }) {
  return (
    <span className={className ? `qbadge ${className}` : "qbadge"}>
      <img decoding="async" src={img("qualiopi.png")} alt="Qualiopi, processus certifié, République française" width={633} height={338} />
    </span>
  );
}

export function KheironLanding() {
  const { short, clock } = useCountdown();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const touch: Record<string, string> = {};
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) touch[key] = value.slice(0, 200);
    }
    if (Object.keys(touch).length) {
      touch.at = new Date().toISOString();
      touch.landing = window.location.pathname;
      if (!readStore("cm_first")) writeStore("cm_first", touch);
      writeStore("cm_last", touch, sessionStorage);
    }
    if (touch.fbclid) writeStore("cm_fbc", `fb.1.${Date.now()}.${touch.fbclid}`);
    track("ViewContent", { content_name: KHEIRON_STAGE });
    const onShow = () => setBusy(false);
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  const checkout = () => {
    setBusy(true);
    track("InitiateCheckout", { content_name: KHEIRON_STAGE }, newId());
    const url = new URL(KHEIRON_PAYMENT_LINK);
    const params = new URLSearchParams(window.location.search);
    const cid = params.get("cid") || "";
    const email = params.get("email") || "";
    if (/^rec[A-Za-z0-9]{14}$/.test(cid)) url.searchParams.set("client_reference_id", cid);
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) url.searchParams.set("prefilled_email", email);
    url.searchParams.set("locale", "fr");
    const last = readStore("cm_last", sessionStorage) || readStore("cm_first") || {};
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const) {
      if (last[key]) url.searchParams.set(key, last[key]);
    }
    window.location.href = url.toString();
  };

  const onWhatsApp = () => track("Contact", { content_name: KHEIRON_STAGE, method: "whatsapp" }, newId());

  return (
    <div className="kheiron" id="top">
      <header className="topbar">
        <div className="urgency">
          <div className="wrap">
            <span className="dot" aria-hidden="true" />
            <span>
              <b>Session unique</b> · 20 places · Début dans <b>{short}</b>
              <span className="u-more"> · Aucune autre date prévue avec Kheiron</span>
            </span>
            <a href="#tarif">Je me lance</a>
          </div>
        </div>
        <div className="wrap">
          <a href="#top" className="logo" aria-label="Cinémergence, retour en haut">
            <img decoding="async" src={img("logo-cinemergence.png")} alt="Cinémergence" width={455} height={160} />
          </a>
          <a href="#tarif" className="btn btn-primary btn-alive">Je tente ma chance</a>
        </div>
      </header>

      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow">Cinéma × Formation × Émergence · Stand-Up · Nov.–Déc. 2026</span>
            <h1>Tu te crois drôle&nbsp;?<br /><em>Prouve-le devant Kheiron.</em></h1>
            <p className="lead">4 jours pour écrire, roder et jouer ton propre sketch. Dès le premier jour, tu le joues devant Kheiron, qui te coache en direct. Et tu termines sur la scène d&apos;un café-théâtre parisien, devant un vrai public, filmé en conditions pro.</p>
            <div className="chips">
              <span className="chip">📅 28–29 nov. & 5–6 déc.</span>
              <span className="chip">🎤 Coaché par Kheiron dès le jour 1</span>
              <span className="chip">🎭 Scène ouverte en café-théâtre</span>
              <span className="chip">🎥 Équipe vidéo pro dédiée</span>
            </div>
            <div className="cta-row">
              <a href="#tarif" className="btn btn-primary">Je me lance →</a>
              <a href="#programme" className="btn btn-ghost">Voir le programme</a>
            </div>
            <div className="scarcity-box">
              <span className="scarce-pill">⚡ 20 places seulement</span>
              <span className="scarce-pill">⏳ Début dans {short}</span>
            </div>
            <div className="trust-row">
              <Qualiopi />
              <span><b>Organisme certifié Qualiopi</b>NDA 117 888 658 78 · DREETS Île-de-France</span>
            </div>
          </div>
          <div className="portrait">
            <img src={img("kheiron.webp")} alt="Kheiron" width={900} height={910} fetchPriority="high" />
            <div className="tag">
              <div className="display">Kheiron</div>
              <small>Humoriste · Auteur · Réalisateur · Invité du jour 1</small>
            </div>
          </div>
        </div>
      </section>

      <div className="strip">
        <div className="wrap">
          <ul className="feats">
            <li><span className="fi"><MicIcon /></span><span><b>Kheiron</b>te coache en personne</span></li>
            <li><span className="fi"><SeatsIcon /></span><span><b>20 places</b>pas une de plus</span></li>
            <li><span className="fi"><StageIcon /></span><span><b>Café-théâtre</b>ta scène ouverte finale</span></li>
            <li><span className="fi"><CameraIcon /></span><span><b>Équipe vidéo pro</b>pour filmer tes passages</span></li>
          </ul>
          <div className="qcell">
            <Qualiopi />
            <span><b>Certifié Qualiopi</b>Organisme de formation</span>
          </div>
        </div>
      </div>

      <section>
        <div className="wrap two">
          <div>
            <span className="eyebrow">Le vrai problème</span>
            <h2>Tes vannes ne valent rien tant qu&apos;elles n&apos;ont pas rencontré un public.</h2>
            <p className="lead">Tu fais rire tes potes. Tu as des idées plein ton téléphone. Mais entre « je suis drôle » et « je tiens une salle », il y a un monde, et personne ne t&apos;a montré comment le traverser.</p>
          </div>
          <div>
            <ul className="pain">
              <li>Tu écris seul, sans savoir ce qui marche vraiment</li>
              <li>Les open mics, c&apos;est 5 minutes et aucun retour concret</li>
              <li>Les cours « théoriques » ne te mettent jamais sur scène</li>
              <li>Tu ne sais pas comment fonctionne le milieu : scènes ouvertes, plateaux, comedy clubs</li>
              <li>Tu n&apos;as aucune vidéo propre à montrer aux programmateurs</li>
            </ul>
            <p className="big-quote quote-space">Ici, tu écris, tu joues, tu te plantes, tu corriges, <span>et tu recommences devant un vrai public.</span></p>
          </div>
        </div>
      </section>

      <section className="alt">
        <div className="wrap kh-grid">
          <div className="portrait">
            <img decoding="async" src={img("kheiron-60-minutes-portrait.webp")} alt="Kheiron, veste rouge, affiche de 60 minutes avec Kheiron" width={470} height={587} loading="lazy" />
          </div>
          <div>
            <span className="eyebrow">Jour 1 · Samedi 28 novembre · Théâtre Apollo</span>
            <h2>Une journée avec Kheiron. Sur scène, pas dans le public.</h2>
            <p className="lead">Peu de formations offrent ça : jouer ton propre sketch devant un humoriste reconnu, dès le premier jour. Il te coache, te juge et te corrige sur le moment. Son avis porte sur <em>ton</em> texte, pas sur des généralités.</p>
            <div className="kh-day">
              <div>
                <h3>Le matin : la masterclass</h3>
                <ul className="checks">
                  <li>Son parcours et le métier de stand-uppeur</li>
                  <li>Comment on s&apos;insère : scènes ouvertes, plateaux, comedy clubs</li>
                  <li>Comment on construit une carrière</li>
                  <li>Le statut et l&apos;économie du métier : droits d&apos;auteur, cachets</li>
                  <li>Les réseaux sociaux, puis tes questions</li>
                </ul>
              </div>
              <div>
                <h3>L&apos;après-midi : tu passes devant lui</h3>
                <ul className="checks">
                  <li>Ton passage de 4 à 5 min devant lui, puis ses retours sur ton texte</li>
                  <li>Un retour collectif sur les points communs du groupe</li>
                  <li>Ton passage est filmé : c&apos;est ton point de départ</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="wrap kh-bento-wrap">
          <div>
            <span className="eyebrow">Son univers, de la scène à l&apos;écran</span>
            <p className="ps-sub">Et de retour dans la saison 2 de la série culte <em>Bref.</em></p>
          </div>
          <KheironPosterShow
            posters={POSTERS.map(([file, alt, title, caption]) => ({
              src: img(file),
              alt,
              title,
              caption,
            }))}
          />
        </div>
        <div className="wrap team-head">
          <span className="eyebrow">Ton équipe sur les 4 jours</span>
          <h2>Kheiron ouvre le bal. Eux t&apos;emmènent jusqu&apos;à la scène.</h2>
          <p className="lead">Phil Darwin t&apos;accompagne pendant les 4 jours. Avec un formateur mystère, ils reprennent ton texte là où Kheiron l&apos;a laissé, jusqu&apos;à la scène ouverte.</p>
          <div className="team">
            <article className="coach star">
              <div className="pic"><img decoding="async" src={img("kheiron.webp")} alt="Kheiron" width={900} height={910} loading="lazy" /></div>
              <div className="body"><span className="role">Jour 1 · Masterclass</span><h3>Kheiron</h3><p>Humoriste, auteur, réalisateur. Il te fait passer sur scène et te coache sur ton propre sketch.</p></div>
            </article>
            <article className="coach">
              <div className="pic"><img className="darwin" decoding="async" src={img("phil-darwin.webp")} alt="Phil Darwin, micro à la main" width={683} height={1024} loading="lazy" /></div>
              <div className="body">
                <span className="role">Les 4 jours · Formateur</span>
                <h3>Phil Darwin</h3>
                <p className="sub">Humoriste, comédien et formateur</p>
                <p>Artiste franco-congolais, il évolue depuis plus de 20 ans dans le stand-up, le théâtre et les médias. Il a joué à l&apos;Olympia, au Zénith de Paris et à La Cigale, et dans des festivals en Europe, en Afrique et en Amérique du Nord. Chroniqueur radio et comédien, il joue dans <em>Mayouya</em> de Claudia Yoka, présenté à Cannes en 2022.</p>
                <p className="force">Il transmet le métier en masterclass et en formation : écriture humoristique, interprétation, rythme comique et présence scénique.</p>
                <p>Pendant les 4 jours, il t&apos;accompagne de tes premières prises de parole jusqu&apos;à ton sketch devant le public.</p>
              </div>
            </article>
            <article className="coach mystery">
              <div className="pic" aria-hidden="true"><span className="q-mark">?</span></div>
              <div className="body">
                <span className="role">Jours 2 à 4 · Formateur mystère</span>
                <h3>? ? ? ? ?</h3>
                <p>Son nom reste secret pour l&apos;instant : il sera dévoilé prochainement. Les premiers inscrits le découvriront avant tout le monde.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="programme">
        <div className="wrap">
          <span className="eyebrow">Le programme · 30 heures</span>
          <h2>4 jours, de ton premier jet à la scène.</h2>
          <p className="lead">Tu travailles sur ton propre sketch du début à la fin. Les deux côtés du métier : l&apos;écriture (vannes, structure, persona) et le jeu (timing, rapport au public, gérer un bide).</p>
          <div className="timeline">
            <div className="day star">
              <span className="badge">Kheiron</span>
              <span className="when">Sam. 28 nov.</span>
              <div className="num">01</div>
              <h3>Le métier et le diagnostic</h3>
              <ul>
                <li>Masterclass et échange avec Kheiron</li>
                <li>Tu joues ton sketch devant lui, il te coache</li>
                <li>Passage filmé : ton « avant »</li>
              </ul>
              <div className="where">📍 Théâtre Apollo</div>
            </div>
            <div className="day">
              <span className="when">Dim. 29 nov.</span>
              <div className="num">02</div>
              <h3>Comprendre le rire, écrire la vanne</h3>
              <ul>
                <li>Les mécanismes du rire : surprise, décalage, tabou, autodérision</li>
                <li>Prémisse, setup, punchline, tag, callback</li>
                <li>Tu réécris ton sketch et tu repars avec ta feuille de route</li>
              </ul>
              <div className="where">📍 Lieu communiqué aux inscrits</div>
            </div>
            <div className="day">
              <span className="when">Sam. 5 déc.</span>
              <div className="num">03</div>
              <h3>Se trouver et passer à la scène</h3>
              <ul>
                <li>Ton angle, ton personnage de scène, ta structure</li>
                <li>Rythme, silences, gérer un bide ou un chahut</li>
                <li>Filages filmés, avec retours et visionnage</li>
              </ul>
              <div className="where">📍 Lieu communiqué aux inscrits</div>
            </div>
            <div className="day star">
              <span className="badge">Live</span>
              <span className="when">Dim. 6 déc.</span>
              <div className="num">04</div>
              <h3>Rodage et scène ouverte</h3>
              <ul>
                <li>Dernière réécriture et générale</li>
                <li>Le soir : scène ouverte devant le public d&apos;un café-théâtre parisien</li>
                <li>Filmée en conditions pro, avec bilan à chaud</li>
              </ul>
              <div className="where">📍 Café-théâtre parisien · adresse communiquée aux inscrits</div>
            </div>
          </div>
          <div className="between">
            <span className="ico">✍️</span>
            <div><b>Entre les deux week-ends</b>Tu réécris ton sketch en suivant ta feuille de route personnelle, au lieu de tout enchaîner. En stand-up, c&apos;est souvent là que tout se joue.</div>
          </div>
          <figure className="pull"><div><div className="stars" aria-label="5 sur 5">★★★★★</div><blockquote>Le travail est direct. Pas de blabla. On répète, on tourne, on corrige. J&apos;ai surtout progressé sur la justesse et l&apos;écoute.</blockquote><cite><b>Yanis, 32 ans, intermittent</b> · Stage Bande Démo Cinéma</cite></div></figure>
        </div>
      </section>

      <section className="alt">
        <div className="wrap">
          <span className="eyebrow">Tu repars avec</span>
          <h2>Du concret. Pas un certificat.</h2>
          <div className="deliv">
            <div className="card"><div className="ico">🎥</div><h3>Une vidéo pro de ton passage</h3><p>Ta scène ouverte filmée en conditions professionnelles, montée et remise. Pour te faire connaître sur les réseaux et démarcher les programmateurs.</p></div>
            <div className="card"><div className="ico">🎭</div><h3>Ta première vraie scène</h3><p>Une scène ouverte dans un café-théâtre parisien, devant un public qui ne te doit rien. Pas seulement devant les autres élèves.</p></div>
            <div className="card"><div className="ico">📈</div><h3>Ton avant / après filmé</h3><p>Ton passage devant Kheiron le jour 1, puis ta scène ouverte le jour 4 : tu vois ta progression, image à l&apos;appui.</p></div>
            <div className="card"><div className="ico">🎯</div><h3>Des retours 100 % personnalisés</h3><p>Les retours de Kheiron, puis ceux des formateurs à chaque étape, et une feuille de route écrite pour toi. Aucun conseil copié-collé pour tout le groupe.</p></div>
            <div className="card"><div className="ico">🗺️</div><h3>Les clés du milieu</h3><p>Comment fonctionnent les scènes ouvertes, les plateaux et les comedy clubs, comment on construit une carrière et comment on en vit.</p></div>
            <div className="card"><div className="ico">🗓️</div><h3>Compatible avec ta vie</h3><p>Deux week-ends : tu suis la formation sans quitter ton emploi ni poser de congés.</p></div>
          </div>
        </div>
      </section>

      <section className="testi-section" id="temoignages">
        <div className="wrap">
          <span className="eyebrow">Ils sont passés par Cinémergence</span>
          <h2>Ce qu&apos;en disent nos anciens élèves.</h2>
          <p className="lead">Ils ont suivi nos formations cinéma. Ils racontent avec leurs mots ce qui a changé pour eux. Chaque formation Cinémergence repose sur la même exigence : des professionnels du métier, des conditions réelles et un livrable concret à la fin.</p>
          <div className="vcar" aria-label="Témoignages vidéo">
            <KheironVideoShow videos={VIDEOS} />
          </div>
          <div className="testis">
            <figure className="testi"><span className="profil">Débutant</span><blockquote>Je n&apos;avais aucune bande démo. En deux jours, j&apos;ai travaillé des scènes exigeantes et obtenu des images exploitables. Le regard d&apos;un réalisateur change vraiment la façon d&apos;aborder le jeu.</blockquote><figcaption><b>Sarah, 24 ans</b><span className="formation">Stage Bande Démo Cinéma</span></figcaption></figure>
            <figure className="testi"><span className="profil">Débutant</span><blockquote>Je pensais être prêt pour les castings. Le stage m&apos;a montré mes faiblesses. Ça m&apos;a forcé à travailler plus finement. Résultat : des images plus crédibles.</blockquote><figcaption><b>Thomas, 22 ans</b><span className="formation">Stage Bande Démo Cinéma</span></figcaption></figure>
            <figure className="testi"><span className="profil">Débutant</span><blockquote>Avant le stage, je jouais surtout en théâtre. J&apos;avais du mal avec la caméra. J&apos;ai compris comment gérer mon regard et mon énergie en gros plan. Les images obtenues m&apos;ont permis d&apos;envoyer une bande démo propre aux castings.</blockquote><figcaption><b>Camille, 27 ans</b><span className="formation">Stage Bande Démo Cinéma</span></figcaption></figure>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <span className="eyebrow">Pour qui ?</span>
          <h2>Aucune expérience nécessaire. Juste l&apos;envie de monter sur scène.</h2>
          <p className="lead">Pour tous ceux qui veulent découvrir le stand-up, apprendre à faire rire ou perfectionner leur humour sur scène.</p>
          <div className="fit">
            <div className="card yes">
              <h3>C&apos;est pour toi si tu es…</h3>
              <ul>
                <li>Débutant·e, et tu rêves de monter sur scène sans avoir jamais osé</li>
                <li>Passionné·e, ou tu as déjà fait quelques open mics et tu veux passer un cap</li>
                <li>Humoriste, comédien·ne ou auteur·rice et tu veux maîtriser l&apos;écriture comique</li>
                <li>Créateur·rice de contenu, et tu veux être drôle en vrai, pas seulement au montage</li>
                <li>Simplement curieux·se de ce qui se passe derrière une vanne qui marche</li>
              </ul>
            </div>
            <div className="card no">
              <h3>Ce n&apos;est pas pour toi si…</h3>
              <ul>
                <li>Tu cherches un cours théorique sans jamais monter sur scène</li>
                <li>Tu ne peux pas être présent·e les 4 jours</li>
                <li>Tu n&apos;es pas prêt·e à entendre des retours francs</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="alt" id="tarif">
        <div className="wrap">
          <div className="center">
            <span className="eyebrow">Tarif</span>
            <h2>Ta place pour les 4 jours</h2>
          </div>
          <div className="price-box">
            <span className="cd-label">Début du stage dans</span>
            <div className="countdown">
              <div><b>{clock.j}</b><span>jours</span></div>
              <div><b>{clock.h}</b><span>heures</span></div>
              <div><b>{clock.m}</b><span>min</span></div>
            </div>
            <div className="price">1 500 €</div>
            <p className="price-sub">ou <b>3 × 500 € sans frais</b></p>
            <ul>
              <li>La masterclass de Kheiron et ton passage coaché devant lui</li>
              <li>30 heures de formation sur 2 week-ends, 20 places seulement</li>
              <li>Ta scène ouverte devant le public d&apos;un café-théâtre parisien</li>
              <li>La vidéo professionnelle de ton passage, montée</li>
              <li>Ton avant / après filmé et ta feuille de route personnelle</li>
              <li>Formation délivrée par un organisme certifié Qualiopi</li>
            </ul>
            <div className="trust-row trust-center"><Qualiopi /></div>
            <button type="button" className="btn btn-primary" aria-busy={busy} onClick={checkout}>Je me lance : je réserve ma place →</button>
            <p className="last-call">⚡ 20 places, une seule session. Quand c&apos;est complet, c&apos;est complet.</p>
            <p className="pay-note">Paiement sécurisé par Stripe · Carte bancaire ou paiement en 3× sans frais</p>
            <figure className="pull"><div><div className="stars" aria-label="5 sur 5">★★★★★</div><blockquote>Le cadre est professionnel. On se sent considéré comme un acteur, pas comme un élève. J&apos;ai gagné en confiance face caméra.</blockquote><cite><b>Laura, 35 ans, intermittente</b> · Stage Bande Démo Cinéma</cite></div></figure>
            <div className="guarantee">
              <span className="shield">🛡️</span>
              <div><b>Zéro risque.</b> Le stage est confirmé dès 10 inscrits. S&apos;il n&apos;a pas lieu, tu es remboursé·e intégralement.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="alt">
        <div className="wrap">
          <div className="center">
            <span className="eyebrow">Questions fréquentes</span>
            <h2>Tu te poses encore des questions ?</h2>
          </div>
          <div className="faq">
            <details><summary>Je n&apos;ai jamais fait de scène. C&apos;est pour moi ?</summary><p>Oui. Aucune expérience préalable n&apos;est nécessaire, seule compte l&apos;envie de monter sur scène. Tu écris et tu rodes ton passage avec les formateurs avant la scène ouverte : tu ne montes pas devant le public sans préparation.</p></details>
            <details><summary>Est-ce que je dois arriver avec un texte ?</summary><p>Oui, apporte un premier sketch le jour 1, même brouillon. C&apos;est lui que tu joues devant Kheiron, puis que tu réécris tout au long de la formation jusqu&apos;à la scène finale. <span className="todo">Consigne exacte : durée, aide pour ceux qui partent de zéro</span></p></details>
            <details><summary>Est-ce que Kheiron est présent les 4 jours ?</summary><p>Kheiron anime le jour 1, le samedi 28 novembre au Théâtre Apollo : la masterclass le matin, puis les passages coachés l&apos;après-midi. Phil Darwin t&apos;accompagne pendant les 4 jours, avec un formateur mystère dont le nom sera bientôt dévoilé, jusqu&apos;à la scène ouverte.</p></details>
            <details><summary>Pourquoi deux week-ends et pas 4 jours d&apos;affilée ?</summary><p>La semaine entre les deux sessions te laisse le temps de réécrire ton sketch avec ta feuille de route personnelle et d&apos;arriver au deuxième week-end avec un texte qui a déjà mûri. Et c&apos;est compatible avec un emploi ou une autre activité.</p></details>
            <details><summary>Comment se passe la scène finale ?</summary><p>Le dimanche 6 décembre au soir, dans un café-théâtre parisien, devant du public. Tu joues ton passage de 4 à 5 minutes, filmé en conditions professionnelles par une équipe de captation. Tu as un retour à chaud juste après.</p></details>
            <details><summary>Je ne suis pas à Paris, ça vaut le coup ?</summary><p>Les sessions ont lieu sur deux week-ends, ce qui permet de venir sans poser de congés. <span className="todo">Infos logement / tarifs hôtels partenaires</span></p></details>
            <details><summary>La vidéo de mon passage m&apos;appartient ?</summary><p>Oui. Tu reçois la captation montée de ton passage après la formation, et tu l&apos;utilises comme tu veux : réseaux sociaux, démarchage des programmateurs, candidatures.</p></details>
            <details><summary>Comment se passe le paiement ?</summary><p>Tu réserves et tu paies ta place directement en ligne, sur une page de paiement sécurisée Stripe, en une fois ou en 3× sans frais. Si le stage n&apos;atteint pas le nombre minimum de participants, tu es remboursé·e intégralement.</p></details>
            <details><summary>Qui est Cinémergence ?</summary><p>Une école de formation aux métiers du cinéma et de la scène, certifiée Qualiopi, fondée par le réalisateur Choukri Rouha et parrainée par Bibi Naceri. Chaque formation s&apos;ouvre avec une grande figure de la discipline et se termine par un livrable concret.</p></details>
          </div>
        </div>
      </section>

      <section id="reserver">
        <div className="wrap form-wrap">
          <div>
            <span className="eyebrow">Pas encore décidé·e ?</span>
            <h2>Une question avant de réserver&nbsp;? Écris-nous.</h2>
            <p className="lead">Pas de formulaire, pas de mail qui se perd. Tu nous écris sur WhatsApp, une vraie personne de l&apos;équipe Cinémergence te répond.</p>
            <ol className="steps">
              <li><b>Tu nous écris sur WhatsApp</b>Ton niveau, tes questions, tes disponibilités.</li>
              <li><b>On te répond sous 24h</b>Pour vérifier que la masterclass te correspond.</li>
              <li><b>Tu reçois ton lien de réservation</b>Paiement sécurisé Stripe, en une fois ou en 3× sans frais.</li>
            </ol>
            <figure className="pull wa-pull"><div><div className="stars" aria-label="5 sur 5">★★★★★</div><blockquote>Ce que j&apos;ai apprécié : les retours précis et concrets. On comprend vite ce qui fonctionne et ce qui sonne faux.</blockquote><cite><b>Mehdi, 29 ans, en reconversion</b> · Stage Bande Démo Cinéma</cite></div></figure>
          </div>
          <div className="wa-card">
            <div className="wa-top">
              <div className="wa-av"><img decoding="async" src={img("logo-cinemergence.png")} alt="" width={455} height={160} /></div>
              <div><b>Cinémergence</b><small><span className="wa-dot" />Réponse sous 24h</small></div>
              <span className="wa-ico"><WhatsAppIcon /></span>
            </div>
            <div className="wa-chat" aria-hidden="true">
              <p className="bub in">Salut 👋 Une question sur la masterclass avec Kheiron ? Écris-nous, on te répond perso.</p>
              <p className="bub out">Bonjour ! Je suis intéressé·e par la masterclass stand-up 🎤<span className="tick">✓✓</span></p>
              <p className="bub in typing"><i /><i /><i /></p>
            </div>
            <a className="wa-num" href={whatsAppLink(WA_INTRO)} target="_blank" rel="noopener" onClick={onWhatsApp}><small>Appuie sur le numéro pour ouvrir WhatsApp</small>+33 7 69 18 55 94</a>
            <a className="btn wa-btn" href={whatsAppLink(WA_INTRO)} target="_blank" rel="noopener" onClick={onWhatsApp}><WhatsAppIcon />Écrire sur WhatsApp</a>
            <p className="wa-q">Ou commence par une question toute prête :</p>
            <div className="wa-chips">
              {WA_CHIPS.map(([label, text]) => (
                <a key={label} className="wa-chip" href={whatsAppLink(text)} target="_blank" rel="noopener" onClick={onWhatsApp}>{label}</a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="plateau-section" id="plateau" aria-label="Photos de tournage">
        <div className="wrap">
          <div>
            <span className="eyebrow">Sur le plateau</span>
            <h2>Nos élèves, en conditions réelles de tournage.</h2>
          </div>
          <KheironPlateauShow
            photos={PLATEAU.map(([file, alt]) => ({ src: img(`plateau/${file}`), alt }))}
          />
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div>
            <img decoding="async" className="flogo" src={img("logo-cinemergence.png")} alt="Cinémergence" width={455} height={160} loading="lazy" />
            © 2026 Cinémergence · Association loi 1901 · SIREN 988 939 112 · Organisme de formation déclaré · NDA 117 888 658 78 (DREETS Île-de-France)<br />
            Certifié Qualiopi · La certification qualité a été délivrée au titre de la catégorie d&apos;action suivante : actions de formation.
          </div>
          <div className="sign serif">Former. Révéler. Faire émerger.</div>
          <div className="trust-row" style={{ marginTop: 0 }}>
            <Qualiopi />
            <span><b>WhatsApp</b>+33 7 69 18 55 94</span>
          </div>
          <div><a href="/mentions-legales">Mentions légales</a> · <a href="/cgv">CGV</a> · <a href="/confidentialite">Confidentialité</a></div>
        </div>
      </footer>

      <div className="sticky">
        <small>Masterclass avec Kheiron<br /><b>{short} · 20 places</b></small>
        <a href="#tarif" className="btn btn-primary btn-alive">Je me lance</a>
      </div>
    </div>
  );
}

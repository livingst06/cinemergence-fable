#!/usr/bin/env python3
"""Parse Cinémergence formation DOCX fiches → src/lib/formations-catalog.ts"""

from __future__ import annotations

import json
import re
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET

DOCX_DIR = Path("/home/livingst/Documents/dev-docs/cinemergence/formations")
OUT = Path("/home/livingst/dev/cinemergence-fable/src/lib/formations-catalog.ts")

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"

# File stem → metadata overrides
META: dict[str, dict] = {
    "Formation_Castings_Auditions_35h": {
        "slug": "formation-castings-auditions",
        "pole": "Jeu",
        "titreCourt": "Castings & auditions",
        "audience": "intermittent",
        "prioritaire": False,
    },
    "Formation_Comedien_Face_Action_35h": {
        "slug": "formation-comedien-face-action",
        "pole": "Jeu",
        "titreCourt": "Comédien face à l'action",
        "audience": "intermittent",
        "prioritaire": False,
    },
    "Formation_Confiance_Jeu_Acteur_Entreprise_14h": {
        "slug": "formation-confiance-jeu-acteur-entreprise",
        "pole": "Entreprise",
        "titreCourt": "Confiance par le jeu d'acteur",
        "audience": "entreprise",
        "prioritaire": False,
    },
    "Formation_Contenus_Verticaux_Promo_21h": {
        "slug": "formation-contenus-verticaux-promo",
        "pole": "Technique",
        "titreCourt": "Contenus verticaux promo",
        "audience": "intermittent",
        "prioritaire": False,
    },
    "Formation_Doublage_Voix_35h": {
        "slug": "formation-doublage-voix",
        "pole": "Jeu",
        "titreCourt": "Doublage et voix",
        "audience": "intermittent",
        "prioritaire": False,
    },
    "Formation_Ecriture_Court_Metrage_35h": {
        "slug": "formation-ecriture-court-metrage",
        "pole": "Écriture",
        "titreCourt": "Écriture de court-métrage",
        "audience": "intermittent",
        "prioritaire": False,
    },
    "Formation_Etalonnage_DaVinci_35h": {
        "slug": "formation-etalonnage-davinci",
        "pole": "Technique",
        "titreCourt": "Étalonnage DaVinci",
        "audience": "intermittent",
        "prioritaire": False,
    },
    "Formation_IA_Production_Audiovisuelle_35h": {
        "slug": "formation-ia-production-audiovisuelle",
        "pole": "Technique",
        "titreCourt": "IA production audiovisuelle",
        "audience": "intermittent",
        "prioritaire": False,
    },
    "Formation_Jeu_Publicite_21h": {
        "slug": "formation-jeu-publicite",
        "pole": "Jeu",
        "titreCourt": "Jeu pour la publicité",
        "audience": "intermittent",
        "prioritaire": False,
    },
    "Formation_Jouer_Face_Camera_63h": {
        "slug": "formation-jouer-face-camera",
        "pole": "Jeu",
        "titreCourt": "Jouer face caméra",
        "audience": "intermittent",
        "prioritaire": True,
    },
    "Formation_Lumiere_Image_Chef_Operateur_63h": {
        "slug": "formation-lumiere-image",
        "pole": "Technique",
        "titreCourt": "Lumière et image",
        "audience": "intermittent",
        "prioritaire": False,
    },
    "Formation_Maquillage_Cinema_35h": {
        "slug": "formation-maquillage-cinema",
        "pole": "Technique",
        "titreCourt": "Maquillage cinéma",
        "audience": "intermittent",
        "prioritaire": False,
    },
    "Formation_Montage_Cinema_63h": {
        "slug": "formation-montage-cinema",
        "pole": "Technique",
        "titreCourt": "Montage cinéma",
        "audience": "intermittent",
        "prioritaire": False,
    },
    "Formation_Passer_A_La_Realisation_63h": {
        "slug": "formation-passer-a-la-realisation",
        "pole": "Réalisation",
        "titreCourt": "Passer à la réalisation",
        "audience": "intermittent",
        "prioritaire": False,
    },
    "Formation_Piloter_Carriere_Intermittent_21h": {
        "slug": "formation-piloter-carriere-intermittent",
        "pole": "Carrière",
        "titreCourt": "Piloter sa carrière",
        "audience": "intermittent",
        "prioritaire": False,
    },
    "Formation_Presentateur_Animateur_TV_Web_35h": {
        "slug": "formation-presentateur-animateur-tv-web",
        "pole": "Jeu",
        "titreCourt": "Présentateur-animateur",
        "audience": "intermittent",
        "prioritaire": False,
    },
    "Formation_Prise_De_Parole_Entreprise_14h": {
        "slug": "formation-prise-de-parole-entreprise",
        "pole": "Entreprise",
        "titreCourt": "Prise de parole face caméra",
        "audience": "entreprise",
        "prioritaire": False,
    },
    "Formation_Realiser_Documentaire_63h": {
        "slug": "formation-realiser-documentaire",
        "pole": "Réalisation",
        "titreCourt": "Réaliser un documentaire",
        "audience": "intermittent",
        "prioritaire": False,
    },
    "Formation_Realiser_Film_Court_63h": {
        "slug": "formation-realiser-film-court",
        "pole": "Réalisation",
        "titreCourt": "Réaliser son film court",
        "audience": "intermittent",
        "prioritaire": True,
    },
    "Formation_Stand_Up_35h": {
        "slug": "formation-stand-up",
        "pole": "Jeu",
        "titreCourt": "Écrire et jouer son stand-up",
        "audience": "intermittent",
        "prioritaire": False,
    },
    "Formation_Tourner_Bande_Demo_63h": {
        "slug": "formation-tourner-bande-demo",
        "pole": "Jeu",
        "titreCourt": "Tourner sa bande démo",
        "audience": "intermittent",
        "prioritaire": True,
    },
    "Formation_Video_Entreprise_35h": {
        "slug": "formation-video-entreprise",
        "pole": "Entreprise",
        "titreCourt": "Vidéo d'entreprise",
        "audience": "entreprise",
        "prioritaire": False,
    },
    "Formation_Video_Smartphone_Entreprise_21h": {
        "slug": "formation-video-smartphone-entreprise",
        "pole": "Entreprise",
        "titreCourt": "Vidéo smartphone",
        "audience": "entreprise",
        "prioritaire": False,
    },
}

JEUX_INTERVENANTS = {
    "formation-jouer-face-camera",
    "formation-tourner-bande-demo",
}


def paras_from_docx(path: Path) -> list[str]:
    z = ZipFile(path)
    root = ET.fromstring(z.read("word/document.xml"))
    out: list[str] = []
    for p in root.iter(f"{W}p"):
        parts = []
        for t in p.iter(f"{W}t"):
            if t.text:
                parts.append(t.text)
        if parts:
            out.append("".join(parts).strip())
    return [p for p in out if p]


def field_after(ps: list[str], label: str) -> str:
    for i, p in enumerate(ps):
        if p == label and i + 1 < len(ps):
            return ps[i + 1]
    return ""


def find_section_index(ps: list[str], *needles: str) -> int | None:
    """Find heading line containing any needle (case-insensitive). Prefer numbered headings."""
    lower_needles = [n.lower() for n in needles]
    for i, p in enumerate(ps):
        pl = p.lower()
        if any(n in pl for n in lower_needles) and (
            p[0].isdigit() or pl.startswith(tuple(lower_needles))
        ):
            return i
    for i, p in enumerate(ps):
        pl = p.lower()
        if any(n in pl for n in lower_needles):
            return i
    return None


def section_range(ps: list[str], start_prefix: str, end_prefixes: list[str]) -> list[str]:
    start = None
    for i, p in enumerate(ps):
        if p.startswith(start_prefix) or start_prefix.lower() in p.lower():
            # Prefer exact startswith for numbered sections
            if p.startswith(start_prefix) or (
                start_prefix[0].isdigit() and start_prefix.split(" ", 1)[-1].lower() in p.lower()
            ):
                start = i + 1
                break
    if start is None:
        return []
    end = len(ps)
    for i in range(start, len(ps)):
        for ep in end_prefixes:
            if ps[i].startswith(ep) or (
                len(ep) > 3 and ep.lower() in ps[i].lower() and ps[i][0].isdigit()
            ):
                return ps[start:i]
    return ps[start:end]


def section_by_keywords(
    ps: list[str], start_needles: list[str], end_needles: list[str]
) -> list[str]:
    start = find_section_index(ps, *start_needles)
    if start is None:
        return []
    end = len(ps)
    for i in range(start + 1, len(ps)):
        pl = ps[i].lower()
        # Numbered next section OR unnumbered heading matching end needles
        if any(n.lower() in pl for n in end_needles):
            if ps[i][0].isdigit() or any(pl.startswith(n.lower()) for n in end_needles):
                end = i
                break
    return ps[start + 1 : end]


def is_duration(s: str) -> bool:
    return bool(re.match(r"^\d+\s*h(\s*\d+)?$", s.strip(), re.I)) or bool(
        re.match(r"^\d+\s*h\s*\d+$", s.strip(), re.I)
    )


def clean_bullet(s: str) -> str:
    s = s.strip()
    s = re.sub(r"^[·•\-\u2022]\s*", "", s)
    s = re.sub(r"[;.\s]+$", "", s)
    return s.strip()


def parse_list_items(lines: list[str], skip_prefixes: tuple[str, ...] = ()) -> list[str]:
    items = []
    for line in lines:
        if not line or line in ("Séquence et contenu", "Durée"):
            continue
        if any(line.startswith(p) for p in skip_prefixes):
            continue
        if line.startswith("À l'issue") or line.startswith("À l’issue"):
            continue
        if is_duration(line):
            continue
        # Skip phase headers and day headers when collecting simple lists
        if re.match(r"^Phase\s+\d+", line):
            continue
        if re.match(r"^Jour\s+\d+", line.strip()):
            continue
        if line.startswith("Objectif de la journée"):
            continue
        cleaned = clean_bullet(line)
        if cleaned and cleaned not in items:
            items.append(cleaned)
    return items


def parse_objectifs(ps: list[str]) -> list[str]:
    lines = section_by_keywords(
        ps, ["Objectifs pédagogiques"], ["Compétences visées", "Programme détaillé"]
    )
    return parse_list_items(lines)


def parse_competences(ps: list[str]) -> list[str]:
    lines = section_by_keywords(
        ps, ["Compétences visées"], ["Programme détaillé", "Méthodes et moyens"]
    )
    return parse_list_items(lines)


def parse_bullets_section_kw(ps: list[str], start: list[str], ends: list[str]) -> list[str]:
    lines = section_by_keywords(ps, start, ends)
    return parse_list_items(lines)


def parse_paragraph_section_kw(ps: list[str], start: list[str], ends: list[str]) -> str:
    lines = section_by_keywords(ps, start, ends)
    text_lines = []
    for line in lines:
        if line in ("Séquence et contenu", "Durée"):
            continue
        if re.match(r"^Jour\s+\d+", line.strip()):
            break
        if re.match(r"^Phase\s+\d+", line):
            break
        text_lines.append(line)
    return "\n\n".join(text_lines).strip()


def parse_programme(ps: list[str]) -> list[dict]:
    lines = section_by_keywords(
        ps,
        ["Programme détaillé"],
        ["Méthodes et moyens pédagogiques", "Moyens techniques"],
    )
    days: list[dict] = []
    current: dict | None = None
    i = 0
    while i < len(lines):
        line = lines[i]
        # Phase headers — skip but keep reading
        if re.match(r"^Phase\s+\d+", line):
            i += 1
            continue
        # Day header: "  Jour 1 — Title (7 h)" or "Jour 1 — Title"
        m = re.match(
            r"^\s*Jour\s+(\d+)\s*[—–\-]\s*(.+?)(?:\s*\((\d+)\s*h\))?\s*$",
            line,
        )
        if m:
            if current:
                days.append(current)
            jour = int(m.group(1))
            titre = m.group(2).strip()
            # strip trailing duration in title if present
            titre = re.sub(r"\s*\(\d+\s*h\)\s*$", "", titre).strip()
            current = {
                "jour": jour,
                "titre": titre,
                "objectifJournee": None,
                "detail": None,
                "sequences": [],
            }
            i += 1
            continue

        if current is None:
            i += 1
            continue

        if line.startswith("Objectif de la journée"):
            obj = re.sub(r"^Objectif de la journée\s*:\s*", "", line).strip()
            current["objectifJournee"] = obj
            i += 1
            continue

        if line in ("Séquence et contenu", "Durée"):
            i += 1
            continue

        # Sequence pair: title then duration
        if i + 1 < len(lines) and is_duration(lines[i + 1]):
            seq_title = line
            # Often "Title — detail"
            if " — " in seq_title:
                t, d = seq_title.split(" — ", 1)
                current["sequences"].append(
                    {"titre": t.strip(), "duree": lines[i + 1], "detail": d.strip()}
                )
            else:
                current["sequences"].append(
                    {"titre": seq_title, "duree": lines[i + 1]}
                )
            i += 2
            continue

        # Orphan descriptive line before first sequence → detail
        if not current["sequences"] and not current.get("detail"):
            if not line.startswith("Objectif"):
                current["detail"] = line
        i += 1

    if current:
        days.append(current)

    # Build detail from sequences summary if missing
    for day in days:
        if not day.get("detail") and day.get("sequences"):
            day["detail"] = " · ".join(s["titre"] for s in day["sequences"][:3])
        # Drop null keys for cleaner output handling later
    return days


def extract_tarif_short(tarif_raw: str) -> str | None:
    m = re.search(r"([\d\s]+)\s*€", tarif_raw)
    if m:
        return f"{m.group(1).strip()} €"
    return None


def extract_effectif(effectif_raw: str) -> int | None:
    m = re.search(r"(\d+)\s*stagiaires?", effectif_raw, re.I)
    return int(m.group(1)) if m else None


def detect_financements(text: str, audience: str) -> list[str]:
    t = text.lower()
    fins: list[str] = []
    if "afdas" in t:
        fins.append("afdas")
    if "opco" in t:
        fins.append("opco")
    if re.search(r"\bcpf\b", t):
        fins.append("cpf")
    if "france travail" in t:
        fins.append("france-travail")
    if not fins:
        fins = ["opco"] if audience == "entreprise" else ["afdas"]
    return fins


def clean_placeholder(s: str) -> str:
    s = re.sub(r"\s*—\s*référent handicap\s*:\s*\[à compléter\]", "", s, flags=re.I)
    s = re.sub(r"\s*\[à compléter\][^.]*\.?", "", s)
    return s.strip()


def parse_fiche(path: Path) -> dict:
    stem = path.stem
    meta = META[stem]
    ps = paras_from_docx(path)

    titre_display = ""
    for i, p in enumerate(ps):
        if p == "Programme de formation professionnelle" and i + 1 < len(ps):
            titre_display = ps[i + 1]
            break

    sous_titre = ""
    for i, p in enumerate(ps):
        if p == titre_display and i + 1 < len(ps) and not ps[i + 1].startswith("1."):
            sous_titre = ps[i + 1]
            break

    intitule = field_after(ps, "Intitulé") or titre_display
    duree = field_after(ps, "Durée totale")
    modalite = field_after(ps, "Modalité") or "Présentiel"
    effectif_raw = field_after(ps, "Effectif")
    public = field_after(ps, "Public visé")
    prerequis = field_after(ps, "Prérequis")
    tarif_raw = field_after(ps, "Tarif")
    lieu = field_after(ps, "Lieu")
    delai = field_after(ps, "Délai d'accès") or field_after(ps, "Délai d’accès")
    access_id = field_after(ps, "Accessibilité")

    heures_m = re.search(r"(\d+)\s*heures?", duree)
    jours_m = re.search(r"(\d+)\s*journ", duree)

    contexte = parse_paragraph_section_kw(
        ps,
        ["Contexte et finalité"],
        ["Objectifs pédagogiques", "Sécurité, aptitude", "Compétences visées"],
    )

    objectifs = parse_objectifs(ps)
    competences = parse_competences(ps)
    programme = parse_programme(ps)

    methodes = parse_bullets_section_kw(
        ps, ["Méthodes et moyens pédagogiques"], ["Moyens techniques", "Encadrement"]
    )
    moyens = parse_bullets_section_kw(
        ps, ["Moyens techniques"], ["Encadrement", "Modalités d'évaluation", "Modalités d’évaluation"]
    )
    encadrement_lines = section_by_keywords(
        ps,
        ["Encadrement"],
        ["Modalités d'évaluation", "Modalités d’évaluation", "Livrables"],
    )
    encadrement = " ".join(encadrement_lines).strip()

    eval_lines = section_by_keywords(
        ps,
        ["Modalités d'évaluation", "Modalités d’évaluation"],
        ["Livrables", "Accessibilité"],
    )
    evaluation = " ".join(eval_lines).strip()

    livrables = parse_bullets_section_kw(
        ps, ["Livrables"], ["Accessibilité", "Modalités d'accès", "Modalités d’accès"]
    )
    access_lines = section_by_keywords(
        ps,
        ["Accessibilité aux personnes"],
        ["Modalités d'accès", "Modalités d’accès", "Indicateurs"],
    )
    accessibilite = clean_placeholder(" ".join(access_lines).strip() or access_id)

    finance_lines = section_by_keywords(
        ps,
        ["Modalités d'accès et financement", "Modalités d’accès et financement"],
        ["Indicateurs de résultats"],
    )
    modalites_financement = " ".join(finance_lines).strip()

    full_text = "\n".join(ps)
    fins = detect_financements(full_text + " " + tarif_raw, meta["audience"])

    # Accroche from sous-titre without duration clutter
    accroche = sous_titre or (contexte.split("\n\n")[0][:220] if contexte else intitule)
    intro = contexte.split("\n\n")[0] if contexte else intitule
    contexte_full = contexte

    tarif = extract_tarif_short(tarif_raw)
    livrable = livrables[0] if livrables else "Attestation de fin de formation"

    slug = meta["slug"]
    intervenants = (
        ["bibi-naceri", "edouard-montoute", "salim-kechiouche", "karina-testa"]
        if slug in JEUX_INTERVENANTS
        else []
    )

    faq = []
    if prerequis:
        faq.append(
            {
                "q": "Quels sont les prérequis ?",
                "r": prerequis,
            }
        )
    if fins:
        labels = {
            "afdas": "AFDAS",
            "opco": "OPCO",
            "cpf": "CPF",
            "france-travail": "France Travail",
        }
        faq.append(
            {
                "q": "Puis-je financer cette formation ?",
                "r": "Oui — dispositifs possibles : "
                + ", ".join(labels[f] for f in fins)
                + ". On t'accompagne pour monter le dossier.",
            }
        )
    if livrables:
        faq.append(
            {
                "q": "Qu'est-ce que je repars concrètement ?",
                "r": "Livrables : " + " ; ".join(livrables[:3]) + ".",
            }
        )

    format_label = (
        f"Formation intensive — {jours_m.group(1)} jours"
        if jours_m
        else "Formation professionnelle"
    )

    meta_title = f"{meta['titreCourt']} — Formation cinéma Paris | Cinémergence"
    meta_desc = (
        f"{intitule}. {duree}. École de formation Cinémergence à Paris."
    )[:160]

    return {
        "slug": slug,
        "pole": meta["pole"],
        "titre": intitule,
        "titreCourt": meta["titreCourt"],
        "sousTitre": sous_titre or None,
        "prioritaire": meta["prioritaire"],
        "audience": meta["audience"],
        "accroche": accroche,
        "publicCible": public,
        "livrable": livrable,
        "livrables": livrables or [livrable],
        "intro": intro,
        "contexteFinalite": contexte_full or None,
        "pourQui": public,
        "objectifs": objectifs,
        "competences": competences,
        "programme": programme,
        "duree": duree,
        "dureeHeures": int(heures_m.group(1)) if heures_m else None,
        "dureeJours": int(jours_m.group(1)) if jours_m else None,
        "format": format_label,
        "modalite": modalite,
        "effectifMax": extract_effectif(effectif_raw),
        "prerequis": prerequis or None,
        "lieu": lieu or None,
        "delaiAcces": delai or None,
        "tarif": tarif,
        "financements": fins,
        "methodesPedagogiques": methodes or None,
        "moyensTechniques": moyens or None,
        "encadrement": encadrement or None,
        "evaluation": evaluation or None,
        "accessibilite": accessibilite or None,
        "modalitesAccesFinancement": modalites_financement or None,
        "intervenants": intervenants,
        "faq": faq,
        "metaTitle": meta_title,
        "metaDescription": meta_desc,
    }


def ts_string(s: str | None) -> str:
    if s is None:
        return "undefined"
    return json.dumps(s, ensure_ascii=False)


def ts_str_array(items: list[str] | None) -> str:
    if not items:
        return "undefined"
    inner = ",\n".join(f"      {json.dumps(i, ensure_ascii=False)}" for i in items)
    return f"[\n{inner},\n    ]"


def emit_formation(f: dict) -> str:
    prog_parts = []
    for day in f["programme"]:
        seqs = day.get("sequences") or []
        if seqs:
            seq_lines = []
            for s in seqs:
                fields = [f'titre: {json.dumps(s["titre"], ensure_ascii=False)}']
                if s.get("duree"):
                    fields.append(f'duree: {json.dumps(s["duree"], ensure_ascii=False)}')
                if s.get("detail"):
                    fields.append(f'detail: {json.dumps(s["detail"], ensure_ascii=False)}')
                seq_lines.append("{ " + ", ".join(fields) + " }")
            seq_block = "[\n          " + ",\n          ".join(seq_lines) + ",\n        ]"
        else:
            seq_block = "undefined"

        fields = [
            f'jour: {day["jour"]}',
            f'titre: {json.dumps(day["titre"], ensure_ascii=False)}',
        ]
        if day.get("objectifJournee"):
            fields.append(
                f'objectifJournee: {json.dumps(day["objectifJournee"], ensure_ascii=False)}'
            )
        if day.get("detail"):
            fields.append(f'detail: {json.dumps(day["detail"], ensure_ascii=False)}')
        if seqs:
            fields.append(f"sequences: {seq_block}")
        prog_parts.append("      {\n        " + ",\n        ".join(fields) + ",\n      }")

    programme_ts = "[\n" + ",\n".join(prog_parts) + ",\n    ]" if prog_parts else "[]"

    faq_parts = []
    for item in f["faq"]:
        faq_parts.append(
            f'      {{ q: {json.dumps(item["q"], ensure_ascii=False)}, r: {json.dumps(item["r"], ensure_ascii=False)} }}'
        )
    faq_ts = "[\n" + ",\n".join(faq_parts) + ",\n    ]" if faq_parts else "[]"

    fins = ", ".join(json.dumps(x) for x in f["financements"])
    ints = ", ".join(json.dumps(x) for x in f["intervenants"])

    def opt_arr(key: str) -> str:
        val = f.get(key)
        if not val:
            return ""
        return f"    {key}: {ts_str_array(val)},\n"

    def opt_str(key: str) -> str:
        val = f.get(key)
        if not val:
            return ""
        return f"    {key}: {ts_string(val)},\n"

    def opt_num(key: str) -> str:
        val = f.get(key)
        if val is None:
            return ""
        return f"    {key}: {val},\n"

    return f"""  {{
    slug: {ts_string(f['slug'])},
    pole: {ts_string(f['pole'])},
    titre: {ts_string(f['titre'])},
    titreCourt: {ts_string(f['titreCourt'])},
{opt_str('sousTitre')}    prioritaire: {str(f['prioritaire']).lower()},
    audience: {ts_string(f['audience'])},
    accroche: {ts_string(f['accroche'])},
    publicCible: {ts_string(f['publicCible'])},
    livrable: {ts_string(f['livrable'])},
{opt_arr('livrables')}    intro: {ts_string(f['intro'])},
{opt_str('contexteFinalite')}    pourQui: {ts_string(f['pourQui'])},
    objectifs: {ts_str_array(f['objectifs'])},
{opt_arr('competences')}    programme: {programme_ts},
    duree: {ts_string(f['duree'])},
{opt_num('dureeHeures')}{opt_num('dureeJours')}    format: {ts_string(f['format'])},
{opt_str('modalite')}{opt_num('effectifMax')}{opt_str('prerequis')}{opt_str('lieu')}{opt_str('delaiAcces')}    tarif: {ts_string(f['tarif']) if f['tarif'] else 'null'},
    financements: [{fins}],
{opt_arr('methodesPedagogiques')}{opt_arr('moyensTechniques')}{opt_str('encadrement')}{opt_str('evaluation')}{opt_str('accessibilite')}{opt_str('modalitesAccesFinancement')}    intervenants: [{ints}],
    faq: {faq_ts},
    metaTitle: {ts_string(f['metaTitle'])},
    metaDescription: {ts_string(f['metaDescription'])},
  }}"""


def main() -> None:
    files = sorted(DOCX_DIR.glob("Formation_*.docx"))
    assert len(files) == 23, f"Expected 23, got {len(files)}"
    formations = []
    for path in files:
        assert path.stem in META, f"Missing META for {path.stem}"
        f = parse_fiche(path)
        assert f["objectifs"], f"No objectifs for {path.name}"
        assert f["programme"], f"No programme for {path.name}"
        formations.append(f)
        print(
            f"OK {f['slug']}: {len(f['objectifs'])} obj, "
            f"{len(f['programme'])} jours, {len(f.get('livrables') or [])} livrables"
        )

    body = ",\n".join(emit_formation(f) for f in formations)
    content = f"""import type {{ FormationData }} from "./formation-types";

/** Catalogue des 23 formations — généré depuis les fiches DOCX Qualiopi. */
export const formationsCatalog: FormationData[] = [
{body},
];
"""
    OUT.write_text(content, encoding="utf-8")
    print(f"Wrote {OUT} ({len(formations)} formations)")


if __name__ == "__main__":
    main()

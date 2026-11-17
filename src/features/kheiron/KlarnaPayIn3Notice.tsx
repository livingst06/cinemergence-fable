"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  KLARNA_MODAL_SUBTITLE,
  KLARNA_MODAL_TITLE,
  KLARNA_PAY_IN_3_WARNING,
  klarnaRepresentativeExample,
  KLARNA_SOLVENCY_AFTER,
  KLARNA_SOLVENCY_BEFORE,
  KLARNA_SOLVENCY_LINK,
  KLARNA_TERMS_URL,
  formatKlarnaEuros,
  klarnaInstallmentEuros,
  klarnaPlanExamples,
} from "@/lib/kheiron-offer";

const HOW_IT_WORKS = [
  { title: "Au moment du paiement, choisissez Klarna", detail: null },
  {
    title: "Choisissez votre plan de paiement",
    detail:
      "Différents plans de paiement peuvent être proposés en fonction du montant de l\u2019achat et de votre solvabilité.",
  },
  {
    title: "Terminez votre commande",
    detail: "Le montant sera débité en fonction du plan de paiement que vous avez choisi.",
  },
] as const;

function KlarnaBadge() {
  return <span className="klarna-badge">Klarna</span>;
}

export function KlarnaPayIn3Notice({ amountEuros }: { amountEuros: number }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const installment = formatKlarnaEuros(klarnaInstallmentEuros(amountEuros));
  const plans = klarnaPlanExamples(amountEuros);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open, mounted]);

  useEffect(() => {
    const dialog = dialogRef.current;
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, [mounted]);

  const close = () => setOpen(false);

  return (
    <div className="bnpl">
      <KlarnaBadge />
      <div className="bnpl-copy">
        <p className="bnpl-offer">
          3 paiements de {installment} à 0 % d&apos;intérêt avec Klarna{" "}
          <button
            type="button"
            className="bnpl-more"
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            En savoir plus
          </button>
        </p>
        <p className="bnpl-legal">{KLARNA_PAY_IN_3_WARNING}</p>
      </div>
      {mounted &&
        createPortal(
          <dialog
            ref={dialogRef}
            className="klarna-modal"
            aria-labelledby={titleId}
            onClose={close}
            onClick={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            <div className="klarna-modal-scroll">
              <button type="button" className="klarna-x" aria-label="Fermer" onClick={close}>
                ×
              </button>
              <div className="klarna-modal-brand">
                <KlarnaBadge />
              </div>
              <h2 id={titleId}>{KLARNA_MODAL_TITLE}</h2>
              <p className="klarna-sub">{KLARNA_MODAL_SUBTITLE}</p>
              <p className="klarna-plans-label">Exemples de plans</p>
              <ul className="klarna-plans">
                {plans.map((plan) => (
                  <li key={plan.detail} className="klarna-plan">
                    <div>
                      <span>{plan.title}</span>
                      <strong>{plan.detail}</strong>
                      {plan.fees ? <em>{plan.fees}</em> : null}
                    </div>
                    <span className="klarna-total">Total {plan.total}</span>
                  </li>
                ))}
              </ul>
              <p className="klarna-warn">{KLARNA_PAY_IN_3_WARNING}</p>
              <h3>Comment ça marche&nbsp;?</h3>
              <ol className="klarna-steps">
                {HOW_IT_WORKS.map((step) => (
                  <li key={step.title}>
                    <b>{step.title}</b>
                    {step.detail ? <span>{step.detail}</span> : null}
                  </li>
                ))}
              </ol>
              <aside className="klarna-example">
                <b>Exemples représentatifs</b>
                <p>{klarnaRepresentativeExample(amountEuros)}</p>
              </aside>
              <p className="klarna-fine">
                {KLARNA_SOLVENCY_BEFORE}
                <a href={KLARNA_TERMS_URL} target="_blank" rel="noopener noreferrer">
                  {KLARNA_SOLVENCY_LINK}
                </a>
                {KLARNA_SOLVENCY_AFTER}
              </p>
            </div>
            <button type="button" className="klarna-done" onClick={close}>
              Fermer
            </button>
          </dialog>,
          document.body,
        )}
    </div>
  );
}

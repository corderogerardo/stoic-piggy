'use client';

import { Piggy } from '@stoicpiggy/ui';
import { type ReactNode, useState } from 'react';
import type { Lang } from '@/lib/content';

const UI = {
  es: { home: '← Inicio', effective: 'Vigente desde' },
  en: { home: '← Home', effective: 'Effective' },
} as const;

/** Shared chrome for the Privacy Policy + Terms pages: ES/EN toggle (Spanish
 *  default, matching the site), back-to-home header, and a readable column.
 *  Both language bodies are passed in; only the active one renders. */
export function LegalPage({
  title,
  effectiveDate,
  bodies,
}: {
  title: Record<Lang, string>;
  effectiveDate: Record<Lang, string>;
  bodies: Record<Lang, ReactNode>;
}) {
  const [lang, setLang] = useState<Lang>('es');
  const ui = UI[lang];

  const langBtn = (active: boolean) =>
    `cursor-pointer rounded-full px-3 py-1.5 text-[11px] font-extrabold tracking-[0.5px] ${
      active ? 'bg-navy text-cream' : 'bg-transparent text-navy/60'
    }`;

  return (
    <div className="min-h-screen bg-canvas text-navy">
      <header className="border-b border-navy/10">
        <div className="mx-auto flex max-w-[760px] items-center justify-between gap-3 px-[26px] py-5">
          <a href="/" className="flex items-center gap-[10px]">
            <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-accent">
              <Piggy mood="zen" size={22} />
            </span>
            <span className="text-[15px] font-extrabold">Stoic Piggy</span>
          </a>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-full border border-navy/10 p-0.5">
              <button
                type="button"
                onClick={() => setLang('es')}
                className={langBtn(lang === 'es')}
              >
                ES
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={langBtn(lang === 'en')}
              >
                EN
              </button>
            </div>
            <a href="/" className="text-[13px] font-bold text-navy/60 hover:text-navy">
              {ui.home}
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[760px] px-[26px] py-[clamp(36px,6vw,72px)]">
        <h1 className="m-0 text-[clamp(28px,4vw,42px)] font-extrabold leading-[1.1] tracking-[-1px]">
          {title[lang]}
        </h1>
        <p className="mt-3 text-[13px] text-navy/50">
          {ui.effective} {effectiveDate[lang]}
        </p>
        <div className="legal-body mt-8 text-[15px] leading-[1.7] text-navy/85">{bodies[lang]}</div>
      </main>
    </div>
  );
}

/** Section heading used inside a LegalPage. */
export function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-10 mb-3 text-[19px] font-extrabold tracking-[-0.3px] text-navy">
      {children}
    </h2>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mb-4">{children}</p>;
}

export function UL({ children }: { children: ReactNode }) {
  return <ul className="mb-4 list-disc space-y-1.5 pl-6">{children}</ul>;
}

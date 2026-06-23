'use client';

import { Piggy } from '@stoicpiggy/ui';
import { useState } from 'react';
import { CONTENT, type Lang } from '@/lib/content';

const STEP_ICONS = ['list-ul', 'check-square-o', 'bank'];
const STEP_ICON_BG = ['bg-teal/40', 'bg-teal/40', 'bg-accent'];
const STEP_ICON_FG = ['text-accent', 'text-accent', 'text-cream'];
const FEAT_BG = [
  'bg-accent/15',
  'bg-teal/40',
  'bg-blue/20',
  'bg-accent/15',
  'bg-teal/40',
  'bg-blue/20',
];
const FEAT_FG = [
  'text-accent',
  'text-accent',
  'text-blue',
  'text-accent',
  'text-accent',
  'text-blue',
];

export function LandingPage() {
  const [lang, setLang] = useState<Lang>('es');
  const [openFaq, setOpenFaq] = useState(0);
  const c = CONTENT[lang];

  const langBtn = (active: boolean) =>
    `cursor-pointer rounded-full px-3 py-1.5 text-[11px] font-extrabold tracking-[0.5px] ${
      active ? 'bg-navy text-cream' : 'bg-transparent text-navy/60'
    }`;

  return (
    <div className="w-full overflow-x-hidden bg-canvas text-navy">
      {/* ============ NAV ============ */}
      <header className="sticky top-0 z-[100] border-b border-navy/10 bg-canvas/90 backdrop-blur-[12px]">
        <nav className="mx-auto flex max-w-[1180px] items-center justify-between gap-5 px-[26px] py-[15px]">
          <a href="#top" className="flex items-center gap-[11px]">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
              <Piggy mood="zen" size={28} />
            </span>
            <span className="text-[18px] font-extrabold tracking-[-0.3px]">Stoic Piggy</span>
          </a>
          <div className="flex items-center gap-[30px]">
            <div className="hidden items-center gap-[26px] md:flex">
              <a href="#how" className="text-sm font-bold text-navy/70 hover:text-navy">
                {c.nav.how}
              </a>
              <a href="#features" className="text-sm font-bold text-navy/70 hover:text-navy">
                {c.nav.features}
              </a>
              <a href="#faq" className="text-sm font-bold text-navy/70 hover:text-navy">
                {c.nav.faq}
              </a>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-navy/[0.07] p-[3px]">
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
            <a
              href="#how"
              className="rounded-[11px] bg-navy px-[19px] py-[11px] text-[13.5px] font-extrabold text-cream"
            >
              {c.nav.cta}
            </a>
          </div>
        </nav>
      </header>

      {/* ============ HERO ============ */}
      <section
        id="top"
        className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-12 px-[26px] pt-[clamp(40px,7vw,86px)] pb-[clamp(34px,5vw,60px)]"
      >
        <div className="min-w-[300px] flex-[1_1_420px]">
          <div className="mb-[22px] inline-flex items-center gap-2 rounded-full bg-teal/40 px-[14px] py-2 text-[11px] font-extrabold tracking-[0.6px]">
            <i className="fa fa-leaf text-accent" />
            {c.hero.eyebrow}
          </div>
          <h1 className="m-0 text-[clamp(38px,5.4vw,62px)] font-extrabold leading-[1.04] tracking-[-1.5px]">
            {c.hero.title1}
            <br />
            <span className="text-accent">{c.hero.title2}</span>
          </h1>
          <p className="mt-[22px] max-w-[500px] text-[clamp(16px,1.6vw,18.5px)] leading-[1.6] text-navy/70">
            {c.hero.sub}
          </p>
          <div className="mt-8 flex flex-wrap gap-[13px]">
            <a
              href="#how"
              className="inline-flex items-center gap-[9px] rounded-[14px] bg-accent px-[26px] py-4 text-base font-extrabold text-cream"
            >
              {c.hero.cta1}
              <i className="fa fa-arrow-right" />
            </a>
            <a
              href="#how"
              className="inline-flex items-center gap-[9px] rounded-[14px] border-2 border-navy px-6 py-[14px] text-base font-extrabold text-navy"
            >
              {c.hero.cta2}
            </a>
          </div>
          <div className="mt-[30px] flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-[9px] text-[13.5px] font-semibold text-navy/60">
              <i className="fa fa-check-circle text-[15px] text-blue" />
              {c.hero.t1}
            </div>
            <div className="flex items-center gap-[9px] text-[13.5px] font-semibold text-navy/60">
              <i className="fa fa-check-circle text-[15px] text-blue" />
              {c.hero.t2}
            </div>
          </div>
        </div>

        {/* phone mockup */}
        <div className="flex min-w-[300px] flex-[1_1_340px] justify-center">
          <div className="relative">
            <div className="absolute -inset-x-10 -inset-y-[30px] rounded-full bg-teal/30 blur-[8px]" />
            <div
              className="relative h-[610px] w-[300px] rounded-[44px] bg-[#0b1320] p-[9px] shadow-[0_40px_80px_rgba(11,19,32,0.4)]"
              style={{ animation: 'spl-floaty 6s ease-in-out infinite' }}
            >
              <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-canvas">
                <div className="absolute left-1/2 top-0 z-[5] h-6 w-[118px] -translate-x-1/2 rounded-b-[14px] bg-[#0b1320]" />
                <div className="px-[18px] pb-4 pt-10">
                  <div className="mb-[14px] flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-semibold text-navy/60">{c.mock.hi}</div>
                      <div className="text-[21px] font-extrabold">Marco</div>
                    </div>
                    <span className="inline-flex items-center gap-[5px] rounded-full bg-accent px-[11px] py-[6px] text-[9px] font-extrabold tracking-[0.5px] text-cream">
                      <i className="fa fa-bolt" />
                      {c.mock.level}
                    </span>
                  </div>
                  <div className="mb-3 rounded-[20px] bg-navy p-[17px] text-cream">
                    <div className="mb-2 text-[9px] font-extrabold tracking-[0.6px] text-teal/85">
                      {c.mock.bal}
                    </div>
                    <div className="font-mono text-[34px] font-bold leading-none tracking-[-1.5px]">
                      $340
                    </div>
                  </div>
                  <div className="mb-3 rounded-[18px] border-2 border-navy p-[15px]">
                    <div className="mb-[9px] text-[9px] font-extrabold tracking-[0.6px] text-navy/50">
                      {c.mock.tasksLabel}
                    </div>
                    <div className="mb-[11px] flex items-center gap-[11px]">
                      <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-teal/40">
                        <i className="fa fa-trash-o text-[15px] text-accent" />
                      </span>
                      <div className="flex-1 text-[13px] font-extrabold leading-tight">
                        {c.mock.t1}
                      </div>
                      <span className="font-mono text-sm font-bold text-blue">+$20</span>
                    </div>
                    <div className="flex items-center gap-[11px]">
                      <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-teal/40">
                        <i className="fa fa-book text-[15px] text-accent" />
                      </span>
                      <div className="flex-1 text-[13px] font-extrabold leading-tight">
                        {c.mock.t2}
                      </div>
                      <span className="font-mono text-[13px] font-bold text-blue">+50 XP</span>
                    </div>
                  </div>
                  <div className="relative flex items-center gap-[11px] overflow-hidden rounded-[18px] bg-accent px-4 py-[14px] text-cream">
                    <div className="absolute -bottom-3 -right-[10px] opacity-90">
                      <Piggy mood="happy" size={58} />
                    </div>
                    <div className="max-w-[150px] text-[12.5px] font-extrabold leading-[1.3]">
                      {c.mock.streak}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRUST STRIP ============ */}
      <section className="border-y border-navy/10 bg-white">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-center gap-x-[44px] gap-y-[14px] px-[26px] py-[22px]">
          <span className="text-[11px] font-extrabold tracking-[0.6px] text-navy/45">
            {c.trust.label}
          </span>
          {c.trust.items.map((t) => (
            <div
              key={t.label}
              className="flex items-center gap-[9px] text-sm font-bold text-navy/60"
            >
              <i className={`fa fa-${t.icon} text-blue`} />
              {t.label}
            </div>
          ))}
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how" className="bg-teal/[0.18]">
        <div className="mx-auto max-w-[1180px] px-[26px] py-[clamp(56px,7vw,92px)]">
          <div className="mx-auto mb-[50px] max-w-[640px] text-center">
            <div className="mb-[14px] text-xs font-extrabold tracking-[0.8px] text-accent">
              {c.how.eyebrow}
            </div>
            <h2 className="m-0 text-[clamp(30px,3.6vw,44px)] font-extrabold leading-[1.08] tracking-[-1px]">
              {c.how.title}
            </h2>
            <p className="mt-4 text-[17px] leading-[1.55] text-navy/70">{c.how.sub}</p>
          </div>
          <div className="flex flex-wrap gap-[22px]">
            {c.how.steps.map((s, i) => (
              <div
                key={s.title}
                className="flex-[1_1_280px] rounded-[24px] border-2 border-navy bg-canvas p-7"
              >
                <div className="mb-4 flex items-center gap-[14px]">
                  <span
                    className={`flex h-[54px] w-[54px] items-center justify-center rounded-[15px] ${STEP_ICON_BG[i]}`}
                  >
                    <i className={`fa fa-${STEP_ICONS[i]} text-[23px] ${STEP_ICON_FG[i]}`} />
                  </span>
                  <span className="font-mono text-[34px] font-bold text-navy/15">{`0${i + 1}`}</span>
                </div>
                <div className="mb-[7px] text-[11px] font-extrabold tracking-[0.5px] text-accent">
                  {s.tag}
                </div>
                <h3 className="m-0 mb-[9px] text-[21px] font-extrabold leading-[1.15]">
                  {s.title}
                </h3>
                <p className="m-0 text-[14.5px] leading-[1.6] text-navy/70">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TASKS -> MONEY ============ */}
      <section className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-[54px] px-[26px] py-[clamp(56px,7vw,92px)]">
        <div className="min-w-[300px] flex-[1_1_360px]">
          <div className="mb-[14px] text-xs font-extrabold tracking-[0.8px] text-accent">
            {c.flow.eyebrow}
          </div>
          <h2 className="m-0 text-[clamp(28px,3.4vw,42px)] font-extrabold leading-[1.1] tracking-[-1px]">
            {c.flow.title}
          </h2>
          <p className="mb-[26px] mt-[18px] max-w-[480px] text-[16.5px] leading-[1.6] text-navy/70">
            {c.flow.sub}
          </p>
          <div className="flex flex-col gap-[15px]">
            {c.flow.points.map((p) => (
              <div key={p.b} className="flex items-start gap-[13px]">
                <span className="mt-px flex h-[26px] w-[26px] items-center justify-center rounded-lg bg-accent/15">
                  <i className="fa fa-check text-xs text-accent" />
                </span>
                <div className="text-[15.5px] leading-[1.5] text-navy/80">
                  <b className="text-navy">{p.b}</b> {p.t}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* flow visual */}
        <div className="flex min-w-[300px] flex-[1_1_360px] flex-col gap-4">
          <div className="rounded-[22px] bg-navy p-[22px] text-cream">
            <div className="mb-[14px] flex items-center justify-between">
              <span className="text-[10px] font-extrabold tracking-[0.6px] text-teal/85">
                {c.flow.cardLabel}
              </span>
              <span className="rounded-full bg-white/15 px-[10px] py-[5px] text-[9px] font-extrabold tracking-[0.5px]">
                {c.flow.cardTag}
              </span>
            </div>
            <div className="flex items-center gap-[13px]">
              <span className="flex h-[46px] w-[46px] items-center justify-center rounded-[13px] bg-teal/20">
                <i className="fa fa-paint-brush text-[19px] text-teal" />
              </span>
              <div className="flex-1">
                <div className="text-base font-extrabold">{c.flow.taskName}</div>
                <div className="text-xs text-teal/80">{c.flow.taskMeta}</div>
              </div>
              <span className="font-mono text-[20px] font-bold text-accent">+$50</span>
            </div>
          </div>
          <div className="flex justify-center text-navy/30">
            <i className="fa fa-long-arrow-down text-[22px]" />
          </div>
          <div className="flex items-center gap-[14px] rounded-[22px] border-2 border-navy bg-canvas p-5">
            <div className="flex-none">
              <Piggy mood="thinking" size={50} />
            </div>
            <div className="flex-1 text-sm leading-[1.5] text-navy/80">{c.flow.coachMsg}</div>
          </div>
          <div className="flex items-center justify-between gap-[14px] rounded-[22px] bg-accent px-[22px] py-5 text-cream">
            <div>
              <div className="text-[11px] font-extrabold tracking-[0.5px] opacity-90">
                {c.flow.goalLabel}
              </div>
              <div className="mt-0.5 text-[18px] font-extrabold">{c.flow.goalName}</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[22px] font-bold">68%</div>
              <div className="text-[10px] font-bold opacity-85">$340 / $500</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section id="features" className="border-y border-navy/10 bg-white">
        <div className="mx-auto max-w-[1180px] px-[26px] py-[clamp(56px,7vw,92px)]">
          <div className="mx-auto mb-12 max-w-[600px] text-center">
            <div className="mb-[14px] text-xs font-extrabold tracking-[0.8px] text-accent">
              {c.feat.eyebrow}
            </div>
            <h2 className="m-0 text-[clamp(30px,3.6vw,44px)] font-extrabold leading-[1.08] tracking-[-1px]">
              {c.feat.title}
            </h2>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[18px]">
            {c.features.map((f, i) => (
              <div key={f.title} className="rounded-[20px] border border-navy/10 bg-canvas p-6">
                <span
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-[13px] ${FEAT_BG[i]}`}
                >
                  <i className={`fa fa-${f.icon} text-[20px] ${FEAT_FG[i]}`} />
                </span>
                <h3 className="m-0 mb-2 text-[18px] font-extrabold leading-tight">{f.title}</h3>
                <p className="m-0 text-sm leading-[1.55] text-navy/70">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ STOIC ANGLE ============ */}
      <section className="bg-navy text-cream">
        <div className="mx-auto max-w-[980px] px-[26px] py-[clamp(60px,8vw,104px)] text-center">
          <div
            className="mb-[22px] inline-block"
            style={{ animation: 'spl-floaty 5s ease-in-out infinite' }}
          >
            <Piggy mood="zen" size={96} />
          </div>
          <div className="mb-5 text-xs font-extrabold tracking-[0.9px] text-teal">
            {c.stoic.eyebrow}
          </div>
          <h2 className="mx-auto m-0 max-w-[760px] text-[clamp(26px,3.4vw,40px)] font-extrabold leading-[1.22] tracking-[-0.6px]">
            {c.stoic.quote}
          </h2>
          <div className="mt-[22px] text-[13px] font-extrabold tracking-[0.6px] text-teal">
            {c.stoic.author}
          </div>
          <p className="mx-auto mt-[30px] max-w-[600px] text-base leading-[1.65] text-cream/80">
            {c.stoic.body}
          </p>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="mx-auto max-w-[1180px] px-[26px] py-[clamp(56px,7vw,92px)]">
        <div className="mx-auto mb-12 max-w-[600px] text-center">
          <div className="mb-[14px] text-xs font-extrabold tracking-[0.8px] text-accent">
            {c.testi.eyebrow}
          </div>
          <h2 className="m-0 text-[clamp(30px,3.6vw,44px)] font-extrabold leading-[1.08] tracking-[-1px]">
            {c.testi.title}
          </h2>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(290px,1fr))] gap-[18px]">
          {c.testi.items.map((t) => (
            <div
              key={t.name}
              className="flex flex-col rounded-[22px] border-2 border-navy bg-canvas p-[26px]"
            >
              <div className="mb-[14px] text-[13px] tracking-[2px] text-accent">★★★★★</div>
              <p className="m-0 mb-5 flex-1 text-[15.5px] leading-[1.6] text-navy/85">{t.quote}</p>
              <div className="flex items-center gap-3">
                <span
                  className="flex h-11 w-11 flex-none items-center justify-center rounded-full text-base font-extrabold text-cream"
                  style={{ background: t.avBg }}
                >
                  {t.initial}
                </span>
                <div>
                  <div className="text-[14.5px] font-extrabold">{t.name}</div>
                  <div className="text-[12.5px] text-navy/60">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" className="mx-auto max-w-[760px] px-[26px] py-[clamp(56px,7vw,92px)]">
        <div className="mb-[42px] text-center">
          <div className="mb-[14px] text-xs font-extrabold tracking-[0.8px] text-accent">
            {c.faq.eyebrow}
          </div>
          <h2 className="m-0 text-[clamp(30px,3.6vw,44px)] font-extrabold leading-[1.08] tracking-[-1px]">
            {c.faq.title}
          </h2>
        </div>
        <div className="flex flex-col gap-3">
          {c.faq.items.map((f, i) => {
            const open = openFaq === i;
            return (
              <button
                type="button"
                key={f.q}
                onClick={() => setOpenFaq(open ? -1 : i)}
                className="cursor-pointer rounded-[18px] border border-navy/15 bg-canvas px-[22px] py-5 text-left"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-base font-extrabold leading-[1.3]">{f.q}</span>
                  <i
                    className={`fa fa-${open ? 'minus' : 'plus'} flex-none text-[15px] text-accent`}
                  />
                </div>
                {open && (
                  <p className="m-0 mt-[13px] text-[14.5px] leading-[1.6] text-navy/70">{f.a}</p>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* ============ FOOTER CTA ============ */}
      <footer className="bg-navy text-cream">
        <div className="mx-auto max-w-[920px] px-[26px] py-[clamp(56px,7vw,96px)] text-center">
          <h2 className="mx-auto m-0 max-w-[640px] text-[clamp(30px,4vw,50px)] font-extrabold leading-[1.08] tracking-[-1px]">
            {c.footer.title}
          </h2>
          <p className="mx-auto mt-5 max-w-[520px] text-[17px] leading-[1.55] text-cream/80">
            {c.footer.sub}
          </p>
          <div className="mt-[34px] flex flex-wrap justify-center gap-[13px]">
            <a
              href="#top"
              className="inline-flex items-center gap-[9px] rounded-[14px] bg-accent px-7 py-4 text-base font-extrabold text-cream"
            >
              {c.footer.cta1}
              <i className="fa fa-arrow-right" />
            </a>
            <a
              href="#how"
              className="inline-flex items-center gap-[9px] rounded-[14px] border-2 border-cream/40 px-[26px] py-[14px] text-base font-extrabold text-cream"
            >
              {c.footer.cta2}
            </a>
          </div>
        </div>
        <div className="border-t border-cream/15">
          <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-[14px] px-[26px] py-6">
            <div className="flex items-center gap-[10px]">
              <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-accent">
                <Piggy mood="zen" size={22} />
              </span>
              <span className="text-[15px] font-extrabold">Stoic Piggy</span>
            </div>
            <span className="text-[12.5px] text-cream/55">{c.footer.legal}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

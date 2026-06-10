import { useState } from 'react';
import { useResumeStore } from '../../store';
import type { ResumeData } from '../../types';

// ─── Types ───────────────────────────────────────────────────────────────────

type Status = 'pass' | 'warn' | 'fail';

interface Check {
  id: string;
  label: string;
  status: Status;
  detail: string;
  earned: number;
  max: number;
}

interface Category {
  id: string;
  label: string;
  checks: Check[];
  earned: number;
  max: number;
}

// ─── Analysis engine ─────────────────────────────────────────────────────────

const STRONG_VERBS = new Set([
  'achieved','administered','advanced','analyzed','architected','automated',
  'built','championed','collaborated','consolidated','created','cut',
  'decreased','delivered','deployed','designed','developed','directed',
  'drove','eliminated','enabled','engineered','established','executed',
  'founded','generated','grew','guided','implemented','improved','increased',
  'integrated','launched','led','leveraged','maintained','managed','migrated',
  'modernized','monitored','negotiated','optimized','orchestrated','overhauled',
  'pioneered','produced','rebuilt','reduced','refactored','resolved',
  'restructured','scaled','secured','shipped','simplified','spearheaded',
  'standardized','streamlined','transformed','upgraded','validated','wrote',
]);

const FILLER_RE = [
  /^helped\b/i, /^assisted\b/i, /^worked on\b/i,
  /^was responsible/i, /^responsible for\b/i,
  /^participated\b/i, /^involved\b/i, /^supported\b/i,
];

const DATE_MM_YYYY = /^\d{2}\/\d{4}$/;
const NUM_IN_BULLET = /\b\d[\d,.]*\s*[%$kKmMxX]?|\$[\d,.]+|[\d,.]+[%x]/;
const PRONOUN_RE = /\b(I|me|my|mine|myself|we|our|us)\b/;
const SPECIAL_CHAR_RE = /[→←↑↓▸•◦►»]/u;

function firstWord(s: string) {
  return (s.trim().split(/[\s,(.\-]+/)[0] ?? '').toLowerCase();
}

function mk(
  id: string, label: string, status: Status,
  detail: string, earned: number, max: number,
): Check {
  return { id, label, status, detail, earned, max };
}

function analyzeResume(r: ResumeData): { score: number; categories: Category[] } {
  const validExp  = r.experience.filter(e => e.company || e.title);
  const allBullets = validExp.flatMap(e => e.bullets.filter(b => b.trim()));
  const validProj  = r.projects.filter(p => p.name || p.description);

  // ── Contact (15 pts) ─────────────────────────────────────────────────────
  const contact: Check[] = [
    mk('name',     'Full name',          r.contact.name     ? 'pass' : 'fail', r.contact.name     ? '' : 'Add your full name.',                         r.contact.name     ? 3 : 0, 3),
    mk('email',    'Email address',      r.contact.email    ? 'pass' : 'fail', r.contact.email    ? '' : 'Add a professional email address.',            r.contact.email    ? 2 : 0, 2),
    mk('phone',    'Phone number',       r.contact.phone    ? 'pass' : 'fail', r.contact.phone    ? '' : 'Add a phone number.',                          r.contact.phone    ? 2 : 0, 2),
    mk('location', 'Location',           r.contact.location ? 'pass' : 'warn', r.contact.location ? '' : 'Add city / region.',                          r.contact.location ? 2 : 0, 2),
    mk('linkedin', 'LinkedIn URL',       r.contact.linkedin ? 'pass' : 'warn', r.contact.linkedin ? '' : 'Most ATS systems expect a LinkedIn URL.',      r.contact.linkedin ? 3 : 0, 3),
    mk('github',   'GitHub / Portfolio', r.contact.github   ? 'pass' : 'warn', r.contact.github   ? '' : 'Add a GitHub or portfolio link.',             r.contact.github   ? 3 : 0, 3),
  ];

  // ── Sections (10 pts) ────────────────────────────────────────────────────
  const hasEdu    = r.education.some(e => e.degree || e.university);
  const hasSkills = Object.values(r.skills).some(v => v.trim());
  const has2Proj  = validProj.length >= 2;
  const sections: Check[] = [
    mk('sec-exp',    'Work Experience present',  validExp.length > 0 ? 'pass' : 'fail', validExp.length > 0 ? '' : 'Add at least one work experience entry.',     validExp.length > 0 ? 3 : 0, 3),
    mk('sec-edu',    'Education present',        hasEdu    ? 'pass' : 'fail', hasEdu    ? '' : 'Add your education details.',                                      hasEdu    ? 2 : 0, 2),
    mk('sec-skills', 'Skills section present',   hasSkills ? 'pass' : 'fail', hasSkills ? '' : 'Add a skills section.',                                            hasSkills ? 2 : 0, 2),
    mk('sec-proj',   '2+ Projects',              has2Proj  ? 'pass' : 'warn', has2Proj  ? '' : 'Add at least 2 projects with descriptions and links.',             has2Proj  ? 3 : 0, 3),
  ];

  // ── Format (15 pts) ──────────────────────────────────────────────────────
  const allDates = validExp.flatMap(e => [e.startDate, e.endDate].filter(Boolean));
  const badDates = allDates.filter(d => d && !DATE_MM_YYYY.test(d) && !/^\d{4}$/.test(d) && !/^present$/i.test(d));
  const dateStatus: Status = badDates.length === 0 ? 'pass' : badDates.length <= 1 ? 'warn' : 'fail';

  // Gap detection — sort descending, compare end of prev job to start of next
  const dated = [...validExp]
    .filter(e => DATE_MM_YYYY.test(e.startDate))
    .sort((a, b) => (b.startDate > a.startDate ? 1 : -1));
  let maxGap = 0;
  for (let i = 0; i < dated.length - 1; i++) {
    const end = dated[i + 1].current ? null : dated[i + 1].endDate;
    const next = dated[i].startDate;
    if (!end || !DATE_MM_YYYY.test(end) || !DATE_MM_YYYY.test(next)) continue;
    const [em, ey] = end.split('/').map(Number);
    const [nm, ny] = next.split('/').map(Number);
    const gap = (ny - ey) * 12 + (nm - em);
    if (gap > maxGap) maxGap = gap;
  }

  const specialTitles = validExp.some(e => SPECIAL_CHAR_RE.test(e.title ?? ''));

  const format: Check[] = [
    mk('dates',  'Consistent date format (MM/YYYY)', dateStatus,
      dateStatus === 'pass' ? '' : `Non-standard dates: ${badDates.slice(0, 2).join(', ')}. Use MM/YYYY.`,
      dateStatus === 'pass' ? 5 : dateStatus === 'warn' ? 3 : 0, 5),
    mk('gaps',   'No employment gaps > 6 months', maxGap > 7 ? 'warn' : 'pass',
      maxGap > 7 ? `~${maxGap}-month gap detected. Consider adding contract or freelance work.` : '',
      maxGap > 7 ? 3 : 5, 5),
    mk('titles', 'Clean job titles (no special chars)', specialTitles ? 'warn' : 'pass',
      specialTitles ? 'Remove arrows (→) or symbols from job titles — they confuse ATS parsers.' : '',
      specialTitles ? 2 : 5, 5),
  ];

  // ── Content Quality (35 pts) ─────────────────────────────────────────────
  const headline = mk('headline', 'Professional headline present',
    r.headline ? 'pass' : 'fail',
    r.headline ? '' : 'Add a concise title/headline below your name.',
    r.headline ? 5 : 0, 5);

  const wc = r.summary.trim().split(/\s+/).filter(Boolean).length;
  const sumStatus: Status = wc >= 30 && wc <= 100 ? 'pass' : wc > 0 ? 'warn' : 'fail';
  const summary = mk('summary', `Summary (${wc} words — aim 40–80)`,
    sumStatus,
    sumStatus !== 'pass'
      ? wc === 0 ? 'Add a professional summary.'
        : wc < 30 ? 'Too brief. Expand to 40–80 words.'
        : 'Too long. Keep under 100 words.'
      : '',
    sumStatus === 'pass' ? 5 : sumStatus === 'warn' ? 2 : 0, 5);

  const withVerb = allBullets.filter(b => STRONG_VERBS.has(firstWord(b)));
  const vPct = allBullets.length ? withVerb.length / allBullets.length : 0;
  const vStatus: Status = vPct >= 0.85 ? 'pass' : vPct >= 0.6 ? 'warn' : 'fail';
  const verbs = mk('verbs', `Action verbs (${Math.round(vPct * 100)}% of bullets)`,
    vStatus,
    vStatus !== 'pass'
      ? `${Math.round(vPct * 100)}% start with a power verb. Aim for 85%+.`
      : '',
    vStatus === 'pass' ? 8 : vStatus === 'warn' ? 4 : 0, 8);

  const vc: Record<string, number> = {};
  allBullets.forEach(b => { const v = firstWord(b); if (v) vc[v] = (vc[v] ?? 0) + 1; });
  const repeated = Object.entries(vc).filter(([, n]) => n >= 3).map(([v]) => v);
  const repeats = mk('repeat-verbs', 'No repeated action verbs',
    repeated.length === 0 ? 'pass' : 'warn',
    repeated.length ? `"${repeated.join('", "')}" starts 3+ bullets — vary your verbs.` : '',
    repeated.length === 0 ? 5 : 2, 5);

  const hasPronouns = [...allBullets, r.summary].some(t => PRONOUN_RE.test(t));
  const pronouns = mk('pronouns', 'No first-person pronouns',
    hasPronouns ? 'fail' : 'pass',
    hasPronouns ? 'Remove "I", "my", "we", "our" from bullets and summary.' : '',
    hasPronouns ? 0 : 4, 4);

  const fillerCount = allBullets.filter(b => FILLER_RE.some(re => re.test(b))).length;
  const filler = mk('filler', 'No weak phrases ("helped", "assisted"…)',
    fillerCount === 0 ? 'pass' : 'warn',
    fillerCount ? `${fillerCount} bullet(s) use weak openers. Replace with strong action verbs.` : '',
    fillerCount === 0 ? 4 : 2, 4);

  // No consecutive bullets from same job starting with identical verb
  const samePairCount = validExp.reduce((acc, e) => {
    const bs = e.bullets.filter(b => b.trim());
    for (let i = 0; i < bs.length - 1; i++) {
      if (firstWord(bs[i]) === firstWord(bs[i + 1]) && firstWord(bs[i]) !== '') acc++;
    }
    return acc;
  }, 0);
  const conseq = mk('consecutive', 'No consecutive same-verb bullets',
    samePairCount === 0 ? 'pass' : 'warn',
    samePairCount ? `${samePairCount} consecutive bullet pair(s) start with the same verb.` : '',
    samePairCount === 0 ? 4 : 2, 4);

  const content: Check[] = [headline, summary, verbs, repeats, pronouns, filler, conseq];

  // ── Impact & Results (20 pts) ────────────────────────────────────────────
  const quantified = allBullets.filter(b => NUM_IN_BULLET.test(b));
  const qPct = allBullets.length ? quantified.length / allBullets.length : 0;
  const qStatus: Status = qPct >= 0.5 ? 'pass' : qPct >= 0.3 ? 'warn' : 'fail';
  const qCheck = mk('quantified', `${quantified.length}/${allBullets.length} bullets quantified`,
    qStatus,
    qStatus !== 'pass' ? `Only ${Math.round(qPct * 100)}% use numbers/metrics. Aim for 50%+.` : '',
    qStatus === 'pass' ? 10 : qStatus === 'warn' ? 5 : 0, 10);

  const underBulleted = validExp.filter(e => e.bullets.filter(b => b.trim()).length < 3);
  const bulCount = mk('bullet-count', '3+ bullets per role',
    underBulleted.length === 0 ? 'pass' : 'warn',
    underBulleted.length ? `${underBulleted.map(e => e.company || e.title).join(', ')} has fewer than 3 bullets.` : '',
    underBulleted.length === 0 ? 5 : 2, 5);

  const projNamed  = validProj.filter(p => p.name);
  const projLinked = validProj.filter(p => p.url);
  const projLinks = mk('proj-links', 'Projects have links',
    projNamed.length === 0 || projLinked.length === projNamed.length ? 'pass' : 'warn',
    projLinked.length < projNamed.length ? `${projNamed.length - projLinked.length} project(s) missing a GitHub/demo URL.` : '',
    projLinked.length > 0 ? 5 : 0, 5);

  const impact: Check[] = [qCheck, bulCount, projLinks];

  // ── Assemble ─────────────────────────────────────────────────────────────
  const mkCat = (id: string, label: string, checks: Check[]): Category => ({
    id, label, checks,
    earned: checks.reduce((s, c) => s + c.earned, 0),
    max:    checks.reduce((s, c) => s + c.max,    0),
  });

  const categories = [
    mkCat('contact',  'Contact',          contact),
    mkCat('sections', 'Sections',         sections),
    mkCat('format',   'Format',           format),
    mkCat('content',  'Content Quality',  content),
    mkCat('impact',   'Impact & Results', impact),
  ];

  const totalEarned = categories.reduce((s, c) => s + c.earned, 0);
  const totalMax    = categories.reduce((s, c) => s + c.max,    0);

  return { score: Math.round((totalEarned / totalMax) * 100), categories };
}

// ─── UI helpers ──────────────────────────────────────────────────────────────

const S: Record<Status, { icon: string; cls: string; dot: string }> = {
  pass: { icon: '✓', cls: 'text-green-600',  dot: 'bg-green-500' },
  warn: { icon: '⚠', cls: 'text-amber-500',  dot: 'bg-amber-400' },
  fail: { icon: '✕', cls: 'text-red-500',    dot: 'bg-red-500'   },
};

const TIERS = [
  { min: 90, bar: 'bg-green-500',  text: 'text-green-600',  label: 'Excellent' },
  { min: 80, bar: 'bg-blue-500',   text: 'text-blue-600',   label: 'Strong'    },
  { min: 70, bar: 'bg-amber-500',  text: 'text-amber-600',  label: 'Good'      },
  { min: 60, bar: 'bg-orange-500', text: 'text-orange-600', label: 'Fair'      },
  { min: 0,  bar: 'bg-red-500',    text: 'text-red-600',    label: 'Needs Work'},
];

function tier(score: number) {
  return TIERS.find(t => score >= t.min) ?? TIERS[4];
}

function catStatus(cat: Category): Status {
  if (cat.checks.some(c => c.status === 'fail')) return 'fail';
  if (cat.checks.some(c => c.status === 'warn')) return 'warn';
  return 'pass';
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ATSScore() {
  const resume = useResumeStore(s => s.resume);
  const { score, categories } = analyzeResume(resume);
  const t = tier(score);

  const totalIssues = categories.flatMap(c => c.checks).filter(c => c.status !== 'pass').length;
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

      {/* ── Score header ── */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">ATS Score</span>
          <span className={`text-xl font-bold ${t.text}`}>
            {score}<span className="text-sm font-normal text-slate-400">/100</span>
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 mb-1.5">
          <div className={`h-2 rounded-full transition-all duration-500 ${t.bar}`} style={{ width: `${score}%` }} />
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold ${t.text}`}>{t.label}</span>
          <span className="text-xs text-slate-400">
            {totalIssues === 0 ? 'No issues' : `${totalIssues} issue${totalIssues > 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      {/* ── Category rows ── */}
      <div className="border-t border-slate-100 divide-y divide-slate-100">
        {categories.map(cat => {
          const cs      = catStatus(cat);
          const issues  = cat.checks.filter(c => c.status !== 'pass');
          const isOpen  = expanded.has(cat.id);
          const pct     = cat.max > 0 ? Math.round((cat.earned / cat.max) * 100) : 100;
          const topIssue = issues[0];

          return (
            <div key={cat.id}>
              <button
                onClick={() => toggle(cat.id)}
                className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 transition text-left"
              >
                {/* status dot */}
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5 ${S[cs].dot}`} />
                <span className="flex-1 text-xs font-medium text-slate-700 leading-tight">{cat.label}</span>
                <div className="flex items-center gap-1.5">
                  {issues.length > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                      cs === 'fail' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {issues.length}
                    </span>
                  )}
                  <span className={`text-[11px] font-semibold tabular-nums ${
                    pct >= 90 ? 'text-green-600' : pct >= 70 ? 'text-amber-500' : 'text-red-500'
                  }`}>{pct}%</span>
                  <svg
                    className={`w-3 h-3 text-slate-300 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Top issue preview when collapsed */}
              {!isOpen && topIssue?.detail && (
                <p className="px-4 pb-2 text-[11px] text-slate-400 leading-tight pl-8 -mt-1">
                  {topIssue.detail}
                </p>
              )}

              {/* Expanded checks */}
              {isOpen && (
                <div className="px-4 pb-3 pt-0.5 space-y-2 bg-slate-50">
                  {cat.checks.map(c => (
                    <div key={c.id} className="flex gap-2">
                      <span className={`text-[11px] font-bold flex-shrink-0 w-3.5 mt-0.5 text-center ${S[c.status].cls}`}>
                        {S[c.status].icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-slate-700 leading-snug">{c.label}</p>
                        {c.detail && (
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{c.detail}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

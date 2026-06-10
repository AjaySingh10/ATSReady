import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useResumeStore } from '../store';
import { DEFAULT_SECTION_ORDER } from '../types';
import { renderRichText } from '../lib/formatting';

// A4 geometry (mm). Each rendered page is a full A4 box with its own padding,
// so the margins are preserved identically on every page — in preview and PDF.
const PAGE_W = 210;
const PAGE_H = 297;
const PAD_V = 10; // top/bottom margin
const PAD_H = 12; // left/right margin
const CONTENT_W = PAGE_W - PAD_H * 2; // 186mm

type Block = { key: string; keepWithNext: boolean; node: React.ReactNode };

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-[10px] mb-0.5">
      <h2 className="text-[11pt] font-bold text-black">{children}</h2>
      <hr className="border-t border-black mt-0.5" />
    </div>
  );
}

function toHref(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  if (/^(mailto:|tel:)/i.test(v)) return v;
  return `https://${v}`;
}

function skillLine(label: string, value: string) {
  if (!value.trim()) return null;
  // Flex row like the PDF: wrapped value lines hang-indent under the value column.
  return (
    <p key={label} className="text-[9.5pt] leading-[1.3] flex">
      <span className="font-bold whitespace-nowrap">{label}:{' '}</span>
      <span className="text-black flex-1">{value}</span>
    </p>
  );
}

export function ResumePreview() {
  const r = useResumeStore((s) => s.resume);

  const blocks = useMemo<Block[]>(() => {
    const { contact: c, skills, experience, education, projects, awards } = r;
    const order = r.sectionOrder ?? DEFAULT_SECTION_ORDER;
    const out: Block[] = [];

    const contactItems = [
      { value: c.phone, href: c.phone ? `tel:${c.phone.replace(/\s+/g, '')}` : null },
      { value: c.location, href: null },
      { value: c.email, href: c.email ? `mailto:${c.email}` : null },
      { value: c.linkedin, href: toHref(c.linkedin) },
      { value: c.github, href: toHref(c.github) },
      { value: c.website, href: toHref(c.website) },
      { value: c.stackoverflow, href: toHref(c.stackoverflow) },
      { value: c.other, href: toHref(c.other) },
    ].filter((item) => item.value.trim());

    // Header — name, headline, contact
    out.push({
      key: 'header',
      keepWithNext: false,
      node: (
        <div className="text-center mb-1">
          <h1 className="text-[18pt] font-bold text-black mb-[13pt]">
            {c.name || 'Your Name'}
          </h1>
          {r.headline && (
            <p className="text-[9.5pt] text-black mb-[5pt]">{r.headline}</p>
          )}
          {contactItems.length > 0 && (
            <p className="text-[9pt] text-black">
              {contactItems.map((item, i) => (
                <span key={i}>
                  {i > 0 && <span> | </span>}
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noreferrer" className="text-black no-underline">
                      {item.value}
                    </a>
                  ) : (
                    item.value
                  )}
                </span>
              ))}
            </p>
          )}
        </div>
      ),
    });

    for (const key of order) {
      if (key === 'summary' && r.summary) {
        out.push({ key: 'summary-title', keepWithNext: true, node: <SectionTitle>SUMMARY</SectionTitle> });
        out.push({
          key: 'summary-body',
          keepWithNext: false,
          node: <p className="text-[9.5pt] text-black leading-[1.3]">{renderRichText(r.summary)}</p>,
        });
      }

      if (key === 'skills' && Object.values(skills).some((v) => v.trim())) {
        out.push({ key: 'skills-title', keepWithNext: true, node: <SectionTitle>SKILLS</SectionTitle> });
        out.push({
          key: 'skills-body',
          keepWithNext: false,
          node: (
            <div className="space-y-0.5">
              {skillLine('Programming Languages', skills.languages)}
              {skillLine('Frameworks & Libraries', skills.frameworks)}
              {skillLine('Databases & Streaming', skills.databases)}
              {skillLine('Tools & Platforms', skills.tools)}
            </div>
          ),
        });
      }

      if (key === 'experience' && experience.some((e) => e.company || e.title)) {
        out.push({ key: 'exp-title', keepWithNext: true, node: <SectionTitle>EXPERIENCE</SectionTitle> });
        experience
          .filter((e) => e.company || e.title)
          .forEach((e, ei) => {
            const bullets = e.bullets.filter((b) => b.trim());
            const dateStr = [e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' – ');
            out.push({
              key: `exp-${e.id}-h`,
              keepWithNext: bullets.length > 0,
              node: (
                <div className={ei === 0 ? '' : 'mt-[5pt]'}>
                  <div>
                    <span className="font-bold text-[10pt] text-black">{e.company || 'Company'}</span>
                    {e.location && <span className="text-[9.5pt] text-black">, {e.location}</span>}
                    {dateStr && <span className="text-[9pt] text-black">{'  |  '}{dateStr}</span>}
                  </div>
                  <p className="font-bold italic text-[9.5pt] text-black mb-0.5">{e.title}</p>
                </div>
              ),
            });
            bullets.forEach((b, bi) => {
              out.push({
                key: `exp-${e.id}-b${bi}`,
                keepWithNext: false,
                node: (
                  <ul className="list-disc list-outside ml-4 mb-0.5">
                    <li className="text-[9.5pt] text-black leading-[1.3]">{renderRichText(b)}</li>
                  </ul>
                ),
              });
            });
          });
      }

      if (key === 'projects' && projects.some((p) => p.name || p.description)) {
        out.push({ key: 'proj-title', keepWithNext: true, node: <SectionTitle>PROJECTS</SectionTitle> });
        projects
          .filter((p) => p.name || p.description)
          .forEach((p, pi) => {
            out.push({
              key: `proj-${p.id}`,
              keepWithNext: false,
              node: (
                <div className={pi === 0 ? '' : 'mt-[3.5pt]'}>
                  <span className="font-bold text-[10pt] text-black">
                    {p.url ? (
                      <a href={p.url} className="text-black no-underline">
                        {p.name}
                      </a>
                    ) : (
                      p.name
                    )}
                  </span>
                  {p.tech && <span className="text-[9.5pt] text-black"> | {p.tech}</span>}
                  {p.downloads && (
                    <span className="text-[9.5pt] text-black"> | {renderRichText(p.downloads)}</span>
                  )}
                  {p.description && (
                    <p className="text-[9.5pt] text-black mt-0.5 leading-[1.3]">{renderRichText(p.description)}</p>
                  )}
                </div>
              ),
            });
          });
      }

      if (key === 'education' && education.some((e) => e.degree || e.university)) {
        out.push({ key: 'edu-title', keepWithNext: true, node: <SectionTitle>EDUCATION</SectionTitle> });
        education
          .filter((e) => e.degree || e.university)
          .forEach((e, ei) => {
            out.push({
              key: `edu-${e.id}`,
              keepWithNext: false,
              node: (
                <div className={ei === 0 ? '' : 'mt-[3.5pt]'}>
                  <div>
                    <span className="font-bold text-[10pt] text-black">{e.degree || 'Degree'}</span>
                    {e.graduationYear && <span className="text-[9pt] text-black">{'  |  '}{e.graduationYear}</span>}
                  </div>
                  <p className="text-[9.5pt] text-black">
                    {[e.university, e.location].filter(Boolean).join(', ')}
                    {e.gpa && <span className="ml-2">GPA: {e.gpa}</span>}
                  </p>
                  {e.achievements && (
                    <p className="text-[9.5pt] text-black mt-0.5">{renderRichText(e.achievements)}</p>
                  )}
                </div>
              ),
            });
          });
      }

      if (key === 'awards' && awards.some((a) => a.achievement || a.competition)) {
        out.push({ key: 'awards-title', keepWithNext: true, node: <SectionTitle>AWARDS &amp; CERTIFICATIONS</SectionTitle> });
        awards
          .filter((a) => a.achievement || a.competition)
          .forEach((a, ai) => {
            out.push({
              key: `award-${a.id}`,
              keepWithNext: false,
              node: (
                <div className={`flex gap-2 text-[9.5pt] text-black ${ai === 0 ? '' : 'mt-0.5'}`}>
                  {a.year && <span className="font-bold w-10 shrink-0">{a.year}</span>}
                  <span>{[a.achievement, a.competition].filter(Boolean).join(' | ')}</span>
                </div>
              ),
            });
          });
      }
    }

    return out;
  }, [r]);

  // ----- Pagination: measure block heights, pack into A4 pages -----
  const measureRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<number[][]>([]);
  const [tick, setTick] = useState(0);

  // Re-measure once webfonts have loaded (heights change when the font swaps in).
  useLayoutEffect(() => {
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts?.ready) fonts.ready.then(() => setTick((t) => t + 1));
  }, []);

  useLayoutEffect(() => {
    const container = measureRef.current;
    const probe = probeRef.current;
    if (!container || !probe) return;

    const pxPerMm = probe.offsetWidth / 100;
    if (!pxPerMm) return;
    // A small safety margin avoids clipping from sub-pixel rounding.
    const pageContentPx = (PAGE_H - PAD_V * 2) * pxPerMm - 2;

    const wrappers = Array.from(container.querySelectorAll<HTMLElement>('[data-block]'));
    const sentinel = container.querySelector<HTMLElement>('[data-sentinel]');
    if (wrappers.length === 0 || !sentinel) return;

    const tops = wrappers.map((w) => w.offsetTop);
    const heights = wrappers.map((_, i) => (i + 1 < tops.length ? tops[i + 1] : sentinel.offsetTop) - tops[i]);

    // Glue keepWithNext runs into atomic groups (heading + first row never orphaned).
    const groups: number[][] = [];
    let cur: number[] = [];
    blocks.forEach((b, i) => {
      cur.push(i);
      if (!b.keepWithNext) {
        groups.push(cur);
        cur = [];
      }
    });
    if (cur.length) groups.push(cur);

    // Greedily pack groups into pages.
    const result: number[][] = [];
    let page: number[] = [];
    let used = 0;
    for (const g of groups) {
      const gh = g.reduce((s, i) => s + heights[i], 0);
      if (page.length && used + gh > pageContentPx) {
        result.push(page);
        page = [];
        used = 0;
      }
      page.push(...g);
      used += gh;
    }
    if (page.length) result.push(page);

    setPages((prev) => {
      const same =
        prev.length === result.length && prev.every((p, i) => p.length === result[i].length && p.every((v, j) => v === result[i][j]));
      return same ? prev : result;
    });
  }, [blocks, tick]);

  // Fallback before the first measurement: render everything on one page.
  // `pages` holds block *indices* from a prior measurement. When `blocks`
  // changes (e.g. a bullet is removed) those indices can point past the new,
  // shorter array for the one render before the layout effect re-measures.
  // Rendering `blocks[i].key` on a stale out-of-range index would throw and
  // crash the whole app, so fall back to the single-page layout until the
  // next measurement reconciles `pages` with the current `blocks`.
  const pagesValid =
    pages.length > 0 && pages.every((page) => page.every((i) => i < blocks.length));
  const paginated = pagesValid;
  const renderedPages = pagesValid ? pages : [blocks.map((_, i) => i)];

  return (
    <>
      {/* Hidden measurement layer — same content width as a page's text column.
          The outer wrapper is a zero-size, positioned, clipped containing block:
          it anchors the absolutely-positioned measure layer so its multi-page
          height stays clipped here instead of inflating the document's scroll
          height (which would add a stray window scrollbar next to the pane's). */}
      <div
        aria-hidden
        className="no-print"
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      >
        <div
          ref={measureRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${CONTENT_W}mm`,
            visibility: 'hidden',
            pointerEvents: 'none',
            zIndex: -1,
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: '9.5pt',
            lineHeight: '1.2',
            overflow: 'hidden',
          }}
        >
          <div ref={probeRef} style={{ width: '100mm', height: 0 }} />
          {blocks.map((b) => (
            <div data-block key={b.key}>
              {b.node}
            </div>
          ))}
          <div data-sentinel style={{ height: 0 }} />
        </div>
      </div>

      {/* Real, paginated A4 pages — identical in preview and PDF.
          Block layout (not flex) so `break-after: page` works when printing. */}
      <div>
        {renderedPages.map((pageBlocks, pi) => (
          <div
            key={pi}
            className="resume-page bg-white shadow-xl font-[Arial,Helvetica,sans-serif] text-black mx-auto mb-6"
            style={{
              width: `${PAGE_W}mm`,
              // Once paginated, each page is a fixed A4 box. Before that, never clip —
              // grow to fit so content is never silently lost.
              height: paginated ? `${PAGE_H}mm` : undefined,
              minHeight: `${PAGE_H}mm`,
              padding: `${PAD_V}mm ${PAD_H}mm`,
              fontSize: '9.5pt',
              lineHeight: '1.2',
              boxSizing: 'border-box',
              overflow: paginated ? 'hidden' : 'visible',
            }}
          >
            {pageBlocks.map((i) => (
              <div key={blocks[i].key}>{blocks[i].node}</div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

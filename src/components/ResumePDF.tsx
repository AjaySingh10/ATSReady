import { Document, Page, Text, View, Link, StyleSheet } from '@react-pdf/renderer';
import type { ResumeData } from '../types';
import { DEFAULT_SECTION_ORDER } from '../types';

// Colors: slate-900=#0f172a  slate-800=#1e293b  slate-700=#334155  slate-600=#475569
const C = { s900: '#000000', s800: '#000000', s700: '#000000', s600: '#000000' };

// react-pdf measures text slightly taller than the browser's CSS engine.
// All vertical spacing is reduced ~20% vs the HTML preview to compensate
// and keep the output on one page when the preview fits on one page.
const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    color: C.s800,
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 34,
    lineHeight: 1.2,
  },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: { textAlign: 'center', marginBottom: 2 },
  name: { fontFamily: 'Helvetica-Bold', fontSize: 18, color: C.s900, marginBottom: 13 },
  headline: { fontFamily: 'Helvetica', fontSize: 9.5, color: C.s700, marginBottom: 5 },
  contactLine: { fontSize: 9, color: C.s900 },
  // Link style — must explicitly kill underline; react-pdf defaults to underlined
  link: { color: C.s900, textDecoration: 'none' },

  // ── Section title ───────────────────────────────────────────────────────────
  sectionBlock: { marginTop: 6.5, marginBottom: 3 },
  sectionHeading: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: C.s900,
    marginBottom: 1.5,
  },
  sectionRule: { borderBottomWidth: 0.6, borderBottomColor: C.s900, marginBottom: 2 },

  // ── Skills ─────────────────────────────────────────────────────────────────
  skillRow: { flexDirection: 'row', marginBottom: 1 },
  skillLabel: { fontFamily: 'Helvetica-Bold', fontSize: 9.5 },
  skillValue: { fontSize: 9.5, color: C.s700, flex: 1 },

  // ── Experience ─────────────────────────────────────────────────────────────
  expEntryGap: { marginTop: 5 },
  expCompany: { fontFamily: 'Helvetica-Bold', fontSize: 10, color: C.s900 },
  expLocation: { fontSize: 9.5, color: C.s600 },
  expDate: { fontSize: 9, color: C.s600 },
  expTitle: { fontFamily: 'Helvetica-BoldOblique', fontSize: 9.5, color: C.s700, marginBottom: 1 },
  bullet: { flexDirection: 'row', marginBottom: 1 },
  bulletDot: { width: 11, fontSize: 9.5, color: C.s800 },
  bulletText: { flex: 1, fontSize: 9.5, color: C.s800, lineHeight: 1.3 },

  // ── Projects ───────────────────────────────────────────────────────────────
  projEntryGap: { marginTop: 3.5 },
  projNameRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline' },
  projName: { fontFamily: 'Helvetica-Bold', fontSize: 10, color: C.s900, textDecoration: 'none' },
  projMeta: { fontSize: 9.5, color: C.s700 },
  projDesc: { fontSize: 9.5, color: C.s800, marginTop: 1, lineHeight: 1.3 },

  // ── Education ──────────────────────────────────────────────────────────────
  eduEntryGap: { marginTop: 3.5 },
  eduDegree: { fontFamily: 'Helvetica-Bold', fontSize: 10, color: C.s900 },
  eduYear: { fontSize: 9, color: C.s600 },
  eduUniversity: { fontSize: 9.5, color: C.s700 },
  eduAchieve: { fontSize: 9.5, color: C.s600, marginTop: 1 },

  // ── Awards ─────────────────────────────────────────────────────────────────
  awardRow: { flexDirection: 'row', marginBottom: 1 },
  awardYear: { fontFamily: 'Helvetica-Bold', fontSize: 9.5, width: 28 },
  awardText: { flex: 1, fontSize: 9.5, color: C.s800 },

  // ── Summary ────────────────────────────────────────────────────────────────
  summaryText: { fontSize: 9.5, color: C.s800, lineHeight: 1.3 },

  bold: { fontFamily: 'Helvetica-Bold' },
});

function RichText({ text, style }: { text: string; style?: object }) {
  const parts = text.split(/(\*\*[^*]+?\*\*)/g);
  if (parts.length === 1) return <Text style={style}>{text}</Text>;
  return (
    <Text style={style}>
      {parts.map((part, i) =>
        part.length > 4 && part.startsWith('**') && part.endsWith('**')
          ? <Text key={i} style={s.bold}>{part.slice(2, -2)}</Text>
          : part
      )}
    </Text>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <View style={s.sectionBlock}>
      <Text style={s.sectionHeading}>{title}</Text>
      <View style={s.sectionRule} />
    </View>
  );
}

function toHref(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  if (/^(mailto:|tel:)/i.test(v)) return v;
  return `https://${v}`;
}

export function ResumePDF({ resume: r }: { resume: ResumeData }) {
  const { contact: c, skills, experience, education, projects, awards } = r;
  const order = r.sectionOrder ?? DEFAULT_SECTION_ORDER;

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

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <Text style={s.name}>{c.name || 'Your Name'}</Text>
          {r.headline ? <Text style={s.headline}>{r.headline}</Text> : null}
          {contactItems.length > 0 && (
            <Text style={s.contactLine}>
              {contactItems.map((item, i) => (
                <Text key={i}>
                  {i > 0 ? ' | ' : ''}
                  {item.href
                    ? <Link src={item.href} style={s.link}>{item.value}</Link>
                    : item.value}
                </Text>
              ))}
            </Text>
          )}
        </View>

        {order.map((key) => {

          if (key === 'summary' && r.summary) {
            return (
              <View key="summary">
                <SectionTitle title="SUMMARY" />
                <RichText text={r.summary} style={s.summaryText} />
              </View>
            );
          }

          if (key === 'skills' && Object.values(skills).some((v) => v.trim())) {
            const rows = [
              { label: 'Programming Languages', value: skills.languages },
              { label: 'Frameworks & Libraries', value: skills.frameworks },
              { label: 'Databases & Streaming', value: skills.databases },
              { label: 'Tools & Platforms', value: skills.tools },
            ].filter((r) => r.value.trim());
            return (
              <View key="skills">
                <SectionTitle title="SKILLS" />
                {rows.map((row) => (
                  <View key={row.label} style={s.skillRow}>
                    <Text style={s.skillLabel}>{row.label}: </Text>
                    <Text style={s.skillValue}>{row.value}</Text>
                  </View>
                ))}
              </View>
            );
          }

          if (key === 'experience' && experience.some((e) => e.company || e.title)) {
            return (
              <View key="experience">
                <SectionTitle title="EXPERIENCE" />
                {experience
                  .filter((e) => e.company || e.title)
                  .map((e, ei) => {
                    const dateStr = [e.startDate, e.current ? 'Present' : e.endDate]
                      .filter(Boolean).join(' – ');
                    const bullets = e.bullets.filter((b) => b.trim());
                    return (
                      <View key={e.id} style={ei > 0 ? s.expEntryGap : undefined}>
                        <Text>
                          <Text style={s.expCompany}>{e.company || 'Company'}</Text>
                          {e.location ? <Text style={s.expLocation}>, {e.location}</Text> : null}
                          {dateStr ? <Text style={s.expDate}>  |  {dateStr}</Text> : null}
                        </Text>
                        <Text style={s.expTitle}>{e.title}</Text>
                        {bullets.map((b, bi) => (
                          <View key={bi} style={s.bullet}>
                            <Text style={s.bulletDot}>•</Text>
                            <RichText text={b} style={s.bulletText} />
                          </View>
                        ))}
                      </View>
                    );
                  })}
              </View>
            );
          }

          if (key === 'education' && education.some((e) => e.degree || e.university)) {
            return (
              <View key="education">
                <SectionTitle title="EDUCATION" />
                {education
                  .filter((e) => e.degree || e.university)
                  .map((e, ei) => (
                    <View key={e.id} wrap={false} style={ei > 0 ? s.eduEntryGap : undefined}>
                      <Text>
                        <Text style={s.eduDegree}>{e.degree || 'Degree'}</Text>
                        {e.graduationYear
                          ? <Text style={s.eduYear}>  |  {e.graduationYear}</Text>
                          : null}
                      </Text>
                      <Text style={s.eduUniversity}>
                        {[e.university, e.location].filter(Boolean).join(', ')}
                        {e.gpa ? `  GPA: ${e.gpa}` : ''}
                      </Text>
                      {e.achievements
                        ? <RichText text={e.achievements} style={s.eduAchieve} />
                        : null}
                    </View>
                  ))}
              </View>
            );
          }

          if (key === 'projects' && projects.some((p) => p.name || p.description)) {
            return (
              <View key="projects">
                <SectionTitle title="PROJECTS" />
                {projects
                  .filter((p) => p.name || p.description)
                  .map((p, pi) => (
                    <View key={p.id} style={pi > 0 ? s.projEntryGap : undefined}>
                      <View style={s.projNameRow}>
                        {p.url
                          ? <Link src={toHref(p.url) ?? p.url} style={{ ...s.projName, textDecoration: 'none' }}>{p.name}</Link>
                          : <Text style={s.projName}>{p.name}</Text>}
                        {p.tech ? <Text style={s.projMeta}> | {p.tech}</Text> : null}
                        {p.downloads ? <RichText text={` | ${p.downloads}`} style={s.projMeta} /> : null}
                      </View>
                      {p.description
                        ? <RichText text={p.description} style={s.projDesc} />
                        : null}
                    </View>
                  ))}
              </View>
            );
          }

          if (key === 'awards' && awards.some((a) => a.achievement || a.competition)) {
            return (
              <View key="awards">
                <SectionTitle title="AWARDS & CERTIFICATIONS" />
                {awards
                  .filter((a) => a.achievement || a.competition)
                  .map((a) => (
                    <View key={a.id} style={s.awardRow}>
                      {a.year ? <Text style={s.awardYear}>{a.year}</Text> : null}
                      <Text style={s.awardText}>
                        {[a.achievement, a.competition].filter(Boolean).join(' | ')}
                      </Text>
                    </View>
                  ))}
              </View>
            );
          }

          return null;
        })}
      </Page>
    </Document>
  );
}

import { useResumeStore } from '../store';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 mb-1">
      <h2 className="text-[11pt] font-bold uppercase tracking-wide text-slate-900">{children}</h2>
      <hr className="border-t border-slate-900 mt-0.5" />
    </div>
  );
}

function skillLine(label: string, value: string) {
  if (!value.trim()) return null;
  return (
    <p key={label} className="text-[9.5pt] leading-snug">
      <span className="font-semibold">{label}: </span>
      <span className="text-slate-700">{value}</span>
    </p>
  );
}

export function ResumePreview() {
  const r = useResumeStore((s) => s.resume);
  const { contact: c, skills, experience, education, projects, awards } = r;

  const contactParts = [
    c.phone,
    c.location,
    c.email,
    c.linkedin,
    c.github,
    c.website,
    c.stackoverflow,
    c.other,
  ].filter(Boolean);

  return (
    <div
      id="resume-preview"
      className="bg-white shadow-xl font-[Calibri,Arial,sans-serif] text-slate-900"
      style={{
        width: '8.5in',
        minHeight: '11in',
        padding: '0.5in',
        fontSize: '10pt',
        lineHeight: '1.3',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div className="text-center mb-2">
        <h1 className="text-[18pt] font-bold tracking-tight text-slate-900 mb-0.5">
          {c.name || 'Your Name'}
        </h1>
        {r.headline && (
          <p className="text-[10pt] font-semibold text-slate-700 mb-1">{r.headline}</p>
        )}
        {contactParts.length > 0 && (
          <p className="text-[9pt] text-slate-600">{contactParts.join(' | ')}</p>
        )}
      </div>

      {/* Summary */}
      {r.summary && (
        <>
          <SectionTitle>Professional Summary</SectionTitle>
          <p className="text-[9.5pt] text-slate-800 leading-snug">{r.summary}</p>
        </>
      )}

      {/* Skills */}
      {Object.values(skills).some((v) => v.trim()) && (
        <>
          <SectionTitle>Skills</SectionTitle>
          <div className="space-y-0.5">
            {skillLine('Programming Languages', skills.languages)}
            {skillLine('Frameworks', skills.frameworks)}
            {skillLine('Databases', skills.databases)}
            {skillLine('Tools & Platforms', skills.tools)}
            {skillLine('Other', skills.other)}
          </div>
        </>
      )}

      {/* Work Experience */}
      {experience.some((e) => e.company || e.title) && (
        <>
          <SectionTitle>Work Experience</SectionTitle>
          {experience
            .filter((e) => e.company || e.title)
            .map((e) => (
              <div key={e.id} className="mb-2.5">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-[10pt]">{e.company || 'Company'}</span>
                    {e.location && (
                      <span className="text-[9.5pt] text-slate-600">, {e.location}</span>
                    )}
                  </div>
                  <span className="text-[9pt] text-slate-600 whitespace-nowrap ml-2">
                    {[e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' – ')}
                  </span>
                </div>
                <p className="font-semibold italic text-[9.5pt] text-slate-700 mb-0.5">{e.title}</p>
                <ul className="list-disc list-outside ml-4 space-y-0.5">
                  {e.bullets.filter((b) => b.trim()).map((b, i) => (
                    <li key={i} className="text-[9.5pt] text-slate-800 leading-snug">{b}</li>
                  ))}
                </ul>
              </div>
            ))}
        </>
      )}

      {/* Education */}
      {education.some((e) => e.degree || e.university) && (
        <>
          <SectionTitle>Education</SectionTitle>
          {education
            .filter((e) => e.degree || e.university)
            .map((e) => (
              <div key={e.id} className="mb-2">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-[10pt]">{e.degree || 'Degree'}</span>
                  {e.graduationYear && (
                    <span className="text-[9pt] text-slate-600">{e.graduationYear}</span>
                  )}
                </div>
                <p className="text-[9.5pt] text-slate-700">
                  {[e.university, e.location].filter(Boolean).join(', ')}
                  {e.gpa && <span className="ml-2 font-medium">GPA: {e.gpa}</span>}
                </p>
                {e.achievements && (
                  <p className="text-[9.5pt] text-slate-600 mt-0.5">{e.achievements}</p>
                )}
              </div>
            ))}
        </>
      )}

      {/* Projects */}
      {projects.some((p) => p.name || p.description) && (
        <>
          <SectionTitle>Projects</SectionTitle>
          {projects
            .filter((p) => p.name || p.description)
            .map((p) => (
              <div key={p.id} className="mb-2">
                <span className="font-bold text-[10pt]">
                  {p.url ? (
                    <a href={p.url} className="text-blue-700 underline">
                      {p.name}
                    </a>
                  ) : (
                    p.name
                  )}
                </span>
                {p.description && (
                  <p className="text-[9.5pt] text-slate-800 mt-0.5 leading-snug">{p.description}</p>
                )}
              </div>
            ))}
        </>
      )}

      {/* Awards */}
      {awards.some((a) => a.achievement || a.competition) && (
        <>
          <SectionTitle>Awards, Accolades &amp; Certifications</SectionTitle>
          {awards
            .filter((a) => a.achievement || a.competition)
            .map((a) => (
              <div key={a.id} className="flex gap-2 text-[9.5pt] text-slate-800 mb-0.5">
                {a.year && <span className="font-semibold w-10 shrink-0">{a.year}</span>}
                <span>
                  {[a.achievement, a.competition].filter(Boolean).join(' | ')}
                </span>
              </div>
            ))}
        </>
      )}
    </div>
  );
}

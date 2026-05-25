import { useResumeStore } from '../../store';
import type { ResumeData } from '../../types';

function score(resume: ResumeData): { score: number; issues: string[] } {
  const issues: string[] = [];
  let pts = 0;

  if (resume.contact.name) pts += 10;
  else issues.push('Add your name');

  if (resume.contact.email) pts += 5;
  else issues.push('Add email address');

  if (resume.contact.phone) pts += 5;
  else issues.push('Add phone number');

  if (resume.contact.location) pts += 5;
  else issues.push('Add location (City, State)');

  if (resume.contact.linkedin) pts += 5;
  else issues.push('Add LinkedIn profile URL');

  if (resume.headline) pts += 10;
  else issues.push('Add a headline (e.g., "Senior Software Engineer at Google")');

  const wordCount = resume.summary.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount > 0 && wordCount <= 50) pts += 10;
  else if (wordCount > 50) issues.push('Professional summary should be under 50 words');
  else issues.push('Add a professional summary (under 50 words)');

  const hasSkills = Object.values(resume.skills).some((v: string) => v.trim().length > 0);
  if (hasSkills) pts += 10;
  else issues.push('Add at least one skill category');

  const validExp = resume.experience.filter((e) => e.company && e.title);
  if (validExp.length > 0) {
    pts += 10;
    const hasBullets = validExp.every((e) => e.bullets.some((b: string) => b.trim().length > 0));
    if (hasBullets) pts += 10;
    else issues.push('Add bullet points with quantifiable results to experience entries');
  } else {
    issues.push('Add at least one work experience entry');
  }

  const validEdu = resume.education.filter((e) => e.degree && e.university);
  if (validEdu.length > 0) pts += 10;
  else issues.push('Add education details');

  const validProjects = resume.projects.filter((p) => p.name && p.description);
  if (validProjects.length >= 2) pts += 5;
  else if (validProjects.length === 1) {
    pts += 2;
    issues.push('Add at least 2 projects (TIH recommends minimum 2)');
  } else {
    issues.push('Add at least 2 projects with GitHub links');
  }

  const projectsWithLinks = validProjects.filter((p) => p.url);
  if (validProjects.length > 0 && projectsWithLinks.length < validProjects.length) {
    issues.push('Add GitHub/portfolio links to all projects');
  }

  if (resume.contact.github) pts += 5;

  return { score: Math.min(pts, 100), issues };
}

const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
const textColors = ['text-red-600', 'text-orange-600', 'text-yellow-600', 'text-blue-600', 'text-green-600'];

export function ATSScore() {
  const resume = useResumeStore((s) => s.resume);
  const { score: s, issues } = score(resume);
  const tier = Math.min(Math.floor(s / 20), 4);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">ATS Readiness Score</span>
        <span className="text-lg font-bold text-slate-800">{s}/100</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${colors[tier]}`}
          style={{ width: `${s}%` }}
        />
      </div>
      <p className={`text-xs font-semibold mb-2 ${textColors[tier]}`}>
        {labels[tier]}
      </p>
      {issues.length > 0 && (
        <ul className="space-y-1">
          {issues.map((issue, i) => (
            <li key={i} className="text-xs text-slate-500 flex gap-1.5">
              <span className="text-orange-400 mt-0.5">▸</span>
              {issue}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

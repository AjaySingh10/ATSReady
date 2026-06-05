export interface ContactInfo {
  name: string;
  phone: string;
  location: string;
  email: string;
  linkedin: string;
  github: string;
  website: string;
  stackoverflow: string;
  other: string;
}

export interface WorkEntry {
  id: string;
  company: string;
  location: string;
  title: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface EducationEntry {
  id: string;
  degree: string;
  graduationYear: string;
  university: string;
  location: string;
  gpa: string;
  achievements: string;
}

export interface ProjectEntry {
  id: string;
  name: string;
  url: string;
  description: string;
}

export interface AwardEntry {
  id: string;
  year: string;
  achievement: string;
  competition: string;
}

export interface SkillsData {
  languages: string;
  frameworks: string;
  databases: string;
  tools: string;
  other: string;
}

export type SectionKey =
  | 'summary'
  | 'skills'
  | 'experience'
  | 'education'
  | 'projects'
  | 'awards';

export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  'summary',
  'skills',
  'experience',
  'education',
  'projects',
  'awards',
];

export interface ResumeData {
  headline: string;
  summary: string;
  contact: ContactInfo;
  skills: SkillsData;
  experience: WorkEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  awards: AwardEntry[];
  sectionOrder: SectionKey[];
}

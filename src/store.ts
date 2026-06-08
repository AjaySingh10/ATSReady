import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ResumeData, SectionKey } from './types';
import { DEFAULT_SECTION_ORDER } from './types';

const defaultResume: ResumeData = {
  headline: 'Software Engineer II | Full Stack · Cloud · Systems | 6 Years',
  summary:
    'Results-driven professional with X years of experience in [your field]. Skilled in [key skill 1], [key skill 2], and [key skill 3]. Proven track record of delivering impactful solutions and collaborating across teams to drive business outcomes.',

  contact: {
    name: 'Joe Doe',
    phone: '+91 XXXXX XXXXX',
    location: 'City, India',
    email: 'your.personal@gmail.com',
    linkedin: 'linkedin.com/in/joedoe',
    github: 'github.com/joedoe',
    website: '',
    stackoverflow: '',
    other: '',
  },

  skills: {
    languages: 'Go (Golang) | Rust | C# | TypeScript | Python | JavaScript | Java',
    frameworks: 'Angular | Svelte | .NET | Spring Boot | egui | Node.js | FastAPI',
    databases: 'PostgreSQL | Redis | MySQL | MongoDB | Kafka',
    tools:
      'Amazon Web Services | Docker | Terraform | Nginx | Keycloak | Ory | Snapcraft | SystemD | Git | GitLab CI/CD | Ollama | Claude API | OpenAI API | OAuth2 | OpenID Connect | REST APIs | Microservices | Agile/Scrum | Prompt Engineering',
  },

  experience: [
    {
      id: 'exp-1',
      company: 'Company 1',
      location: 'City, Country',
      title: 'Job Title',
      startDate: '01/2022',
      endDate: '',
      current: true,
      bullets: ['Describe your key achievement and its quantifiable impact here.'],
    },
    {
      id: 'exp-2',
      company: 'Company 2',
      location: 'City, Country',
      title: 'Job Title',
      startDate: '06/2020',
      endDate: '12/2021',
      current: false,
      bullets: ['Describe your key achievement and its quantifiable impact here.'],
    },
  ],

  education: [
    {
      id: 'edu-1',
      degree: 'B.E. / B.Tech in Computer Science (or your degree)',
      graduationYear: '2019',
      university: 'Your University Name',
      location: 'City, India',
      gpa: '',
      achievements: 'Add any academic achievements, clubs, or awards here',
    },
  ],

  projects: [
    {
      id: 'proj-1',
      name: 'Project 1',
      tech: 'React | Node.js',
      downloads: '',
      url: 'github.com/you/project-1',
      description: 'Brief description of what the project does, the tech stack used, and its impact.',
    },
    {
      id: 'proj-2',
      name: 'Project 2',
      tech: 'Python | FastAPI',
      downloads: '',
      url: 'github.com/you/project-2',
      description: 'Brief description of what the project does, the tech stack used, and its impact.',
    },
  ],

  awards: [],

  sectionOrder: DEFAULT_SECTION_ORDER,
};

interface ResumeStore {
  resume: ResumeData;
  lastSaved: number | null;
  setResume: (data: ResumeData) => void;
  updateResume: (partial: Partial<ResumeData>) => void;
  reorderSections: (order: SectionKey[]) => void;
  moveSection: (key: SectionKey, direction: 'up' | 'down') => void;
  removeSection: (key: SectionKey) => void;
  addSection: (key: SectionKey) => void;
  resetResume: () => void;
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      resume: defaultResume,
      lastSaved: null,
      setResume: (data) => set({ resume: data, lastSaved: Date.now() }),
      updateResume: (partial) =>
        set((state) => ({
          resume: { ...state.resume, ...partial },
          lastSaved: Date.now(),
        })),
      reorderSections: (order) =>
        set((state) => ({
          resume: { ...state.resume, sectionOrder: order },
          lastSaved: Date.now(),
        })),
      moveSection: (key, direction) =>
        set((state) => {
          const order = [...state.resume.sectionOrder];
          const from = order.indexOf(key);
          const to = direction === 'up' ? from - 1 : from + 1;
          if (from === -1 || to < 0 || to >= order.length) return state;
          [order[from], order[to]] = [order[to], order[from]];
          return {
            resume: { ...state.resume, sectionOrder: order },
            lastSaved: Date.now(),
          };
        }),
      removeSection: (key) =>
        set((state) => ({
          resume: {
            ...state.resume,
            sectionOrder: state.resume.sectionOrder.filter((k) => k !== key),
          },
          lastSaved: Date.now(),
        })),
      addSection: (key) =>
        set((state) => {
          if (state.resume.sectionOrder.includes(key)) return state;
          return {
            resume: { ...state.resume, sectionOrder: [...state.resume.sectionOrder, key] },
            lastSaved: Date.now(),
          };
        }),
      resetResume: () => set({ resume: defaultResume, lastSaved: null }),
    }),
    {
      name: 'resume-builder-data',
      storage: createJSONStorage(() => localStorage),
      version: 5,
      migrate: (persisted) => {
        const state = persisted as { resume?: Partial<ResumeData> } | undefined;
        if (state?.resume) {
          if (!state.resume.sectionOrder) {
            state.resume.sectionOrder = DEFAULT_SECTION_ORDER;
          }
          const s = state.resume.skills as
            | Partial<Record<'languages' | 'frameworks' | 'databases' | 'tools' | 'other' | 'platforms', string>>
            | undefined;
          if (s) {
            const join = (...vals: (string | undefined)[]) =>
              vals.map((v) => (v ?? '').trim()).filter(Boolean).join(' | ');
            const isLegacyV1 = 'other' in s;
            // Tools & Platforms is one field: fold in any legacy v1 groups and the v3 Platforms field.
            const tools = isLegacyV1
              ? join(s.tools, s.databases, s.other, s.platforms)
              : join(s.tools, s.platforms);
            // v5: "Databases & Streaming" is a fresh, separate field.
            state.resume.skills = {
              languages: s.languages ?? '',
              frameworks: s.frameworks ?? '',
              databases: '',
              tools,
            };
          }
          // v3: projects gained a tech-stack field; v4: an optional downloads field.
          if (Array.isArray(state.resume.projects)) {
            state.resume.projects = (state.resume.projects as unknown as Array<Record<string, unknown>>).map(
              (p) => ({ tech: '', downloads: '', ...p }) as unknown as ResumeData['projects'][number]
            );
          }
        }
        return state as ResumeStore;
      },
    }
  )
);

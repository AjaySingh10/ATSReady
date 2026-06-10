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
      version: 13,
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
            const tools = isLegacyV1
              ? join(s.tools, s.databases, s.other, s.platforms)
              : join(s.tools, s.platforms);
            state.resume.skills = {
              languages: s.languages ?? '',
              frameworks: s.frameworks ?? '',
              databases: '',
              tools,
            };
          }
          if (Array.isArray(state.resume.projects)) {
            state.resume.projects = (state.resume.projects as unknown as Array<Record<string, unknown>>).map(
              (p) => ({ tech: '', downloads: '', ...p }) as unknown as ResumeData['projects'][number]
            );
          }

          // v6 + v7: ATS content improvements applied to live data.
          if (state.resume.summary) {
            state.resume.summary = state.resume.summary
              .replace(/cross functional/g, 'cross-functional');
          }

          if (Array.isArray(state.resume.experience)) {
            state.resume.experience = (state.resume.experience as ResumeData['experience']).map((exp) => {
              // Fix internship end date — having two "Present" jobs is an HR red flag.
              if (exp.current && exp.title?.toLowerCase().includes('intern')) {
                exp = { ...exp, current: false, endDate: exp.endDate || '05/2021' };
              }
              // Normalise the promotion arrow in title to a clean separator.
              if (exp.title) {
                exp = { ...exp, title: exp.title.replace(/\s*->\s*/g, ' → ') };
              }
              if (Array.isArray(exp.bullets)) {
                exp = {
                  ...exp,
                  bullets: exp.bullets.map((b) => b
                    // Grammar: "a Apache" → "an Apache"
                    .replace(/\ba \*\*Apache/g, 'an **Apache')
                    .replace(/\ba Apache/g, 'an Apache')
                    // Number formatting: 10000 → 10,000
                    .replace(/\b10000\b/g, '10,000')
                    // Incomplete phrase
                    .replace(/tiered feature,/g, 'tiered feature access,')
                    // Compound modifier hyphenation
                    .replace(/\b15 member\b/g, '15-member')
                    .replace(/\b5 engineer\b/g, '5-engineer')
                    // Reduce "air-gapped" repetition (keep first two, replace rest)
                    .replace('for air-gapped edge servers, defining system', 'for isolated edge servers, defining system')
                    .replace('across air-gapped edge and cloud environments', 'across offline and cloud environments')
                    .replace(/in air-gapped environments\./g, 'in offline environments.')
                  ),
                };
              }
              return exp;
            });
          }
          // v7: fix date format, title arrow, Websocket capitalisation,
          //     zero-downtime hyphen, and Built verb repetition.
          if (Array.isArray(state.resume.experience)) {
            state.resume.experience = (state.resume.experience as ResumeData['experience']).map((exp) => {
              // Normalise short-year start date "06/21" → "06/2021"
              if (exp.startDate === '06/21') exp = { ...exp, startDate: '06/2021' };

              // Remove arrow from title — keep only the most recent role name
              if (exp.title?.includes('→')) {
                const parts = exp.title.split('→');
                exp = { ...exp, title: parts[parts.length - 1].trim() };
              }

              if (Array.isArray(exp.bullets)) {
                exp = {
                  ...exp,
                  bullets: exp.bullets.map((b) => b
                    // Vary repeated "Built" action verb
                    .replace(/^Built a real-time/, 'Developed a real-time')
                    .replace(/^Built an offline/, 'Deployed an offline')
                    .replace(/^Built SSO/, 'Implemented SSO')
                    // Hyphenate compound modifier
                    .replace(/zero downtime rotation/g, 'zero-downtime rotation')
                    // Reduce "offline" repetition created in v6
                    .replace('across offline and cloud environments', 'across disconnected and cloud environments')
                    .replace('in offline environments.', 'in disconnected environments.')
                  ),
                };
              }
              return exp;
            });
          }

          // v8: fix numeric range hyphens → en dashes, spell out abbreviated units
          if (Array.isArray(state.resume.experience)) {
            state.resume.experience = (state.resume.experience as ResumeData['experience']).map((exp) => {
              if (!Array.isArray(exp.bullets)) return exp;
              return {
                ...exp,
                bullets: exp.bullets.map((b) => b
                  // Numeric ranges: hyphen → en dash (–)
                  .replace(/\b50-70%/g,  '50–70%')
                  .replace(/\b10-15\b/g, '10–15')
                  .replace(/\b100-500\b/g, '100–500')
                  // Abbreviated time units → written out
                  .replace(/1 min to under 10 sec/g, '1 minute to under 10 seconds')
                  .replace(/\b90s to less than 25s\b/g, '90 seconds to under 25 seconds')
                ),
              };
            });
          }

          // Fix WebSocket capitalisation in skills
          if (state.resume.skills?.databases) {
            state.resume.skills = {
              ...state.resume.skills,
              databases: state.resume.skills.databases.replace(/\bWebsocket\b/g, 'WebSocket'),
            };
          }

          // v9: fix Design issue (middle dot in headline) + 3 grammar issues
          if (state.resume.headline) {
            // Design: replace middle dot separator (·) with pipe — ATS parsers flag it
            state.resume.headline = state.resume.headline.replace(/\s*·\s*/g, ' | ');
          }

          if (state.resume.summary) {
            // Grammar: "Actively building..." is a fragment (no subject) — rewrite with subject
            state.resume.summary = state.resume.summary
              .replace(
                'Actively building AI-powered tools and integrating LLMs into real-world workflows.',
                'Focused on building AI-powered tools and integrating LLMs into real-world workflows.'
              );
          }

          if (Array.isArray(state.resume.experience)) {
            state.resume.experience = (state.resume.experience as ResumeData['experience']).map((exp) => {
              if (!Array.isArray(exp.bullets)) return exp;
              return {
                ...exp,
                bullets: exp.bullets.map((b) => b
                  // Grammar: "per new marketing/UX guidelines" — "per" is flagged as informal
                  .replace(
                    'rebuild the UI per new marketing/UX guidelines',
                    'rebuild the UI aligned with new marketing and UX guidelines'
                  )
                  // Grammar: two-sentence bullet — merge into one sentence
                  .replace(
                    '(**RxJS, Angular Material**). Boosted performance and build efficiency of complex engineering data models and CAD integrations.',
                    '(**RxJS, Angular Material**), improving performance and build efficiency across complex engineering data models and CAD integrations.'
                  )
                ),
              };
            });
          }
          // v10: restore Databases & Streaming row; trim Tools & Platforms
          if (state.resume.skills != null) {
            state.resume.skills = {
              ...state.resume.skills,
              databases:
                'PostgreSQL | MySQL | MongoDB | Redis | WebSocket | Apache Kafka',
              tools:
                'AWS | Docker | Kubernetes | Proxmox | Nginx | Nix | OAuth2 | Keycloak | Ory | Snapcraft | LDAP/AD | CI/CD | SystemD | Cron | ARM | REST APIs | GraphQL | Microservices | Claude API | OpenAI API | Claude Code | Ollama | MCP',
            };
          }

          // v11: PDF proofread fixes — punctuation, brand capitalisation, dashes
          if (Array.isArray(state.resume.experience)) {
            state.resume.experience = (state.resume.experience as ResumeData['experience']).map((exp) => ({
              ...exp,
              company: (exp.company ?? '')
                .replace(/\s+\)/g, ')')      // "(formerly nVent )" → "(formerly nVent)"
                .replace(/\s-\s/g, ' – '),   // spaced hyphen between names → en dash
            }));
          }

          if (state.resume.summary) {
            // "Proven track record" is a flagged cliché on most resume graders
            state.resume.summary = state.resume.summary.replace(
              'Proven track record of leading',
              'Experienced in leading'
            );
          }

          if (state.resume.skills?.frameworks) {
            state.resume.skills = {
              ...state.resume.skills,
              frameworks: state.resume.skills.frameworks.replace(/\bEgui\b/g, 'egui'),
            };
          }

          if (Array.isArray(state.resume.projects)) {
            state.resume.projects = (state.resume.projects as ResumeData['projects']).map((p) => ({
              ...p,
              name: (p.name ?? '').replace(/^Claude deck$/, 'Claude Deck'),
              tech: (p.tech ?? '')
                .replace(/\bTypescript\b/g, 'TypeScript')
                .replace(/\s+,/g, ','),      // "Node.js ," → "Node.js,"
              description: (p.description ?? '')
                .replace('UI - no JSON editing required', 'UI — no JSON editing required'),
            }));
          }

          // v12: "**15** member" — bold markers sit between "15" and "member",
          // so the plain "15 member" rule above can never match this variant.
          if (Array.isArray(state.resume.experience)) {
            state.resume.experience = (state.resume.experience as ResumeData['experience']).map((exp) => ({
              ...exp,
              bullets: Array.isArray(exp.bullets)
                ? exp.bullets.map((b) => b.replace('**15** member', '**15**-member'))
                : exp.bullets,
            }));
          }
        }
        return state as ResumeStore;
      },
    }
  )
);

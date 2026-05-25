import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ResumeData } from './types';

const defaultResume: ResumeData = {
  headline: 'Software Engineer II | Full Stack · Cloud · Systems | 6 Years',
  summary:
    'Results-driven professional with X years of experience in [your field]. Skilled in [key skill 1], [key skill 2], and [key skill 3]. Proven track record of delivering impactful solutions and collaborating across teams to drive business outcomes.',

  contact: {
    name: 'Joe Doe',
    phone: '+91 XXXXX XXXXX',
    location: 'Mumbai, India',
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
    databases: 'PostgreSQL | Redis | MySQL',
    tools:
      'Amazon Web Services | Docker | Terraform | Nginx | Keycloak | Ory | Snapcraft | SystemD | Git | GitLab CI/CD | Ollama | Claude API | OpenAI API',
    other:
      'OAuth2 | OpenID Connect | JSON API | REST APIs | Microservices | Agile/Scrum | Redis Caching | Prompt Engineering',
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
      url: 'github.com/you/project-1',
      description: 'Brief description of what the project does, the tech stack used, and its impact.',
    },
    {
      id: 'proj-2',
      name: 'Project 2',
      url: 'github.com/you/project-2',
      description: 'Brief description of what the project does, the tech stack used, and its impact.',
    },
  ],

  awards: [],
};

interface ResumeStore {
  resume: ResumeData;
  lastSaved: number | null;
  setResume: (data: ResumeData) => void;
  updateResume: (partial: Partial<ResumeData>) => void;
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
      resetResume: () => set({ resume: defaultResume, lastSaved: null }),
    }),
    {
      name: 'resume-builder-data',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

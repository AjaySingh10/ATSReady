import { useResumeStore } from '../../store';
import { SectionCard } from '../ui/SectionCard';
import { Field } from '../ui/Field';

export function SkillsSection() {
  const skills = useResumeStore((s) => s.resume.skills);
  const updateResume = useResumeStore((s) => s.updateResume);

  const set = (key: keyof typeof skills, value: string) =>
    updateResume({ skills: { ...skills, [key]: value } });

  return (
    <SectionCard
      title="Skills"
      tip="Separate skills with | character. Use full names for ATS (e.g., 'Amazon Web Services' not 'AWS'). Match keywords from job descriptions."
    >
      <Field
        label="Programming Languages"
        placeholder="Python | JavaScript | TypeScript | Java | Go"
        value={skills.languages}
        onChange={(e) => set('languages', e.target.value)}
        hint="If impressive, note scale (e.g., '100,000+ lines of Python')"
      />
      <Field
        label="Frameworks & Libraries"
        placeholder="React | Node.js | Django | Spring Boot | Express"
        value={skills.frameworks}
        onChange={(e) => set('frameworks', e.target.value)}
      />
      <Field
        label="Databases & Streaming"
        placeholder="PostgreSQL | Redis | MySQL | MongoDB | Kafka"
        value={skills.databases}
        onChange={(e) => set('databases', e.target.value)}
      />
      <Field
        label="Tools & Platforms"
        placeholder="Amazon Web Services | Docker | Kubernetes | Terraform | Git | Keycloak"
        value={skills.tools}
        onChange={(e) => set('tools', e.target.value)}
        hint="Cloud, DevOps tools, and infrastructure"
      />
    </SectionCard>
  );
}

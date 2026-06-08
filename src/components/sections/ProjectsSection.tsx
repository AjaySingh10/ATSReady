import { useResumeStore } from '../../store';
import { SectionCard } from '../ui/SectionCard';
import { Field, TextareaField } from '../ui/Field';
import type { ProjectEntry } from '../../types';

function EntryCard({
  entry,
  index,
  onUpdate,
  onRemove,
}: {
  entry: ProjectEntry;
  index: number;
  onUpdate: (e: ProjectEntry) => void;
  onRemove: () => void;
}) {
  const set = <K extends keyof ProjectEntry>(key: K, value: ProjectEntry[K]) =>
    onUpdate({ ...entry, [key]: value });

  const missingUrl = entry.name && !entry.url;

  return (
    <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Project {index + 1}</span>
        {index > 1 && (
          <button type="button" onClick={onRemove} className="text-xs text-red-400 hover:text-red-600 transition">
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Project Name *" placeholder="Project 1" value={entry.name} onChange={(e) => set('name', e.target.value)} />
        <div>
          <Field
            label="GitHub / Live URL *"
            placeholder="github.com/you/project-1"
            value={entry.url}
            onChange={(e) => set('url', e.target.value)}
          />
          {missingUrl && (
            <p className="text-xs text-amber-600 mt-1">Always link projects — hiring managers verify via GitHub</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Tech Stack"
          placeholder="React | Node.js | PostgreSQL"
          value={entry.tech}
          onChange={(e) => set('tech', e.target.value)}
          hint="Shown next to the project name, separated by |"
        />
        <Field
          label="Downloads (optional)"
          bold
          placeholder="1,000+ downloads"
          value={entry.downloads}
          onChange={(e) => set('downloads', e.target.value)}
          hint="Select text + B (or Ctrl/Cmd+B) to bold"
        />
      </div>

      <TextareaField
        label="Description — role, tech stack, and quantifiable impact"
        placeholder="Brief description of what the project does, the tech stack used, and its impact."
        rows={3}
        value={entry.description}
        onChange={(e) => set('description', e.target.value)}
      />
    </div>
  );
}

export function ProjectsSection() {
  const projects = useResumeStore((s) => s.resume.projects);
  const updateResume = useResumeStore((s) => s.updateResume);

  const updateEntry = (i: number, entry: ProjectEntry) => {
    const updated = [...projects];
    updated[i] = entry;
    updateResume({ projects: updated });
  };

  const removeEntry = (i: number) =>
    updateResume({ projects: projects.filter((_, idx) => idx !== i) });

  const addEntry = () =>
    updateResume({
      projects: [
        ...projects,
        { id: crypto.randomUUID(), name: '', tech: '', downloads: '', url: '', description: '' },
      ],
    });

  return (
    <SectionCard
      title="Projects"
      tip="TIH requires minimum 2 projects. Always link to GitHub or a live URL — hiring managers will check. Include quantifiable results (stars, users, performance gains)."
    >
      <div className="space-y-4">
        {projects.map((entry, i) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            index={i}
            onUpdate={(e) => updateEntry(i, e)}
            onRemove={() => removeEntry(i)}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={addEntry}
        className="mt-1 w-full border-2 border-dashed border-slate-200 rounded-xl py-2.5 text-sm text-slate-400 hover:border-blue-300 hover:text-blue-500 transition"
      >
        + Add Project
      </button>
    </SectionCard>
  );
}

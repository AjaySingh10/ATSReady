import { useResumeStore } from '../../store';
import { SectionCard } from '../ui/SectionCard';
import { Field, TextareaField } from '../ui/Field';
import type { EducationEntry } from '../../types';

function EntryCard({
  entry,
  index,
  onUpdate,
  onRemove,
}: {
  entry: EducationEntry;
  index: number;
  onUpdate: (e: EducationEntry) => void;
  onRemove: () => void;
}) {
  const set = <K extends keyof EducationEntry>(key: K, value: EducationEntry[K]) =>
    onUpdate({ ...entry, [key]: value });

  const gpaNum = parseFloat(entry.gpa);
  const gpaWarning = entry.gpa && !isNaN(gpaNum) && gpaNum < 3.5;

  return (
    <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Education {index + 1}
        </span>
        {index > 0 && (
          <button type="button" onClick={onRemove} className="text-xs text-red-400 hover:text-red-600 transition">
            Remove
          </button>
        )}
      </div>

      <Field label="Degree *" placeholder="BSc in Computer Science" value={entry.degree} onChange={(e) => set('degree', e.target.value)} />

      <div className="grid grid-cols-2 gap-3">
        <Field label="University *" placeholder="Stanford University" value={entry.university} onChange={(e) => set('university', e.target.value)} />
        <Field label="Location" placeholder="Stanford, CA" value={entry.location} onChange={(e) => set('location', e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Graduation Year" placeholder="2024 (or Expected 2025)" value={entry.graduationYear} onChange={(e) => set('graduationYear', e.target.value)} />
        <div>
          <Field
            label="GPA (optional)"
            placeholder="3.82 / 4.00"
            value={entry.gpa}
            onChange={(e) => set('gpa', e.target.value)}
          />
          {gpaWarning && (
            <p className="text-xs text-amber-600 mt-1">TIH recommends only listing GPA ≥ 3.5/4.0</p>
          )}
        </div>
      </div>

      <TextareaField
        label="Achievements, Clubs, Awards"
        placeholder="Dean's List, President of CS Society, Valedictorian, Teaching Assistant for Data Structures"
        rows={2}
        value={entry.achievements}
        onChange={(e) => set('achievements', e.target.value)}
      />
    </div>
  );
}

export function EducationSection() {
  const education = useResumeStore((s) => s.resume.education);
  const updateResume = useResumeStore((s) => s.updateResume);

  const updateEntry = (i: number, entry: EducationEntry) => {
    const updated = [...education];
    updated[i] = entry;
    updateResume({ education: updated });
  };

  const removeEntry = (i: number) =>
    updateResume({ education: education.filter((_, idx) => idx !== i) });

  const addEntry = () =>
    updateResume({
      education: [
        ...education,
        {
          id: crypto.randomUUID(),
          degree: '',
          graduationYear: '',
          university: '',
          location: '',
          gpa: '',
          achievements: '',
        },
      ],
    });

  return (
    <SectionCard
      title="Education"
      tip="Place Education FIRST if you're a recent grad or have < 3 years experience. List GPA only if ≥ 3.5/4.0 or ≥ 4.3/5.0."
    >
      <div className="space-y-4">
        {education.map((entry, i) => (
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
        + Add Education
      </button>
    </SectionCard>
  );
}

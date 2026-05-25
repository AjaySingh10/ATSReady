import { useResumeStore } from '../../store';
import { SectionCard } from '../ui/SectionCard';
import { Field } from '../ui/Field';
import type { AwardEntry } from '../../types';

function EntryCard({
  entry,
  index,
  onUpdate,
  onRemove,
}: {
  entry: AwardEntry;
  index: number;
  onUpdate: (e: AwardEntry) => void;
  onRemove: () => void;
}) {
  const set = <K extends keyof AwardEntry>(key: K, value: AwardEntry[K]) =>
    onUpdate({ ...entry, [key]: value });

  return (
    <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Award {index + 1}</span>
        <button type="button" onClick={onRemove} className="text-xs text-red-400 hover:text-red-600 transition">
          Remove
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Year" placeholder="2023" value={entry.year} onChange={(e) => set('year', e.target.value)} />
        <Field label="Achievement" placeholder="1st Place out of 200 teams" value={entry.achievement} onChange={(e) => set('achievement', e.target.value)} className="col-span-2" />
      </div>
      <Field label="Competition / Issuer" placeholder="Google Code Jam" value={entry.competition} onChange={(e) => set('competition', e.target.value)} />
    </div>
  );
}

export function AwardsSection() {
  const awards = useResumeStore((s) => s.resume.awards);
  const updateResume = useResumeStore((s) => s.updateResume);

  const updateEntry = (i: number, entry: AwardEntry) => {
    const updated = [...awards];
    updated[i] = entry;
    updateResume({ awards: updated });
  };

  const removeEntry = (i: number) =>
    updateResume({ awards: awards.filter((_, idx) => idx !== i) });

  const addEntry = () =>
    updateResume({
      awards: [
        ...awards,
        { id: crypto.randomUUID(), year: '', achievement: '', competition: '' },
      ],
    });

  return (
    <SectionCard
      title="Awards, Accolades & Certifications"
      tip="Only include achievements relevant to the role. Format: Year | Quantified achievement | Competition/Issuer."
      defaultOpen={false}
    >
      {awards.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-2">No awards added yet.</p>
      )}
      <div className="space-y-4">
        {awards.map((entry, i) => (
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
        + Add Award / Certification
      </button>
    </SectionCard>
  );
}

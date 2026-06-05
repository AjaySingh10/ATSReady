import { useResumeStore } from '../../store';
import { SectionCard } from '../ui/SectionCard';
import { Field } from '../ui/Field';
import { handleBoldKeyDown, toggleBold } from '../../lib/formatting';
import type { WorkEntry } from '../../types';

function EntryCard({
  entry,
  index,
  onUpdate,
  onRemove,
}: {
  entry: WorkEntry;
  index: number;
  onUpdate: (e: WorkEntry) => void;
  onRemove: () => void;
}) {
  const set = <K extends keyof WorkEntry>(key: K, value: WorkEntry[K]) =>
    onUpdate({ ...entry, [key]: value });

  const setBullet = (i: number, value: string) => {
    const bullets = [...entry.bullets];
    bullets[i] = value;
    set('bullets', bullets);
  };

  const addBullet = () => set('bullets', [...entry.bullets, '']);
  const removeBullet = (i: number) => set('bullets', entry.bullets.filter((_, idx) => idx !== i));

  return (
    <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Position {index + 1}
        </span>
        {index > 0 && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-red-400 hover:text-red-600 transition"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Company *" placeholder="Company 1" value={entry.company} onChange={(e) => set('company', e.target.value)} />
        <Field label="Location" placeholder="City, Country" value={entry.location} onChange={(e) => set('location', e.target.value)} />
      </div>

      <Field label="Job Title *" placeholder="Job Title" value={entry.title} onChange={(e) => set('title', e.target.value)} />

      <div className="grid grid-cols-2 gap-3">
        <Field label="Start Date" placeholder="08/2021" value={entry.startDate} onChange={(e) => set('startDate', e.target.value)} />
        <div>
          <Field
            label="End Date"
            placeholder="Present"
            value={entry.current ? 'Present' : entry.endDate}
            disabled={entry.current}
            onChange={(e) => set('endDate', e.target.value)}
          />
          <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={entry.current}
              onChange={(e) => set('current', e.target.checked)}
              className="rounded"
            />
            <span className="text-xs text-slate-500">Current role</span>
          </label>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-600 block mb-2">
          Accomplishments — use format: Action → Quantifiable Result
          <span className="text-slate-400 font-normal"> · select text + Ctrl/Cmd+B to bold</span>
        </label>
        <div className="space-y-2">
          {entry.bullets.map((bullet, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-slate-300 mt-2.5 text-sm">•</span>
              <input
                value={bullet}
                onChange={(e) => setBullet(i, e.target.value)}
                onKeyDown={handleBoldKeyDown}
                placeholder="Describe your key achievement and its quantifiable impact here."
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  const input = e.currentTarget.parentElement?.querySelector('input');
                  if (input) toggleBold(input);
                }}
                title="Bold selected text (Ctrl/Cmd+B)"
                aria-label="Bold selected text"
                className="mt-1.5 shrink-0 text-xs font-bold text-slate-400 hover:text-blue-600 border border-slate-200 hover:border-blue-300 rounded px-1.5 leading-5 transition"
              >
                B
              </button>
              {entry.bullets.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeBullet(i)}
                  className="mt-2 text-slate-300 hover:text-red-400 transition text-lg leading-none"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addBullet}
          className="mt-2 text-xs text-blue-500 hover:text-blue-700 transition"
        >
          + Add bullet point
        </button>
      </div>
    </div>
  );
}

export function ExperienceSection() {
  const experience = useResumeStore((s) => s.resume.experience);
  const updateResume = useResumeStore((s) => s.updateResume);

  const updateEntry = (i: number, entry: WorkEntry) => {
    const updated = [...experience];
    updated[i] = entry;
    updateResume({ experience: updated });
  };

  const removeEntry = (i: number) =>
    updateResume({ experience: experience.filter((_, idx) => idx !== i) });

  const addEntry = () =>
    updateResume({
      experience: [
        ...experience,
        {
          id: crypto.randomUUID(),
          company: '',
          location: '',
          title: '',
          startDate: '',
          endDate: '',
          current: false,
          bullets: [''],
        },
      ],
    });

  return (
    <SectionCard
      title="Work Experience"
      tip="List in reverse chronological order. Format: Company, Location | Title | MM/YYYY – MM/YYYY. Each bullet: Action that resulted in [quantifiable outcome]."
    >
      <div className="space-y-4">
        {experience.map((entry, i) => (
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
        + Add Position
      </button>
    </SectionCard>
  );
}

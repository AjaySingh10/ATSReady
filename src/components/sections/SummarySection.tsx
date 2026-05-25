import { useResumeStore } from '../../store';
import { SectionCard } from '../ui/SectionCard';
import { Field, TextareaField } from '../ui/Field';

export function SummarySection() {
  const headline = useResumeStore((s) => s.resume.headline);
  const summary = useResumeStore((s) => s.resume.summary);
  const updateResume = useResumeStore((s) => s.updateResume);

  const wordCount = summary.trim().split(/\s+/).filter(Boolean).length;
  const wordsLeft = 50 - wordCount;
  const overLimit = wordCount > 50;

  return (
    <SectionCard
      title="Headline & Summary"
      tip='Headline: under 10 words, e.g. "Software Engineer with 5 years at FAANG companies". Summary: under 50 words answering "Why are you a good fit?". Start with your job role noun.'
    >
      <Field
        label="Headline (≤ 10 words) *"
        placeholder='e.g. "Senior Software Engineer | 5 Years | Full Stack | FAANG"'
        value={headline}
        onChange={(e) => updateResume({ headline: e.target.value })}
      />
      <div>
        <TextareaField
          label="Professional Summary (≤ 50 words) *"
          placeholder="Software Engineer with X years of full stack experience specializing in React and Node.js. Domain expert in fintech as a result of working at multiple payment companies."
          rows={4}
          value={summary}
          onChange={(e) => updateResume({ summary: e.target.value })}
        />
        <p className={`text-xs mt-1 ${overLimit ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
          {wordCount} / 50 words{overLimit ? ' — too long! Trim to 50 words.' : wordsLeft < 10 ? ` — ${wordsLeft} words left` : ''}
        </p>
      </div>
    </SectionCard>
  );
}

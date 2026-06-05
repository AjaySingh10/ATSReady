import { useState, type ReactNode } from 'react';
import { useResumeStore } from '../store';
import type { SectionKey } from '../types';
import { SummarySection } from './sections/SummarySection';
import { SkillsSection } from './sections/SkillsSection';
import { ExperienceSection } from './sections/ExperienceSection';
import { EducationSection } from './sections/EducationSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { AwardsSection } from './sections/AwardsSection';

const SECTION_COMPONENTS: Record<SectionKey, () => ReactNode> = {
  summary: SummarySection,
  skills: SkillsSection,
  experience: ExperienceSection,
  education: EducationSection,
  projects: ProjectsSection,
  awards: AwardsSection,
};

interface RowProps {
  sectionKey: SectionKey;
  index: number;
  total: number;
  dragIndex: number | null;
  overIndex: number | null;
  onDragStart: (index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: () => void;
  onDrop: () => void;
}

function ReorderableRow({
  sectionKey,
  index,
  total,
  dragIndex,
  overIndex,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onDrop,
}: RowProps) {
  const moveSection = useResumeStore((s) => s.moveSection);
  const Section = SECTION_COMPONENTS[sectionKey];

  const isDragging = dragIndex === index;
  const isDropTarget = overIndex === index && dragIndex !== null && dragIndex !== index;

  return (
    <div
      onDragEnter={() => onDragEnter(index)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      className={`relative transition ${isDragging ? 'opacity-40' : ''} ${
        isDropTarget ? 'ring-2 ring-blue-400 rounded-xl' : ''
      }`}
    >
      {/* Reorder controls */}
      <div className="absolute -left-0.5 top-3 z-10 flex flex-col items-center gap-0.5">
        <button
          type="button"
          draggable
          onDragStart={() => onDragStart(index)}
          onDragEnd={onDragEnd}
          title="Drag to reorder"
          aria-label={`Drag ${sectionKey} section to reorder`}
          className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 leading-none"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <circle cx="7" cy="5" r="1.4" />
            <circle cx="13" cy="5" r="1.4" />
            <circle cx="7" cy="10" r="1.4" />
            <circle cx="13" cy="10" r="1.4" />
            <circle cx="7" cy="15" r="1.4" />
            <circle cx="13" cy="15" r="1.4" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => moveSection(sectionKey, 'up')}
          disabled={index === 0}
          title="Move up"
          aria-label={`Move ${sectionKey} section up`}
          className="text-slate-300 enabled:hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed leading-none"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l5-5 5 5" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => moveSection(sectionKey, 'down')}
          disabled={index === total - 1}
          title="Move down"
          aria-label={`Move ${sectionKey} section down`}
          className="text-slate-300 enabled:hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed leading-none"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 8l5 5 5-5" />
          </svg>
        </button>
      </div>

      {/* Indented to make room for the control rail */}
      <div className="pl-6">
        <Section />
      </div>
    </div>
  );
}

export function SectionReorderList() {
  const order = useResumeStore((s) => s.resume.sectionOrder);
  const reorderSections = useResumeStore((s) => s.reorderSections);

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  function handleDrop() {
    if (dragIndex === null || overIndex === null || dragIndex === overIndex) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const next = [...order];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(overIndex, 0, moved);
    reorderSections(next);
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <div className="space-y-3">
      {order.map((key, index) => (
        <ReorderableRow
          key={key}
          sectionKey={key}
          index={index}
          total={order.length}
          dragIndex={dragIndex}
          overIndex={overIndex}
          onDragStart={setDragIndex}
          onDragEnter={setOverIndex}
          onDragEnd={() => {
            setDragIndex(null);
            setOverIndex(null);
          }}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
}

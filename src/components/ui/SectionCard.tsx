import { useState, type ReactNode } from 'react';

interface Props {
  title: string;
  tip?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function SectionCard({ title, tip, children, defaultOpen = true }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="font-semibold text-slate-800 text-sm tracking-wide uppercase">{title}</span>
        <span className="text-slate-400 text-lg">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-slate-100">
          {tip && (
            <div className="mt-3 mb-4 flex gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <span className="mt-0.5">💡</span>
              <span>{tip}</span>
            </div>
          )}
          <div className="mt-4 space-y-3">{children}</div>
        </div>
      )}
    </div>
  );
}

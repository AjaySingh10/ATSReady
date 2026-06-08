import { useRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { handleBoldKeyDown, toggleBold } from '../../lib/formatting';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  /** Enable **bold** selection (B button + Ctrl/Cmd+B), like TextareaField. */
  bold?: boolean;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  rows?: number;
}

export function Field({ label, hint, bold, className, onKeyDown, ...props }: InputProps) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-medium text-slate-600">{label}</label>
        {bold && (
          <button
            type="button"
            // preventDefault keeps the input's text selection while clicking
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => ref.current && toggleBold(ref.current)}
            title="Bold selected text (Ctrl/Cmd+B)"
            aria-label="Bold selected text"
            className="shrink-0 text-xs font-bold text-slate-400 hover:text-blue-600 border border-slate-200 hover:border-blue-300 rounded px-1.5 leading-5 transition"
          >
            B
          </button>
        )}
      </div>
      <input
        ref={ref}
        {...props}
        onKeyDown={(e) => {
          if (bold) handleBoldKeyDown(e);
          onKeyDown?.(e);
        }}
        className={`border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${className ?? ''}`}
      />
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function TextareaField({ label, hint, rows = 3, className, onKeyDown, ...props }: TextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-medium text-slate-600">{label}</label>
        <button
          type="button"
          // preventDefault keeps the textarea's text selection while clicking
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => ref.current && toggleBold(ref.current)}
          title="Bold selected text (Ctrl/Cmd+B)"
          aria-label="Bold selected text"
          className="shrink-0 text-xs font-bold text-slate-400 hover:text-blue-600 border border-slate-200 hover:border-blue-300 rounded px-1.5 leading-5 transition"
        >
          B
        </button>
      </div>
      <textarea
        ref={ref}
        {...props}
        rows={rows}
        onKeyDown={(e) => {
          handleBoldKeyDown(e);
          onKeyDown?.(e);
        }}
        className={`border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none ${className ?? ''}`}
      />
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

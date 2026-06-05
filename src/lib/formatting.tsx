import type { KeyboardEvent, ReactNode } from 'react';

type TextField = HTMLInputElement | HTMLTextAreaElement;

/**
 * Render a plain string containing **bold** markers as React nodes,
 * turning each `**...**` span into a <strong>. Used in the resume preview
 * and PDF export. The stored value stays plain text so it's ATS-safe.
 */
export function renderRichText(text: string): ReactNode {
  if (!text) return text;
  const parts = text.split(/(\*\*[^*]+?\*\*)/g);
  return parts.map((part, i) =>
    part.length > 4 && part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      part
    )
  );
}

function setNativeValue(el: TextField, value: string) {
  const proto =
    el instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  setter?.call(el, value);
}

/**
 * Toggle **bold** markers around the current selection of an input/textarea.
 * Dispatches a native `input` event so React's controlled onChange fires and
 * the store stays in sync. Restores the selection around the affected text.
 */
export function toggleBold(el: TextField) {
  const start = el.selectionStart ?? 0;
  const end = el.selectionEnd ?? 0;
  if (start === end) return; // nothing selected — nothing to bold

  const value = el.value;
  const before = value.slice(0, start);
  const selected = value.slice(start, end);
  const after = value.slice(end);

  let newValue: string;
  let newStart: number;
  let newEnd: number;

  const wrappedOutside = before.endsWith('**') && after.startsWith('**');
  const wrappedInside =
    selected.length > 4 && selected.startsWith('**') && selected.endsWith('**');

  if (wrappedOutside) {
    // ** sit just outside the selection — unbold by removing them
    newValue = before.slice(0, -2) + selected + after.slice(2);
    newStart = start - 2;
    newEnd = end - 2;
  } else if (wrappedInside) {
    // selection itself includes the ** — unbold by stripping them
    newValue = before + selected.slice(2, -2) + after;
    newStart = start;
    newEnd = end - 4;
  } else {
    newValue = `${before}**${selected}**${after}`;
    newStart = start + 2;
    newEnd = end + 2;
  }

  setNativeValue(el, newValue);
  el.dispatchEvent(new Event('input', { bubbles: true }));

  requestAnimationFrame(() => {
    el.focus();
    el.setSelectionRange(newStart, newEnd);
  });
}

/** Ctrl/Cmd+B keyboard shortcut for any text field. */
export function handleBoldKeyDown(e: KeyboardEvent<TextField>) {
  if ((e.metaKey || e.ctrlKey) && (e.key === 'b' || e.key === 'B')) {
    e.preventDefault();
    toggleBold(e.currentTarget);
  }
}

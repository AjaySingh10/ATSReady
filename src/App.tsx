import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { ContactSection } from './components/sections/ContactSection';
import { ResumePDF } from './components/ResumePDF';
import { SectionReorderList } from './components/SectionReorderList';
import { ResumePreview } from './components/ResumePreview';
import { ATSScore } from './components/ui/ATSScore';
import { useResumeStore } from './store';

function SaveStatus() {
  const lastSaved = useResumeStore((s) => s.lastSaved);

  if (!lastSaved) return null;

  const date = new Date(lastSaved);
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <span className="flex items-center gap-1 text-xs text-green-600">
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
      Saved {time}
    </span>
  );
}

export default function App() {
  const resetResume = useResumeStore((s) => s.resetResume);
  const resume = useResumeStore((s) => s.resume);
  const [confirmReset, setConfirmReset] = useState(false);
  const [exporting, setExporting] = useState(false);

  function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    resetResume();
    setConfirmReset(false);
  }

  async function handleExportPDF() {
    setExporting(true);
    try {
      const blob = await pdf(<ResumePDF resume={resume} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resume.contact.name || 'resume'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 print:block print:h-auto print:overflow-visible">
      {/* Left panel — form */}
      <div className="no-print w-[660px] shrink-0 flex flex-col h-full border-r border-slate-200 bg-slate-100">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-slate-200 shrink-0">
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-none">ATSReady</h1>
            <div className="flex items-center gap-3 mt-0.5">
              <SaveStatus />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                confirmReset
                  ? 'border-red-300 text-red-600 bg-red-50 hover:bg-red-100'
                  : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300'
              }`}
            >
              {confirmReset ? 'Confirm reset?' : 'Reset'}
            </button>
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {exporting ? 'Generating…' : 'Export PDF'}
            </button>
          </div>
        </div>

        {/* Scrollable form content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <ATSScore />
          <ContactSection />
          <SectionReorderList />

          {/* ATS checklist footer */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800 space-y-1.5">
            <p className="font-semibold text-blue-900">TIH ATS Checklist</p>
            <ul className="space-y-1">
              {[
                'Font: Calibri, Arial, or Garamond ≥ 10pt ✓',
                'Margins: 0.5 inches on all sides ✓',
                'No header/footer sections ✓',
                'Standard section headings ✓',
                'No symbols in headings ✓',
                'Export as PDF for submission ✓',
                'Keep to 1 page max',
                'Test in Resume Worded after export',
              ].map((item) => (
                <li key={item} className="flex gap-1.5">
                  <span className="text-blue-400">▸</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right panel — live preview */}
      <div className="flex-1 overflow-hidden bg-slate-300 flex flex-col print:block print:overflow-visible">
        <div className="no-print shrink-0 px-6 py-3 bg-slate-200 border-b border-slate-300 flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Live Preview</span>
          <span className="text-xs text-slate-400">— updates as you type. Use "Export PDF" to download.</span>
        </div>
        <div className="flex-1 min-h-0 overflow-auto p-6 print:overflow-visible print:p-0">
          <div className="flex justify-center print:block">
            <ResumePreview />
          </div>
        </div>
      </div>
    </div>
  );
}

import { useResumeStore } from '../../store';
import { SectionCard } from '../ui/SectionCard';
import { Field } from '../ui/Field';

export function ContactSection() {
  const contact = useResumeStore((s) => s.resume.contact);
  const updateResume = useResumeStore((s) => s.updateResume);

  const set = (key: keyof typeof contact, value: string) =>
    updateResume({ contact: { ...contact, [key]: value } });

  return (
    <SectionCard
      title="Contact Information"
      tip="Use | as dividers on your resume. Gmail is recommended. Never use work phone/email. Include LinkedIn at minimum."
    >
      <Field label="Full Name *" placeholder="Jane Smith" value={contact.name} onChange={(e) => set('name', e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Phone *" placeholder="+1 (555) 000-0000" value={contact.phone} onChange={(e) => set('phone', e.target.value)} />
        <Field label="Location *" placeholder="San Francisco, CA" value={contact.location} onChange={(e) => set('location', e.target.value)} />
      </div>
      <Field label="Email *" type="email" placeholder="jane@gmail.com" value={contact.email} onChange={(e) => set('email', e.target.value)} />
      <Field label="LinkedIn URL *" placeholder="linkedin.com/in/janesmith" value={contact.linkedin} onChange={(e) => set('linkedin', e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="GitHub URL" placeholder="github.com/janesmith" value={contact.github} onChange={(e) => set('github', e.target.value)} />
        <Field label="Personal Website" placeholder="janesmith.dev" value={contact.website} onChange={(e) => set('website', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Stack Overflow" placeholder="stackoverflow.com/u/..." value={contact.stackoverflow} onChange={(e) => set('stackoverflow', e.target.value)} />
        <Field label="Other (Medium, LeetCode…)" placeholder="medium.com/@jane" value={contact.other} onChange={(e) => set('other', e.target.value)} />
      </div>
    </SectionCard>
  );
}

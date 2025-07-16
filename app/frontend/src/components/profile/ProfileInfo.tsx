import React, { useState } from 'react';

interface Experience {
  id: number;
  title: string;
  company: string;
  start: string;
  end?: string;
  description?: string;
}

interface Education {
  id: number;
  school: string;
  degree: string;
  field: string;
  start: string;
  end?: string;
  description?: string;
}

interface ProfileInfoProps {
  bio: string;
  skills: string[];
  experiences: Experience[];
  educations: Education[];
  contact: {
    email: string;
    phone?: string;
    website?: string;
  };
}

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-4">
      <button
        className="w-full flex justify-between items-center py-2 px-3 bg-gray-100 rounded hover:bg-gray-200 md:cursor-default md:bg-transparent md:hover:bg-transparent"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="font-semibold text-lg">{title}</span>
        <span className="md:hidden">{open ? '−' : '+'}</span>
      </button>
      <div className={`mt-2 ${open ? '' : 'hidden md:block'}`}>{children}</div>
    </div>
  );
};

const ProfileInfo: React.FC<ProfileInfoProps> = ({ bio, skills, experiences, educations, contact }) => {
  return (
    <div className="space-y-4">
      <CollapsibleSection title="Bio">
        <p className="text-gray-700">{bio}</p>
      </CollapsibleSection>
      <CollapsibleSection title="Skills">
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span key={skill} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              {skill}
            </span>
          ))}
        </div>
      </CollapsibleSection>
      <CollapsibleSection title="Work Experience">
        <ul className="space-y-2">
          {experiences.map((exp) => (
            <li key={exp.id} className="border-l-4 border-blue-400 pl-3">
              <div className="font-semibold">{exp.title} @ {exp.company}</div>
              <div className="text-sm text-gray-500">{exp.start} - {exp.end || 'Present'}</div>
              {exp.description && <div className="text-gray-700 mt-1">{exp.description}</div>}
            </li>
          ))}
        </ul>
      </CollapsibleSection>
      <CollapsibleSection title="Education">
        <ul className="space-y-2">
          {educations.map((edu) => (
            <li key={edu.id} className="border-l-4 border-green-400 pl-3">
              <div className="font-semibold">{edu.degree} in {edu.field}</div>
              <div className="text-sm text-gray-500">{edu.school} | {edu.start} - {edu.end || 'Present'}</div>
              {edu.description && <div className="text-gray-700 mt-1">{edu.description}</div>}
            </li>
          ))}
        </ul>
      </CollapsibleSection>
      <CollapsibleSection title="Contact Information">
        <div className="space-y-1">
          <div><span className="font-medium">Email:</span> {contact.email}</div>
          {contact.phone && <div><span className="font-medium">Phone:</span> {contact.phone}</div>}
          {contact.website && <div><span className="font-medium">Website:</span> <a href={contact.website} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{contact.website}</a></div>}
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default ProfileInfo; 
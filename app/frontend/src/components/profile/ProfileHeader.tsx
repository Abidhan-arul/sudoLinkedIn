import React from 'react';

interface SocialLink {
  platform: string;
  url: string;
}

interface ProfileHeaderProps {
  avatarUrl: string;
  name: string;
  title: string;
  location: string;
  socialLinks: SocialLink[];
}

const platformIcons: Record<string, string> = {
  linkedin: 'fab fa-linkedin',
  twitter: 'fab fa-twitter',
  github: 'fab fa-github',
  facebook: 'fab fa-facebook',
  instagram: 'fab fa-instagram',
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  avatarUrl,
  name,
  title,
  location,
  socialLinks,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start bg-white rounded-lg shadow p-6 md:p-8 gap-4 md:gap-8 w-full">
      <img
        src={avatarUrl}
        alt="User avatar"
        className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-blue-500 object-cover shadow-md"
      />
      <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{name}</h1>
        <p className="text-lg text-blue-600 font-medium mt-1">{title}</p>
        <p className="text-gray-500 mt-1">{location}</p>
        <div className="flex gap-3 mt-3">
          {socialLinks.map((link) => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-600 text-xl"
              aria-label={link.platform}
            >
              <i className={platformIcons[link.platform] || 'fas fa-link'}></i>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader; 
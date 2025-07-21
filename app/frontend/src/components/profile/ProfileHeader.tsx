import React from 'react';

interface ProfileHeaderProps {
  user: {
    avatarUrl?: string;
    name: string;
    title?: string;
    location?: string;
    social?: {
      linkedin?: string;
      twitter?: string;
      github?: string;
    };
  };
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-end md:space-x-6 p-4 bg-gray-100 rounded-lg mb-6">
      <div className="flex-shrink-0 mb-4 md:mb-0">
        <img
          src={user.avatarUrl || '/default-avatar.png'}
          alt="Avatar"
          className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
        />
      </div>
      <div className="flex-1 text-center md:text-left">
        <div className="text-2xl font-bold">{user.name}</div>
        {user.title && <div className="text-gray-600">{user.title}</div>}
        {user.location && <div className="text-gray-500 text-sm">{user.location}</div>}
        <div className="flex justify-center md:justify-start space-x-4 mt-2">
          {user.social?.linkedin && (
            <a href={user.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">LinkedIn</a>
          )}
          {user.social?.twitter && (
            <a href={user.social.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Twitter</a>
          )}
          {user.social?.github && (
            <a href={user.social.github} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:underline">GitHub</a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader; 
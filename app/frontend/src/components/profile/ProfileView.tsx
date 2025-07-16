import React, { useEffect, useState } from 'react';
import { profileApi } from './api';
import ProfileHeader from './ProfileHeader';
import ProfileInfo from './ProfileInfo';
import ActivityFeed from './ActivityFeed';

const ProfileView: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    profileApi.getProfile()
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load profile.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <span className="text-gray-500">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <span className="text-red-500">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <ProfileHeader
        avatarUrl={profile.avatarUrl}
        name={profile.name}
        title={profile.title}
        location={profile.location}
        socialLinks={profile.socialLinks}
      />
      <ProfileInfo
        bio={profile.bio}
        skills={profile.skills}
        experiences={profile.experiences}
        educations={profile.educations}
        contact={profile.contact}
      />
      <ActivityFeed
        posts={profile.posts}
        interactions={profile.interactions}
        connectionCount={profile.connectionCount}
        mutualConnections={profile.mutualConnections}
      />
    </div>
  );
};

export default ProfileView; 
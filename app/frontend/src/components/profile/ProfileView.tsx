import React, { useEffect, useState } from 'react';
import { profileApi } from './api';
import ProfileHeader from './ProfileHeader';

const ProfileView: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await profileApi.getProfile();
        setProfile(data);
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Map API data to ProfileHeader props
  const headerUser = profile && {
    avatarUrl: profile.profile?.avatarUrl ? `http://localhost:5000${profile.profile.avatarUrl}` : undefined,
    name: profile.username || profile.name || '',
    title: profile.profile?.title || '',
    location: profile.profile?.location || '',
    social: profile.profile?.social || {},
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        {loading && <p>Loading profile...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {profile && (
          <>
            <ProfileHeader user={headerUser} />
            <div className="space-y-2">
              <div><strong>Bio:</strong> {profile.profile?.summary || ''}</div>
              <div><strong>Skills:</strong> {(profile.profile?.skills || []).join(', ')}</div>
              {/* Add experience, education, contact info, etc. here */}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileView; 
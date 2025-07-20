import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { profileApi } from './api';

const ProfileView: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    profileApi.getProfile()
      .then(data => {
        console.log('Profile data received:', data); // Debug log
        setProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Profile fetch error:', err); // Debug log
        setError('Failed to load profile');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!profile) return <div>No profile data found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start bg-white rounded-lg shadow p-6 mb-6">
        <img
          src={profile.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'User')}&size=128`}
          alt="Avatar"
          className="w-32 h-32 rounded-full border-4 border-blue-500 mb-4 md:mb-0 md:mr-6"
        />
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">{profile.full_name || 'User'}</h1>
              <div className="text-gray-600 text-lg">{profile.headline}</div>
              <div className="text-gray-500">{profile.location}</div>
            </div>
            <Link
              to="/profile/edit"
              className="mt-4 md:mt-0 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Edit Profile
            </Link>
          </div>
          <div className="flex justify-center md:justify-start space-x-4 mt-2">
            <a href="#" className="text-blue-600 hover:underline">LinkedIn</a>
            <a href="#" className="text-blue-400 hover:underline">Twitter</a>
            <a href="#" className="text-gray-700 hover:underline">Website</a>
          </div>
        </div>
      </div>

      {/* Skills & Bio */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">Skills</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {(profile.skills || []).map((skill: string) => (
            <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">{skill}</span>
          ))}
        </div>
        <h2 className="text-xl font-semibold mb-2">About</h2>
        <p className="text-gray-700">{profile.summary}</p>
      </div>

      {/* Experience */}
      {profile.experiences && profile.experiences.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Experience</h2>
          {profile.experiences.map((exp: any) => (
            <div key={exp.id} className="mb-4 pb-4 border-b border-gray-200 last:border-b-0">
              <h3 className="font-semibold">{exp.title}</h3>
              <p className="text-gray-600">{exp.company}</p>
              <p className="text-gray-500 text-sm">
                {exp.start_date} - {exp.end_date || 'Present'}
              </p>
              {exp.description && <p className="text-gray-700 mt-2">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {profile.educations && profile.educations.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Education</h2>
          {profile.educations.map((edu: any) => (
            <div key={edu.id} className="mb-4 pb-4 border-b border-gray-200 last:border-b-0">
              <h3 className="font-semibold">{edu.school}</h3>
              <p className="text-gray-600">{edu.degree} in {edu.field_of_study}</p>
              <p className="text-gray-500 text-sm">
                {edu.start_year} - {edu.end_year || 'Present'}
              </p>
              {edu.description && <p className="text-gray-700 mt-2">{edu.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Contact Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">Contact Info</h2>
        <div className="text-gray-700">
          <div>Email: {profile.email || 'Not provided'}</div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView; 
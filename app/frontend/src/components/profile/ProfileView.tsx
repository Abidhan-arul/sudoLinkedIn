import React, { useRef, useState } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { useNavigate } from 'react-router-dom';
import AuthImage from './AuthImage';

const ProfileView: React.FC = () => {
  const { profile, loading, error, updateProfile, uploadImage, refreshProfile, clearError } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editProfile, setEditProfile] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imgTimestamp, setImgTimestamp] = useState(Date.now());
  const navigate = useNavigate();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setUploading(true);
        await uploadImage(file);
        await refreshProfile(); // Ensure profile is refreshed after upload
        setImgTimestamp(Date.now()); // Update timestamp to bust cache
        setSaveMsg('Profile photo updated!');
        setTimeout(() => setSaveMsg(''), 2000);
      } catch (error) {
        setSaveMsg('Image upload failed');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleProfileUpdate = (field: string, value: string) => {
    setEditProfile((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      await updateProfile(editProfile);
      setSaveMsg('Profile saved!');
      setEditProfile({});
      setTimeout(() => setSaveMsg(''), 2000);
    } catch (error) {
      setSaveMsg('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <ErrorMessage 
          message={error} 
          onRetry={refreshProfile}
          onDismiss={clearError}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 py-8">
      <div className="relative rounded-2xl shadow-2xl bg-white/80 backdrop-blur-md border border-gray-200 overflow-hidden max-w-4xl w-full">
        {/* Gradient Header with Title */}
        <div className="h-44 bg-gradient-to-r from-blue-600 to-indigo-500 flex flex-col items-center justify-end relative">
          <h1 className="text-4xl font-extrabold text-white mb-4 drop-shadow-lg tracking-tight">Profile</h1>
        </div>
        {/* Profile Image - Overlapping */}
        <div className="flex flex-col items-center -mt-24">
          <div className="relative group w-40 h-40">
            <AuthImage
              imageUrl={profile?.profile_image_url || profile?.profile_thumbnail_url || ''}
              token={localStorage.getItem('token') || ''}
              alt="Profile"
              className="w-40 h-40 rounded-full border-4 border-white shadow-2xl object-cover group-hover:opacity-80 transition-opacity duration-200"
            />
            {/* Overlay for upload */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
              style={{ zIndex: 2 }}
              aria-label="Change Photo"
            >
              {uploading ? (
                <LoadingSpinner size="sm" text="" />
              ) : (
                <>
                  <svg className="w-8 h-8 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs text-white font-semibold">Change Photo</span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 tracking-tight">{editProfile.full_name ?? profile?.full_name}</h2>
          {profile?.headline && (
            <p className="text-lg text-gray-600 mt-1">{editProfile.headline ?? profile.headline}</p>
          )}
        </div>
        <div className="p-12 pt-8 bg-white/70 space-y-10">
          {/* Personal Info Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-blue-50 rounded-xl shadow p-8 border border-gray-100">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <div>
                <div className="text-xs text-gray-500">Full Name</div>
                <div className="text-lg font-semibold text-gray-900">{profile?.full_name}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 12.414a2 2 0 00-2.828 0l-4.243 4.243M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <div>
                <div className="text-xs text-gray-500">Headline</div>
                <div className="text-gray-700">{profile?.headline}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 12.414a2 2 0 00-2.828 0l-4.243 4.243" /></svg>
              <div>
                <div className="text-xs text-gray-500">Location</div>
                <div className="text-gray-700">{profile?.location}</div>
              </div>
            </div>
          </div>
          {/* About Block */}
          <div className="bg-indigo-50 rounded-xl shadow p-8 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" /></svg>
              <div className="text-xs text-gray-500">About</div>
            </div>
            <div className="text-gray-700 whitespace-pre-line pl-7">{profile?.about}</div>
          </div>
          {/* Summary Block */}
          <div className="bg-yellow-50 rounded-xl shadow p-8 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17l4 4 4-4m0-5a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div className="text-xs text-gray-500">Summary</div>
            </div>
            <div className="text-gray-700 whitespace-pre-line pl-7">{profile?.summary}</div>
          </div>
          {/* Skills Block */}
          <div className="bg-cyan-50 rounded-xl shadow p-8 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6" /></svg>
              <div className="text-xs text-gray-500">Skills</div>
            </div>
            <div className="flex flex-wrap gap-2 pl-7">
              {(profile?.skills || []).map((skill: string, idx: number) => (
                <span key={idx} className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-4 py-1 rounded-full text-sm font-semibold shadow-sm border border-blue-200">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className="flex justify-end mt-10">
            <button
              onClick={() => navigate('/profile/edit')}
              className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-8 py-2 rounded-lg font-bold shadow-lg hover:scale-105 hover:from-blue-600 hover:to-indigo-500 transition-all duration-200"
            >
              Edit Profile
            </button>
          </div>
          {/* Offline Indicator */}
          {!navigator.onLine && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-6">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="ml-2 text-sm text-yellow-800">
                  You're currently offline. Changes will be saved when you reconnect.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileView; 
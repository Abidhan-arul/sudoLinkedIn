import React, { useEffect, useState, useRef } from 'react';
import { profileApi } from './api';
import { useAuth } from '../../context/AuthContext';

const initialSocial = { linkedin: '', twitter: '', github: '' };

const ProfileEdit: React.FC = () => {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [social, setSocial] = useState(initialSocial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validation, setValidation] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [profileUpdated, setProfileUpdated] = useState(false);

  const { user, login } = useAuth();

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await profileApi.getProfile();
      setName(data.username || data.name || '');
      setTitle(data.profile?.title || '');
      setLocation(data.profile?.location || '');
      setBio(data.profile?.summary || '');
      setSkills((data.profile?.skills || []).join(', '));
      setSocial({
        linkedin: data.profile?.social?.linkedin || '',
        twitter: data.profile?.social?.twitter || '',
        github: data.profile?.social?.github || '',
      });
      if (data.profile?.avatarUrl) setAvatarPreview(`http://localhost:5000${data.profile.avatarUrl}`);
    } catch (err) {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profileUpdated) {
      fetchProfile();
      setProfileUpdated(false);
    }
  }, [profileUpdated]);

  // Real-time validation
  useEffect(() => {
    const v: { [key: string]: string } = {};
    if (!name.trim()) v.name = 'Name is required.';
    if (skills && skills.split(',').some(s => s.length > 20)) v.skills = 'Each skill must be 20 characters or less.';
    setValidation(v);
  }, [name, skills]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      setUploading(true);
      try {
        const res = await profileApi.uploadProfileImage(file);
        console.log('Avatar upload response:', res);
        if (res.avatarUrl) {
          setAvatarPreview(`http://localhost:5000${res.avatarUrl}`);
          // Update user object in localStorage/context
          if (user) {
            const updatedUser = { ...user, avatarUrl: res.avatarUrl };
            login(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
          // Refetch profile to update UI
          fetchProfile();
        }
      } catch (err) {
        setUploadError('Failed to upload image.');
        console.error('Avatar upload error:', err);
      } finally {
        setUploading(false);
      }
    } else {
      setAvatarPreview(null);
    }
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSocial({ ...social, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (Object.keys(validation).length > 0) return;
    const payload = {
      full_name: name,
      title,
      location,
      summary: bio,
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      social,
    };
    console.log('Profile update payload:', payload);
    try {
      const res = await profileApi.updateProfile(payload);
      console.log('Profile update response:', res);
      setSuccess(true);
      setProfileUpdated(true);
    } catch (err) {
      setError('Failed to update profile.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
        {loading && <p>Loading profile...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center space-x-4">
            <div>
              <img
                src={avatarPreview || '/default-avatar.png'}
                alt="Avatar Preview"
                className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
              />
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
              />
              <button
                type="button"
                className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                onClick={() => fileInputRef.current?.click()}
              >
                Change Avatar
              </button>
            </div>
          </div>
          {uploading && <div className="text-blue-600">Uploading...</div>}
          {uploadError && <div className="text-red-500">{uploadError}</div>}
          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Name</label>
              <input
                className="w-full border rounded p-2"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              {validation.name && <div className="text-red-500 text-sm">{validation.name}</div>}
            </div>
            <div>
              <label className="block font-medium mb-1">Title</label>
              <input
                className="w-full border rounded p-2"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Location</label>
              <input
                className="w-full border rounded p-2"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>
          </div>
          {/* Bio */}
          <div>
            <label className="block font-medium mb-1">Bio</label>
            <textarea
              className="w-full border rounded p-2"
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
            />
          </div>
          {/* Skills */}
          <div>
            <label className="block font-medium mb-1">Skills (comma separated)</label>
            <input
              className="w-full border rounded p-2"
              value={skills}
              onChange={e => setSkills(e.target.value)}
            />
            {validation.skills && <div className="text-red-500 text-sm">{validation.skills}</div>}
          </div>
          {/* Social Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium mb-1">LinkedIn</label>
              <input
                className="w-full border rounded p-2"
                name="linkedin"
                value={social.linkedin}
                onChange={handleSocialChange}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Twitter</label>
              <input
                className="w-full border rounded p-2"
                name="twitter"
                value={social.twitter}
                onChange={handleSocialChange}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">GitHub</label>
              <input
                className="w-full border rounded p-2"
                name="github"
                value={social.github}
                onChange={handleSocialChange}
              />
            </div>
          </div>
          {/* Experience and Education sections can be added here as arrays */}
          {success && <div className="text-green-600">Profile updated!</div>}
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={loading || Object.keys(validation).length > 0}
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit; 
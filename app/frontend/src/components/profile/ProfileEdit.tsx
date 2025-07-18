import React, { useState, useEffect } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { useNavigate } from 'react-router-dom';

const ProfileEdit: React.FC = () => {
  const { profile, updateProfile, loading, error, refreshProfile } = useProfile();
  const [form, setForm] = useState<any>({});
  const [saveMsg, setSaveMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        headline: profile.headline || '',
        summary: profile.summary || '',
        about: profile.about || '',
        location: profile.location || '',
        skills: (profile.skills || []).join(', '),
        email: profile.email || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      // Only include allowed fields and non-empty values, exclude email
      const allowedFields = ['full_name', 'headline', 'summary', 'location', 'about', 'skills'];
      const payload: any = {};
      allowedFields.forEach(field => {
        let value = form[field];
        if (field === 'skills') {
          value = value.split(',').map((s: string) => s.trim()).filter((s: string) => s);
        }
        if (value !== undefined && value !== null && value !== '') {
          payload[field] = value;
        }
      });
      // Ensure full_name is present and valid
      if (!payload.full_name || payload.full_name.length < 2) {
        setSaveMsg('Full name must be at least 2 characters.');
        setSaving(false);
        return;
      }
      await updateProfile(payload);
      setSaveMsg('Profile updated!');
      setTimeout(() => setSaveMsg(''), 2000);
      refreshProfile();
    } catch (err) {
      setSaveMsg('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 py-8">
      <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl p-10 max-w-4xl w-full">
        <h1 className="text-3xl font-extrabold text-indigo-700 mb-8 tracking-tight flex items-center gap-3 mt-2 ml-12">
          <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Edit Profile
        </h1>
        {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
        {saveMsg && <div className="mb-4 text-green-600 font-semibold">{saveMsg}</div>}
        {/* Remove email block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-2 bg-blue-50 rounded-xl shadow p-6 border border-gray-100">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Full Name
            </label>
            <input type="text" name="full_name" value={form.full_name || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200 transition" />
          </div>
          <div className="flex flex-col gap-2 bg-pink-50 rounded-xl shadow p-6 border border-gray-100">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 12.414a2 2 0 00-2.828 0l-4.243 4.243M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Headline
            </label>
            <input type="text" name="headline" value={form.headline || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-200 transition" />
          </div>
          <div className="flex flex-col gap-2 bg-green-50 rounded-xl shadow p-6 border border-gray-100">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 12.414a2 2 0 00-2.828 0l-4.243 4.243" /></svg>
              Location
            </label>
            <input type="text" name="location" value={form.location || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-200 transition" />
          </div>
          <div className="md:col-span-2 flex flex-col gap-2 mt-2 bg-indigo-50 rounded-xl shadow p-6 border border-gray-100">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17l4 4 4-4m0-5a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Summary
            </label>
            <textarea name="summary" value={form.summary || ''} onChange={handleChange} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-yellow-200 transition" />
          </div>
          <div className="md:col-span-2 flex flex-col gap-2 mt-2 bg-yellow-50 rounded-xl shadow p-6 border border-gray-100">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" /></svg>
              About
            </label>
            <textarea name="about" value={form.about || ''} onChange={handleChange} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-200 transition" />
          </div>
          <div className="md:col-span-2 flex flex-col gap-2 mt-2 bg-cyan-50 rounded-xl shadow p-6 border border-gray-100">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6" /></svg>
              Skills (comma separated)
            </label>
            <input type="text" name="skills" value={form.skills || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-200 transition" placeholder="e.g. Python, React, SQL" />
          </div>
        </div>
        <div className="flex justify-end mt-10">
          <button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-8 py-2 rounded-lg font-bold shadow-lg hover:scale-105 hover:from-blue-600 hover:to-indigo-500 transition-all duration-200 disabled:opacity-60">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
        {/* Back Arrow at left bottom */}
        <button onClick={() => navigate('/profile')} className="fixed left-10 bottom-10 flex items-center gap-2 text-indigo-600 hover:text-indigo-900 font-semibold text-lg focus:outline-none z-50">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Home
        </button>
      </div>
    </div>
  );
};

export default ProfileEdit; 
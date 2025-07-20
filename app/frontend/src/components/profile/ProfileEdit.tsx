import React, { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { profileApi } from './api';

interface Experience {
  id?: number;
  title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  description: string;
}

interface Education {
  id?: number;
  school: string;
  degree: string;
  field_of_study: string;
  start_year: string;
  end_year: string;
  description: string;
}

const ProfileEdit: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    profileApi.getProfile().then(data => {
      setFullName(data.full_name || '');
      setHeadline(data.headline || '');
      setSummary(data.summary || '');
      setLocation(data.location || '');
      setSkills((data.skills || []).join(', '));
      setExperiences(data.experiences || []);
      setEducations(data.educations || []);
      setImageUrl(data.image_url || null);
      setLoading(false);
    }).catch((err) => {
      console.error('Profile load error:', err);
      setError('Failed to load profile');
      setLoading(false);
    });
  }, []);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleImageUpload = async () => {
    if (!image) return;
    setUploading(true);
    setError('');
    try {
      const res = await profileApi.uploadImage(image);
      setImageUrl(res.image_url);
      setSuccess('Image uploaded!');
    } catch {
      setError('Image upload failed');
    }
    setUploading(false);
  };

  const addExperience = () => {
    setExperiences([...experiences, {
      title: '',
      company: '',
      location: '',
      start_date: '',
      end_date: '',
      description: ''
    }]);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const addEducation = () => {
    setEducations([...educations, {
      school: '',
      degree: '',
      field_of_study: '',
      start_year: '',
      end_year: '',
      description: ''
    }]);
  };

  const removeEducation = (index: number) => {
    setEducations(educations.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...educations];
    updated[index] = { ...updated[index], [field]: value };
    setEducations(updated);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await profileApi.updateProfile({
        full_name: fullName,
        headline,
        summary,
        location,
        skills: skills.split(',').map(s => s.trim()).filter(s => s),
        experiences,
        educations
      });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Update failed');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)} 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
                <input 
                  value={headline} 
                  onChange={e => setHeadline(e.target.value)} 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="e.g., Software Engineer at Tech Company"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input 
                value={location} 
                onChange={e => setLocation(e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="e.g., San Francisco, CA"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
              <textarea 
                value={summary} 
                onChange={e => setSummary(e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                rows={4}
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          {/* Skills */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Skills</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
              <input 
                value={skills} 
                onChange={e => setSkills(e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="e.g., JavaScript, React, Python, Node.js"
              />
            </div>
          </div>

          {/* Experience */}
          <div className="border-b pb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Experience</h2>
              <button 
                type="button" 
                onClick={addExperience}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Experience
              </button>
            </div>
            {experiences.map((exp, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">Experience {index + 1}</h3>
                  <button 
                    type="button" 
                    onClick={() => removeExperience(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input 
                      value={exp.title} 
                      onChange={e => updateExperience(index, 'title', e.target.value)} 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <input 
                      value={exp.company} 
                      onChange={e => updateExperience(index, 'company', e.target.value)} 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input 
                      value={exp.location} 
                      onChange={e => updateExperience(index, 'location', e.target.value)} 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input 
                      type="date"
                      value={exp.start_date} 
                      onChange={e => updateExperience(index, 'start_date', e.target.value)} 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input 
                      type="date"
                      value={exp.end_date} 
                      onChange={e => updateExperience(index, 'end_date', e.target.value)} 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    value={exp.description} 
                    onChange={e => updateExperience(index, 'description', e.target.value)} 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    rows={3}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="border-b pb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Education</h2>
              <button 
                type="button" 
                onClick={addEducation}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Education
              </button>
            </div>
            {educations.map((edu, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">Education {index + 1}</h3>
                  <button 
                    type="button" 
                    onClick={() => removeEducation(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                    <input 
                      value={edu.school} 
                      onChange={e => updateEducation(index, 'school', e.target.value)} 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                    <input 
                      value={edu.degree} 
                      onChange={e => updateEducation(index, 'degree', e.target.value)} 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                    <input 
                      value={edu.field_of_study} 
                      onChange={e => updateEducation(index, 'field_of_study', e.target.value)} 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Year</label>
                    <input 
                      type="number"
                      value={edu.start_year} 
                      onChange={e => updateEducation(index, 'start_year', e.target.value)} 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Year</label>
                    <input 
                      type="number"
                      value={edu.end_year} 
                      onChange={e => updateEducation(index, 'end_year', e.target.value)} 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    value={edu.description} 
                    onChange={e => updateEducation(index, 'description', e.target.value)} 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    rows={3}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Profile Image */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Profile Image</h2>
            <div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {imageUrl && (
                <div className="mt-4">
                  <img src={imageUrl} alt="Preview" className="w-32 h-32 rounded-full object-cover border-4 border-gray-200" />
                  {image && (
                    <button 
                      type="button" 
                      onClick={handleImageUpload} 
                      className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50" 
                      disabled={uploading}
                    >
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          {error && <div className="text-red-500 bg-red-50 p-3 rounded-md">{error}</div>}
          {success && <div className="text-green-600 bg-green-50 p-3 rounded-md">{success}</div>}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button 
              type="submit" 
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit; 
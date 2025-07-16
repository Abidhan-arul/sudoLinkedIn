import React, { useState } from 'react';

interface ProfileEditForm {
  username: string;
  email: string;
  bio: string;
  skills: string;
}

const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
const validateUsername = (username: string) => username.length >= 3;
const validateSkills = (skills: string) => skills.split(',').every(s => s.trim().length > 0);

const InputField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string;
  placeholder?: string;
}> = ({ label, value, onChange, type = 'text', error, placeholder }) => (
  <div className="mb-4">
    <label className="block font-medium mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${error ? 'border-red-500' : 'border-gray-300'}`}
      placeholder={placeholder}
    />
    {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
  </div>
);

const TextAreaField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
}> = ({ label, value, onChange, error, placeholder }) => (
  <div className="mb-4">
    <label className="block font-medium mb-1">{label}</label>
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${error ? 'border-red-500' : 'border-gray-300'}`}
      placeholder={placeholder}
      rows={3}
    />
    {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
  </div>
);

const ProfileEdit: React.FC = () => {
  const [form, setForm] = useState<ProfileEditForm>({
    username: '',
    email: '',
    bio: '',
    skills: '',
  });
  const [errors, setErrors] = useState<Partial<ProfileEditForm>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  // Image upload state
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [dragActive, setDragActive] = useState(false);

  const validate = (field: keyof ProfileEditForm, value: string) => {
    switch (field) {
      case 'email':
        return validateEmail(value) ? '' : 'Invalid email address';
      case 'username':
        return validateUsername(value) ? '' : 'Username must be at least 3 characters';
      case 'skills':
        return validateSkills(value) ? '' : 'Skills must be comma-separated words';
      default:
        return '';
    }
  };

  const handleChange = (field: keyof ProfileEditForm, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: validate(field, value) }));
  };

  const handleImageChange = (file: File | null) => {
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageChange(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const simulateUpload = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 10;
      });
    }, 80);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    const newErrors: Partial<ProfileEditForm> = {};
    (Object.keys(form) as (keyof ProfileEditForm)[]).forEach(field => {
      const err = validate(field, form[field]);
      if (err) valid = false;
      newErrors[field] = err;
    });
    setErrors(newErrors);
    if (!valid) return;
    setSubmitting(true);
    setSuccess(false);
    setErrorMsg('');
    if (image) {
      simulateUpload();
    }
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section: Account Info */}
          <div>
            <h2 className="font-semibold text-lg mb-2">Account Info</h2>
            <InputField
              label="Username"
              value={form.username}
              onChange={v => handleChange('username', v)}
              error={errors.username}
              placeholder="Enter your username"
            />
            <InputField
              label="Email"
              value={form.email}
              onChange={v => handleChange('email', v)}
              error={errors.email}
              placeholder="Enter your email"
              type="email"
            />
          </div>
          {/* Section: Bio */}
          <div>
            <h2 className="font-semibold text-lg mb-2">Bio</h2>
            <TextAreaField
              label="Bio"
              value={form.bio}
              onChange={v => handleChange('bio', v)}
              error={errors.bio}
              placeholder="Tell us about yourself"
            />
          </div>
          {/* Section: Skills */}
          <div>
            <h2 className="font-semibold text-lg mb-2">Skills</h2>
            <InputField
              label="Skills"
              value={form.skills}
              onChange={v => handleChange('skills', v)}
              error={errors.skills}
              placeholder="e.g. React, Node.js, SQL"
            />
          </div>
          {/* Section: Image Upload */}
          <div>
            <h2 className="font-semibold text-lg mb-2">Profile Image</h2>
            <div
              className={`border-2 border-dashed rounded p-4 text-center transition-colors duration-200 ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-400'}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="profile-image-input"
                onChange={handleFileInput}
              />
              {imagePreview ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-blue-400 mx-auto" />
                  <button
                    type="button"
                    className="text-red-500 hover:underline text-sm"
                    onClick={() => handleImageChange(null)}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label htmlFor="profile-image-input" className="block cursor-pointer text-gray-500">
                  Drag & drop an image here, or <span className="text-blue-600 underline">browse</span>
                </label>
              )}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
              {uploadProgress === 100 && (
                <div className="text-green-600 mt-2">Upload complete!</div>
              )}
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            {success && <span className="text-green-600 font-medium">Profile updated!</span>}
            {errorMsg && <span className="text-red-600 font-medium">{errorMsg}</span>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit; 
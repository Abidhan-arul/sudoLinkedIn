import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const PostCreate: React.FC = () => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleContentChange = (value: string) => {
    setContent(value);
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setMedia(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!content || content === '<p><br></p>') {
      setError('Post content is required.');
      return;
    }
    setLoading(true);
    // TODO: Implement API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setContent('');
      setMedia(null);
      setPreviewUrl(null);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Create Post</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Content</label>
            <ReactQuill
              value={content}
              onChange={handleContentChange}
              theme="snow"
              className="mb-2"
              readOnly={loading}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Media (Image/Video)</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaChange}
              disabled={loading}
            />
          </div>
          {previewUrl && (
            <div className="mb-4">
              <label className="block mb-1 font-medium">Preview</label>
              {media && media.type.startsWith('image') ? (
                <img src={previewUrl} alt="Preview" className="max-h-48 rounded" />
              ) : (
                <video src={previewUrl} controls className="max-h-48 rounded" />
              )}
            </div>
          )}
          {error && <div className="text-red-500 mb-2">{error}</div>}
          {success && <div className="text-green-600 mb-2">Post created successfully!</div>}
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostCreate; 
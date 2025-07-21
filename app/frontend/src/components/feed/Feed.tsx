import React, { useEffect, useState } from 'react';
import { feedApi } from './api';

interface Post {
  id: number;
  user_id: number;
  username: string;
  content: string;
  media_url?: string;
  created_at: string;
}

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await feedApi.getFeed();
        setPosts(data);
      } catch (err) {
        setError('Failed to load feed.');
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Welcome to the Feed!</h1>
        {loading && <p>Loading feed...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && posts.length === 0 && <p>No posts yet.</p>}
        {!loading && !error && posts.map(post => (
          <div key={post.id} className="bg-white rounded shadow p-4">
            <div className="font-semibold mb-1">{post.username || 'Unknown User'}</div>
            <div className="mb-2" dangerouslySetInnerHTML={{ __html: post.content }} />
            {post.media_url && (
              post.media_url.match(/\.(mp4|mov|avi)$/i) ? (
                <video src={post.media_url} controls className="max-h-64 w-full rounded mb-2" />
              ) : (
                <img src={post.media_url} alt="Post media" className="max-h-64 w-full rounded mb-2" />
              )
            )}
            <div className="text-xs text-gray-500">{new Date(post.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feed; 
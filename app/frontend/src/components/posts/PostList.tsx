import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';

const API_URL = 'http://localhost:5000/api/posts';

interface Post {
  id: number;
  user_id: number;
  username: string;
  content: string;
  media_url?: string;
  created_at: string;
  category?: string;
  tags?: string[];
  visibility?: string;
  likes_count?: number;
  views_count?: number;
}

const visibilities = ['public', 'private', 'connections'];
const sortOptions = [
  { value: 'created_at', label: 'Newest' },
  { value: 'likes_count', label: 'Most Liked' },
  { value: 'views_count', label: 'Most Viewed' },
];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

function useInfiniteScroll({ loading, hasMore, onLoadMore }: { loading: boolean; hasMore: boolean; onLoadMore: () => void; }) {
  const observer = useRef<IntersectionObserver | null>(null);
  const lastRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (loading || !hasMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new window.IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        onLoadMore();
      }
    });
    if (lastRef.current) observer.current.observe(lastRef.current);
    return () => observer.current?.disconnect();
  }, [loading, hasMore, onLoadMore]);
  return lastRef;
}

const PostCard = React.memo(({ post, refProp }: { post: Post; refProp?: React.Ref<HTMLDivElement> }) => (
  <div
    ref={refProp}
    className="bg-white rounded shadow p-4 flex flex-col gap-2"
  >
    <div className="font-semibold">{post.username || 'Unknown User'}</div>
    <div dangerouslySetInnerHTML={{ __html: post.content }} />
    {post.media_url && (
      post.media_url.match(/\.(mp4|mov|avi)$/i) ? (
        <video src={post.media_url} controls className="max-h-64 w-full rounded mb-2" />
      ) : (
        <img
          src={post.media_url}
          alt="Post media"
          className="max-h-64 w-full rounded mb-2"
          loading="lazy"
          onError={e => (e.currentTarget.style.display = 'none')}
        />
      )
    )}
    <div className="text-xs text-gray-500">{new Date(post.created_at).toLocaleString()}</div>
  </div>
));

const FilterBar = React.memo(({ search, setSearch, category, setCategory, tags, setTags, visibility, setVisibility, sort, setSort, order, setOrder, categories, popularTags }: any) => (
  <div className="flex flex-wrap gap-2 mb-4 items-center">
    <input
      type="text"
      placeholder="Search posts..."
      className="border rounded p-2 flex-1 min-w-[120px]"
      value={search}
      onChange={e => setSearch(e.target.value)}
    />
    <select
      className="border rounded p-2"
      value={category}
      onChange={e => setCategory(e.target.value)}
    >
      {categories.map((cat: string) => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
    </select>
    <input
      type="text"
      placeholder="Tags (comma separated)"
      className="border rounded p-2 min-w-[120px]"
      value={tags}
      onChange={e => setTags(e.target.value)}
      list="popular-tags"
    />
    <datalist id="popular-tags">
      {popularTags.map((tag: string) => <option key={tag} value={tag} />)}
    </datalist>
    <select
      className="border rounded p-2"
      value={visibility}
      onChange={e => setVisibility(e.target.value)}
    >
      <option value="">All</option>
      {visibilities.map(v => (
        <option key={v} value={v}>{v}</option>
      ))}
    </select>
    <select
      className="border rounded p-2"
      value={sort}
      onChange={e => setSort(e.target.value)}
    >
      {sortOptions.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <button
      className="border rounded p-2"
      onClick={() => setOrder(order === 'desc' ? 'asc' : 'desc')}
    >
      {order === 'desc' ? '↓' : '↑'}
    </button>
  </div>
));

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, info: any) { console.error(error, info); }
  render() {
    if (this.state.hasError) return <div className="text-red-600">Something went wrong.</div>;
    return this.props.children;
  }
}

const SkeletonCard = () => (
  <div className="bg-white rounded shadow p-4 flex flex-col gap-2 animate-pulse">
    <div className="h-4 w-1/3 bg-gray-200 rounded mb-2" />
    <div className="h-6 w-full bg-gray-200 rounded mb-2" />
    <div className="h-32 w-full bg-gray-200 rounded mb-2" />
    <div className="h-3 w-1/4 bg-gray-200 rounded" />
  </div>
);

const PostList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [tags, setTags] = useState('');
  const [visibility, setVisibility] = useState('');
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const debouncedSearch = useDebounce(search, 500);

  // Fetch categories and tags from backend
  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then(res => res.json())
      .then(data => setCategories(['All', ...(data.categories || [])]))
      .catch(() => setCategories(['All']));
    fetch(`${API_URL}/popular-tags`)
      .then(res => res.json())
      .then(data => setPopularTags(data.tags || []))
      .catch(() => setPopularTags([]));
  }, []);

  const fetchPosts = useCallback(async (pageNum: number, reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', String(pageNum));
      params.append('per_page', '10');
      if (category && category !== 'All') params.append('category', category);
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (tags) params.append('tags', tags);
      if (visibility) params.append('visibility', visibility);
      if (sort) params.append('sort', sort);
      if (order) params.append('order', order);
      const res = await fetch(`${API_URL}?${params.toString()}`);
      const data = await res.json();
      if (reset) {
        setPosts(data.posts);
      } else if (pageNum === 1) {
        setPosts(data.posts);
      } else {
        setPosts(prev => [...prev, ...data.posts]);
      }
      setHasMore(pageNum < data.pages);
    } catch (err) {
      setError('Failed to load posts.');
    } finally {
      setLoading(false);
    }
  }, [category, debouncedSearch, tags, visibility, sort, order]);

  // Refetch on filter change
  useEffect(() => {
    setPage(1);
    fetchPosts(1, true);
  }, [fetchPosts]);

  // Fetch more on page change
  useEffect(() => {
    if (page === 1) return;
    fetchPosts(page);
  }, [page, fetchPosts]);

  // Infinite scroll
  const lastPostRef = useInfiniteScroll({
    loading,
    hasMore,
    onLoadMore: () => setPage(prev => prev + 1),
  });

  const memoizedPosts = useMemo(() => posts, [posts]);

  return (
    <ErrorBoundary>
    <div className="max-w-2xl mx-auto p-4">
        <FilterBar
          search={search} setSearch={setSearch}
          category={category} setCategory={setCategory}
          tags={tags} setTags={setTags}
          visibility={visibility} setVisibility={setVisibility}
          sort={sort} setSort={setSort}
          order={order} setOrder={setOrder}
          categories={categories}
          popularTags={popularTags}
        />
        <div className="space-y-6">
          {memoizedPosts.length === 0 && !loading && !error && <p>No posts yet.</p>}
          {loading && memoizedPosts.length === 0 && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          {memoizedPosts.map((post, idx) => (
            <PostCard
              key={post.id}
              post={post}
              refProp={idx === memoizedPosts.length - 1 ? lastPostRef : undefined}
            />
          ))}
          {loading && memoizedPosts.length > 0 && <div className="text-blue-600">Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}
          {!hasMore && memoizedPosts.length > 0 && <div className="text-gray-400 text-center">No more posts.</div>}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default PostList; 
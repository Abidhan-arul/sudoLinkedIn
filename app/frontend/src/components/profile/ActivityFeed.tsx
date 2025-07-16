import React, { useState } from 'react';

interface Post {
  id: number;
  content: string;
  date: string;
}

interface Interaction {
  id: number;
  type: string;
  target: string;
  date: string;
}

interface ActivityFeedProps {
  posts: Post[];
  interactions: Interaction[];
  connectionCount: number;
  mutualConnections: string[];
}

const PAGE_SIZE = 5;

const ActivityFeed: React.FC<ActivityFeedProps> = ({ posts, interactions, connectionCount, mutualConnections }) => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const activities = [
    ...posts.map((p) => ({ activityType: 'post', ...p })),
    ...interactions.map((i) => ({ activityType: 'interaction', ...i })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const showMore = () => setVisibleCount((c) => c + PAGE_SIZE);

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
        <div>
          <span className="font-bold text-lg">Connections:</span> {connectionCount}
        </div>
        <div className="mt-2 md:mt-0">
          <span className="font-bold">Mutual Connections:</span>
          <span className="ml-2 text-blue-600">{mutualConnections.join(', ') || 'None'}</span>
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-2">Activity Timeline</h2>
      <ul className="space-y-3">
        {activities.slice(0, visibleCount).map((activity: any) => (
          <li key={activity.activityType + '-' + activity.id} className="border-l-4 border-blue-300 pl-3">
            <div className="text-sm text-gray-500 mb-1">{new Date(activity.date).toLocaleString()}</div>
            {activity.activityType === 'post' ? (
              <div>
                <span className="font-medium text-blue-700">Posted:</span> {activity.content}
              </div>
            ) : (
              <div>
                <span className="font-medium text-green-700">{activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}:</span> {activity.target}
              </div>
            )}
          </li>
        ))}
      </ul>
      {visibleCount < activities.length && (
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={showMore}
        >
          Load More
        </button>
      )}
    </div>
  );
};

export default ActivityFeed; 
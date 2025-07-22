import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/navigation/Layout';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import ProfileView from '../components/profile/ProfileView';
import ProfileEdit from '../components/profile/ProfileEdit';
import PostCreate from '../components/posts/PostCreate';
import PostList from '../components/posts/PostList';
import Feed from '../components/feed/Feed';
import JobList from '../components/job-board/JobList';
import MessageList from '../components/messaging/MessageList';
import ProtectedRoute from '../components/auth/ProtectedRoute';

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />, // Protect all main app routes
    children: [
  {
    path: '/',
        element: <Layout />, // Layout with Navbar
        children: [
          { path: '/', element: <Feed /> },
          { path: '/profile', element: <ProfileView /> },
          { path: '/profile/edit', element: <ProfileEdit /> },
          { path: '/posts/create', element: <PostCreate /> },
          { path: '/posts', element: <PostList /> },
          { path: '/jobs', element: <JobList /> },
          { path: '/messages', element: <MessageList /> },
        ],
  },
    ],
  },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
]); 
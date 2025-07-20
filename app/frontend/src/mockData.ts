// Mock user profile data
import type { User, Profile, Post } from './types';

export const mockUser: User = {
  id: 1,
  email: 'johndoe@email.com',
  name: 'John Doe',
  created_at: '2022-01-01',
};

export const mockProfile: Profile = {
  id: 1,
  user_id: 1,
  bio: 'Experienced Software Engineer passionate about building scalable web applications.',
  location: 'San Francisco, CA',
  skills: ['React', 'TypeScript', 'Node.js', 'Python', 'Leadership'],
  experience: [
    {
      id: 1,
      title: 'Senior Software Engineer',
      company: 'TechCorp',
      start_date: '2020-01-01',
      end_date: '2023-01-01',
      description: 'Led a team of engineers to build cloud-native applications.'
    },
    {
      id: 2,
      title: 'Software Engineer',
      company: 'Webify',
      start_date: '2017-06-01',
      end_date: '2019-12-31',
      description: 'Developed and maintained web applications.'
    }
  ],
  education: [
    {
      id: 1,
      school: 'State University',
      degree: 'B.Sc.',
      field: 'Computer Science',
      start_date: '2013-09-01',
      end_date: '2017-05-31',
    }
  ]
};

export const mockPosts: Post[] = [
  {
    id: 1,
    user_id: 1,
    content: 'Excited to share my latest project on GitHub! 🚀',
    created_at: '2023-06-01',
    likes: 34,
    comments: [],
  },
  {
    id: 2,
    user_id: 1,
    content: 'Attended a great tech conference last week!',
    created_at: '2023-05-20',
    likes: 21,
    comments: [],
  }
];

export const mockValidationRules = {
  username: /^[a-zA-Z0-9_]{3,20}$/,
  email: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
  bio: /^.{0,200}$/,
  skills: /^.{0,100}$/,
}; 
const API_URL = 'http://localhost:5000';

const MOCK = true;

const mockProfile = {
  avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
  name: 'John Doe',
  title: 'Software Engineer',
  location: 'San Francisco, CA',
  socialLinks: [
    { platform: 'linkedin', url: 'https://linkedin.com/in/johndoe' },
    { platform: 'github', url: 'https://github.com/johndoe' },
    { platform: 'twitter', url: 'https://twitter.com/johndoe' },
  ],
  bio: 'Passionate developer with 5+ years of experience in web and mobile applications.',
  skills: ['React', 'Node.js', 'TypeScript', 'SQL', 'Docker'],
  experiences: [
    { id: 1, title: 'Frontend Developer', company: 'TechCorp', start: '2019', end: '2022', description: 'Built scalable UIs.' },
    { id: 2, title: 'Intern', company: 'StartupX', start: '2018', end: '2019', description: 'Worked on MVP features.' },
  ],
  educations: [
    { id: 1, school: 'MIT', degree: 'BSc', field: 'Computer Science', start: '2015', end: '2019', description: 'Graduated with honors.' },
  ],
  contact: { email: 'john.doe@email.com', phone: '123-456-7890', website: 'https://johndoe.dev' },
  posts: [
    { id: 1, content: 'Excited to join TechCorp!', date: '2022-01-10T10:00:00Z' },
    { id: 2, content: 'Just published a new blog post on React hooks.', date: '2022-02-15T14:30:00Z' },
  ],
  interactions: [
    { id: 1, type: 'like', target: 'Jane Smith post', date: '2022-03-01T09:00:00Z' },
    { id: 2, type: 'comment', target: 'StartupX announcement', date: '2022-03-05T11:20:00Z' },
  ],
  connectionCount: 120,
  mutualConnections: ['Jane Smith', 'Bob Lee'],
};

export const profileApi = {
  getProfile: async () => {
    if (MOCK) {
      return new Promise((resolve) => setTimeout(() => resolve(mockProfile), 400));
    }
    const response = await fetch(`${API_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  updateProfile: async (profileData: any) => {
    if (MOCK) {
      return new Promise((resolve) => setTimeout(() => resolve({ success: true, ...profileData }), 400));
    }
    const response = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(profileData),
    });
    return response.json();
  },
}; 
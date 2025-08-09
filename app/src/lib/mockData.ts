// Mock data for development and testing

import { Club, Member, User, MemberRole, Event, Announcement, Project, InviteCode } from './types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'demo@nivaro.com',
    name: 'Demo User',
    avatar: undefined,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'user-2',
    email: 'alice@example.com',
    name: 'Alice Johnson',
    avatar: undefined,
    createdAt: new Date('2024-01-02')
  },
  {
    id: 'user-3',
    email: 'bob@example.com',
    name: 'Bob Smith',
    avatar: undefined,
    createdAt: new Date('2024-01-03')
  }
];

export const mockClubs: Club[] = [
  {
    id: 'club-1',
    name: 'Tech Innovators',
    description: 'A community for technology enthusiasts and innovators',
    avatar: undefined,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    ownerId: 'user-1'
  },
  {
    id: 'club-2',
    name: 'Book Club',
    description: 'Monthly book discussions and literary events',
    avatar: undefined,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-10'),
    ownerId: 'user-2'
  }
];

export const mockMembers: Member[] = [
  {
    id: 'member-1',
    userId: 'user-1',
    clubId: 'club-1',
    role: MemberRole.ADMIN,
    joinedAt: new Date('2024-01-01'),
    user: mockUsers[0]
  },
  {
    id: 'member-2',
    userId: 'user-2',
    clubId: 'club-1',
    role: MemberRole.MEMBER,
    joinedAt: new Date('2024-01-10'),
    user: mockUsers[1]
  },
  {
    id: 'member-3',
    userId: 'user-2',
    clubId: 'club-2',
    role: MemberRole.ADMIN,
    joinedAt: new Date('2024-01-05'),
    user: mockUsers[1]
  }
];

export const mockEvents: Event[] = [
  {
    id: 'event-1',
    clubId: 'club-1',
    title: 'Weekly Tech Meetup',
    description: 'Discuss latest tech trends and innovations',
    date: new Date('2024-02-15T18:00:00'),
    location: 'Conference Room A',
    createdBy: 'user-1',
    createdAt: new Date('2024-01-20')
  },
  {
    id: 'event-2',
    clubId: 'club-1',
    title: 'Hackathon 2024',
    description: '48-hour coding competition',
    date: new Date('2024-03-01T09:00:00'),
    location: 'Main Hall',
    createdBy: 'user-1',
    createdAt: new Date('2024-01-25')
  }
];

export const mockAnnouncements: Announcement[] = [
  {
    id: 'announcement-1',
    clubId: 'club-1',
    title: 'Welcome New Members!',
    content: 'We\'re excited to have new members joining our tech community.',
    createdBy: 'user-1',
    createdAt: new Date('2024-01-15'),
    pinned: true
  },
  {
    id: 'announcement-2',
    clubId: 'club-1',
    title: 'Meeting Schedule Update',
    content: 'Our weekly meetings will now be held on Thursdays instead of Fridays.',
    createdBy: 'user-1',
    createdAt: new Date('2024-01-18'),
    pinned: false
  }
];

export const mockProjects: Project[] = [
  {
    id: 'project-1',
    clubId: 'club-1',
    name: 'Community Website',
    description: 'Building a new website for our club',
    status: 'active',
    createdBy: 'user-1',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'project-2',
    clubId: 'club-1',
    name: 'Mobile App',
    description: 'Developing a mobile app for club members',
    status: 'planning',
    createdBy: 'user-1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
];

export const mockInviteCodes: InviteCode[] = [
  {
    code: 'TECH2024',
    clubId: 'club-1',
    createdBy: 'user-1',
    expiresAt: new Date('2024-12-31'),
    usedBy: undefined,
    usedAt: undefined
  }
];
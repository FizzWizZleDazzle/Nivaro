// Core types for club and member management

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
}

export enum MemberRole {
  ADMIN = 'admin',
  MEMBER = 'member'
}

export interface Member {
  id: string;
  userId: string;
  clubId: string;
  role: MemberRole;
  joinedAt: Date;
  user: User;
}

export interface InviteCode {
  code: string;
  clubId: string;
  createdBy: string;
  expiresAt: Date;
  usedBy?: string;
  usedAt?: Date;
}

// Dashboard content types
export interface Event {
  id: string;
  clubId: string;
  title: string;
  description: string;
  date: Date;
  location?: string;
  createdBy: string;
  createdAt: Date;
}

export interface Announcement {
  id: string;
  clubId: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: Date;
  pinned: boolean;
}

export interface Project {
  id: string;
  clubId: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
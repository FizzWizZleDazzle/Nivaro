// Authentication and session management utilities

import { MemberRole } from './types';

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
}

export interface ClubSession extends AuthSession {
  clubId: string;
  clubName: string;
  memberRole: MemberRole;
}

// Mock authentication functions for development
// In a real app, these would integrate with a proper auth service

export const mockAuth: AuthSession = {
  userId: 'user-1',
  email: 'demo@nivaro.com',
  name: 'Demo User'
};

export function isAdmin(role: MemberRole): boolean {
  return role === MemberRole.ADMIN;
}

export function canEditClub(role: MemberRole): boolean {
  return isAdmin(role);
}

export function canInviteMembers(role: MemberRole): boolean {
  return isAdmin(role);
}

export function canManageContent(role: MemberRole): boolean {
  return isAdmin(role);
}
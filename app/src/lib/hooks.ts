// React hooks for club data fetching
import { useState, useEffect } from 'react';
import { Club, Member, Event, Announcement, Project } from './types';
import { clubsApi, membersApi, eventsApi, announcementsApi, projectsApi, ApiError } from './api';

interface DataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface ArrayDataState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Hook for fetching all clubs
export function useClubs(): ArrayDataState<Club> {
  const [state, setState] = useState<ArrayDataState<Club>>({
    data: [],
    loading: true,
    error: null,
    refetch: () => {},
  });

  const fetchClubs = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const clubs = await clubsApi.getAll();
      setState(prev => ({ ...prev, data: clubs, loading: false }));
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to fetch clubs';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  setState(prev => ({ ...prev, refetch: fetchClubs }));

  return state;
}

// Hook for fetching a specific club
export function useClub(clubId: string | null): DataState<Club> {
  const [state, setState] = useState<DataState<Club>>({
    data: null,
    loading: true,
    error: null,
    refetch: () => {},
  });

  const fetchClub = async () => {
    if (!clubId) {
      setState(prev => ({ ...prev, loading: false, error: 'No club ID provided' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const club = await clubsApi.getById(clubId);
      setState(prev => ({ ...prev, data: club, loading: false }));
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to fetch club';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
    }
  };

  useEffect(() => {
    fetchClub();
  }, [clubId]);

  setState(prev => ({ ...prev, refetch: fetchClub }));

  return state;
}

// Hook for fetching club members
export function useClubMembers(clubId: string | null): ArrayDataState<Member> {
  const [state, setState] = useState<ArrayDataState<Member>>({
    data: [],
    loading: true,
    error: null,
    refetch: () => {},
  });

  const fetchMembers = async () => {
    if (!clubId) {
      setState(prev => ({ ...prev, loading: false, error: 'No club ID provided' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const members = await membersApi.getByClub(clubId);
      setState(prev => ({ ...prev, data: members, loading: false }));
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to fetch members';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [clubId]);

  setState(prev => ({ ...prev, refetch: fetchMembers }));

  return state;
}

// Hook for fetching club events
export function useClubEvents(clubId: string | null): ArrayDataState<Event> {
  const [state, setState] = useState<ArrayDataState<Event>>({
    data: [],
    loading: true,
    error: null,
    refetch: () => {},
  });

  const fetchEvents = async () => {
    if (!clubId) {
      setState(prev => ({ ...prev, loading: false, error: 'No club ID provided' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const events = await eventsApi.getByClub(clubId);
      setState(prev => ({ ...prev, data: events, loading: false }));
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to fetch events';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [clubId]);

  setState(prev => ({ ...prev, refetch: fetchEvents }));

  return state;
}

// Hook for fetching club announcements
export function useClubAnnouncements(clubId: string | null): ArrayDataState<Announcement> {
  const [state, setState] = useState<ArrayDataState<Announcement>>({
    data: [],
    loading: true,
    error: null,
    refetch: () => {},
  });

  const fetchAnnouncements = async () => {
    if (!clubId) {
      setState(prev => ({ ...prev, loading: false, error: 'No club ID provided' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const announcements = await announcementsApi.getByClub(clubId);
      setState(prev => ({ ...prev, data: announcements, loading: false }));
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to fetch announcements';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [clubId]);

  setState(prev => ({ ...prev, refetch: fetchAnnouncements }));

  return state;
}

// Hook for fetching club projects
export function useClubProjects(clubId: string | null): ArrayDataState<Project> {
  const [state, setState] = useState<ArrayDataState<Project>>({
    data: [],
    loading: true,
    error: null,
    refetch: () => {},
  });

  const fetchProjects = async () => {
    if (!clubId) {
      setState(prev => ({ ...prev, loading: false, error: 'No club ID provided' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const projects = await projectsApi.getByClub(clubId);
      setState(prev => ({ ...prev, data: projects, loading: false }));
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to fetch projects';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [clubId]);

  setState(prev => ({ ...prev, refetch: fetchProjects }));

  return state;
}
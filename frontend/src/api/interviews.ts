import { api } from '../lib/api';

export interface InterviewAuthor {
  user_id: number;
  name: string;
  email?: string;
  avatar_url?: string | null;
  role?: string;
}

export interface InterviewPost {
  post_id: number;
  owner_id: number;
  content: string;
  media: string[];
  video_url?: string | null;
  company?: string | null;
  role?: string | null;
  tags: string[];
  likes_count: number;
  approved: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
  owner: InterviewAuthor;
  isLiked?: boolean;
}

export interface InterviewUserStats {
  totalPosts: number;
  approvedPosts: number;
  pendingPosts: number;
  totalLikes: number;
}

export const getInterviews = async (params: {
  page?: number;
  limit?: number;
  tag?: string;
  search?: string;
} = {}) => {
  const response = await api.get('/interviews', { params, withCredentials: true });
  return response.data;
};

export const getFeaturedInterviews = async () => {
  const response = await api.get('/interviews/featured', { withCredentials: true });
  return response.data;
};

export const getUserInterviewStats = async () => {
  const response = await api.get('/interviews/my-stats', { withCredentials: true });
  return response.data;
};

export const getMyInterviews = async () => {
  const response = await api.get('/interviews/my-posts', { withCredentials: true });
  return response.data;
};

export const createInterviewPost = async (data: {
  content: string;
  media?: string[];
  video_url?: string;
  company?: string;
  role?: string;
  tags?: string[];
}) => {
  const response = await api.post('/interviews', data, { withCredentials: true });
  return response.data;
};

export const toggleLikeInterviewPost = async (id: number) => {
  const response = await api.post(`/interviews/${id}/like`, {}, { withCredentials: true });
  return response.data;
};

export const getPendingInterviews = async () => {
  const response = await api.get('/interviews/admin/pending', { withCredentials: true });
  return response.data;
};

export const approveInterviewPost = async (id: number, approved = true) => {
  const response = await api.patch(`/interviews/admin/${id}/approve`, { approved }, { withCredentials: true });
  return response.data;
};

export const toggleFeatureInterviewPost = async (id: number, featured?: boolean) => {
  const response = await api.patch(`/interviews/admin/${id}/feature`, { featured }, { withCredentials: true });
  return response.data;
};

export const deleteInterviewPost = async (id: number) => {
  const response = await api.delete(`/interviews/${id}`, { withCredentials: true });
  return response.data;
};

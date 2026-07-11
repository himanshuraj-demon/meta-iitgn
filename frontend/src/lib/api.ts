import axios from 'axios';

const apiBase = `${process.env.NEXT_PUBLIC_API_URL}/api` || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: apiBase,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface UserCreateInput {
  name: string;
  email: string;
  avatar_url?: string | null;
}

export interface DraftSubmitInput {
  page_id?: number | null;
  title: string;
  content: string;
  metadata?: any;
  editor_id: number;
  base_version?: number | null;
}

export interface ReviewDraftInput {
  reviewer_id: number;
  action: 'approve' | 'reject';
  rejection_reason?: string | null;
}

export const apiService = {
  // Users
  createUser: async (data: UserCreateInput) => {
    const response = await api.post('/users', data);
    return response.data;
  },

  // Pages
  getRecentNewPages: async (limit = 5) => {
    const response = await api.get('/pages/recent/new', { params: { limit } });
    return response.data;
  },

  getRecentUpdatedPages: async (limit = 5) => {
    const response = await api.get('/pages/recent/updated', { params: { limit } });
    return response.data;
  },

  searchPages: async (query: string) => {
    const response = await api.get('/pages/search', { params: { query } });
    return response.data;
  },

  getPage: async (slug: string) => {
    const response = await api.get(`/pages/${slug}`);
    return response.data;
  },

  // Drafts
  submitDraft: async (data: DraftSubmitInput) => {
    const response = await api.post('/drafts', data);
    return response.data;
  },

  getPendingDrafts: async (pageId?: number) => {
    const response = await api.get('/drafts/pending', { params: { page_id: pageId } });
    return response.data;
  },

  reviewDraft: async (pendingId: number, data: ReviewDraftInput) => {
    const response = await api.post(`/drafts/${pendingId}/review`, data);
    return response.data;
  },
};

import { apiClient } from './client';
import { User } from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data.data;
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get('/auth/me');
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};

import client from './client';
import { AuthRequest, AuthResponse } from '../types';

export const authService = {
  login: (data: AuthRequest): Promise<AuthResponse> => {
    return client.post('/auth/login', data).then((res) => res.data);
  },

  logout: () => {
    return client.post('/auth/logout').then((res) => res.data);
  },
};

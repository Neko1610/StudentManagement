import { User } from '../types';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const auth = {
  setToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  setUser: (user: User) => {
  const fixedUser = {
    ...user,
    email: user.email?.replace('@local', '') // 🔥 FIX CHÍNH
  };

  localStorage.setItem(USER_KEY, JSON.stringify(fixedUser));
},

  getUser: (): User | null => {
  const user = localStorage.getItem(USER_KEY);
  if (!user) return null;

  const parsed = JSON.parse(user);

  return {
    ...parsed,
    email: parsed.email?.replace('@local', '')
  };
},

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getUserRole: (): string | null => {
    const user = auth.getUser();
    return user?.role || null;
  },
};

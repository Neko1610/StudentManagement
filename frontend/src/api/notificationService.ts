import client from './client';
import { auth } from '../utils/auth';
import { Notification } from '../types';

export interface SendNotificationPayload {
  recipientType: 'ALL' | 'STUDENT' | 'TEACHER' | 'PARENT' | 'SPECIFIC';
  userId?: number;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'IMPORTANT';
}

const withSender = (payload: SendNotificationPayload) => {
  const user = auth.getUser();
  return {
    ...payload,
    senderId: user?.id && Number.isFinite(Number(user.id)) ? Number(user.id) : undefined,
    senderRole: user?.role,
    senderEmail: user?.email,
  };
};

export const notificationService = {
  send: (payload: SendNotificationPayload): Promise<Notification[]> =>
    client.post('/notifications', withSender(payload)).then((res) => res.data),

  getMine: (): Promise<Notification[]> => {
    const user = auth.getUser();
    return client
      .get('/notifications/me', {
        params: {
          userId: user?.id && Number.isFinite(Number(user.id)) ? Number(user.id) : undefined,
          role: user?.role,
        },
      })
      .then((res) => res.data);
  },

  markAsRead: (id: string): Promise<Notification> =>
    client.put(`/notifications/${id}/read`).then((res) => res.data),
};

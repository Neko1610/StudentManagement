import client from './client';
import { Notification } from '../types';

export const commonService = {
  getNotifications: (): Promise<Notification[]> => {
    return client.get('/notifications').then((res) => res.data);
  },

  getNotificationsByRecipient: (recipientId: string): Promise<Notification[]> => {
    return client.get(`/notifications/recipient/${recipientId}`).then((res) => res.data);
  },

  markNotificationAsRead: (id: string): Promise<void> => {
    return client.put(`/notifications/${id}/read`).then((res) => res.data);
  },

  deleteNotification: (id: string): Promise<void> => {
    return client.delete(`/notifications/${id}`).then((res) => res.data);
  },
};

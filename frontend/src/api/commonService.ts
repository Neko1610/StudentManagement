import client from './client';
import { Notification } from '../types';
import axios from 'axios';
import { notificationService } from './notificationService';

export const commonService = {
  getNotifications: (): Promise<Notification[]> => {
    return notificationService.getMine();
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
  getStudentByEmail: (email: string) =>
  axios.get(`/students/email/${email}`).then(res => res.data),
};

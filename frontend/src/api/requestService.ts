import client from './client';
import { auth } from '../utils/auth';
import { ParentRequest } from '../types';

export interface SubmitRequestPayload {
  requestType: 'LEAVE' | 'MESSAGE';
  content: string;
  startDate?: string;
  endDate?: string;
}

export const requestService = {
  submit: (payload: SubmitRequestPayload): Promise<ParentRequest> => {
    const user = auth.getUser();
    return client
      .post('/requests', {
        ...payload,
        parentId: user?.id && Number.isFinite(Number(user.id)) ? Number(user.id) : undefined,
        parentEmail: user?.email,
      })
      .then((res) => res.data);
  },

  getForTeacher: (): Promise<ParentRequest[]> => {
    const user = auth.getUser();
    return client
      .get('/requests/teacher', {
        params: {
          teacherId: user?.id && Number.isFinite(Number(user.id)) ? Number(user.id) : undefined,
          teacherEmail: user?.email,
        },
      })
      .then((res) => res.data);
  },

  getMine: (): Promise<ParentRequest[]> => {
    return client.get('/requests/mine').then((res) => res.data);
  },

  approve: (id: string): Promise<ParentRequest> =>
    client.put(`/requests/${id}/approve`).then((res) => res.data),

  reject: (id: string): Promise<ParentRequest> =>
    client.put(`/requests/${id}/reject`).then((res) => res.data),
};

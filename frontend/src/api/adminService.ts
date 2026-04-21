import client from './client';
import { Student, Teacher, Parent, Schedule, Notification } from '../types';

export const adminService = {
  // Student
  getStudents: () => client.get('/students').then(res => res.data),

  createStudent: (
    data: Partial<Student>,
    classId?: number,
    parentIds?: number[]
  ) =>
    client.post('/students', data, {
      params: { classId, parentIds },
      paramsSerializer: (params: any) => {
        const searchParams = new URLSearchParams();

        if (params.classId) {
          searchParams.append('classId', String(params.classId));
        }

        if (params.parentIds) {
          params.parentIds.forEach((id: number) => {
            searchParams.append('parentIds', String(id)); // 🔥 FIX
          });
        }

        return searchParams.toString();
      },
    }).then(res => res.data),

  updateStudent: (
    id: string,
    data: Partial<Student>,
    classId?: number,
    parentIds?: number[]
  ) =>
    client.put(`/students/${id}`, data, {
      params: { classId, parentIds },
      paramsSerializer: (params: any) => {
        const searchParams = new URLSearchParams();

        if (params.classId) {
          searchParams.append('classId', String(params.classId)); // 🔥 convert
        }

        if (params.parentIds) {
          params.parentIds.forEach((id: number) => {
            searchParams.append('parentIds', String(id)); // 🔥 convert
          });
        }

        return searchParams.toString();
      },
    }).then(res => res.data),

  deleteStudent: (id: string) =>
    client.delete(`/students/${id}`).then(res => res.data),

  // Teacher
  getTeachers: () => client.get('/teachers').then(res => res.data),

  createTeacher: (data: Partial<Teacher>) =>
    client.post('/teachers', data).then(res => res.data),

  updateTeacher: (
    id: string,
    data: Partial<Teacher>,
    subjectId?: number,
    classId?: number
  ) =>
    client
      .put(`/teachers/${id}`, data, {
        params: {
          subjectId,
          classId,
        },
      })
      .then((res) => res.data),

  deleteTeacher: (id: string) =>
    client.delete(`/teachers/${id}`).then(res => res.data),

  // Parent
  getParents: () => client.get('/parents').then(res => res.data),

  createParent: (data: Partial<Parent>) =>
    client.post('/parents', data).then(res => res.data),

  updateParent: (id: string, data: Partial<Parent>) =>
    client.put(`/parents/${id}`, data).then(res => res.data),

  deleteParent: (id: string) =>
    client.delete(`/parents/${id}`).then(res => res.data),

  getSchedules: (): Promise<Schedule[]> => {
    return client.get('/schedules').then(res => res.data);
  },

  createSchedule: (data: any): Promise<Schedule> => {
    return client.post(
      `/schedules?classId=${data.classId}&subjectId=${data.subjectId}&teacherId=${data.teacherId}`,
      {
        dayOfWeek: data.dayOfWeek,
        period: data.period
      }
    ).then(res => res.data);
  },
  updateSchedule: (id: number, data: any) => {
    return client.put(
      `/schedules/${id}?classId=${data.classId}&subjectId=${data.subjectId}&teacherId=${data.teacherId}`,
      {
        dayOfWeek: data.dayOfWeek,
        period: data.period
      }
    );
  },
  deleteSchedule: (id: number) => {
    return client.delete(`/schedules/${id}`);
  },

  // Notification
  sendNotification: (data: any): Promise<Notification> => {
    return client.post('/notifications', data).then(res => res.data);
  },
  // ===== CLASS =====
  getClasses: () => client.get('/classes').then(res => res.data),

  createClass: (data: any) =>
    client.post('/classes', data).then(res => res.data),

  updateClass: (id: string, data: any) =>
    client.put(`/classes/${id}`, data).then(res => res.data),

  deleteClass: (id: string) =>
    client.delete(`/classes/${id}`).then(res => res.data),

  // ===== SUBJECT =====
  getSubjects: () => client.get('/subjects').then(res => res.data),

  createSubject: (data: any) =>
    client.post('/subjects', data).then(res => res.data),

  updateSubject: (id: string, data: any) =>
    client.put(`/subjects/${id}`, data).then(res => res.data),

  deleteSubject: (id: string) =>
    client.delete(`/subjects/${id}`).then(res => res.data),
};
import client from './client';
import { Parent, Student, Tuition, Fund, Teacher, Request } from '../types';
import { requestService } from './requestService';

export const parentService = {
  getProfile: (email: string) =>
    client.get(`/parents/email/${email}`).then(res => res.data),

  updateProfile: (email: string, data: any) =>
    client.put(`/parents/email/${email}`, data).then(res => res.data),

  updateProfileById: (id: string, data: any) =>
    client.put(`/parents/${id}`, data).then(res => res.data),


  getStudents: (email: string) =>
    client.get(`/parents/email/${email}/students`),

  getChildren: (email: string) =>
    client.get(`/parents/email/${email}/students`).then(res => res.data),



  getTeachers: (classId: string): Promise<Teacher[]> => {
    return client.get(`/teachers/class/${classId}`).then((res) => res.data);
  },

  submitRequest: (data: any): Promise<Request> => {
    return requestService.submit(data as any) as any;
  },
  getScoresByStudent: (studentId: number) =>
    client.get(`/scores/student/${studentId}`).then(res => res.data),
  getAttendanceByStudent: (studentId: number) =>
    client.get(`/attendance/student/${studentId}`).then(res => res.data),

  getAssignmentsByStudent: (studentId: number) =>
    client.get(`/assignments/student/${studentId}`).then(res => res.data),

  getAssignmentsByClass: (classId: number) =>
    client.get(`/assignments/class/${classId}`).then(res => res.data),

  exportScoresExcelUrl: (studentId: number) =>
    `${client.defaults.baseURL}/scores/export/student/${studentId}`,

  exportScoresPdfUrl: (studentId: number) =>
    `${client.defaults.baseURL}/scores/export/student/${studentId}/pdf`,


  getTuition: (studentId: string) =>
    client.get(`/tuitions/student/${studentId}`).then(res => res.data),

  getFunds: (classId: string) =>
    client.get(`/funds/class/${classId}`).then(res => res.data),

  payTuition: (id: number) =>
    client.put(`/tuitions/${id}/pay`).then(res => res.data),
  createFund: (data: any, classId: string) =>
  client.post(`/funds?classId=${classId}`, data).then(res => res.data),

};

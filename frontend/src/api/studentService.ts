import client from './client';
import { Student, Score, Schedule, Assignment, Submission, Exam } from '../types';

const mapSchedule = (s: any): Schedule => ({
  id: s.id,
  dayOfWeek: s.dayOfWeek,
  period: s.period,
  className: s.className,
  subjectName: s.subjectName,
  room:
    s.room?.name ||
    s.roomName ||
    s.room ||
    ''
});
export const studentService = {
  getProfile: (email: string) => {
    return client
      .get(`/students/email/${encodeURIComponent(email)}`)
      .then(res => res.data);
  },
  updateProfile: (id: number, data: any, classId: number) => {
    return client.put(`/students/${id}`, data, {
      params: { classId } // 🔥 QUAN TRỌNG
    }).then(res => res.data);
  },
  getScores: (studentId: number) => {
    return client.get(`/scores/student/${studentId}`).then(res => res.data);
  },
  exportScores: (studentId: number) => {
    return client.get(`/scores/export/${studentId}`, {
      responseType: 'blob' // 🔥 bắt buộc
    }).then(res => res.data);
  },
  getScoresByStudent: (studentId: number) =>
    client.get(`/scores/student/${studentId}`).then(res => res.data),

  getAssignmentsByClass: (classId: number) =>
    client.get(`/assignments/class/${classId}`)
      .then(res => res.data || []),

  submitAssignment: (formData: FormData): Promise<Submission> => {
    return client.post('/submissions/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  downloadAssignment: (filePath: string) => {
    return `${client.defaults.baseURL}/assignments/download/${filePath}`;
  },
  getExams: (studentId: string): Promise<Exam[]> => {
    return client.get(`/exams/student/${studentId}`).then((res) => res.data);
  },

  getSubmissions: (studentId: number) =>
    client.get(`/submissions/student/${studentId}`)
      .then(res => res.data || []),

  getScheduleByClass: (classId: number) => {
    return client.get(`/schedules/class/${classId}`)
      .then(res => (res.data || []).map(mapSchedule));
  },
exportPdf: (studentId: number, semester: number) => {
  return client.get(`scores/export/student/${studentId}/pdf`, {
    params: { semester }, // 👈 thêm dòng này
    responseType: 'blob',
  }).then(res => res.data);
}
};

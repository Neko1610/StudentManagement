import client from './client';
import {
  Teacher,
  Clazz,
  Attendance,
  Schedule,
  Assignment,
  Submission
} from '../types';

const mapSchedule = (s: any): Schedule => ({
  id: s.id,
  dayOfWeek: s.dayOfWeek,
  period: s.period,
  className: s.className,
  subjectName: s.subjectName,
  room: s.room
});

export const teacherService = {
  // PROFILE
  getProfile: async (email: string): Promise<Teacher> => {
    const res = await client.get(`/teachers/email/${email}`);
    return res.data;
  },

  updateProfile: async (id: number, data: Partial<Teacher>): Promise<Teacher> => {
    const res = await client.put(`/teachers/${id}`, data);
    return res.data;
  },

  // CLASSES
  getClasses: async (email: string): Promise<Clazz[]> => {
    const res = await client.get(`/teachers/classes`, {
      params: { email }
    });
    return res.data || [];
  },

  getStudentsByClass: async (classId: number) => {
    const res = await client.get(`/students/class/${classId}`);
    return res.data;
  },

  getAttendance: async (classId: string): Promise<Attendance[]> => {
    const res = await client.get(`/attendance/class/${classId}`);
    return res.data || [];
  },

  markAttendance: async (data: any): Promise<Attendance> => {
    const res = await client.post('/attendance', data);
    return res.data;
  },

  getSchedule: async (email: string): Promise<Schedule[]> => {
    const res = await client.get(`/schedules/teacher/email/${email}`);
    return (res.data || []).map(mapSchedule);
  },

  getTodaySchedule: async (email: string): Promise<Schedule[]> => {
    const res = await client.get(`/schedules/teacher/email/${email}`);

    const today = new Date()
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toUpperCase();

    return (res.data || [])
      .map(mapSchedule)
      .filter((s: Schedule) => s.dayOfWeek === today);
  },


  getScoresByClass: async (classId: number, email: string) => {
    const res = await client.get(`/scores/class/${classId}`, {
      params: { email } // 🔥 QUAN TRỌNG
    });
    return res.data;
  },

  getSubjects: async () => {
    const res = await client.get('/subjects');
    return res.data;
  },

  createScore: async (data: any) => {
    const res = await client.post(`/scores`, data);
    return res.data;
  },

  updateScore: async (id: number, data: any, semester: number) => {
    const res = await client.put(`/scores/${id}?semester=${semester}`, data);
    return res.data;
  },

  deleteScore: async (id: number) => {
    const res = await client.delete(`/scores/${id}`);
    return res.data;
  },

  exportScoreExcel: async (classId: number, semester: number) => {
    const res = await client.get(
      `/scores/export/class/${classId}?semester=${semester}`,
      { responseType: 'blob' }
    );
    return res.data;
  },

  exportScorePDF: async (classId: number, semester: number) => {
    const res = await client.get(
      `/scores/export/class/${classId}/pdf?semester=${semester}`,
      { responseType: 'blob' }
    );
    return res.data;
  },

  getAssignmentsByClass: async (classId: number, email: string) => {
    const res = await client.get(`/assignments/class/${classId}`, {
      params: { email }
    });
    return res.data;
  },

  updateSubmission: async (
    id: number,
    data: Pick<Submission, 'score' | 'comment'>
  ): Promise<Submission> => {

    const res = await client.put(
      `/submissions/${id}`, // ✅ bỏ semester
      data
    );

    return res.data;
  },

  getSubmissionsByAssignment: async (assignmentId: number): Promise<Submission[]> => {
    const res = await client.get(`/submissions/assignment/${assignmentId}`);
    return res.data;
  },

  submitAssignment: async (formData: FormData) => {
    const res = await client.post(`/submissions/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  createAssignment: async (formData: FormData): Promise<Assignment> => {
    const res = await client.post('/assignments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  updateAssignment: async (id: number, data: Partial<Assignment>): Promise<Assignment> => {
    const res = await client.put(`/assignments/${id}`, data);
    return res.data;
  },

  deleteAssignment: async (id: number) => {
    await client.delete(`/assignments/${id}`);
  },
};
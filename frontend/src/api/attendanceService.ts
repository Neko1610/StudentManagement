import client from './client';
import { Attendance } from '../types';
import { normalizeAttendance, normalizeAttendanceList } from '../utils/attendance';

export interface MarkAttendancePayload {
  studentId: string | number;
  classId: string | number;
  date: string;
  period: string;
  status: Attendance['status'];
  remark?: string;
  session?: string;
}

export const attendanceService = {
  getByClass: async (classId: string | number): Promise<Attendance[]> => {
    const res = await client.get(`/attendance/class/${classId}`);
    return normalizeAttendanceList(res.data || []);
  },

  getByStudent: async (studentId: string | number): Promise<Attendance[]> => {
    const res = await client.get(`/attendance/student/${studentId}`);
    return normalizeAttendanceList(res.data || []);
  },

  mark: async (data: MarkAttendancePayload): Promise<Attendance> => {
    const res = await client.post('/attendance', {
      ...data,
      period: String(data.period),
      session: data.session,
    });
    return normalizeAttendance(res.data);
  },
};

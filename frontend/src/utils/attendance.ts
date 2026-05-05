import { Attendance } from '../types';

export const PERIODS = Array.from({ length: 10 }, (_, index) => String(index + 1));

const SESSION_TO_PERIOD: Record<string, string> = {
  AM4: '1',
  AM5: '1',
  PM: '6',
};

const getNestedId = (record: any, key: string) => {
  const value = record[key];
  if (value !== undefined && value !== null) return String(value);

  if (key === 'studentId' && record.student?.id !== undefined) {
    return String(record.student.id);
  }

  if (key === 'classId') {
    const classValue = record.clazz?.id ?? record.class?.id ?? record.student?.classId;
    if (classValue !== undefined && classValue !== null) return String(classValue);
  }

  return '';
};

export const normalizePeriod = (record: Partial<Attendance> | any): string => {
  const rawPeriod = record.period !== undefined && record.period !== null ? String(record.period) : '';
  const rawSession = record.session !== undefined && record.session !== null ? String(record.session) : '';

  if (PERIODS.includes(rawPeriod)) return rawPeriod;
  if (rawPeriod && SESSION_TO_PERIOD[rawPeriod]) return SESSION_TO_PERIOD[rawPeriod];
  if (rawSession && SESSION_TO_PERIOD[rawSession]) return SESSION_TO_PERIOD[rawSession];

  return rawPeriod || rawSession || '';
};

export const normalizeAttendance = (record: Partial<Attendance> | any): Attendance => ({
  ...record,
  id: record.id !== undefined && record.id !== null
    ? String(record.id)
    : `${getNestedId(record, 'classId')}-${getNestedId(record, 'studentId')}-${record.date}-${normalizePeriod(record)}`,
  classId: getNestedId(record, 'classId'),
  studentId: getNestedId(record, 'studentId'),
  date: String(record.date || ''),
  status: record.status,
  remark: record.remark,
  period: normalizePeriod(record),
  session: record.session,
});

export const attendanceKey = (record: Attendance) =>
  `${record.classId}-${record.studentId}-${record.date}-${record.period || ''}`;

export const normalizeAttendanceList = (records: any[] = []): Attendance[] => {
  const deduped = new Map<string, Attendance>();

  records.forEach((record) => {
    const normalized = normalizeAttendance(record);
    deduped.set(attendanceKey(normalized), normalized);
  });

  return Array.from(deduped.values()).sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return Number(a.period || 0) - Number(b.period || 0);
  });
};

export const filterAttendanceByPeriod = (records: Attendance[], period?: string) => {
  if (!period) return records;
  return records.filter((record) => record.period === period);
};

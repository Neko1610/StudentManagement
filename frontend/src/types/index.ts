export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
  phone?: string;
  avatar?: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Student {
  id: number; // 🔥 fix

  studentCode?: string;

  fullName: string;
  email: string;
  phone?: string;

  dob?: string;
  gender?: string;

  // class
  classId?: number;
  className?: string;
  active: boolean;
  // relations
  parents?: Parent[];
}

export interface Teacher {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  qualifications?: string;
  specialization?: string;
  avatar?: string;
  degree: string;
  // 🔥 ADD THÊM
  subjectId?: string;
  subjectName?: string;


  homeroomClassName?: string;
  homeroomClassId?: number;
  classId?: string;
  className?: string;
}
export interface Parent {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  occupation?: string;
  relationship?: string;
  avatar?: string;
}

export interface Clazz {
  id: number;
  name: string;
  grade?: string;
  teacherId?: string;
  capacity?: number;
  currentStudents?: number;
  description?: string;
  studentCount?: number;
  homeroom?: boolean;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  credits?: number;
  description?: string;
}

export interface Schedule {
  id: number;
  className: string;
  subjectName: string;
  room: string;
  dayOfWeek: string;
  period: number;
  teacherName?: string;
}

export interface Attendance {
  id: string;
  classId: string;
  studentId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  remark?: string;
  period?: string;
  session?: string;
}
export interface Score {
  id: string;
  studentId: string;
  subjectId: string;
  classId: string;
  score: number;
  coefficient: number;
  date: string;
  type: string;
}

export type ScoreType = 'ORAL' | 'TEST15' | 'MID' | 'FINAL';

export interface Assignment {
  id: number;
  classId?: number;
  title: string;
  description?: string;
  deadline: string;
  type: ScoreType;
  semester: 1 | 2;
  createdBy?: string;
  createdAt?: string;
  attachments?: string[];
  filePath?: string;
}

export interface Submission {
  id: number;
  assignmentId?: number;
  studentId?: number;
  assignment?: Assignment;
  student?: Student;
  submissionDate?: string;
  submittedAt?: string;
  content?: string;
  attachments?: string[];
  grade?: number;
  score?: number | null;
  feedback?: string;
  comment?: string;
  filePath?: string;
}

export interface Notification {
  id: string;
  receiverId?: string;
  recipientId?: string;
  senderId?: string;
  roleTarget?: 'ALL' | 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
  title: string;
  content?: string;
  message?: string;
  type: 'INFO' | 'WARNING' | 'IMPORTANT';
  isRead: boolean;
  createdAt: string;
}

export interface Tuition {
  id: string;
  studentId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'UNPAID' | 'PAID' | 'PENDING' | 'OVERDUE';
  description?: string;
  createdAt?: string;
}

export interface Fund {
  id: string;
  classId: string;
  name: string;
  amount: number;
  description?: string;
  date: string;
}

export interface Exam {
  id: string;
  classId: string;
  subjectId: string;
  date: string;
  startTime: string;
  endTime: string;
  room?: string;
  duration: number;
}

export interface Request {
  id: string;
  studentId: string;
  parentId: string;
  type: 'LEAVE' | 'TRANSFER' | 'OTHER';
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  respondedAt?: string;
}

export interface ParentRequest {
  id: string;
  parentId: string;
  parentName?: string;
  teacherId: string;
  requestType: 'LEAVE' | 'MESSAGE';
  content: string;
  startDate?: string;
  endDate?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

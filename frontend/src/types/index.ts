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
}

export interface Attendance {
  id: string;
  classId: string;
  studentId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  remark?: string;
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

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  description: string;
  deadline: string;
  createdBy: string;
  createdAt: string;
  attachments?: string[];
  filePath?: string; 
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  submissionDate: string;
  content?: string;
  attachments?: string[];
  grade?: number;
  feedback?: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  senderId: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface Tuition {
  id: string;
  studentId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  description?: string;
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

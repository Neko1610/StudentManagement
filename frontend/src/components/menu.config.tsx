import {
  DashboardOutlined,
  TeamOutlined,
  CalendarOutlined,
  FileTextOutlined,
  CheckOutlined,
  BellOutlined,
  FileOutlined,
  UserOutlined,
  CreditCardOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { KeyOutlined } from '@ant-design/icons';

export const menuConfig = [
  {
    key: 'dashboard',
    label: 'Trang chủ',
    icon: <DashboardOutlined />,
  },
  {
    key: 'classes',
    label: 'Lớp học',
    icon: <TeamOutlined />,
    roles: ['admin'],
  },
  {
    key: 'subjects',
    label: 'Môn học',
    icon: <BookOutlined />,
    roles: ['admin'],
  },
  {
    key: 'profile',
    label: 'Hồ sơ',
    icon: <UserOutlined />,
    roles: ['teacher', 'parent', 'student'],
  },

  // ===== TEACHER =====
  {
    key: 'classes',
    label: 'Lớp học',
    icon: <TeamOutlined />,
    roles: ['teacher'],
  },
  {
    key: 'schedule',
    label: 'Thời khóa biểu',
    icon: <CalendarOutlined />,
    roles: ['teacher', 'student'],
  },
  {
    key: 'attendance',
    label: 'Điểm danh',
    icon: <CheckOutlined />,
    roles: ['teacher'],
  },
  {
    key: 'scores',
    label: 'Điểm số',
    icon: <FileTextOutlined />,
    roles: ['teacher', 'student'],
  },
  {
    key: 'assignments',
    label: 'Bài tập',
    icon: <FileOutlined />,
    roles: ['teacher', 'student'],
  },
  {
    key: 'submissions',
    label: 'Bài nộp',
    icon: <FileTextOutlined />,
    roles: ['teacher'],
  },
  {
    key: 'notifications',
    label: 'Thông báo',
    icon: <BellOutlined />,
    roles: ['teacher', 'admin', 'student'],
  },

  // ===== PARENT =====
  {
    key: 'students',
    label: 'Học sinh',
    icon: <TeamOutlined />,
    roles: ['parent', 'admin'],
  },
  {
    key: 'tuition',
    label: 'Học phí',
    icon: <CreditCardOutlined />,
    roles: ['parent', 'admin'],
  },
  {
    key: 'teachers',
    label: 'Giáo viên',
    icon: <UserOutlined />,
    roles: ['parent', 'admin'],
  },
  {
    key: 'requests',
    label: 'Yêu cầu',
    icon: <FileOutlined />,
    roles: ['parent', 'teacher'],
  },

  // ===== ADMIN =====
  {
    key: 'parents',
    label: 'Phụ huynh',
    icon: <UserOutlined />,
    roles: ['admin'],
  },
  {
    key: 'schedules',
    label: 'Thời khóa biểu',
    icon: <CalendarOutlined />,
    roles: ['admin'],
  },
  {
    key: 'reset-password',
    label: 'Đổi mật khẩu',
    icon: <KeyOutlined />,
    roles: ['admin', 'teacher', 'student', 'parent'],
  },
];
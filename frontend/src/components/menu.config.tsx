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
  SolutionOutlined,
  BookOutlined,
} from '@ant-design/icons';

export const menuConfig = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardOutlined />,
  },
  {
    key: 'classes',
    label: 'Classes',
    icon: <TeamOutlined />,
    roles: ['admin'],
  },
  {
    key: 'subjects',
    label: 'Subjects',
    icon: <BookOutlined />,
    roles: ['admin'],
  },
  {
    key: 'profile',
    label: 'Profile',
    icon: <UserOutlined />,
    roles: ['teacher', 'parent', 'student'], // 🔥 ADMIN KHÔNG CÓ
  },

  // ===== TEACHER =====
  {
    key: 'classes',
    label: 'Classes',
    icon: <TeamOutlined />,
    roles: ['teacher'],
  },
  {
    key: 'schedule',
    label: 'Schedule',
    icon: <CalendarOutlined />,
    roles: ['teacher', 'student'],
  },
  {
    key: 'attendance',
    label: 'Attendance',
    icon: <CheckOutlined />,
    roles: ['teacher'],
  },
  {
    key: 'scores',
    label: 'Scores',
    icon: <FileTextOutlined />,
    roles: ['teacher', 'student'],
  },
  {
    key: 'assignments',
    label: 'Assignments',
    icon: <FileOutlined />,
    roles: ['teacher', 'student'],
  },
   {
    key: 'submissions',
    label: 'Submissions',
    icon: <FileTextOutlined />,
    roles: ['teacher']
  },

  {
    key: 'notifications',
    label: 'Notifications',
    icon: <BellOutlined />,
    roles: ['teacher', 'admin', 'student'],
  },
 
  // ===== PARENT =====
  {
    key: 'students',
    label: 'Students',
    icon: <TeamOutlined />,
    roles: ['parent', 'admin'],
  },
  {
    key: 'tuition',
    label: 'Tuition',
    icon: <CreditCardOutlined />,
    roles: ['parent', 'admin'],
  },
  {
    key: 'feedback',
    label: 'Feedback',
    icon: <BellOutlined />,
    roles: ['parent'],
  },
  {
    key: 'teachers',
    label: 'Teachers',
    icon: <UserOutlined />,
    roles: ['parent', 'admin'],
  },
  {
    key: 'requests',
    label: 'Requests',
    icon: <FileOutlined />,
    roles: ['parent', 'teacher'],
  },

  // ===== ADMIN =====
  {
    key: 'parents',
    label: 'Parents',
    icon: <UserOutlined />,
    roles: ['admin'],
  },
  {
    key: 'schedules',
    label: 'Schedules',
    icon: <CalendarOutlined />,
    roles: ['admin'],
  },
];

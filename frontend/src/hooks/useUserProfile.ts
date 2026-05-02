import { useEffect, useState } from 'react';
import { auth } from '../utils/auth';
import { studentService } from '../api/studentService';
import { teacherService } from '../api/teacherService';
import { parentService } from '../api/parentService';
import { Student, Teacher, Parent } from '../types';

export function useUserProfile() {
  const user = auth.getUser();

  const [profile, setProfile] = useState<
    Student | Teacher | Parent | null
  >(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      try {
        let data = null;

        if (user.role === 'STUDENT') {
          data = await studentService.getProfile(user.id);
        }

        if (user.role === 'TEACHER') {
          data = await teacherService.getProfile(user.id);
        }

        if (user.role === 'PARENT') {
          data = await parentService.getProfile(user.id);
        }

        setProfile(data);
      } catch (e) {
        console.error('Load profile failed');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // 👉 NAME
  const name =
    profile?.fullName ||
    user?.fullName ||
    user?.email ||
    'User';

  // 👉 SUB TEXT
  const sub = (() => {
    switch (user?.role) {
      case 'STUDENT':
        return (profile as Student)?.className || 'Học sinh';

      case 'TEACHER':
        const t = profile as Teacher;
        return t?.homeroomClassName
          ? `Chủ nhiệm ${t.homeroomClassName}`
          : t?.subjectName
          ? `Giáo viên • ${t.subjectName}`
          : 'Giáo viên';

      case 'PARENT':
        return (profile as Parent)?.relationship
          ? `Phụ huynh • ${(profile as Parent).relationship}`
          : 'Phụ huynh';

      case 'ADMIN':
        return 'Quản trị viên';

      default:
        return '';
    }
  })();

  return {
    user,
    profile,
    name,
    sub,
    loading,
  };
}
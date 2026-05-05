import { Alert, Result, Spin } from 'antd';
import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminParents from './pages/admin/AdminParents';
import AdminSchedules from './pages/admin/AdminSchedules';
import AdminStudents from './pages/admin/AdminStudents';
import AdminTeachers from './pages/admin/AdminTeachers';
import AdminTuitions from './pages/admin/AdminTuitions';
import ParentContacts from './pages/parent/ParentContacts';
import ParentDashboard from './pages/parent/ParentDashboard';
import ParentProfile from './pages/parent/ParentProfile';
import ParentRequests from './pages/parent/ParentRequests';
import ResetPassword from './pages/ResetPassword';
import ParentStudents from './pages/parent/ParentStudents';
import ParentTuition from './pages/parent/ParentTuition';
import StudentAssignments from './pages/student/StudentAssignments';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentExams from './pages/student/StudentExams';
import StudentProfile from './pages/student/StudentProfile';
import StudentSchedule from './pages/student/StudentSchedule';
import StudentNotifications from './pages/student/StudentNotifications';
import TeacherAssignments from './pages/teacher/TeacherAssignments';
import TeacherSubmissions from './pages/teacher/TeacherSubmission';
import TeacherClasses from './pages/teacher/TeacherClasses';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import StudentScores from './pages/student/StudentScores';
import TeacherProfile from './pages/teacher/TeacherEditProfile';
import TeacherNotifications from './pages/teacher/TeacherNotification';
import TeacherRequests from './pages/teacher/TeacherRequests';
import TeacherSchedule from './pages/teacher/TeacherSchedule';

import TeacherAttendance from './pages/teacher/TeacherAttendance';
import TeacherScores from './pages/teacher/TeacherScores';
import { auth } from './utils/auth';
import type { User } from './types';
import AdminClasses from './pages/admin/AdminClasses';
import AdminSubjects from './pages/admin/AdminSubjects';

function LoadingFallback() {
  return <Spin fullscreen tip="Loading page..." />;
}

function RouteFallback({ title, description }: { title: string; description: string }) {
  return (
    <Result
      status="warning"
      title={title}
      subTitle={description}
      extra={
        <Alert
          type="info"
          showIcon
          message="The app is still running"
          description="This screen is shown instead of crashing when a route or API-backed page cannot finish loading."
        />
      }
    />
  );
}

function RoleHomeRedirect() {
  const role = auth.getUserRole()?.toLowerCase();

  if (!auth.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (role) {
    return <Navigate to={`/${role}`} replace />;
  }

  return <Navigate to="/login" replace />;
}

function ProtectedPage({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: User['role'][];
}) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles} fallback={<LoadingFallback />}>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin/reset-password"
        element={
          <ProtectedPage allowedRoles={['ADMIN']}>
            <ResetPassword />
          </ProtectedPage>
        }
      />

      <Route
        path="/teacher/reset-password"
        element={
          <ProtectedPage allowedRoles={['TEACHER']}>
            <ResetPassword />
          </ProtectedPage>
        }
      />

      <Route
        path="/student/reset-password"
        element={
          <ProtectedPage allowedRoles={['STUDENT']}>
            <ResetPassword />
          </ProtectedPage>
        }
      />

      <Route
        path="/parent/reset-password"
        element={
          <ProtectedPage allowedRoles={['PARENT']}>
            <ResetPassword />
          </ProtectedPage>
        }
      />
      <Route path="/" element={<RoleHomeRedirect />} />

      <Route
        path="/teacher"
        element={
          <ProtectedPage allowedRoles={['TEACHER']}>
            <TeacherDashboard />
          </ProtectedPage>
        }
      />
      <Route
        path="/teacher/classes"
        element={
          <ProtectedPage allowedRoles={['TEACHER']}>
            <TeacherClasses />
          </ProtectedPage>
        }
      />
      <Route
        path="/teacher/schedule"
        element={
          <ProtectedPage allowedRoles={['TEACHER']}>
            <TeacherSchedule />
          </ProtectedPage>
        }
      />
      <Route
        path="/teacher/attendance/:classId"
        element={
          <ProtectedPage allowedRoles={['TEACHER']}>
            <TeacherAttendance />
          </ProtectedPage>
        }
      />
       <Route
        path="/teacher/attendance"
        element={
          <ProtectedPage allowedRoles={['TEACHER']}>
            <TeacherAttendance />
          </ProtectedPage>
        }
      />
      <Route
        path="/teacher/scores"
        element={
          <ProtectedPage allowedRoles={['TEACHER']}>
            <TeacherScores />
          </ProtectedPage>
        }
      />

      <Route
        path="/teacher/assignments"
        element={
          <ProtectedPage allowedRoles={['TEACHER']}>
            <TeacherAssignments />
          </ProtectedPage>
        }
      />
      <Route
        path="/teacher/submissions"
        element={
          <ProtectedPage allowedRoles={['TEACHER']}>
            <TeacherSubmissions />
          </ProtectedPage>
        }
      />
      <Route
        path="/teacher/notifications"
        element={
          <ProtectedPage allowedRoles={['TEACHER']}>
            <TeacherNotifications />
          </ProtectedPage>
        }
      />
      <Route
        path="/teacher/requests"
        element={
          <ProtectedPage allowedRoles={['TEACHER']}>
            <TeacherRequests />
          </ProtectedPage>
        }
      />

      <Route
        path="/teacher/profile"
        element={
          <ProtectedPage allowedRoles={['TEACHER']}>
            <TeacherProfile />
          </ProtectedPage>
        }
      />

      <Route
        path="/student"
        element={
          <ProtectedPage allowedRoles={['STUDENT']}>
            <StudentDashboard />
          </ProtectedPage>
        }
      />
      <Route
        path="/student/schedule"
        element={
          <ProtectedPage allowedRoles={['STUDENT']}>
            <StudentSchedule />
          </ProtectedPage>
        }
      />

      <Route
        path="/student/assignments"
        element={
          <ProtectedPage allowedRoles={['STUDENT']}>
            <StudentAssignments />
          </ProtectedPage>
        }
      />

      <Route
        path="/student/scores"
        element={
          <ProtectedPage allowedRoles={['STUDENT']}>
            <StudentScores />
          </ProtectedPage>
        }
      />
      <Route
        path="/student/exams"
        element={
          <ProtectedPage allowedRoles={['STUDENT']}>
            <StudentExams />
          </ProtectedPage>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedPage allowedRoles={['STUDENT']}>
            <StudentProfile />
          </ProtectedPage>
        }
      />
      <Route
        path="/student/notifications"
        element={
          <ProtectedPage allowedRoles={['STUDENT']}>
            <StudentNotifications />
          </ProtectedPage>
        }
      />

      <Route
        path="/parent"
        element={
          <ProtectedPage allowedRoles={['PARENT']}>
            <ParentDashboard />
          </ProtectedPage>
        }
      />
      <Route
        path="/parent/students"
        element={
          <ProtectedPage allowedRoles={['PARENT']}>
            <ParentStudents />
          </ProtectedPage>
        }
      />
      <Route
        path="/parent/tuition"
        element={
          <ProtectedPage allowedRoles={['PARENT']}>
            <ParentTuition />
          </ProtectedPage>
        }
      />

      <Route
        path="/parent/teachers"
        element={
          <ProtectedPage allowedRoles={['PARENT']}>
            <ParentContacts />
          </ProtectedPage>
        }
      />
      <Route
        path="/parent/requests"
        element={
          <ProtectedPage allowedRoles={['PARENT']}>
            <ParentRequests />
          </ProtectedPage>
        }
      />
      <Route
        path="/parent/profile"
        element={
          <ProtectedPage allowedRoles={['PARENT']}>
            <ParentProfile />
          </ProtectedPage>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedPage allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedPage>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedPage allowedRoles={['ADMIN']}>
            <AdminStudents />
          </ProtectedPage>
        }
      />
      <Route
        path="/admin/teachers"
        element={
          <ProtectedPage allowedRoles={['ADMIN']}>
            <AdminTeachers />
          </ProtectedPage>
        }
      />
      <Route
        path="/admin/classes"
        element={
          <ProtectedPage allowedRoles={['ADMIN']}>
            <AdminClasses />
          </ProtectedPage>
        }
      />

      <Route
        path="/admin/subjects"
        element={
          <ProtectedPage allowedRoles={['ADMIN']}>
            <AdminSubjects />
          </ProtectedPage>
        }
      />
      <Route
        path="/admin/parents"
        element={
          <ProtectedPage allowedRoles={['ADMIN']}>
            <AdminParents />
          </ProtectedPage>
        }
      />
      <Route
        path="/admin/schedules"
        element={
          <ProtectedPage allowedRoles={['ADMIN']}>
            <AdminSchedules />
          </ProtectedPage>
        }
      />
      <Route
        path="/admin/tuition"
        element={
          <ProtectedPage allowedRoles={['ADMIN']}>
            <AdminTuitions />
          </ProtectedPage>
        }
      />
      <Route
        path="/admin/notifications"
        element={
          <ProtectedPage allowedRoles={['ADMIN']}>
            <AdminNotifications />
          </ProtectedPage>
        }
      />

      <Route
        path="*"
        element={
          <Result
            status="404"
            title="Page not found"
            subTitle="The route does not exist. Redirecting to the correct area will work once you sign in."
          />
        }
      />
    </Routes>
  );
}

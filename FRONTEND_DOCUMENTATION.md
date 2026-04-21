# 📋 COMPLETE FRONTEND PROJECT STRUCTURE

## 🎯 Project Overview

A comprehensive React (Vite) frontend for a School Management System with full role-based access control, JWT authentication, and real-time API integration.

---

## 📁 FOLDER STRUCTURE

```
frontend/
├── .env                          # API Base URL
├── .env.local                    # Local environment variables
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
├── vite.config.js                # Vite configuration
├── index.html                    # HTML entry point
├── README.md                     # Project documentation

├── src/
│   ├── api/                      # API Services Layer
│   │   ├── client.ts             # Axios instance with interceptors
│   │   ├── authService.ts        # Authentication API
│   │   ├── teacherService.ts     # Teacher-specific APIs
│   │   ├── studentService.ts     # Student-specific APIs
│   │   ├── parentService.ts      # Parent-specific APIs
│   │   ├── adminService.ts       # Admin-specific APIs
│   │   └── commonService.ts      # Shared APIs (notifications, etc.)
│   │
│   ├── components/
│   │   ├── layout/               # Reusable Layout Components
│   │   │   ├── Header.tsx        # Top navbar with notifications
│   │   │   ├── Header.module.css
│   │   │   ├── Sidebar.tsx       # Role-based sidebar navigation
│   │   │   ├── Sidebar.module.css
│   │   │   ├── MainLayout.tsx    # Layout wrapper
│   │   │   └── MainLayout.module.css
│   │   │
│   │   └── ProtectedRoute.tsx    # Route protection & authorization
│   │
│   ├── pages/
│   │   ├── Login.tsx             # Login page
│   │   ├── Login.module.css
│   │   │
│   │   ├── teacher/              # Teacher Pages
│   │   │   ├── TeacherDashboard.tsx
│   │   │   ├── TeacherDashboard.module.css
│   │   │   ├── TeacherClasses.tsx
│   │   │   ├── TeacherSchedule.tsx
│   │   │   ├── TeacherAttendance.tsx
│   │   │   ├── TeacherScores.tsx (Assignments component)
│   │   │   ├── TeacherAssignments.tsx
│   │   │   ├── TeacherNotifications.tsx
│   │   │   └── TeacherEditProfile.tsx
│   │   │
│   │   ├── student/              # Student Pages
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── StudentSchedule.tsx
│   │   │   ├── StudentScores.tsx
│   │   │   ├── StudentAssignments.tsx
│   │   │   ├── StudentExams.tsx
│   │   │   └── StudentProfile.tsx
│   │   │
│   │   ├── parent/               # Parent Pages
│   │   │   ├── ParentDashboard.tsx
│   │   │   ├── ParentStudents.tsx
│   │   │   ├── ParentTuition.tsx
│   │   │   ├── ParentFeedback.tsx
│   │   │   ├── ParentContacts.tsx
│   │   │   ├── ParentRequests.tsx
│   │   │   └── ParentProfile.tsx
│   │   │
│   │   └── admin/                # Admin Pages
│   │       ├── AdminDashboard.tsx
│   │       ├── AdminStudents.tsx
│   │       ├── AdminTeachers.tsx
│   │       ├── AdminParents.tsx
│   │       ├── AdminSchedules.tsx
│   │       └── AdminNotifications.tsx
│   │
│   ├── routes/
│   │   └── index.tsx             # All route definitions
│   │
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces for API models
│   │
│   ├── utils/
│   │   ├── auth.ts               # Authentication utilities
│   │   └── download.ts           # File download utilities
│   │
│   ├── App.tsx                   # Root app component
│   ├── App.css                   # Global styles
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global CSS
```

---

## 🔑 KEY FILES DESCRIPTION

### API Services (`src/api/`)

- **client.ts**: Axios instance with automatic token injection and error handling
- **authService.ts**: Login/logout endpoints
- **teacherService.ts**: Classes, attendance, schedule, scores
- **studentService.ts**: Assignments, schedules, scores, exams
- **parentService.ts**: Children info, tuition, requests
- **adminService.ts**: User management, schedule management
- **commonService.ts**: Notifications, shared resources

### Components (`src/components/`)

- **Header**: Navbar with user menu, notifications, logout
- **Sidebar**: Dynamic navigation based on user role
- **MainLayout**: Combines Header + Sidebar with content area
- **ProtectedRoute**: Guards routes and checks authorization

### Pages (`src/pages/`)

Each role has its own dashboard with specific features:

#### Teacher
- Dashboard with class stats
- Class management with student lists
- Attendance marking
- Score/grade management with Excel export
- Assignment creation and grading
- Notification system

#### Student
- Dashboard with pending assignments
- Schedule view
- Scores and subject averages
- Assignment submission
- Exam schedule

#### Parent
- Monitor children's progress
- Tuition and fund information
- Teacher contact system
- Request submission (leave, transfer)
- School feedback

#### Admin
- Overall dashboard statistics
- Student/Teacher/Parent management (CRUD)
- Schedule management
- System-wide notifications

### Types (`src/types/index.ts`)

TypeScript interfaces for all API models:
- User, Student, Teacher, Parent
- Classes, Subjects, Schedules
- Attendance, Scores, Assignments
- Notifications, Tuition, Exams, etc.

### Utils (`src/utils/`)

- **auth.ts**: Token management, user storage, authentication state
- **download.ts**: Excel export functionality

---

## 🔐 AUTHENTICATION FLOW

```
1. User visits /login
2. Enters credentials
3. API call: POST /auth/login
4. Response contains: { token, user }
5. Token stored in localStorage
6. User data stored in localStorage
7. Redirect based on role:
   - ADMIN → /admin
   - TEACHER → /teacher
   - STUDENT → /student
   - PARENT → /parent
8. All subsequent requests include Authorization header
9. Token auto-attaches via Axios interceptor
10. 401 errors trigger auto-logout and redirect to /login
```

---

## 🛣️ ROUTING MAP

```
/login                          → LoginPage

/teacher                        → TeacherDashboard
/teacher/classes               → Class management
/teacher/schedule              → Weekly timetable
/teacher/attendance            → Mark attendance
/teacher/scores                → Grade management
/teacher/assignments           → Create/grade assignments
/teacher/notifications         → Send notifications
/teacher/profile               → Edit teacher profile

/student                        → StudentDashboard
/student/schedule              → View timetable
/student/scores                → View grades
/student/assignments           → Submit assignments
/student/exams                 → Exam schedule
/student/profile               → Edit student profile

/parent                         → ParentDashboard
/parent/students               → View children
/parent/tuition                → Tuition & funds
/parent/feedback               → School messages
/parent/teachers               → Contact teachers
/parent/requests               → Submit requests
/parent/profile                → Edit parent profile

/admin                          → AdminDashboard
/admin/students                → Manage students (CRUD)
/admin/teachers                → Manage teachers (CRUD)
/admin/parents                 → Manage parents (CRUD)
/admin/schedules               → Manage schedules
/admin/notifications           → Send notifications

/                              → Redirect to /login (if not authenticated)
/* (404)                       → Redirect to /login
```

---

## 📦 DEPENDENCIES

```json
{
  "antd": "^5.12.1",           // UI Component Library
  "axios": "^1.15.0",          // HTTP Client
  "react": "^18.3.1",          // React library
  "react-dom": "^18.3.1",      // React DOM
  "react-router-dom": "^6.14.1" // Routing
}
```

### Dev Dependencies
- TypeScript
- Vite
- @vitejs/plugin-react

---

## 🚀 QUICK START GUIDE

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure API URL
Edit `.env`:
```
VITE_API_BASE_URL=http://localhost:8080
```

### 3. Start Development Server
```bash
npm run dev
```
Runs on: `http://localhost:3000`

### 4. Build for Production
```bash
npm run build
```
Creates optimized build in `dist/` folder

### 5. Preview Production Build
```bash
npm run preview
```

---

## 📱 FEATURES

### Authentication
- JWT-based login system
- Automatic token injection in headers
- Auto-logout on token expiry (401)
- Persistent login via localStorage

### Role-Based Access Control
- 4 user roles: ADMIN, TEACHER, STUDENT, PARENT
- Protected routes with role validation
- Dynamic UI based on user role
- Automatic redirects

### Data Management
- CRUD operations for resources
- Modal forms for editing
- Confirmation dialogs for deletion
- Real-time validation

### API Integration
- Axios instance with interceptors
- Automatic error handling
- Loading states
- User-friendly error messages

### UI/UX
- Ant Design components
- Responsive layout
- Mobile-friendly design
- Collapsible sidebar
- Notification system

### Performance
- Code splitting ready
- Lazy loading compatible
- CSS modules for isolation
- Vite fast development

---

## 🔗 API ENDPOINTS USED

### Authentication
- `POST /auth/login`

### Teacher APIs
- `GET /classes/teacher/{id}`
- `GET /students/class/{id}`
- `GET /schedule/teacher/{id}`
- `GET /schedule/today`
- `POST /attendance`
- `GET /attendance/class/{id}`

### Student APIs
- `GET /schedule/student/{id}`
- `GET /scores/student/{id}`
- `GET /scores/export/{id}`
- `GET /assignments/student/{id}`
- `POST /submissions`
- `GET /exams/student/{id}`

### Parent APIs
- `GET /students/parent/{parentId}`
- `GET /tuition/student/{id}`
- `GET /fund/class/{classId}`
- `GET /teachers/class/{classId}`
- `POST /requests`

### Admin APIs
- `GET /students` | `POST /students` | `PUT /students/{id}` | `DELETE /students/{id}`
- `GET /teachers` | `POST /teachers` | `PUT /teachers/{id}` | `DELETE /teachers/{id}`
- `GET /parents` | `POST /parents` | `PUT /parents/{id}` | `DELETE /parents/{id}`
- `GET /schedule` | `POST /schedule`
- `POST /notifications`

### Common APIs
- `GET /notifications`
- `PUT /notifications/{id}/read`
- `DELETE /notifications/{id}`

---

## 📝 DEVELOPMENT NOTES

### Adding New Pages
1. Create component in `pages/{role}/`
2. Import in `routes/index.tsx`
3. Add route with ProtectedRoute wrapper
4. Update Sidebar.tsx for navigation

### Creating API Service
1. Create file in `api/`
2. Use `client` instance
3. Return typed responses
4. Export as service object

### Styling
- Use Ant Design components
- CSS modules for components
- Global styles in App.css
- Responsive design in MainLayout

### Error Handling
- API errors caught in try-catch
- User messages via `message.error()`
- 401 errors trigger auto-logout
- Loading spinners during requests

---

## ✅ VALIDATION CHECKLIST

Before deployment:
- ✓ Backend running on http://localhost:8080
- ✓ All API endpoints implemented
- ✓ JWT tokens working correctly
- ✓ Role-based access verified
- ✓ Error handling tested
- ✓ Responsive design checked
- ✓ No console errors

---

## 🐛 TROUBLESHOOTING

### API Connection Error
- Check backend is running
- Verify .env VITE_API_BASE_URL
- Check CORS configuration on backend

### 401 Unauthorized
- Clear localStorage: `localStorage.clear()`
- Re-login
- Check token validity

### Styling Issues
- Clear node_modules: `rm -rf node_modules`
- Reinstall: `npm install`
- Check Ant Design import: `import 'antd/dist/reset.css'`

### Build Errors
- Check TypeScript errors: `npm run build`
- Verify all imports are correct
- Check for missing dependencies

---

## 📞 SUPPORT

For issues:
1. Check browser console for errors
2. Verify API endpoints in Network tab
3. Check backend logs
4. Review TypeScript compiler output

---

## 📄 LICENSE

MIT License

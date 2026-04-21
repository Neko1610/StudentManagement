# School Management System

This repository contains a full-stack school management system with a Spring Boot backend, React frontend, and Flutter mobile app skeleton.

## Architecture
- `backend/` - Spring Boot 3 backend with JWT authentication, PostgreSQL persistence, and school entity management.
- `frontend/` - React + Vite frontend using Ant Design.
- `flutter_app/` - Flutter app skeleton with login and dashboard screens.

## Prerequisites
- Java 17
- Maven
- Node.js 18+
- Flutter SDK
- PostgreSQL

## Database setup
1. Start PostgreSQL.
2. Create database:
   ```bash
   createdb schooldb
   ```
3. Update credentials in `backend/src/main/resources/application.properties` if needed.

## Run backend
```bash
cd backend
mvn spring-boot:run
```

## Run frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:3000`.

## Run mobile app
```bash
cd flutter_app
flutter pub get
flutter run
```

## Default accounts
- Admin: `admin` / `password`
- Student: `S001` / `student123`
- Teacher: `jdoe` / `teacher123`
- Parent: `phS001` / `parent123`

## Notes
- The backend uses in-memory entity mapping and seeded SQL data.
- All data is loaded from the PostgreSQL database.
- Export scores with `GET /scores/export`.

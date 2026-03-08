# SmartCare Backend

Simple Express and MongoDB backend for the SmartCare hospital management system.

## Current Backend Scope

The backend currently includes:
- Authentication with JWT
- Role-based access control for `admin`, `doctor`, and `receptionist`
- Departments management
- Doctors management
- Patients management
- Appointments management
- Medical records management
- Dashboard summary endpoint
- Database seed script for quick local testing

## Environment Setup

The project uses the `.env` file in the root directory.

Current required variables:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/smartcare
JWT_SECRET=smartcare-dev-secret-change-me
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Important:
- Change `JWT_SECRET` before using this beyond local development.
- Make sure MongoDB is running locally before starting the server or seeding data.

## Install And Run

Install dependencies:

```bash
npm install
```

Start the server:

```bash
npm start
```

Run in watch mode:

```bash
npm run dev
```

## Seed Data

A seed script was added to quickly prepare realistic hospital test data.

Run it with:

```bash
npm run seed
```

## What The Seed Script Does

The seed process:
- Connects to MongoDB using `MONGO_URI`
- Deletes existing records from these collections:
  - `appointments`
  - `medical records`
  - `doctors`
  - `patients`
  - `departments`
  - `users`
- Inserts fresh sample data for:
  - 4 departments
  - 4 doctors
  - 6 patients
  - 6 appointments
  - 3 medical records
  - 4 users

Seeded departments include:
- Outpatient Services
- Pediatrics
- Radiology
- Laboratory

## Seeded Login Accounts

Use these accounts to test authentication and protected routes:

- `admin@smartcare.local` / `Admin123!`
- `reception@smartcare.local` / `Reception123!`
- `doctor.anne@smartcare.local` / `Doctor123!`
- `doctor.kevin@smartcare.local` / `Doctor123!`

## What You Should Do Next

After pulling or running this backend locally:

1. Start MongoDB.
2. Run `npm install` if dependencies are not installed.
3. Run `npm run seed` to load fresh sample data.
4. Start the API with `npm start` or `npm run dev`.
5. Log in through `POST /api/auth/login` using one of the seeded accounts.
6. Copy the returned JWT token.
7. Pass the token as `Authorization: Bearer <token>` when calling protected endpoints.

## Recommended API Test Flow

Test in this order:

1. `POST /api/auth/login`
2. `GET /api/auth/me`
3. `GET /api/departments`
4. `GET /api/patients`
5. `GET /api/doctors`
6. `GET /api/appointments`
7. `GET /api/medical-records`
8. `GET /api/dashboard/summary`

## Main API Routes

Public routes:
- `GET /api`
- `GET /api/health`
- `POST /api/auth/bootstrap-admin`
- `POST /api/auth/login`

Protected routes:
- `GET /api/auth/me`
- `POST /api/auth/register`
- `/api/departments`
- `/api/patients`
- `/api/doctors`
- `/api/appointments`
- `/api/medical-records`
- `GET /api/dashboard/summary`

## Notes About Seeding

Keep in mind:
- `npm run seed` resets the seeded collections before inserting sample data.
- If you already entered manual records in those collections, the seed script will remove them.
- The seed is intended for local development and testing.

## Files Added For This Work

Relevant backend files:
- [scripts/seed.js](C:/@Latest/Kevo/server/scripts/seed.js)
- [models/User.js](C:/@Latest/Kevo/server/models/User.js)
- [models/Patient.js](C:/@Latest/Kevo/server/models/Patient.js)
- [models/Doctor.js](C:/@Latest/Kevo/server/models/Doctor.js)
- [models/Appointment.js](C:/@Latest/Kevo/server/models/Appointment.js)
- [models/MedicalRecord.js](C:/@Latest/Kevo/server/models/MedicalRecord.js)
- [routes/auth.js](C:/@Latest/Kevo/server/routes/auth.js)
- [middleware/auth.js](C:/@Latest/Kevo/server/middleware/auth.js)
- [controllers/authController.js](C:/@Latest/Kevo/server/controllers/authController.js)

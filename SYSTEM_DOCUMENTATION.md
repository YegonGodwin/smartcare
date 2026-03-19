# SmartCare Hospital Management System

**System Documentation**

## Overview
SmartCare is a role-based hospital management system that unifies patient onboarding, appointment scheduling, clinical records, and operational administration. The platform is split into a React + Vite frontend and an Express + MongoDB backend. Access is gated by roles (admin, doctor, receptionist, patient) and all protected data is served through a JWT-secured API.

## Architecture
```mermaid
flowchart LR
  subgraph Client[Web Client (Vite + React)]
    UI[Role-based UI]
  end

  subgraph API[Backend API (Express)]
    Auth[Auth + RBAC]
    Appointments[Appointments]
    Records[Medical Records]
    Scheduling[Availability + Scheduling]
    Logs[System Logs]
  end

  subgraph Data[MongoDB]
    Users[(Users)]
    Patients[(Patients)]
    Doctors[(Doctors)]
    Departments[(Departments)]
    AppointmentsDB[(Appointments)]
    RecordsDB[(Medical Records)]
    SystemLogs[(System Logs)]
  end

  UI -->|JWT + REST| API
  API --> Data
  API --> Email[Email Service]
  API --> Cron[Daily Reminder Job]
```

## Tech Stack
- Frontend: React 19, Vite, TypeScript, React Router, Tailwind CSS v4
- Backend: Node.js, Express 5, Mongoose, JWT, bcryptjs, express-validator
- Infrastructure: MongoDB, SMTP email (Nodemailer), cron-based reminders
- Tooling: ESLint, TypeScript

## Core Features
- Role-based dashboards for Admin, Doctor, Receptionist, and Patient users
- Patient self-registration with admin approval workflow
- Appointment lifecycle management with conflict checks and status transitions
- Doctor availability scheduling and time-off management
- Medical records creation and access control
- Audit-friendly system logs with searchable categories
- Automated email notifications and reminders

## Roles and Access
- Admin: full system access, staff management, approvals, logs, and master data
- Doctor: clinical views, appointment approvals, schedules, and records
- Patient: personal appointments, records, and self-service booking

## Key Workflows

### Authentication and Session
1. User signs in with email + password.
2. API returns a JWT and user profile.
3. Client stores the token in local storage and uses it for `Authorization: Bearer ...`.
4. Protected routes redirect unauthenticated users to `/login`.

### Patient Registration and Approval
1. Patient completes the three-step registration flow.
2. API creates a patient profile and a linked user account with `isApproved = false`.
3. Admin reviews pending approvals in the admin portal.
4. Approval unlocks access to patient dashboards and scheduling.

### Appointment Booking
1. Patient selects a doctor, department, and time slot.
2. API validates availability, checks conflicts, and creates a pending appointment.
3. Doctors approve or reject the appointment.
4. Status changes are tracked in appointment history with audit metadata.

### Doctor Availability
- Doctors maintain weekly availability and submit time-off ranges.
- Emergency unavailability can be toggled with reason and duration.
- Available slots API is used by the client to drive scheduling UI.

### Notifications and Reminders
- Email notifications are sent for confirmations, cancellations, approvals, and re-schedules.
- A daily reminder job runs at 9:00 AM server time for next-day appointments.

## API Overview
Base URL: `VITE_API_URL` or `http://localhost:5000/api`

Response shape:
- Success: `{ success: true, message, data?, meta? }`
- Error: `{ success: false, message, details?, stack? }`

Authentication:
- Auth endpoints are under `/auth`.
- All protected routes require a `Bearer` token.

Core endpoints:
- Auth: `/auth/login`, `/auth/me`, `/auth/patient-register`, `/auth/patients/pending`
- Appointments: `/appointments`, `/appointments/book`, `/appointments/:id/status`
- Scheduling: `/availability/:doctorId`, `/doctor-schedule/*`
- Records: `/medical-records`
- Master data: `/departments`, `/doctors`, `/patients`
- Admin: `/system-logs`, `/users/staff`

## Data Model Summary
- User: login identity, role, department, doctor/patient profile links, approval state
- Patient: demographic details, emergency contacts, insurance, verification status
- Doctor: department, specialization, availability schedule, time-off, status
- Department: name, code, location, contact metadata
- Appointment: schedule, status history, reschedule history, vitals, priorities
- MedicalRecord: diagnosis, prescriptions, lab results, follow-up data
- SystemLog: structured audit entries by category and status

## Security Practices
- Passwords hashed using bcryptjs (salted)
- JWT-based auth for all protected endpoints
- Helmet for secure HTTP headers
- Rate limiting via express-rate-limit
- Input validation using express-validator + centralized error handling
- CORS allowlist controlled by `ALLOWED_ORIGINS`

## Configuration
Environment variables used by the server:
- `PORT`: API server port
- `NODE_ENV`: `development` or `production`
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: signing key for JWTs
- `JWT_EXPIRES_IN`: JWT lifetime (e.g., `7d`)
- `ALLOWED_ORIGINS`: comma-separated list of allowed web origins
- `EMAIL_USER`: SMTP username
- `EMAIL_PASS`: SMTP password or app-specific password
- `FRONTEND_URL`: base URL for frontend links in emails
- `RATE_LIMIT_WINDOW_MS`: rate limiting window in ms
- `RATE_LIMIT_MAX_REQUESTS`: max requests per window

Client configuration:
- `VITE_API_URL`: API base URL

## Local Development

### Prerequisites
- Node.js 20+
- MongoDB instance

### Backend
1. `cd server`
2. `npm install`
3. Configure `server/.env`
4. `npm run dev`

### Frontend
1. `cd client`
2. `npm install`
3. `npm run dev`

## Seeding (Optional)
A seed script is available to load sample data. It deletes existing records first.
- Command: `npm run seed`
- File: `server/scripts/seed.js`

Test credentials from seed:
- Admin: `admin@smartcare.local / Admin123!`
- Receptionist: `reception@smartcare.local / Reception123!`
- Doctor: `doctor.anne@smartcare.local / Doctor123!`
- Doctor: `doctor.kevin@smartcare.local / Doctor123!`
- Patient: `grace.wanjiku@example.com / Patient123!`

## Deployment Notes
- Build frontend with `npm run build` and deploy the `client/dist` output to static hosting.
- Run the API with `npm run start` and provide production-grade environment variables.
- Ensure `ALLOWED_ORIGINS` includes your production frontend URL.
- Configure SMTP credentials if email notifications are required.

## Repository Map
- `client/`: React UI, routes, pages, and UI components
- `server/`: Express API, controllers, models, and services
- `server/config/`: database and email configuration
- `server/services/`: reminders, notifications, audit logging
- `server/routes/`: REST endpoints and route definitions

## Operational Notes
- System logs are accessible via the admin UI and `/system-logs` API endpoints.
- Reminder job uses server-local time for scheduling.
- Unconfigured email still allows core workflows to run; notifications are skipped.

## Gaps and Next Steps (Optional)
- Add automated tests for API routes and core workflows.
- Add CI for linting and type checks.
- Centralize API error codes for easier client-side handling.
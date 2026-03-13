# Email Notifications - Quick Reference

## 📧 All Email Notifications (10 Total)

| # | Notification | Recipient | Trigger | Status |
|---|-------------|-----------|---------|--------|
| 1 | Appointment Confirmation | Patient | Admin creates appointment | ✅ |
| 2 | **New Appointment Request** | **Doctor** | **Patient books appointment** | ✅ NEW |
| 3 | Appointment Approved | Patient | Doctor approves request | ✅ |
| 4 | Appointment Rejected | Patient | Doctor rejects request | ✅ |
| 5 | Appointment Cancelled | Patient | Status changed to cancelled | ✅ |
| 6 | Appointment Rescheduled | Patient | Doctor reschedules | ✅ |
| 7 | Appointment Reminder | Patient | 24 hours before (9 AM daily) | ✅ |
| 8 | Account Approved | Patient | Admin approves registration | ✅ |
| 9 | Account Rejected | Patient | Admin rejects registration | ✅ |
| 10 | Bulk Approval | Patients | Doctor bulk approves | ✅ |

---

## 🎯 Quick Test Commands

```bash
# Test email configuration
cd server
node test-email-simple.js

# Test all email templates
node test-all-emails.js

# Test doctor notification
node test-doctor-notification.js

# Test complete booking flow
node test-booking.js
```

---

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `server/.env` | Email credentials (EMAIL_USER, EMAIL_PASS) |
| `server/config/email.js` | Email transporter setup |
| `server/services/notificationService.js` | Notification functions |
| `server/utils/emailTemplates.js` | Email templates (8 templates) |
| `server/services/reminderService.js` | Cron job for reminders |

---

## 📝 Email Templates

1. `appointmentConfirmationEmail()` - Green theme
2. `newAppointmentRequestEmail()` - Purple theme ⭐ NEW
3. `appointmentApprovedEmail()` - Green theme
4. `appointmentRejectedEmail()` - Red theme
5. `appointmentCancelledEmail()` - Red theme
6. `appointmentRescheduledEmail()` - Blue theme
7. `appointmentReminderEmail()` - Orange theme
8. `patientApprovalEmail()` - Green/Gray theme

---

## 🚀 Quick Start

### 1. Verify Configuration
```bash
cd server
node test-email-simple.js
```

### 2. Start Server
```bash
npm start
```

### 3. Check Logs
Look for:
- ✅ Email transporter initialized with Gmail SMTP
- ✅ Reminder service started (runs daily at 9:00 AM)

---

## 🔍 Troubleshooting

| Issue | Solution |
|-------|----------|
| Email not sent | Check EMAIL_USER and EMAIL_PASS in .env |
| Invalid login | Regenerate Gmail App Password |
| No email received | Check spam folder |
| Doctor not notified | Verify doctor has email in database |
| Patient not notified | Verify patient has email in database |

---

## 📊 Notification Flow

```
PATIENT BOOKS APPOINTMENT
         ↓
    Status: pending
         ↓
    ✉️ Doctor notified ⭐ NEW
         ↓
  Doctor reviews request
         ↓
    Approves/Rejects
         ↓
    ✉️ Patient notified
```

---

## 🎨 Email Design

All emails include:
- Professional HTML formatting
- Plain text fallback
- Responsive design
- SmartCare branding
- Action buttons/links
- Color-coded by type

---

## ⚙️ Environment Variables

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:5173
```

---

## 📱 API Endpoints

| Endpoint | Method | Notification Triggered |
|----------|--------|----------------------|
| `/api/appointments` | POST | Patient confirmation |
| `/api/appointments/book` | POST | Doctor notification ⭐ |
| `/api/doctor-schedule/appointments/:id/approve` | POST | Patient approval |
| `/api/doctor-schedule/appointments/:id/reject` | POST | Patient rejection |
| `/api/appointments/:id/status` | PATCH | Patient cancellation |
| `/api/doctor-schedule/appointments/:id/reschedule` | POST | Patient reschedule |
| `/api/auth/patients/:id/approve` | POST | Patient account approval |
| `/api/auth/patients/:id/reject` | POST | Patient account rejection |

---

## ✅ Status

- Email Service: ✅ Working
- Gmail SMTP: ✅ Configured
- All Templates: ✅ Ready
- Doctor Notifications: ✅ Implemented ⭐
- Cron Job: ✅ Running
- Error Handling: ✅ In Place

**Ready for production** 🚀

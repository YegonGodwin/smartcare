# Email Notification Setup Guide

## Quick Setup

### 1. Configure Email Settings in `.env`

Update your `server/.env` file with your email provider settings:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=SmartCare Hospital
FRONTEND_URL=http://localhost:5173
```

### 2. Email Provider Options

#### Option A: Gmail (Recommended for Testing)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password
3. Use these settings:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```

#### Option B: Mailtrap (Best for Development/Testing)

1. Sign up at https://mailtrap.io (free)
2. Get your credentials from the inbox settings
3. Use these settings:
   ```env
   EMAIL_HOST=smtp.mailtrap.io
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-mailtrap-username
   EMAIL_PASSWORD=your-mailtrap-password
   ```

#### Option C: SendGrid (Production)

1. Sign up at https://sendgrid.com
2. Create an API key
3. Use these settings:
   ```env
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=apikey
   EMAIL_PASSWORD=your-sendgrid-api-key
   ```

### 3. Test the Setup

Restart your server and test by:
1. Booking an appointment (should send confirmation email)
2. Approving a patient (should send approval email)
3. Cancelling an appointment (should send cancellation email)

## Email Notifications Implemented

### 1. Appointment Confirmation
**Trigger:** When appointment is created (by patient or staff)
**Recipient:** Patient
**Content:** Appointment details, doctor info, date/time, reminders

### 2. Appointment Reminder
**Trigger:** Daily at 9:00 AM for appointments scheduled tomorrow
**Recipient:** Patient
**Content:** Reminder with appointment details, preparation instructions

### 3. Appointment Cancellation
**Trigger:** When appointment status changes to "cancelled"
**Recipient:** Patient
**Content:** Cancellation notice with reason (if provided)

### 4. Patient Approval
**Trigger:** When admin approves patient registration
**Recipient:** Patient
**Content:** Welcome message, login link, available features

### 5. Patient Rejection
**Trigger:** When admin rejects patient registration
**Recipient:** Patient
**Content:** Notification of rejection

## Reminder Service

The reminder service runs automatically:
- **Schedule:** Daily at 9:00 AM
- **Target:** Appointments scheduled for the next day
- **Status:** Only sends for "scheduled" or "confirmed" appointments

To change the schedule, edit `server/services/reminderService.js`:
```javascript
// Current: Daily at 9:00 AM
cron.schedule('0 9 * * *', async () => { ... });

// Examples:
// Every hour: '0 * * * *'
// Twice daily (9 AM and 6 PM): '0 9,18 * * *'
// Every 30 minutes: '*/30 * * * *'
```

## Troubleshooting

### Emails Not Sending

1. **Check console logs** - Look for email-related messages
2. **Verify credentials** - Make sure EMAIL_USER and EMAIL_PASSWORD are correct
3. **Check spam folder** - Emails might be filtered
4. **Test SMTP connection** - Use a tool like Telnet to verify connectivity

### Gmail "Less Secure Apps" Error

Gmail no longer supports "less secure apps". You MUST use an App Password:
1. Enable 2FA on your Google account
2. Generate an App Password (see Option A above)
3. Use the App Password in EMAIL_PASSWORD

### Mailtrap Not Receiving

1. Check you're using the correct inbox credentials
2. Verify the inbox is not full
3. Check the Mailtrap dashboard for delivery logs

### Production Considerations

For production, use a dedicated email service:
- **SendGrid** - 100 emails/day free
- **AWS SES** - Very cheap, requires verification
- **Mailgun** - 5,000 emails/month free
- **Postmark** - Excellent deliverability

## Disabling Email Notifications

If you don't want to set up email yet, simply leave the EMAIL_* variables empty or commented out in `.env`. The system will log that emails are skipped but continue working normally.

```env
# EMAIL_HOST=
# EMAIL_USER=
# EMAIL_PASSWORD=
```

## Email Templates

Templates are located in `server/utils/emailTemplates.js`. Each template includes:
- HTML version (styled, responsive)
- Plain text version (fallback)
- Dynamic content (patient name, appointment details, etc.)

To customize templates, edit the functions in `emailTemplates.js`.

## Testing Emails

### Manual Test

Create a test endpoint (for development only):

```javascript
// In server/routes/index.js
router.get('/test-email', async (req, res) => {
    const { sendEmail } = await import('../config/email.js');
    await sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<h1>Test</h1>',
        text: 'Test'
    });
    res.json({ message: 'Email sent' });
});
```

### Check Logs

The system logs all email operations:
- ✅ Email sent: [messageId]
- 📧 Email skipped (no configuration)
- ❌ Email error: [error message]

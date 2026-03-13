export const appointmentConfirmationEmail = (appointment, patient, doctor) => {
    const appointmentDate = new Date(appointment.scheduledFor);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    return {
        subject: `Appointment Confirmed - ${formattedDate}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .appointment-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .label { font-weight: bold; color: #6b7280; }
        .value { color: #111827; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Appointment Confirmed</h1>
            <p>Your appointment has been successfully scheduled</p>
        </div>
        <div class="content">
            <p>Dear ${patient.firstName} ${patient.lastName},</p>
            <p>Your appointment has been confirmed. Please find the details below:</p>
            
            <div class="appointment-card">
                <h3 style="margin-top: 0; color: #667eea;">Appointment Details</h3>
                <div class="detail-row">
                    <span class="label">Appointment Number:</span>
                    <span class="value">${appointment.appointmentNumber}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Doctor:</span>
                    <span class="value">Dr. ${doctor.firstName} ${doctor.lastName}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Specialization:</span>
                    <span class="value">${doctor.specialization}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Date:</span>
                    <span class="value">${formattedDate}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Time:</span>
                    <span class="value">${formattedTime}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Duration:</span>
                    <span class="value">${appointment.durationMinutes} minutes</span>
                </div>
                <div class="detail-row" style="border-bottom: none;">
                    <span class="label">Type:</span>
                    <span class="value" style="text-transform: capitalize;">${appointment.type}</span>
                </div>
            </div>

            <div style="background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
                <strong>⏰ Important Reminders:</strong>
                <ul style="margin: 10px 0;">
                    <li>Please arrive 15 minutes before your appointment time</li>
                    <li>Bring your ID and insurance card (if applicable)</li>
                    <li>If you need to cancel or reschedule, please contact us at least 24 hours in advance</li>
                </ul>
            </div>

            <div class="footer">
                <p><strong>SmartCare Hospital</strong></p>
                <p>For any questions, please contact us or visit our website</p>
                <p style="color: #9ca3af; margin-top: 20px;">This is an automated message, please do not reply to this email.</p>
            </div>
        </div>
    </div>
</body>
</html>
        `,
        text: `
Appointment Confirmed

Dear ${patient.firstName} ${patient.lastName},

Your appointment has been confirmed. Please find the details below:

Appointment Number: ${appointment.appointmentNumber}
Doctor: Dr. ${doctor.firstName} ${doctor.lastName}
Specialization: ${doctor.specialization}
Date: ${formattedDate}
Time: ${formattedTime}
Duration: ${appointment.durationMinutes} minutes
Type: ${appointment.type}

Important Reminders:
- Please arrive 15 minutes before your appointment time
- Bring your ID and insurance card (if applicable)
- If you need to cancel or reschedule, please contact us at least 24 hours in advance

SmartCare Hospital
For any questions, please contact us or visit our website.
        `
    };
};

export const appointmentReminderEmail = (appointment, patient, doctor) => {
    const appointmentDate = new Date(appointment.scheduledFor);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    return {
        subject: `Reminder: Appointment Tomorrow at ${formattedTime}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .reminder-box { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; text-align: center; }
        .appointment-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⏰ Appointment Reminder</h1>
            <p>Your appointment is tomorrow</p>
        </div>
        <div class="content">
            <p>Dear ${patient.firstName} ${patient.lastName},</p>
            
            <div class="reminder-box">
                <h2 style="margin: 0; color: #d97706;">Tomorrow at ${formattedTime}</h2>
                <p style="margin: 10px 0 0 0; font-size: 18px;">with Dr. ${doctor.firstName} ${doctor.lastName}</p>
            </div>

            <div class="appointment-info">
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${formattedTime}</p>
                <p><strong>Doctor:</strong> Dr. ${doctor.firstName} ${doctor.lastName} (${doctor.specialization})</p>
                <p><strong>Appointment Number:</strong> ${appointment.appointmentNumber}</p>
            </div>

            <div style="background: #dbeafe; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;">
                <strong>📋 Please Remember:</strong>
                <ul style="margin: 10px 0;">
                    <li>Arrive 15 minutes early</li>
                    <li>Bring your ID and insurance card</li>
                    <li>Bring any relevant medical records or test results</li>
                </ul>
            </div>

            <p style="margin-top: 20px;">If you need to cancel or reschedule, please contact us as soon as possible.</p>

            <div class="footer">
                <p><strong>SmartCare Hospital</strong></p>
                <p>We look forward to seeing you!</p>
            </div>
        </div>
    </div>
</body>
</html>
        `,
        text: `
Appointment Reminder

Dear ${patient.firstName} ${patient.lastName},

This is a reminder that you have an appointment tomorrow:

Date: ${formattedDate}
Time: ${formattedTime}
Doctor: Dr. ${doctor.firstName} ${doctor.lastName} (${doctor.specialization})
Appointment Number: ${appointment.appointmentNumber}

Please Remember:
- Arrive 15 minutes early
- Bring your ID and insurance card
- Bring any relevant medical records or test results

If you need to cancel or reschedule, please contact us as soon as possible.

SmartCare Hospital
We look forward to seeing you!
        `
    };
};

export const appointmentCancelledEmail = (appointment, patient, doctor, reason) => {
    const appointmentDate = new Date(appointment.scheduledFor);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    return {
        subject: `Appointment Cancelled - ${appointment.appointmentNumber}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .cancelled-box { background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>❌ Appointment Cancelled</h1>
        </div>
        <div class="content">
            <p>Dear ${patient.firstName} ${patient.lastName},</p>
            
            <div class="cancelled-box">
                <h3 style="margin-top: 0; color: #dc2626;">Your appointment has been cancelled</h3>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${formattedTime}</p>
                <p><strong>Doctor:</strong> Dr. ${doctor.firstName} ${doctor.lastName}</p>
                <p><strong>Appointment Number:</strong> ${appointment.appointmentNumber}</p>
                ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            </div>

            <p>If you would like to reschedule, please book a new appointment through our system or contact us.</p>

            <div class="footer">
                <p><strong>SmartCare Hospital</strong></p>
                <p>For any questions, please contact us.</p>
            </div>
        </div>
    </div>
</body>
</html>
        `,
        text: `
Appointment Cancelled

Dear ${patient.firstName} ${patient.lastName},

Your appointment has been cancelled:

Date: ${formattedDate}
Time: ${formattedTime}
Doctor: Dr. ${doctor.firstName} ${doctor.lastName}
Appointment Number: ${appointment.appointmentNumber}
${reason ? `Reason: ${reason}` : ''}

If you would like to reschedule, please book a new appointment through our system or contact us.

SmartCare Hospital
        `
    };
};

export const patientApprovalEmail = (user, approved) => {
    if (approved) {
        return {
            subject: 'Account Approved - Welcome to SmartCare',
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-box { background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; text-align: center; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to SmartCare!</h1>
        </div>
        <div class="content">
            <p>Dear ${user.firstName} ${user.lastName},</p>
            
            <div class="success-box">
                <h2 style="margin: 0; color: #059669;">Your Account Has Been Approved!</h2>
                <p style="margin: 10px 0 0 0;">You can now access all patient services</p>
            </div>

            <p>Your patient account has been approved by our admin team. You can now:</p>
            <ul>
                <li>Book appointments with our doctors</li>
                <li>View your medical records</li>
                <li>Track your health metrics</li>
                <li>Manage your appointments</li>
            </ul>

            <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="button">Login to Your Account</a>
            </div>

            <div class="footer">
                <p><strong>SmartCare Hospital</strong></p>
                <p>We're here to provide you with the best healthcare experience!</p>
            </div>
        </div>
    </div>
</body>
</html>
            `,
            text: `
Welcome to SmartCare!

Dear ${user.firstName} ${user.lastName},

Your Account Has Been Approved!

Your patient account has been approved by our admin team. You can now:
- Book appointments with our doctors
- View your medical records
- Track your health metrics
- Manage your appointments

Login to your account at: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/login

SmartCare Hospital
We're here to provide you with the best healthcare experience!
            `
        };
    } else {
        return {
            subject: 'Account Registration Update',
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Account Registration Update</h1>
        </div>
        <div class="content">
            <p>Dear ${user.firstName} ${user.lastName},</p>
            <p>Thank you for your interest in SmartCare Hospital. Unfortunately, we are unable to approve your account at this time.</p>
            <p>If you believe this is an error or would like more information, please contact our support team.</p>
            <div class="footer">
                <p><strong>SmartCare Hospital</strong></p>
            </div>
        </div>
    </div>
</body>
</html>
            `,
            text: `
Account Registration Update

Dear ${user.firstName} ${user.lastName},

Thank you for your interest in SmartCare Hospital. Unfortunately, we are unable to approve your account at this time.

If you believe this is an error or would like more information, please contact our support team.

SmartCare Hospital
            `
        };
    }
};

export const appointmentApprovedEmail = (appointment, patient, doctor) => {
    const appointmentDate = new Date(appointment.scheduledFor);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    return {
        subject: `Appointment Approved - ${formattedDate}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .appointment-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .label { font-weight: bold; color: #6b7280; }
        .value { color: #111827; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Appointment Approved</h1>
            <p>Your appointment request has been approved</p>
        </div>
        <div class="content">
            <p>Dear ${patient.firstName} ${patient.lastName},</p>
            <p>Your appointment request has been approved. Here are the details:</p>
            
            <div class="appointment-card">
                <h3 style="margin-top: 0; color: #059669;">Appointment Details</h3>
                <div class="detail-row">
                    <span class="label">Appointment Number:</span>
                    <span class="value">${appointment.appointmentNumber}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Doctor:</span>
                    <span class="value">Dr. ${doctor.firstName} ${doctor.lastName}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Date:</span>
                    <span class="value">${formattedDate}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Time:</span>
                    <span class="value">${formattedTime}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Duration:</span>
                    <span class="value">${appointment.durationMinutes} minutes</span>
                </div>
                <div class="detail-row" style="border-bottom: none;">
                    <span class="label">Type:</span>
                    <span class="value" style="text-transform: capitalize;">${appointment.type}</span>
                </div>
            </div>

            <p>Please arrive 15 minutes early and bring any relevant documents.</p>

            <div class="footer">
                <p><strong>SmartCare Hospital</strong></p>
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </div>
</body>
</html>
        `,
        text: `
Appointment Approved

Dear ${patient.firstName} ${patient.lastName},

Your appointment request has been approved. Details:

Appointment Number: ${appointment.appointmentNumber}
Doctor: Dr. ${doctor.firstName} ${doctor.lastName}
Date: ${formattedDate}
Time: ${formattedTime}
Duration: ${appointment.durationMinutes} minutes
Type: ${appointment.type}

Please arrive 15 minutes early and bring any relevant documents.

SmartCare Hospital
        `
    };
};

export const appointmentRejectedEmail = (appointment, patient, doctor) => {
    const appointmentDate = new Date(appointment.scheduledFor);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    const reason = appointment.rejectionReason || 'No reason provided';

    return {
        subject: `Appointment Request Rejected - ${appointment.appointmentNumber}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Appointment Rejected</h1>
        </div>
        <div class="content">
            <p>Dear ${patient.firstName} ${patient.lastName},</p>
            <p>We are sorry to inform you that your appointment request has been rejected.</p>

            <div class="info-box">
                <p><strong>Doctor:</strong> Dr. ${doctor.firstName} ${doctor.lastName}</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${formattedTime}</p>
                <p><strong>Reason:</strong> ${reason}</p>
            </div>

            <p>You may book a new appointment at another time or with another doctor.</p>

            <div class="footer">
                <p><strong>SmartCare Hospital</strong></p>
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </div>
</body>
</html>
        `,
        text: `
Appointment Request Rejected

Dear ${patient.firstName} ${patient.lastName},

Your appointment request has been rejected.

Doctor: Dr. ${doctor.firstName} ${doctor.lastName}
Date: ${formattedDate}
Time: ${formattedTime}
Reason: ${reason}

You may book a new appointment at another time or with another doctor.

SmartCare Hospital
        `
    };
};

export const appointmentRescheduledEmail = (appointment, patient, doctor, previousDate) => {
    const previous = previousDate ? new Date(previousDate) : null;
    const newDate = new Date(appointment.scheduledFor);
    const previousDateText = previous
        ? previous.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A';
    const previousTimeText = previous
        ? previous.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        : 'N/A';
    const newDateText = newDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const newTimeText = newDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    return {
        subject: `Appointment Rescheduled - ${appointment.appointmentNumber}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Appointment Rescheduled</h1>
            <p>Your appointment has been moved to a new time</p>
        </div>
        <div class="content">
            <p>Dear ${patient.firstName} ${patient.lastName},</p>
            <p>Your appointment has been rescheduled. Please review the updated details:</p>

            <div class="info-box">
                <p><strong>Doctor:</strong> Dr. ${doctor.firstName} ${doctor.lastName}</p>
                <p><strong>Previous Date:</strong> ${previousDateText}</p>
                <p><strong>Previous Time:</strong> ${previousTimeText}</p>
                <p><strong>New Date:</strong> ${newDateText}</p>
                <p><strong>New Time:</strong> ${newTimeText}</p>
                <p><strong>Appointment Number:</strong> ${appointment.appointmentNumber}</p>
            </div>

            <p>If this time does not work for you, please contact us to reschedule.</p>

            <div class="footer">
                <p><strong>SmartCare Hospital</strong></p>
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </div>
</body>
</html>
        `,
        text: `
Appointment Rescheduled

Dear ${patient.firstName} ${patient.lastName},

Your appointment has been rescheduled.

Doctor: Dr. ${doctor.firstName} ${doctor.lastName}
Previous Date: ${previousDateText}
Previous Time: ${previousTimeText}
New Date: ${newDateText}
New Time: ${newTimeText}
Appointment Number: ${appointment.appointmentNumber}

If this time does not work for you, please contact us to reschedule.

SmartCare Hospital
        `
    };
};

export const newAppointmentRequestEmail = (appointment, patient, doctor) => {
    const appointmentDate = new Date(appointment.scheduledFor);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    return {
        subject: `New Appointment Request - ${patient.firstName} ${patient.lastName}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .request-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .label { font-weight: bold; color: #6b7280; }
        .value { color: #111827; }
        .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        .button-approve { background: #10b981; }
        .button-reject { background: #ef4444; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 New Appointment Request</h1>
            <p>A patient has requested an appointment with you</p>
        </div>
        <div class="content">
            <p>Dear Dr. ${doctor.firstName} ${doctor.lastName},</p>
            <p>You have received a new appointment request. Please review the details below:</p>
            
            <div class="request-card">
                <h3 style="margin-top: 0; color: #8b5cf6;">Appointment Request Details</h3>
                <div class="detail-row">
                    <span class="label">Appointment Number:</span>
                    <span class="value">${appointment.appointmentNumber}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Patient Name:</span>
                    <span class="value">${patient.firstName} ${patient.lastName}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Patient Number:</span>
                    <span class="value">${patient.patientNumber}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Requested Date:</span>
                    <span class="value">${formattedDate}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Requested Time:</span>
                    <span class="value">${formattedTime}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Duration:</span>
                    <span class="value">${appointment.durationMinutes} minutes</span>
                </div>
                <div class="detail-row">
                    <span class="label">Type:</span>
                    <span class="value" style="text-transform: capitalize;">${appointment.type}</span>
                </div>
                ${appointment.isFirstVisit ? `
                <div class="detail-row">
                    <span class="label">Visit Type:</span>
                    <span class="value">First Visit</span>
                </div>
                ` : ''}
                ${appointment.reason ? `
                <div class="detail-row" style="border-bottom: none;">
                    <span class="label">Reason:</span>
                    <span class="value">${appointment.reason}</span>
                </div>
                ` : ''}
            </div>

            <div style="background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                <strong>⏰ Action Required:</strong>
                <p style="margin: 10px 0 0 0;">Please review and approve or reject this appointment request at your earliest convenience.</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/doctor/appointments" class="button">View in Dashboard</a>
            </div>

            <div class="footer">
                <p><strong>SmartCare Hospital</strong></p>
                <p>This is an automated notification. Please log in to your dashboard to take action.</p>
            </div>
        </div>
    </div>
</body>
</html>
        `,
        text: `
New Appointment Request

Dear Dr. ${doctor.firstName} ${doctor.lastName},

You have received a new appointment request:

Appointment Number: ${appointment.appointmentNumber}
Patient Name: ${patient.firstName} ${patient.lastName}
Patient Number: ${patient.patientNumber}
Requested Date: ${formattedDate}
Requested Time: ${formattedTime}
Duration: ${appointment.durationMinutes} minutes
Type: ${appointment.type}
${appointment.isFirstVisit ? 'Visit Type: First Visit' : ''}
${appointment.reason ? `Reason: ${appointment.reason}` : ''}

Action Required:
Please review and approve or reject this appointment request at your earliest convenience.

View in Dashboard: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/doctor/appointments

SmartCare Hospital
        `
    };
};

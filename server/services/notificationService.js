import { sendEmail } from '../config/email.js';
import {
    appointmentConfirmationEmail,
    appointmentReminderEmail,
    appointmentCancelledEmail,
    patientApprovalEmail,
    appointmentApprovedEmail,
    appointmentRejectedEmail,
    appointmentRescheduledEmail
} from '../utils/emailTemplates.js';

export const sendAppointmentConfirmation = async (appointment, patient, doctor) => {
    if (!patient?.email) {
        console.log('Patient has no email address');
        return;
    }

    const emailContent = appointmentConfirmationEmail(appointment, patient, doctor);

    await sendEmail({
        to: patient.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
    });
};

export const sendAppointmentReminder = async (appointment, patient, doctor) => {
    if (!patient?.email) {
        console.log('Patient has no email address');
        return;
    }

    const emailContent = appointmentReminderEmail(appointment, patient, doctor);

    await sendEmail({
        to: patient.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
    });
};

export const sendAppointmentCancellation = async (appointment, patient, doctor, reason) => {
    if (!patient?.email) {
        console.log('Patient has no email address');
        return;
    }

    const emailContent = appointmentCancelledEmail(appointment, patient, doctor, reason);

    await sendEmail({
        to: patient.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
    });
};

export const sendPatientApprovalNotification = async (user, approved) => {
    if (!user?.email) {
        console.log('User has no email address');
        return;
    }

    const emailContent = patientApprovalEmail(user, approved);

    await sendEmail({
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
    });
};

const getAppointmentContacts = (appointment) => {
    const patient = appointment?.patient;
    const doctor = appointment?.doctor;
    return { patient, doctor };
};

export const sendAppointmentApprovalNotification = async (appointment) => {
    const { patient, doctor } = getAppointmentContacts(appointment);
    if (!patient?.email) {
        console.log('Appointment approval not sent: patient has no email address');
        return;
    }

    const emailContent = appointmentApprovedEmail(appointment, patient, doctor);

    await sendEmail({
        to: patient.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
    });
};

export const sendAppointmentRejectionNotification = async (appointment) => {
    const { patient, doctor } = getAppointmentContacts(appointment);
    if (!patient?.email) {
        console.log('Appointment rejection not sent: patient has no email address');
        return;
    }

    const emailContent = appointmentRejectedEmail(appointment, patient, doctor);

    await sendEmail({
        to: patient.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
    });
};

export const sendAppointmentRescheduleNotification = async (appointment, previousDate) => {
    const { patient, doctor } = getAppointmentContacts(appointment);
    if (!patient?.email) {
        console.log('Appointment reschedule not sent: patient has no email address');
        return;
    }

    const emailContent = appointmentRescheduledEmail(appointment, patient, doctor, previousDate);

    await sendEmail({
        to: patient.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
    });
};

import nodemailer from 'nodemailer';

let transporter = null;

export const initializeEmailTransporter = () => {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
        console.warn('⚠️  Email configuration missing. Email notifications will be disabled.');
        return null;
    }

    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    console.log('✅ Email transporter initialized');
    return transporter;
};

export const getEmailTransporter = () => {
    if (!transporter) {
        transporter = initializeEmailTransporter();
    }
    return transporter;
};

export const sendEmail = async ({ to, subject, html, text }) => {
    const emailTransporter = getEmailTransporter();
    
    if (!emailTransporter) {
        console.log('📧 Email skipped (no configuration):', { to, subject });
        return { skipped: true };
    }

    try {
        const info = await emailTransporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'SmartCare Hospital'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        });

        console.log('✅ Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email error:', error.message);
        return { success: false, error: error.message };
    }
};

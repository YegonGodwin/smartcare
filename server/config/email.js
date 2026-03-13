import nodemailer from 'nodemailer';

let transporter = null;

export const initializeEmailTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️  Email configuration missing. Email notifications will be disabled.');
        return null;
    }

    transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use STARTTLS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        },
        // Force IPv4
        family: 4
    });

    console.log('✅ Email transporter initialized with Gmail SMTP');
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
            from: `"SmartCare Hospital" <${process.env.EMAIL_USER}>`,
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

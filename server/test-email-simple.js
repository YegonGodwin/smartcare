import dotenv from 'dotenv';
import { initializeEmailTransporter, sendEmail } from './config/email.js';

dotenv.config();

const testEmail = async () => {
    console.log('🧪 Testing email configuration...\n');
    
    console.log('Environment variables:');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '****' + process.env.EMAIL_PASS.slice(-4) : 'NOT SET');
    console.log('');
    
    // Initialize transporter
    const transporter = initializeEmailTransporter();
    
    if (!transporter) {
        console.error('❌ Failed to initialize email transporter');
        process.exit(1);
    }
    
    // Send test email
    console.log('📧 Sending test email...');
    const result = await sendEmail({
        to: process.env.EMAIL_USER, // Send to yourself
        subject: 'SmartCare - Email Configuration Test',
        text: 'This is a test email from SmartCare Hospital System. If you receive this, your email configuration is working correctly!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">SmartCare Hospital System</h2>
                <p>This is a test email to verify your email configuration.</p>
                <p><strong>✅ If you receive this, your email notifications are working correctly!</strong></p>
                <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #6b7280; font-size: 14px;">
                    Sent from SmartCare Hospital System<br>
                    ${new Date().toLocaleString()}
                </p>
            </div>
        `
    });
    
    if (result.success) {
        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', result.messageId);
        console.log('\n📬 Check your inbox at:', process.env.EMAIL_USER);
    } else {
        console.error('❌ Failed to send test email');
        console.error('Error:', result.error);
    }
    
    process.exit(result.success ? 0 : 1);
};

testEmail();

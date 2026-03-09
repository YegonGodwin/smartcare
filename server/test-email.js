import dotenv from 'dotenv';
import { sendEmail } from './config/email.js';

dotenv.config();

const testEmail = async () => {
    console.log('🧪 Testing email configuration...\n');
    
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
        console.log('⚠️  Email is not configured');
        console.log('✅ System will work without email (notifications will be skipped)\n');
        return;
    }
    
    console.log('📧 Email Configuration:');
    console.log(`   Host: ${process.env.EMAIL_HOST}`);
    console.log(`   Port: ${process.env.EMAIL_PORT}`);
    console.log(`   User: ${process.env.EMAIL_USER}`);
    console.log(`   From: ${process.env.EMAIL_FROM || process.env.EMAIL_USER}`);
    console.log(`   From Name: ${process.env.EMAIL_FROM_NAME || 'SmartCare Hospital'}\n`);
    
    console.log('📤 Sending test email...');
    
    const result = await sendEmail({
        to: 'kibetgodwin13@gmail.com',
        subject: 'SmartCare Test Email',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h1 style="color: #667eea;">✅ Email Configuration Successful!</h1>
                <p>Your SmartCare email notification system is working correctly.</p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3>What's Working:</h3>
                    <ul>
                        <li>✅ SMTP connection established</li>
                        <li>✅ Email sending functional</li>
                        <li>✅ Templates ready</li>
                        <li>✅ Notification service active</li>
                    </ul>
                </div>
                <p><strong>Next Steps:</strong></p>
                <ol>
                    <li>Book an appointment to test confirmation emails</li>
                    <li>Approve a patient to test approval emails</li>
                    <li>Cancel an appointment to test cancellation emails</li>
                </ol>
            </div>
        `,
        text: 'Email Configuration Successful! Your SmartCare email notification system is working correctly.'
    });
    
    if (result.success) {
        console.log('✅ Test email sent successfully!');
        console.log(`   Message ID: ${result.messageId}`);
        console.log(`\n📬 Check your Mailtrap inbox at: https://mailtrap.io/inboxes`);
        console.log(`   All emails are caught by Mailtrap (not sent to real addresses)`);
    } else if (result.skipped) {
        console.log('⚠️  Email skipped (no configuration)');
    } else {
        console.log('❌ Failed to send test email');
        console.log(`   Error: ${result.error}`);
    }
};

testEmail()
    .then(() => {
        console.log('\n✅ Test completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Test failed:', error.message);
        process.exit(1);
    });

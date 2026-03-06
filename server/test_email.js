

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

const logFile = path.join(__dirname, 'test_email.log');
function log(msg) {
    fs.appendFileSync(logFile, msg + '\n');
    console.log(msg);
}

// Clear previous log
fs.writeFileSync(logFile, '');

log('Testing Email Configuration...');
log('Host: ' + process.env.EMAIL_HOST);
log('Port: ' + process.env.EMAIL_PORT);
log('User: ' + process.env.EMAIL_USER);

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    debug: true, // Enable debug output
    logger: true // Enable logger
});

async function sendTestEmail() {
    try {
        log('Attempting to send mail...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"Test" <noreply@test.com>',
            to: process.env.EMAIL_USER, // Send to self
            subject: 'Test Email from Online Voting App',
            text: 'If you receive this, email configuration is working.',
            html: '<b>If you receive this, email configuration is working.</b>'
        });

        log('Message sent: ' + info.messageId);
        log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
    } catch (error) {
        log('Error occurred: ' + error.message);
        if (error.response) {
            log('SMTP Response: ' + error.response);
        }
    }
}

sendTestEmail();


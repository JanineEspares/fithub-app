const nodemailer = require('nodemailer');
const mailConfig = require('../config/mail');

const transporter = nodemailer.createTransport({
    host: mailConfig.host,
    port: mailConfig.port,
    secure: mailConfig.secure,
    auth: mailConfig.auth
});

const buildSimpleEmailHtml = ({
    title,
    message,
    footer = 'Thank you for choosing FitHub.'
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f7fb;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:24px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:#2563eb;padding:20px 24px;color:#ffffff;">
      <h2 style="margin:0;font-size:20px;">FitHub Notification</h2>
    </div>
    <div style="padding:24px;color:#1f2937;">
      <h3 style="margin-top:0;">${title}</h3>
      <p style="line-height:1.6;margin:0 0 12px;">${message}</p>
      <p style="line-height:1.6;margin:0;">${footer}</p>
    </div>
  </div>
</body>
</html>`;

transporter.verify(function (error) {
    if (error) {
        console.error('Mail server verification failed:', error.message);
    } else {
        console.log('Mail server is ready.');
    }
});

exports.sendMail = async ({
    to,
    subject,
    text,
    html,
    attachments = []
}) => {
    if (!to) {
        console.log('No recipient email.');
        return false;
    }

    const emailHtml = html || buildSimpleEmailHtml({
        title: subject,
        message: text || 'This is a FitHub notification.'
    });

    try {
        console.log('Sending email to:', to);
        const info = await transporter.sendMail({
            from: mailConfig.from,
            to,
            subject,
            text: text || 'This is a FitHub notification.',
            html: emailHtml,
            attachments
        });

        console.log('Email sent successfully.');
        console.log(info.messageId);
        return true;
    } catch (error) {
        console.error('Email delivery failed:', error.message);
        return false;
    }
};

exports.sendTransactionUpdate = async ({
    to,
    subject,
    text,
    html,
    attachments = []
}) => {
    const emailText = text || 'Your transaction status has been updated.';
    const emailHtml = html || buildSimpleEmailHtml({
        title: subject,
        message: emailText,
        footer: 'Thank you for using FitHub.'
    });

    return exports.sendMail({
        to,
        subject,
        text: emailText,
        html: emailHtml,
        attachments
    });
};
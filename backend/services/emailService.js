const nodemailer = require('nodemailer');
const mailConfig = require('../config/mail');

const transporter = nodemailer.createTransport({
    host: mailConfig.host,
    port: mailConfig.port,
    secure: mailConfig.secure,
    auth: mailConfig.auth
});

exports.sendTransactionUpdate = async ({ to, subject, text, html, attachments = [] }) => {
    if (!to) {
        return;
    }

    await transporter.sendMail({
        from: mailConfig.from,
        to,
        subject,
        text,
        html,
        attachments
    });
};

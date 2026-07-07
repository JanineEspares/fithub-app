const nodemailer = require('nodemailer');
const mailConfig = require('../config/mail');

const transporter = nodemailer.createTransport({
    host: mailConfig.host,
    port: mailConfig.port,
    secure: mailConfig.secure,
    auth: mailConfig.auth
});
 
transporter.verify(function (error, success) {
    if (error) {
        console.log(error);
    } else {
        console.log("Mail server is ready.");
    }
});

exports.sendTransactionUpdate = async ({
    to,
    subject,
    text,
    html,
    attachments = []
}) => {

    if (!to) {
        console.log("No recipient email.");
        return;
    }

    console.log("Sending email to:", to);

    const info = await transporter.sendMail({
        from: mailConfig.from,
        to,
        subject,
        text,
        html,
        attachments
    });

    console.log("Email sent successfully.");
    console.log(info);
};
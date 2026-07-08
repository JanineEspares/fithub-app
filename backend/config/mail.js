require('dotenv').config();

module.exports = {
    host: process.env.MAIL_HOST || 'sandbox.smtp.mailtrap.io',
    port: Number(process.env.MAIL_PORT || 2525),
    secure: false,
    auth: {
        user: process.env.MAIL_USER || 'a3f1fa3616f71b',
        pass: process.env.MAIL_PASS || '72708ec9d136ef'
    },
    from: process.env.MAIL_FROM || 'noreply@fithub.local'
};

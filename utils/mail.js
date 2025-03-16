const nodemailer = require('nodemailer');


const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.USER_EMAIL,
            password: process.env.USER_PASSWORD
        }
    });

    const options = {
        from: 'hotel booking support<support@hotels.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
    }
    await transporter.sendMail(options);


}
module.exports = sendEmail
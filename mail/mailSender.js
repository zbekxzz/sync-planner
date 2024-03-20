const nodemailer = require('nodemailer');
const ejs = require('ejs');
const fs = require('fs');

exports.sendMail = async (confirmCode, recipientMail) => {
    const htmlTemplate = fs.readFileSync('mail/template.ejs', 'utf8');

    const compiledTemplate = ejs.compile(htmlTemplate)({
        confirmCode
    });

    const transporter = nodemailer.createTransport({
        host: 'smtp.mail.ru',
        port: 465,
        secure: true,
        auth: {
            user: 'help.sync@mail.ru',
            pass: 'jCPLQphKJ9gZUTVLzuAh',
        },
    });

    const mailOptions = {
        from: 'help.sync@mail.ru',
        to: recipientMail,
        subject: 'Confirm registration',
        html: compiledTemplate,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}
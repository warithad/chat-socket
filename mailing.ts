const nodemailer = require('nodemailer');
require('dotenv').config();

const MAILING_ADDRESS = process.env.MAILING_ADDRESS;
const MAILING_PASSWORD = process.env.MAILING_PASSWORD;


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: MAILING_ADDRESS,
        pass: MAILING_PASSWORD ,
    },
});

// const mailOptions = {
//     from: MAILING_ADDRESS,
//     to: 'recipient@example.com',
//     subject: 'Email Confirmation',
//     text: 'Click the link to confirm your email.',
// };


export function send(mailOptions: any){
    mailOptions.from = MAILING_ADDRESS;

    transporter.sendMail(mailOptions, (error: any, info: any) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}


module.exports = {send};

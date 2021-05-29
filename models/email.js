// "use strict";
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Sendemail after user registration.
const SendEMail = async (type, options) => {
	// create reusable transporter object using the default SMTP transport {Mailgun}
	const transporter = nodemailer.createTransport({
		port: process.env.GMAIL_SMTP_PORT,
		host: process.env.GMAIL_SMTP_HOST,
		auth: {
			user: process.env.GMAIL_SMTP_USER,
			pass: process.env.GMAIL_SMTP_PASSWORD,
		},
		secure: false,
	});

	const emailoptions = {
		from: `${process.env.GMAIL_SMTP_USER}`, // used as MAIL FROM: address for SMTP
		to: `${options.email}`, // used as RCPT TO: address for SMTP
		subject: 'Welcome', // Subject line
		text: 'You have successfully signed up.', // plain text body
		html: '<h2>You have successfully signed up.</h2>', // html body
	};

	// send mail with defined transport object
	await transporter.sendMail(emailoptions);
};

module.exports.SendEMail = SendEMail;

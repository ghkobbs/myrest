const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

const router = express.Router();
dotenv.config();

const {
	customerByEmail,
	validateCustomerSignUp,
	validatePasswordUpdate,
	createCustomer,
	updateCustomerPassword,
} = require('../models/users');

const { SendEMail } = require('../models/email');

// Check if post content type is json
function isJSONContent(req) {
	if (req.headers['content-type'].split('/')[1] !== 'json') {
		return false;
	}

	return true;
}

// Function to verify access_tokens that are set in the header.
function validateToken(req, res, next) {
	try {
		const jwtSecretKey = process.env.JWT_SECRET_KEY;
		const tokenHeaderKey = req.headers.access_token_key;

		const verified = jwt.verify(tokenHeaderKey, jwtSecretKey);

		if (verified) {
			req.userId = verified.userId;
			req.email = verified.email;
			return next();
		}
		return res.status('401').json({
			status: 'failed',
			error: 'Authentication failed',
		});
	} catch (err) {
		return res.status('401').json({
			status: 'failed',
			error: 'ACCESS_TOKEN_KEY is not provided.',
		});
	}
}
/* 
	====================
		GET ROUTES 
	====================
*/

/* 
	====================
		POST ROUTES 
	====================
*/

router.post('/signup', async (req, res) => {
	if (!isJSONContent(req)) {
		return res.status('200').json({
			status: 'failed',
			error: `Content-Type: "${req.headers['content-type']}" is not supported. `,
		});
	}

	if (req.body.email === '' || req.body.password === '' || req.body.confirmpassword === '') {
		return res.status('200').json({ status: 'failed', error: 'Some required fields are missing.' });
	}
	try {
		const emailExist = await customerByEmail(req.body.email);

		if (Object.keys(emailExist).length > 0) {
			return res.status('200').json({
				status: 'failed',
				error: 'The email provided already exist.',
			});
		}
	} catch (e) {
		// eslint-disable-next-line
    console.log("existing email check passed!");
	}

	if (req.body.password !== req.body.confirmpassword) {
		return res.status('200').json({ status: 'failed', error: 'Passwords do not match.' });
	}

	const { error } = validateCustomerSignUp(req.body);
	if (error) return res.status('200').json({ status: 'failed', error: error.details[0].message });

	createCustomer(req.body)
		.then((results) => {
			res.locals.newuser = results;
			SendEMail('accountRegistration', results);
		})
		.then(() => res.status('200').json({ status: 'success', message: 'Account successfully created.' }))
		.catch((err) =>
			res.status('800').json({
				status: 'failed',
				error: 'An error occurred while processing your request.',
			})
		);
});

router.post('/generateToken', async (req, res) => {
	if (!isJSONContent(req)) {
		return res.status('200').json({
			status: 'failed',
			error: `Content-Type: "${req.headers['content-type']}" is not supported. `,
		});
	}

	if (req.body.email === '' || req.body.password === '') {
		return res.status('200').json({ status: 'failed', error: 'Some required fields are missing.' });
	}

	customerByEmail(req.body.email)
		.then((user) => {
			bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
				if (err) {
					return res
						.status('200')
						.json({ status: 'failed', error: 'An error has occurred while submitting your request.' });
				}

				if (isMatch) {
					const jwtSecretKey = process.env.JWT_SECRET_KEY;
					const data = {
						time: new Date(),
						userId: user.id,
						email: user.email,
					};

					const token = jwt.sign(data, jwtSecretKey);

					return res.status('200').json({
						status: 'success',
						access_token: token,
					});
				}
				return res
					.status('200')
					.json({ status: 'failed', error: 'An error has occurred while submitting your request.' });
			});
		})
		.catch((err) =>
			res.status('200').json({ status: 'failed', error: "There's no account matching the email provided." })
		);
});
/* 
	====================
		PUT ROUTES 
	====================
*/
router.put('/passwordreset', validateToken, async (req, res) => {
	if (!isJSONContent(req)) {
		return res.status('200').json({
			status: 'failed',
			error: `Content-Type: "${req.headers['content-type']}" is not supported. `,
		});
	}

	if (req.body.oldpassword === '' || req.body.password === '' || req.body.confirmpassword === '') {
		return res.status('200').json({ status: 'failed', error: 'Some required fields are missing.' });
	}

	if (req.body.password !== req.body.repeatpassword) {
		return res.status('200').json({ status: 'failed', error: 'Passwords do not match.' });
	}

	const { error } = validatePasswordUpdate(req.body);
	if (error) return res.status('200').json({ status: 'failed', error: error.details[0].message });

	updateCustomerPassword(req.userId, req.body)
		.then((results) => {
			res.locals.newuser = results;
		})
		.then(() => res.status('200').json({ status: 'success', message: 'Password successfully changed.' }))
		.catch((err) =>
			res.status('800').json({
				status: 'failed',
				error: 'An error occurred while processing your request.',
			})
		);
});

module.exports = router;

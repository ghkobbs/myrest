const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const router = express.Router();
dotenv.config();

const { PostModel, createPost, updatePost, deletePost, retrivePostById, validatePost } = require('../models/posts');

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
router.get('/', validateToken, async (req, res) => {
	const posts = await new Promise((resolve, reject) => {
		PostModel.find({})
			.sort({ created: -1 })
			.exec(async (err, response) => {
				if (err) reject(err);
				return resolve(response);
			});
	});

	return res.status('200').json({ status: 'success', data: posts });
});

router.get('/:id', validateToken, async (req, res) => {
	retrivePostById(req.params.id)
		.then((post) => res.status('200').json({ status: 'success', data: post }))
		.catch((err) =>
			res
				.status('404')
				.json({ status: 'failed', error: err.message || "There's no post associated with the post id provided." })
		);
});
/* 
	====================
		POST ROUTES 
	====================
*/

router.post('/create', validateToken, async (req, res) => {
	if (!isJSONContent(req)) {
		return res.status('200').json({
			status: 'failed',
			error: `Content-Type: "${req.headers['content-type']}" is not supported. `,
		});
	}

	const { error } = validatePost(req.body);
	if (error) return res.status('200').json({ status: 'failed', error: error.details[0].message });

	createPost(req.userId, req.body.message)
		.then((post) => res.status('200').json({ status: 'success', data: post }))
		.catch((err) =>
			res.status('800').json({
				status: 'failed',
				error: 'An error occurred while processing your request.',
			})
		);
});
/* 
	====================
		PUT ROUTES 
	====================
*/
router.put('/:id', validateToken, async (req, res) => {
	if (!isJSONContent(req)) {
		return res.status('200').json({
			status: 'failed',
			error: `Content-Type: "${req.headers['content-type']}" is not supported. `,
		});
	}

	const { error } = validatePost(req.body);
	if (error) return res.status('200').json({ status: 'failed', error: error.details[0].message });

	updatePost(req.params.id, req.body.message)
		.then((post) => res.status('200').json({ status: 'success', data: post }))
		.catch((err) =>
			res.status('800').json({
				status: 'failed',
				error: err.message || 'An error occurred while processing your request.',
			})
		);
});

/* 
	====================
		PUT ROUTES 
	====================
*/
router.delete('/:id', validateToken, async (req, res) => {
	deletePost(req.params.id)
		.then((post) => res.status('200').json({ status: 'success', data: post }))
		.catch((err) =>
			res.status('800').json({
				status: 'failed',
				error: err.message || 'An error occurred while processing your request.',
			})
		);
});

module.exports = router;

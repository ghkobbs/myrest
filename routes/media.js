const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const router = express.Router();
dotenv.config();

const { MediaModel, createMedia, deleteMedia, retriveMediaById } = require('../models/media');
const { fileUpload } = require('../models/upload');

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

// Get all media route
router.get('/', validateToken, async (req, res) => {
	const images = await new Promise((resolve, reject) => {
		MediaModel.find({ type: 'image' })
			.sort({ created: -1 })
			.exec(async (err, response) => {
				if (err) reject(err);
				return resolve(response);
			});
	});
	const videos = await new Promise((resolve, reject) => {
		MediaModel.find({ type: 'video' })
			.sort({ created: -1 })
			.exec(async (err, response) => {
				if (err) reject(err);
				return resolve(response);
			});
	});

	return res.status('200').json({ status: 'success', data: { images, videos } });
});

// Get all images route
router.get('/images', validateToken, async (req, res) => {
	const images = await new Promise((resolve, reject) => {
		MediaModel.find({ type: 'image' })
			.sort({ created: -1 })
			.exec(async (err, response) => {
				if (err) reject(err);
				return resolve(response);
			});
	});

	return res.status('200').json({ status: 'success', data: images });
});

// Get all videos route
router.get('/videos', validateToken, async (req, res) => {
	const videos = await new Promise((resolve, reject) => {
		MediaModel.find({ type: 'video' })
			.sort({ created: -1 })
			.exec(async (err, response) => {
				if (err) reject(err);
				return resolve(response);
			});
	});

	return res.status('200').json({ status: 'success', data: videos });
});

// Get a specific media route
router.get('/:id', validateToken, async (req, res) => {
	retriveMediaById(req.params.id)
		.then((media) => res.status('200').json({ status: 'success', data: media }))
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
// Upload a new media
router.post('/', validateToken, async (req, res) => {
	const file = await fileUpload(`${req.query.eventType}`, req, res);

	createMedia(req.userId, file)
		.then((media) => res.status('200').json({ status: 'success', data: media }))
		.catch((err) =>
			res.status('800').json({
				status: 'failed',
				error: 'An error occurred while processing your request.',
			})
		);
});
/* 
	====================
		DELETE ROUTES 
	====================
*/

// Delete an existing media
router.delete('/:id', validateToken, async (req, res) => {
	const path = `./public/uploads/${req.query.filename}`;

	try {
		fs.unlink(path, (err) => {
			if (err) {
				return res.status('800').json({ status: 'failed', message: err });
			}

			deleteMedia(req.params.id)
				.then((media) => res.status('200').json({ status: 'success', data: media }))
				.catch((err) =>
					res.status('800').json({
						status: 'failed',
						error: err.message || 'An error occurred while processing your request.',
					})
				);
		});
	} catch (err) {
		return res.status('800').json({ status: 'failed', message: err });
	}
});

module.exports = router;

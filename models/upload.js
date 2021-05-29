const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const path = require('path');

const dotenv = require('dotenv');

dotenv.config();

const fileUpload = (event, request, response) =>
	new Promise((resolve, reject) => {
		let upStorage = '';

		// Check if upload source is set to aws, then upload file to s3
		if (process.env.MEDIA_UPLOAD_SOURCE === 'aws') {
			aws.config.update({
				accessKeyId: process.env.MEDIA_AMAZON_ACCESS_KEY,
				secretAccessKey: process.env.MEDIA_AMAZON_SECRET_KEY,
				region: process.env.MEDIA_AMAZON_REGION,
			});

			const s3 = new aws.S3({
				/* ... */
			});

			upStorage = multerS3({
				s3,
				bucket: process.env.MEDIA_AMAZON_BUCKET,
				acl: 'public-read',
				cacheControl: 'max-age=31536000',
				metadata(req, file, cb) {
					cb(null, { fieldName: file.fieldname });
				},
				filename(req, file, cb) {
					cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
				},
			});
		} else {
			upStorage = multer.diskStorage({
				destination(req, file, cb) {
					cb(null, './public/uploads/');
				},
				filename(req, file, cb) {
					cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
				},
			});
		}

		if (event === 'imageUpload') {
			const uploadImage = multer({
				storage: upStorage,
				fileFilter(req, file, cb) {
					const allowedFiles = ['.png', '.jpeg', '.jpg'];
					if (!allowedFiles.includes(path.extname(file.originalname))) {
						return cb(new Error('The format of the image is not supported.'));
					}
					cb(null, true);
				},
			}).single('image');

			uploadImage(request, response, (err) => {
				if (err) {
					return reject(err);
				}
				const file = process.env.MEDIA_UPLOAD_SOURCE === 'aws' ? request.file : request.file;
				return resolve(file);
			});
		} else if (event === 'videoUpload') {
			const uploadVideo = multer({
				storage: upStorage,
				fileFilter(req, file, cb) {
					const allowedFiles = ['.mp4', '.mov', '.avi'];
					if (!allowedFiles.includes(path.extname(file.originalname))) {
						return cb(new Error('The format of the image is not supported.'));
					}
					cb(null, true);
				},
			}).single('video');

			uploadVideo(request, response, (err) => {
				if (err) {
					return reject(err);
				}

				const file = process.env.MEDIA_UPLOAD_SOURCE === 'aws' ? request.file.location : request.file.filename;
				return resolve(file);
			});
		} else {
			// eslint-disable-next-line
			return reject('Invalid event name supplied.');
		}
	});

module.exports.fileUpload = fileUpload;

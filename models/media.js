const Joi = require('joi');
const mongoose = require('mongoose');

const ObjectValue = mongoose.Types.ObjectId;

const mediaSchema = mongoose.Schema({
	userId: { type: String, required: true },
	file_name: { type: String, required: true },
	type: { type: String, required: true },
	created: { type: Date, required: true },
	updated: { type: Date, required: true, default: new Date() },
});

const Media = mongoose.model('Media', mediaSchema);

// Fetch a particular media by ID
const retriveMediaById = (id) =>
	new Promise((resolve, reject) => {
		Media.findOne({ _id: ObjectValue(id) }).exec((err, doc) => {
			if (err) return reject(err);
			if (!doc) return reject(err);

			return resolve(doc);
		});
	});

// Create new media
const createMedia = (userId, file) =>
	new Promise((resolve, reject) => {
		try {
			let media = new Media({
				userId,
				file_name: file.filename ? file.filename : file,
				type: file.fieldname ? file.fieldname : 'video',
				created: new Date(),
			});

			media = media.save();

			if (!media) reject(media);

			return resolve(media);
		} catch (e) {
			return reject(e);
		}
	});

// Update existing media
const updateMedia = (mediaId, file) =>
	new Promise((resolve, reject) => {
		try {
			const media = Media.findOneAndUpdate(
				{ _id: mediaId },
				{
					$set: {
						file_name: file.name,
						type: file.type,
						updated: new Date(),
					},
				},
				{ new: true }
			);

			if (!media) reject(media);
			return resolve(media);
		} catch (e) {
			return reject(e);
		}
	});

// Delete existing post
const deleteMedia = (mediaId) =>
	new Promise((resolve, reject) => {
		const post = Media.findOneAndDelete({ _id: mediaId });

		if (!post) return reject(post);
		return resolve(post);
	});

module.exports.MediaModel = Media;
module.exports.createMedia = createMedia;
module.exports.updateMedia = updateMedia;
module.exports.retriveMediaById = retriveMediaById;
module.exports.deleteMedia = deleteMedia;

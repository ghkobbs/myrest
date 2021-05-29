const Joi = require('joi');
const mongoose = require('mongoose');

const ObjectValue = mongoose.Types.ObjectId;

const postSchema = mongoose.Schema({
	userId: { type: String, required: true },
	message: { type: String, required: true },
	created: { type: Date, required: true },
	updated: { type: Date, required: true, default: new Date() },
});

const Post = mongoose.model('Post', postSchema);

// Validate post payload
function validatePost(post) {
	const schema = Joi.object({
		message: Joi.string().required(),
	});

	return schema.validate(post);
}

// Fetch a particular post by ID
const retrivePostById = (id) =>
	new Promise((resolve, reject) => {
		Post.findOne({ _id: ObjectValue(id) }).exec((err, doc) => {
			if (err) return reject(err);
			if (!doc) return reject(err);

			return resolve(doc);
		});
	});

// Create new post
const createPost = (userId, message) =>
	new Promise((resolve, reject) => {
		try {
			let post = new Post({
				userId,
				message,
				created: new Date(),
			});

			post = post.save();

			if (!post) reject(post);

			return resolve(post);
		} catch (e) {
			return reject(e);
		}
	});

// Update existing post
const updatePost = (postId, message) =>
	new Promise((resolve, reject) => {
		try {
			const post = Post.findOneAndUpdate(
				{ _id: postId },
				{
					$set: {
						message,
						updated: new Date(),
					},
				},
				{ new: true }
			);

			if (!post) reject(post);
			return resolve(post);
		} catch (e) {
			return reject(e);
		}
	});

// Delete existing post
const deletePost = (postId) =>
	new Promise((resolve, reject) => {
		const post = Post.findOneAndDelete({ _id: postId });

		if (!post) return reject(post);
		return resolve(post);
	});

module.exports.PostModel = Post;
module.exports.validatePost = validatePost;
module.exports.createPost = createPost;
module.exports.updatePost = updatePost;
module.exports.retrivePostById = retrivePostById;
module.exports.deletePost = deletePost;

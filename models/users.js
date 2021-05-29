const Joi = require('joi');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ObjectValue = mongoose.Types.ObjectId;

const userSchema = mongoose.Schema({
	email: { type: String, required: true },
	password: { type: String, required: true },
	created: { type: Date, required: true },
	updated: { type: Date, required: true, default: new Date() },
});

const User = mongoose.model('User', userSchema);

// Validate new user sign up.
function validateUserSignUp(customer) {
	const schema = Joi.object({
		email: Joi.string().email({ minDomainSegments: 2 }),
		password: Joi.string().regex(/^[a-zA-Z0-9!@#$%^&*]{8,45}$/),
		confirmpassword: Joi.string().regex(/^[a-zA-Z0-9!@#$%^&*]{8,45}$/),
	});

	return schema.validate(customer);
}

// Validate user password when reseting.
function validatePasswordUpdate(customer) {
	const schema = Joi.object({
		oldpassword: Joi.string().regex(/^[a-zA-Z0-9!@#$%^&*]{8,45}$/),
		password: Joi.string().regex(/^[a-zA-Z0-9!@#$%^&*]{8,45}$/),
		repeatpassword: Joi.string().regex(/^[a-zA-Z0-9!@#$%^&*]{8,45}$/),
	});

	return schema.validate(customer);
}

// Fetch customer by email
const customerByEmail = (email) =>
	new Promise((resolve, reject) => {
		User.findOne({ email }).exec((err, doc) => {
			if (err || !doc) return reject(err || 'error');
			return resolve(doc);
		});
	});

// Create a new customer
const createCustomer = (params) =>
	new Promise((resolve, reject) => {
		try {
			let user = new User({
				email: params.email,
				password: params.password,
				created: new Date(),
			});

			bcrypt.genSalt(10, (err, salt) => {
				bcrypt.hash(user.password, salt, async (err, hash) => {
					if (err) reject(err);

					user.password = hash;
					user = await user.save();

					if (!user) reject(user);
					return resolve(user);
				});
			});
		} catch (e) {
			return reject(e);
		}
	});

// Update customer password
const updateCustomerPassword = (customerId, params) =>
	new Promise((resolve, reject) => {
		try {
			User.findOne({ _id: ObjectValue(customerId) }, (err, user) => {
				if (!user) reject(err);

				bcrypt.genSalt(10, (err, salt) => {
					bcrypt.compare(params.oldpassword, user.password, (err, isMatch) => {
						if (!isMatch) reject(err);

						bcrypt.hash(params.password, salt, (err, hash) => {
							if (err) return reject(err);

							params.password = hash;

							User.findOneAndUpdate(
								{ _id: ObjectValue(customerId) },
								{
									$set: {
										password: params.password,
										updated: new Date(),
									},
								},
								{ new: true }
							).exec((err, doc) => {
								if (err || !doc) return reject(err || 'error');
								return resolve(doc);
							});
						});
					});
				});
			}).exec((err, doc) => {
				if (err || !doc) return reject(err || 'error');
				return resolve(doc);
			});
		} catch (e) {
			return reject(e);
		}
	});

module.exports.CustomerModel = User;
module.exports.validateCustomerSignUp = validateUserSignUp;
module.exports.validatePasswordUpdate = validatePasswordUpdate;
module.exports.updateCustomerPassword = updateCustomerPassword;
module.exports.customerByEmail = customerByEmail;
module.exports.createCustomer = createCustomer;

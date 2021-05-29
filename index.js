const express = require('express');

const app = express();
const mongoose = require('mongoose');
const session = require('express-session');

// const index = require('./routes/index');
const dotenv = require('dotenv');
const users = require('./routes/users');
const posts = require('./routes/posts');
const media = require('./routes/media');

dotenv.config();

// set key=value pair
app.use(express.json({ extended: true }));

// Express Session Middleware
app.use(
	session({
		secret: process.env.EXPRESS_SECRET,
		resave: true,
		saveUninitialized: true,
	})
);

const PORT = process.env.PORT ? process.env.PORT : 3000;
const DB_CONNECTION_URL = process.env.MONGODB_CONNECTION_URL || 'mongodb://localhost/facebookrest';

mongoose
	.connect(DB_CONNECTION_URL, {
		useNewUrlParser: true,
		useFindAndModify: false,
		useCreateIndex: true,
		useUnifiedTopology: true,
	})
	// eslint-disable-next-line
	.then(() => console.log("Database connected!"))
	// eslint-disable-next-line
	.catch((err) => console.error('Could not connect to database', err));

app.use('/api/users', users);
app.use('/api/posts', posts);
app.use('/api/media', media);

app.use(async function (req, res, next) {
	return res.status('404').json({ status: 'failed', error: 'Resource endpoint does not exist or has been moved.' });
});

process.on('unhandledRejection', (reason, promise) => {
	// eslint-disable-next-line
	console.log('Unhandled Rejection at:', promise, 'reason:', reason);
	// console.log(reason);
	// Application specific logging, throwing an error, or other logic here
});

// eslint-disable-next-line
app.listen(PORT, () => console.log(`Server is running on ${PORT}`));

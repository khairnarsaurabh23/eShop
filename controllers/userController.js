const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary');

const User = require('../models/user');
const bigPromise = require('../middlewares/bigPromise');
const isLoggedIn = require('../middlewares/user');
const customError = require('../utils/cError');
const cookieToken = require('../utils/cookieToken');
const mailHelper = require('../utils/email');
const crypto = require('crypto');

exports.signup = bigPromise( async (req, res, next) => {

	if (!req.files) {
		return next(new customError('Photo is mandetory for signup', 400));
		}

	const {name, email, password} = req.body
	if (!( email || name || password)) {
		return next(new customError('All fields are mandatory', 400))
	}

	let file = req.files.photo;
	const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
		folder: "images",
		width: 150,
		crop: "scale"
	});

	//create a new user instance/document
	const user =  new User({
		name,
		email,
		password,
		photo: {
			id: result.public_id,
			secure_url: result.secure_url,
		},
	});
	//save the instance/document
	await user.save();

	console.log(user.name);

	cookieToken(user, res);
});

exports.login = bigPromise( async (req, res, next) => {
	const { email, password } = req.body;
	//check if email and password having value
	if (!(email && password)) {
		return next(new customError('Please provide email and password', 400));
	}

	//get the user from db
	//select method is for getting password with user
	const user = await User.findOne({email}).select('+password');
	if (!User) {
		return next(new customError('User not found', 404));
	}

	//check for if password is valid or not
	const DBpassword = await user.validatePassword(password);
	if (!DBpassword) {
		return next(new customError('Incorrect password.', 400));
	}
	//send token
	cookieToken(user, res);
});

exports.logout = bigPromise( async (req, res, next) => {
	res.cookie('token', null, {
		expires: new Date(Date.now()),
		httpOnly: true,
	});
	res.status(200).json({
		success: true,
		message: "Successfully logout",
	})
});

exports.forgotPassword = bigPromise( async (req, res, next) => {
	const {email} = req.body

	const user = await User.findOne({email});
	if (!user) {
		return next(new customError('Email is not registered', 404));
	}

	const forgotToken = user.getForgotPasswordToken();

	await user.save({validateBeforeSave: false});

	const url = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`;

	const message = `Click the link given below to reset your password \n\n\n ${url}`;

	try {
		await mailHelper({
			email:user.email,
			subject: 'Password reset mail',
			message
		});

		res.status(200).json({
			success: true,
			message: 'Email sent'
		});

	} catch (e) {
		user.forgotPasswordToken = undefined;
		user.forgetPasswordExpiry = undefined;
		await user.save({validateBeforeSave: false});

		return next(new customError(e.message, 500));
	}
});

exports.passwordReset = bigPromise( async (req, res, next) => {
	const token = req.params.token;

	const encryptedToken = crypto.
		createHash('sha256').
		update(token).
		digest('hex');

	//find the user based on token  value
	const user = await User.findOne({
		encryptedToken,
		forgotPasswordExpiry : {$gt: Date.now()},
	});

	if (!user) {
		return next(new customError('Token expired', 400));
	}

	//reset password and empty token fields
	user.password = req.body.password;
	user.forgotPasswordToken = undefined;
	user.forgotPasswordExpiry = undefined;
	await user.save();

	//send user a token
	cookieToken(user, res);
});

exports.getUserLoggedInDetails = bigPromise( async (req, res, nex) => {
	const user = User.findeById(req.user.id);

	res.status(200).json({
		success: true,
		user,
	});
});

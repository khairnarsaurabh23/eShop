const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary');

const User = require('../models/user');
const bigPromise = require('../middlewares/bigPromise');
const customError = require('../utils/cError');
const cookieToken = require('../utils/cookieToken');
const mailHelper = require('../utils/email');
const crypto = require('crypto');


//signup controller
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

//login
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

//logout
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

//forgot password
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

//password reset
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

//get user details
exports.getLoggedInUserDetails = bigPromise(async (req, res, next, isLoggedIn) => {
  //req.user will be added by middleware
  // find user by id
  //findById is mongoose function to find a document by its '_id' field
  const user = await User.findById(req.user.id);

  //send response and user data
  res.status(200).json({
    success: true,
    user,
  });
});

//change user password
exports.changePassword = bigPromise(async (req, res, next) => {
	//get the old and new password from user(from req)
	const {oldPassword, newPassword} = req.body;

	//check if oldPassword matches to the password in the database
	const user = await User.findById(req.user.id).select('+password');
	if (!user) {
		return next(new customError('User not found!', 404));
	}

	//compares the password provided by user with password in the DB
	//if matches successfuly then returns true
	const DBpassword = await user.validatePassword(oldPassword);
	if (!DBpassword) {
		return next(new customError('Please provide a valid old password', 400));
	}

	//if the password matches to the password in the DB
	user.password = req.body.newPassword;
	await user.save();

	//update the token
	cookieToken(user, res);
});

//update user details
exports.updateUserDetails = bigPromise(async (req, res, next) => {
	const updateObject =  {
		name:req.body.name,
		email:req.body.email};

	if(!(updateObject.name && updateObject.email)){
		return next(new customError('Name and Email are mandetory fields', 404));
	}

	//check if photo is being updated
	if (req.files) {
		//check if user had profile photo uploaded before
//need some more work
		cloudinary.v2.search.expression(req.files.photo.secure_url).execute()
		.then(
			//delete the old Photo
			cloudinary.v2.uploader.destroy(req.files.photo.secure_url)
		);

		//upload the new one
		const result = await cloudinary.v2.uploader.upload(req.files.photo.tempFilePath, {
			folder: "images",
			width: 150,
			crop: "scale"
		});

		updateObject.photo = {
			id: result.public_id,
			secure_url: result.secure_url
		};
	}

	const user = await User.findByIdAndUpdate(req.user.id, updateObject, {
		//get the new object after the update
		new: true,
		//run all validator methods before saving
		runValidators: true
	});

	//send status and json success rersponse
	res.status(200).json({
		success: true,
		user
	});
});


//admin  specific controller
exports.admin = bigPromise(async (req, res, next) => {
	//find all users
	const users = await User.find();

	res.status(200).json({
		success: true,
		users,
	});
});
exports.getUser = bigPromise(async (req, res, next) => {
  // get id from url and get user from database
  const user = await User.findById(req.params.id);

  if (!user) {
    next(new customError("No user found", 400));
  }

  // send user
  res.status(200).json({
    success: true,
    user,
  });
});
exports.updateUser = bigPromise(async (req, res, next) => {
  // get data from request body
  const userObject = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  //a check for email and name in body
  if (!(userObject.name && userObject.email)) {
  	return next(new customError('Email and Name are mandetory fields', 400));
  }

  // update the user in database
  const user = await User.findByIdAndUpdate(req.params.id, userObject, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});
exports.deleteUser = bigPromise(async (req, res, next) => {
  // get user from url
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new customError("User not found", 401));
  }

  // get image id from user in database
  const imageId = user.photo.id;

  // delete image from cloudinary
  await cloudinary.v2.uploader.destroy(imageId);

  // remove user from databse
  await user.remove();

  res.status(200).json({
    success: true,
  });
});

//manager specific route
exports.manager = bigPromise(async (req, res, next) => {
  // select the user with role of user
  const users = await User.find({ roll: "user" });

  //hide the email and other private data of users
  // for user in users:
  // 	user.email = undefined;

  res.status(200).json({
    success: true,
    users,
  });
});




// exports.getUserLoggedInDetails = bigPromise( async (req, res, nex, isLoggedIn) => {
// 	isLoggedIn()
// 	const user = User.findeById(req.user.id);
//
// 	res.status(200).json({
// 		success: true,
// 		user,
// 	});
// });



// //userController.js
//
// exports.getLoggedInUserDetails = BigPromise(async (req, res, next) => {
//   const user = await User.findById(req.user.id);
//   res.status(200).json({
//     success: true,
//     user,
//   });
// });
//
//
//
// //user.js middleware
//
// const User = require('../models/user');
// const bigPromise = require('./bigPromise');
// const customError = require('../utils/cError');
// const jwt = require('jsonwebtoken');
//
// exports.isLoggedIn = bigPromise(async (req, res, next) => {
//     const token = req.cookies.token;
//
//     if (!token) {
//         return next(new customError('Your login session expired, login agin', 401));
//     }
//
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//
//     //injecting our own info to req
//     req.user = await User.findeById(decoded.id);
//
//     next();
// });
//
//
//
//
// //routes/user.js
//
// const express = require('express');
// const router = express.Router();
//
// const {signup,
//     login,
//     logout,
//     forgotPassword,
//     passwordReset,
//     getUserLoggedInDetails} = require('../controllers/userController');
// const isLoggedIn = require('../middlewares/user');
//
// router.route('/signup').post(signup);
// router.route('/login').get(login);
// router.route('/logout').get(logout);
// router.route('/forgotpassword').post(forgotPassword);
// router.route('/password/reset/:token').post(passwordReset);
// router.route('/dashboard').get(isLoggedIn, getUserLoggedInDetails);
//
// module.exports = router;

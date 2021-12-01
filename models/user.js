const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
	name: {
		type      : String,
		required  : [true, 'Name is mandatory field'],
		maxLength : [50, 'Max. char limit exceeded']
	},
	email: {
		type      : String,
		required  : [true, 'Email is mandatory field'],
		validate  : [validator.isEmail, 'Please enter a valid email'], //validate email in correct format
		unique    : [true, 'This email alredy registered, please use another one']
	},
	password: {
		type      : String,
		required  : [true, 'Password is mandatory field'],
		minLength : [8, 'Password must atleast 8 char long'],
		select    : false											//password will not come with model by default
	},
	roll: {
		type      : String,
		default   : 'user'
	},
	photo: {
		id        : {
			type     : String,
			required : false,
		},
		secure_url: {
			type     : String,
			required : false,
		}
	},
	forgetPasswordToken: String,
	forgetPasswordExpiry: Date,
	createAt: {
		type    : Date,
		default : Date.now    // it'll run whenever this field will get exicuted
		//default: Date.now()  -->  it will run now only
	},
});

//encrypt password before saving
userSchema.pre('save', async function(next) {					//It's hook
	if (!this.isModified('password')) {return next();}
	this.password = await bcrypt.hash(this.password, 10);
});

//validate the password
userSchema.methods.validatePassword = async function(password){
	return await bcrypt.compare(password, this.password);
};

//create and return jwt token
userSchema.methods.getJwtToken = function(){
	return jwt.sign(
		{id: this._id},
		process.env.JWT_SECRET,
		{expiresIn: process.env.JWT_EXPIRY}
		);
};

//fotgot password
userSchema.methods.getForgotPasswordToken = function(){
	//generate a random string
	const forgotToken = crypto.randomBytes(20).toString('hex');

	this.forgetPasswordToken = crypto.createHash('sha256')
		                        .update(forgotToken)
		                        .digest('hex');

	this.forgotPasswordExpiry = Date.now() + process.env.FORGOT_PASSWORD_EXPIRY;

	return forgotToken;
};


module.exports =  mongoose.model('user', userSchema);

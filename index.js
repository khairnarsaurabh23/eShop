const app = require('./app');
const connection = require('./config/db');
const cloudinary = require('cloudinary');
require('dotenv').config();

//connect with databse
connection();

//cloudinary config
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});

app.listen(process.env.PORT, ()=> {
	console.log(`Server is running at port ${process.env.PORT}`);
})
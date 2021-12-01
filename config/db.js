const mongoose = require('mongoose');

const connect = () => {
	mongoose.connect(process.env.DB_URL)
	.then(console.log('DB CONNECTION SUCCESSFULLY ESTABLISHED'))
	.catch(error => {
		console.log('DB CONNECTION FAILED');
		console.log(error);
		process.exit(1);
	})
};

module.exports = connect;
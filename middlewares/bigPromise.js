//capsule function for other functions
//will capture errors

module.exports = func => (req, res, next) => 
	Promise.resolve(func(req, res, next)).catch(next);
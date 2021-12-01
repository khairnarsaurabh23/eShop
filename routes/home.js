//handle all routs coming from home page
const express = require('express');
const router = express.Router();

const {home} = require('./../controllers/home');

router.route('/').get(home);

module.exports = router;
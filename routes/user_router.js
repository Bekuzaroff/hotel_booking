const express = require('express');
const user_controller = require('./../controllers/user_controller');

const router = express.Router();

router.route('/signup')
    .post(user_controller.sign_up_user);
router.route('/login')
    .post(user_controller.log_in_user);

module.exports = router;
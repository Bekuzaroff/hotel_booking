const express = require('express');
const user_controller = require('./../controllers/user_controller');

const router = express.Router();

router.route('/signup')
    .post(user_controller.sign_up_user);
router.route('/login')
    .post(user_controller.log_in_user);

router.route('/update_password')
    .patch(user_controller.protect, user_controller.updateUserPassword);
router.route('/update_detailes')
    .patch(user_controller.protect, user_controller.updateUserDetailes);
router.route('/delete_me')
    .delete(user_controller.protect, user_controller.deleteCurrentUser);
    
router.route('/forgot_password')
    .post(user_controller.forgotPassword);

router.route('/reset_password/:token')
    .patch(user_controller.resetPassword);
module.exports = router;
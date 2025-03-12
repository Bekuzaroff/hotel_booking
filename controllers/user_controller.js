const async_error_handler = require('./../utils/async_handler');
const User = require('./../models/user');
const CustomError = require('../utils/custom_error');

exports.sign_up_user = async_error_handler(async (req, res, next) => {
    let user = await User.create(req.body);

    if(!user){
        let err = new CustomError('you did not add you data to sign up', 400);
        next(err);
    }

    res.status(201).json({
        status: 'success',
        data: {
            user: req.body
        }
    })
});
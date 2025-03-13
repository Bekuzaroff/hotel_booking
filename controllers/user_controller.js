const async_error_handler = require('./../utils/async_handler');
const User = require('./../models/user');
const CustomError = require('../utils/custom_error');
const jwt = require('jsonwebtoken');

const signJWT = (id, email) => {
    return jwt.sign({id, email}, process.env.SECRET_JWT_KEY, {
        expiresIn: process.env.EXPIRING_TIME
    });
}
exports.sign_up_user = async_error_handler(async (req, res, next) => {
    let user = await User.create(req.body);

    const token = signJWT(user._id, user.email);

    if(!user){
        let err = new CustomError('you did not add you data to sign up');
        next(err);
    }

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: req.body
        }
    })
});

exports.log_in_user = async_error_handler(async (req, res, next) => {
    const {email, password} = req.body ;

    if(!email || !password){
        const err = new CustomError('you email or password is empty', 404);
        return next(err);
    }

    const user = await User.findOne({email}).select('+password');

    

    if(!user || !(await user.compare_passwords_login(password, user.password))){
        let err = new CustomError('invalid email or password', 404);
        return next(err);
    }

    const token = signJWT(user._id, user.email);

    res.status(200).json({
        status: 'success',
        token,
        data: {
            user: req.body
        }
    })

    

});
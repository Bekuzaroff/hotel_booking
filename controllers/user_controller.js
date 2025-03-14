const async_error_handler = require('./../utils/async_handler');
const User = require('./../models/user');
const CustomError = require('../utils/custom_error');
const jwt = require('jsonwebtoken');
const util = require('util');

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

exports.protect = async_error_handler(async (req, res, next) => {
    //retrieved jwt token from client with header
    let users_jwt = req.headers.authorization;


    if(!users_jwt){
        const err = new CustomError('you did not add you jwt token', 404);
        return next(err)
    }
    const signed_jwt = await util.promisify(jwt.verify)(users_jwt, process.env.SECRET_JWT_KEY);

    //if the user exists
    const user = await User.findById(signed_jwt.id);

    if(!user){
        const err = new CustomError('user with such token does not exist', 404);
        return next(err)
    }
    //if password was changed after login
    if(await user.password_changed_after_login(signed_jwt.iat)){
        const err = new CustomError('you changed you password after you logined, please, login again', 404);
        return next(err)
    }

    next();
    

})
const async_error_handler = require('./../utils/async_handler');
const User = require('./../models/user');
const CustomError = require('../utils/custom_error');
const jwt = require('jsonwebtoken');
const util = require('util');
const email = require('.././utils/mail');

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
    let users_jwt = req.headers.authorization.split(' ')[1];


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

    req.user = user;
    next();
    

});

exports.restrict = (role) => {
    return (req, res, next) => {
        if(req.user.role !== role){
            const err = new CustomError('you are not allowed to change hotel data', 403);
            next(err);
        }
        next();
    }
}

exports.forgotPassword = async_error_handler(async (req, res, next) => {
    let user = await User.findOne({email: req.body.email});

    if(!user){
        const err = new CustomError('user with such email not found', 404);
        next(err);
    }

    const token = user.generate_reset_token();

    await user.save({validateBeforeSave: false});

    const url = `${req.protocol}://${req.get('host')}/api/v1/users/reset_password/${token}`
    const message = `please go this link to reset password ${url}`;
    
    try{
        await email({
            email: user.email,
            subject: 'reset password received',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'password reset link was sent to your email'
        })
    }catch(err){
        user.reset_token = undefined;
        user.reset_token_expires = undefined;

        user.save({validateBeforeSave: false});

        return next(new CustomError('there was a error please try again later', 500));
    }


});
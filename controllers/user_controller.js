const async_error_handler = require('./../utils/async_handler');
const User = require('./../models/user');
const CustomError = require('../utils/custom_error');
const jwt = require('jsonwebtoken');
const util = require('util');
const email = require('.././utils/mail');
const crypto = require('crypto');

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
exports.resetPassword = async_error_handler(async (req, res, next) => {
    let token = crypto.createHash('sha256').update(req.params.token).digest('hex');
    let user = await User.findOne({reset_token: token, reset_token_expires:  {$gt: Date.now()}});


    if(!user){
        const err = new CustomError('token not found', 404);
        next(err);
    }

    const body = req.body;

    //update some user fields 
    user.reset_token = undefined;
    user.reset_token_expires = undefined;
    user.password = body.new_password;
    user.confirm_password = body.confirm_new_password;
    user.password_last_changed = Date.now();

    await user.save();

    //login user after updated password
    let jwt = signJWT(user.id, user.email);
    
    res.status(200).json({
        status: 'success',
        token: jwt
    });
});


exports.updateUserPassword = async_error_handler(async (req, res, next) => {
    let jwt_token = await util.promisify(jwt.verify)(req.body.token, process.util.SECRET_JWT_KEY);

    let user = await User.findOne({_id: jwt_token.id});

    if(!user){
        const err = new CustomError('token not found', 404);
        next(err);
    }

    let new_pass = req.new_password;
    let confirm_new_pass = req.confirm_new_pass;

    user.password = new_pass;
    user.confirm_password = confirm_new_pass;
    user.password_last_changed = Date.now();

    await user.save();

    //login user after updated password
    let jwt = signJWT(user.id, user.email);
    
    res.status(200).json({
        status: 'success',
        token: jwt
    });

});

exports.deleteCurrentUser = async_error_handler(async (req, res, next) => {
    let jwt_token = await util.promisify(jwt.verify)(req.body.token, process.util.SECRET_JWT_KEY);

    let id = jwt_token.id;
    let user = User.findById(id);

    if(!user){
        const err = new CustomError('token not found', 404);
        next(err);
    }

    user.remove(() => {
        console.log('user is removed')
    })

    res.status(200).json({
        status: 'success',
        message: 'user was removed successfully'
    });

});
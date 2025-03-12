const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const user_schema = mongoose.Schema({
    name: {
        unique: true,
        required: [true, 'please enter your name'],
        type: String,
    },
    email: {
        unique: true,
        type: String,
        required: [true, 'please enter your email'],
        validate: [validator.isEmail, "please enter a valid email"]
    },
    photo: String,
    password: {
        type: String,
        required: [true, 'please enter your password'],
        minlength: 6
    },
    confirm_password: {
        type: String,
        validate: {
            validator: (value) => {
                value == this.password;
            },
            message: "your passwords do not match"
        },
        required: [true, 'please confirm your password']
    }
});

user_schema.pre('save', async function(next){
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12)

    this.confirm_password = undefined;

    next();
})

const User = mongoose.model("users", user_schema);
module.exports = User;
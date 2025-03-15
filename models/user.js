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
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin']
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
    },
    password_last_changed: Date
});


//schema middlewares
user_schema.pre('save', async function(next){
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12)

    this.confirm_password = undefined;

    next();
});


//schema methods
user_schema.methods.compare_passwords_login = async function(pass, pass_db) {
    return await bcrypt.compare(pass, pass_db);
}

user_schema.methods.password_changed_after_login = async function (jwt_time_stamp) {
    if(this.password_last_changed){
        this.password_last_changed = parseInt(this.password_last_changed.getTime() / 1000, 10);

        return this.password_last_changed > jwt_time_stamp;
    }
}

//data model
const User = mongoose.model("users", user_schema);
module.exports = User;
const express = require('express');
const app = express();

const router = require('./../routes/router');
const user_router = require('./../routes/user_router');

const CustomError = require('./../utils/custom_error');

const dev_errors = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stacktrace: err.stack,
        error: err
    });
}
const prod_errors = (err, res) => {
    if(err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }else{
        res.status(500).json({
            status: 'error',
            message: 'something went wrong, try again later'
        })
    }
} 

app.use(express.json());

app.use('/api/v1/hotel_server',router);
app.use('/api/v1/users', user_router);

app.use(express.static('./hotel_images'));

app.all("*", (req, res, next) => {
    // res.status(404).json({
    //     status: "fail",
    //     message: `cannot find ${req.originalUrl} url`
    // });
    let err = new CustomError(`cannot find ${req.originalUrl} url`, 404);
    next(err);
});

app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV == "development"){
        dev_errors(err, res);
    }else if(process.env.NODE_ENV == "production"){
        prod_errors(err, res);
    }
})
module.exports = app;
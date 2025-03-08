const express = require('express');
const app = express();
const fs = require('fs');
const Hotel = require('./models/hotel');
const mongoose = require('mongoose');
const dot_env = require('dotenv');

//add file with env variables
dot_env.config({path: './main.env'});


//connect db
// connection url is url from db to connect it
mongoose.connect(process.env.CONNECTION_URL, {
    useNewUrlParser: true
}).then((conn) => {
    console.log("db is connected");
});

app.use(express.json());

app.post('/new_data', async (req, res) => {
    try{
        let data = JSON.parse(fs.readFileSync('./dev_data/hotels.json', 'utf-8'));
        await Hotel.deleteMany({});
        await Hotel.insertMany(data);
        res.status(201).json({
            'status': 'success',
            'message': 'data are added successfully'
        })
    }catch(err){
        res.status(404).json({
            'status': 'fail',
            'message': err.message
        })
    }
});

app.listen(8000, () => {
    console.log('start');
});
const express = require('express');
const app = express();
const router = require('./../routes/router');

app.use(express.json());
app.use('/api/v1/hotel_server',router);
app.use(express.static('./hotel_images'))
module.exports = app;
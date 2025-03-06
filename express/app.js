const express = require('express');
const app = express();
const router = require('./../routes/router');

app.use(express.json());
app.use('/api/v1/hotel_server',router);

module.exports = app;
const app = require('./express/app');
const mongoose = require('mongoose');
const dot_env = require('dotenv');

//add file with env variables
dot_env.config({path: './main.env'});


//connect db
// connection url is url from db to connect it
mongoose.connect(process.env.CONNECTION_URL, {
    useNewUrlParser: true
}).then((conn) => {
    console.log("server has started");
});

//start server entry point
const port = 8000;
app.listen(port, () => {
    console.log('server has started');
});
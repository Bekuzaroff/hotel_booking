const mongoose = require('mongoose');

const hotel_schema = new mongoose.Schema({
    name: {
        unique: true,
        type: String,
        required: [true, "name is required field"],
        trim: true
    },
    country: {
        type: String,
        required: [true, "country is required field"],
        trim: true
    },
    rating: {
        required: true,
        type: Number,
    },
    lng: {
        unique: true,
        type: Number,
        required: [true, "lng is required field"],
    },
    lat: {
        unique: true,
        type: Number,
        required: [true, "lat is required field"],
    },
    images: {
        type: [String],
        required: [true, "images is required field"],
    },
    hasSea: Boolean
    
    
}, {
    toJSON: {virtuals: true}
});
hotel_schema.virtual("rating in 10").get(function(){
    return this.rating * 2;
})

const Hotel = mongoose.model("hotels", hotel_schema);
module.exports = Hotel;
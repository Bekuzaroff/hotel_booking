const mongoose = require('mongoose');

const hotel_schema = new mongoose.Schema({
    name: {
        unique: true,
        type: String,
        required: [true, "name is required field"],
        trim: true,
        minlength: [2, "hotel name is too short"]
    },
    country: {
        type: String,
        required: [true, "country is required field"],
        trim: true
    },
    rating: {
        required: true,
        type: Number,
        validate: {
            validator: function(value){
                return value >= 1 && value <= 5
            },
            message: "ratings should be between 1 and 5"
        }
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
});


hotel_schema.pre('save', function(next){
    this.rating = `rating: ${this.rating}`;
    next();
});

hotel_schema.post('save', function(doc, next){
    console.log('new document added to db');
    next();
});

const Hotel = mongoose.model("hotels", hotel_schema);
module.exports = Hotel;
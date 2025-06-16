const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        type: String,
        default: "https://www.techspot.com/images2/trivia/bigimage/2017/2017-03-19-image-46.jpg",
        set: (v) => v === "" ? "https://www.techspot.com/images2/trivia/bigimage/2017/2017-03-19-image-46.jpg" : v      //arrow function to set default value if not specified
    },
    price: Number,
    location: String,
    country: String
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;

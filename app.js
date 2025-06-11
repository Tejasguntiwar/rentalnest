const express = require("express");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
    console.log("Connection successfull..");
})
.catch((err) => {
    console.log(err);
})

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.get("/", (req, res) => {
    res.send("This is Root");
});


//Index Route
app.get("/listings", async (req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});    
});


//New Route
app.get("/listings/new", async (req, res) => {
    res.render("listings/new.ejs");    
});


//Show Route
app.get("/listings/:id", async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});    
});

//Create Route
app.post("/listings", async (req, res) => {
    // let {title, description, image, price, country, location} = req.body;
    // let newListing = req.body.listing;
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
});

//Edit Route 
app.get("/listings/:id/edit", async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    
    res.render("listings/edit.ejs", {listing});
});


//Update Route
app.put("/listings/:id", async (req, res) => {
    let {id} = req.params;

    await Listing.findByIdAndUpdate(id, {...req.body.listing});

    res.redirect("/listings");
});


//DELETE Route
app.delete("/listings/:id", async (req, res) => {
    let {id} = req.params;

    await Listing.findByIdAndDelete(id);

    res.redirect("/listings");
});



// app.get("/testListing", async (req, res) => {
//     let sampleList = new Listing({
//         title: "Khandelwal Lawns",
//         description: "Mangal Karyalay",
//         image: "https://www.techspot.com/images2/trivia/bigimage/2017/2017-03-19-image-46.jpg",
//         price: 1000,
//         location: "Akola",
//         country: "India",
//     });

//     await sampleList.save();
//     console.log("sample saved..");
//     res.send("sample saved..");
// });

app.listen(3000, () => {
    console.log("Listening on port 3000");
});
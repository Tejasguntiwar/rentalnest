const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("Connection successfull..");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.get("/", (req, res) => {
  res.send("This is Root");
});




//All the routes related to Listings (/listings are moved) to separate /routes/listing.js file
app.use("/listings", listings);

//All the routes related to Reviews (/listings/:id/review) are moved to separate /routes/review.js file
app.use("/listings/:id/reviews", reviews);


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

//if Any of the Above NOT MATCHES
app.all("/{*any}", (req, res, next) => {
  next(new ExpressError(404, "Page not Found!"));
});

//Error Handling
app.use((err, req, res, next) => {
  // let { statusCode, message } = err;
  // res.status(statusCode).send(message);

  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
  // res.status(statusCode).send(message);
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});

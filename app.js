const express = require("express");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");

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

const validateListing = (req, res, next) => {
  let {error} = listingSchema.validate(req.body);
  if (error) {
    let errorMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errorMsg);
  } else {
    next();
  }
};

//Index Route
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

//New Route
app.get(
  "/listings/new",
  wrapAsync(async (req, res) => {
    res.render("listings/new.ejs");
  })
);

//Show Route
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
  })
);

//Create Route
app.post(
  "/listings", validateListing,
  wrapAsync(async (req, res, next) => {
    // let {title, description, image, price, country, location} = req.body;
    // let newListing = req.body.listing;
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  })
);

//Edit Route
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    res.render("listings/edit.ejs", { listing });
  })
);

//Update Route
app.put(
  "/listings/:id", validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;

    await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    const listing = await Listing.findById(id); // ✅ Get updated listing

    res.render("listings/show.ejs", { listing });
  })
);

//DELETE Route
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;

    await Listing.findByIdAndDelete(id);

    res.redirect("/listings");
  })
);

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

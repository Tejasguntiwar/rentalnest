if(process.env.NODE_ENV != "production") {
  require('dotenv').config()
}
console.log(process.env.secret );

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const { error } = require('console');

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));



// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;      //online mongo DB URL


const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,        //to RETAIN SESSION for 24 hr (24 * 3600 in seconds)
});

store.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE", err);
})

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true
  }
};




main()
.then(() => {
  console.log("Connection successfull..");
})
.catch((err) => {
  console.log(err);
});

async function main() {
  await mongoose.connect(dbUrl);
}

// app.get("/", (req, res) => {
//   res.send("This is Root");
// });



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());         //storing in session
passport.deserializeUser(User.deserializeUser());     //un-storing in session


app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
})

//Demo Usage
// app.get("/demouser", async (req, res) => {
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "delta-student"
//   });

//   let registeredUser = await User.register(fakeUser, "helloworld");    //register method will automatically stores fakeUser in the DB with 'helloworld' as password  
//   res.send(registeredUser);
// });


//All the routes related to Listings (/listings are moved) to separate /routes/listing.js file
app.use("/listings", listingRouter);

//All the routes related to Reviews (/listings/:id/review) are moved to separate /routes/review.js file
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);



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

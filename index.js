require("dotenv").config();
const express = require("express");
const expressLayout = require("express-ejs-layouts");
const flash = require('connect-flash');
const session = require("express-session");
const passport = require("passport");
const cookieParser = require("cookie-parser");

const userRoutes = require("./server/routes/userRoutes");
const home = require("./server/routes/home");
const connectDB = require("./server/config/db");

connectDB();

require('./server/utils/third-party');

const app = express();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Static files
app.use(express.static("public"));

// Flash Messages
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, 
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Templating Engine
app.use(expressLayout);
app.set("view engine", "ejs");
app.set("views", "./view");
app.set("layout", "layouts/main");
app.set("layout", "layouts/user");




// Routes
app.use("/", home);
app.use("/auth", userRoutes);

// Handle 404
app.use((req, res, next) => {
  res.status(404).render("404", { layout: "layouts/main" });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render("error", {
    layout: "layouts/main",
    message: err.message,
    error: err
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

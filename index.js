require("dotenv").config();
const express = require("express");
const expressLayout = require("express-ejs-layouts");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const dotenv = require("dotenv");

const userRoutes = require("./server/routes/userRoutes");
const Dbconnection = require('./server/config/db')


Dbconnection();

// Passport configuration
// require('./config/passport');

const app = express();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Static files
app.use(express.static("public"));

// Flash Messages
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Templating Engine
app.use(expressLayout);
app.set("view engine", "ejs");
app.set("views", "./view");

// Routes
app.use("/", userRoutes);

// Handle 404
app.get("*", (req, res) => {
  res.status(404).render("404");
});

// Google authentication routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/signin' }),
  (req, res) => {
    res.redirect('/');
  });

// Facebook authentication routes
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/signin' }),
  (req, res) => {
    res.redirect('/');
  });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

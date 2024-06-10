const express = require("express");
const expressLayout = require("express-ejs-layouts");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const user = require("./server/routes/userRoutes");

const app = express();

const port = 8080;

app.use(express.json());

//static files
app.use(express.static("public"));


// Flash Messages
app.use(flash());
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);

// Templating Engine
app.use(expressLayout);
app.set("view engine", "ejs");
app.set("views", "./view");

// Routes
app.use("/", user);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

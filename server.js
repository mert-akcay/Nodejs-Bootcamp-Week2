const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const ejs = require("ejs");
const MongoDbSession = require("connect-mongodb-session")(session);
const authenticate = require("./middleware/auth");
const authController = require("./controllers/authController");

const app = express();

//For accessing .env file
require("dotenv").config();

//Connection to the DB
require("./config/database").connect();

//Creating a store which stores session data
const store = new MongoDbSession({
  uri: process.env.DATABASE_URI,
  collection: "sessions",
});

//Template engine
app.set("view engine", "ejs");

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: 600000,
      httpOnly: true,
    },
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

//Routes
app.get("/", authenticate, authController.getMainPage);
app.get("/register", authenticate, authController.getRegisterPage);
app.get("/login", authenticate, authController.getLoginPage);
app.get("/users", authenticate, authController.getUsersPage);
app.get("/logout", authenticate, authController.logOut);
app.post("/register", authController.register);
app.post("/login", authController.login);

const PORT = process.env.PORT || process.env.API_PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

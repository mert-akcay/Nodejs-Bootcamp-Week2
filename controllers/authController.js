const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/user");

exports.getMainPage = (req, res) => {
  //Get main page
  res.render("index", { isAuth: req.isAuth, index: "home" });
};

exports.getRegisterPage = (req, res) => {
  //Get sign-up page
  if (req.isAuth) return res.redirect("/");
  res.render("sign-up");
};

exports.getLoginPage = (req, res) => {
  //Get sign-in page
  if (req.isAuth) return res.redirect("/");
  res.render("sign-in");
};

exports.getUsersPage = async (req, res) => {
  //Get all users from database
  if (!req.isAuth) return res.redirect("/login");
  let users = await User.find();
  res.render("users", { isAuth: req.isAuth, users, index: "users" });
};

exports.register = async (req, res) => {
  try {
    //Get credentials from request body
    const { first_name, last_name, email, password } = req.body;

    //Check if credentials is missing
    if (!(email && password && first_name && last_name)) {
      res.status(400).send("All input is required");

      const oldUser = await User.findOne({ email });
      if (oldUser) {
        return res.status(409).send("User already exists.");
      }
    }

    //Encrypt password
    encryptedPassword = await bcrypt.hash(password, 10);

    //Create a database entry
    const user = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(),
      password: encryptedPassword,
    });
    res.status(201).redirect("/login");
  } catch (err) {
    //If any error occures
    console.log(err);
  }
};

exports.login = async (req, res) => {
  try {
    //Get credentials from request body
    const { email, password } = req.body;

    //Check if the user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send("User not found.");

    //Check if the password is valid
    let passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid)
      return res.status(401).send("Password is not correct.");

    //Create a JWT token
    let token = jwt.sign(
      { id: user._id, browserInfo: req.headers["user-agent"] },
      process.env.JWT_SECRET,
      {
        expiresIn: "10m",
      }
    );

    //Return the information including token
    res.cookie("token", token, { httpOnly: true });

    //Set session and add browser info to session
    req.session.userID = user._id;
    req.session.browserInfo = req.headers["user-agent"];

    //Send response
    res.redirect("/");
  } catch (err) {
    //If any error occures
    console.log(err);
  }
};

exports.logOut = (req, res) => {
  //If user is not authenticated, redirect to main page
  if (!req.isAuth) return res.redirect("/");

  //Destroy tokens
  res.cookie("token", null, { httpOnly: true });
  res.cookie("connect.sid", null, { httpOnly: true });

  //Destroy session
  req.session.destroy((err) => {
    if (err) return res.send("An error occured");
    console.log("Session destroyed");
    res.redirect("/");
  });
};

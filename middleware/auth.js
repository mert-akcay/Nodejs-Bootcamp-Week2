var jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  //Get token and sessionID from cookies
  var token = req.cookies.token;
  //Set default value of isAuth
  req.isAuth = false;

  //Check if token exists
  if (!token) return next();

  //Verify token and write decoded userId to request
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next();

    req.userId = decoded.id;
    req.browserInfo = decoded.browserInfo;
  });

  //Compare IDs in jwt and session. And compare browserInfos in session and request
  if (
    !(
      req.userId == req.session.userID &&
      req.headers["user-agent"] == req.session.browserInfo &&
      req.headers["user-agent"] == req.browserInfo
    )
  )
    return next();

  //If everything is OK,set isAuth to true and continue
  req.isAuth = true;
  next();
}

module.exports = authenticate;

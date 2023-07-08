const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  const token = authHeader.split(" ")[1];
  if (!token || token == "") {
    isAuth = false;
    return next();
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "somerandomprivatekey");
  } catch (err) {
    throw err;
  }
  if (!decodedToken) {
    isAuth = false;
    return next();
  }
  req.isAuth = true;
  req.userId = decodedToken.userId;
  return next();
};

const User = require('./mongoose/db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "iritik@123";


const authMiddleware = async(req,res,next) => {
  const authorization = req.headers.authorization;
  const arr = authorization.split(" ");
  const token = arr[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  if(!decoded) {
    res.status(403).json({
      msg : "Your token is unverify"
    })
  }else {
      req.userId  = decoded.userId;
      next();
  }
}

module.exports = authMiddleware; 

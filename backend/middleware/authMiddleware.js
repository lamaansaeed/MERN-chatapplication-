const jwt = require("jsonwebtoken");
const verifyToken =require("../utils/verifyToken")
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"]?.split(" ")[1];
  
   
  if (!authHeader) {
    return res.status(403).json({ message: "Token is required" });
  }

  try {
    

    const user = await verifyToken(authHeader);
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
module.exports = authMiddleware;
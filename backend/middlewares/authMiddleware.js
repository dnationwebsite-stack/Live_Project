// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

const authMiddleware = (requiredRole = null) => {
  
  return (req, res, next) => {

    try {
      console.log('Hello')
      let token = null;

      // Check cookie
      if (req.cookies?.token) token = req.cookies.token;
      // Check Authorization header
      else if (req.headers.authorization?.startsWith("Bearer "))
        token = req.headers.authorization.split(" ")[1];

      if (!token)
        return res.status(401).json({ message: "Unauthorized: Token missing" });

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(401).json({
          message:
            err.name === "TokenExpiredError"
              ? "Unauthorized: Token expired"
              : "Unauthorized: Invalid token",
        });
      }

      req.user = {
        id: decoded._id,
        email: decoded.email,
        role: decoded.role,
      };

      if (requiredRole && req.user.role !== requiredRole)
        return res.status(403).json({ message: "Forbidden: Access denied" });

      next();
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };
};

module.exports = { authMiddleware };

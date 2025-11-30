// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

const authMiddleware = (requiredRole = null) => {
  return (req, res, next) => {
    try {
      let token = null;

      // Check cookie first
      if (req.cookies?.token) {
        token = req.cookies.token;
      }
      // Check Authorization header
      else if (req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
      }

      if (!token) {
        console.log("❌ No token found");
        return res.status(401).json({ message: "Unauthorized: Token missing" });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ Token decoded successfully:", decoded);
      } catch (err) {
        console.log("❌ Token verification failed:", err.message);
        return res.status(401).json({
          message:
            err.name === "TokenExpiredError"
              ? "Unauthorized: Token expired"
              : "Unauthorized: Invalid token",
        });
      }

      // ✅ CRITICAL FIX: Check all possible ID fields
      const userId = decoded._id || decoded.id || decoded.userId || decoded.sub;
      
      console.log("🔍 Extracted userId:", userId);
      
      if (!userId) {
        console.log("❌ No user ID found in token. Decoded token:", decoded);
        return res.status(401).json({ 
          message: "Unauthorized: Invalid token structure",
          debug: Object.keys(decoded) // Shows what fields are available
        });
      }

      req.user = {
        id: userId,
        _id: userId, // ✅ ADD THIS - some code uses _id instead of id
        email: decoded.email,
        role: decoded.role,
      };

      if (requiredRole && req.user.role !== requiredRole) {
        console.log(`❌ Role mismatch. Required: ${requiredRole}, Got: ${req.user.role}`);
        return res.status(403).json({ message: "Forbidden: Access denied" });
      }

      console.log("✅ Auth successful. User:", req.user.id);
      next();
    } catch (err) {
      console.error("❌ Auth middleware error:", err);
      return res.status(500).json({ 
        message: "Internal server error",
        error: err.message 
      });
    }
  };
};

module.exports = { authMiddleware };
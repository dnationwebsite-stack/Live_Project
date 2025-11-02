// utils/generateToken.js
const jwt = require("jsonwebtoken");

const generateToken = (userId, email, role) => {
  return jwt.sign(
    { _id: userId, email ,role }, 
    process.env.JWT_SECRET
  );
};

module.exports = generateToken;

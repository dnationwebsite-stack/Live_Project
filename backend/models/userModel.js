const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  line1: { type: String, required: true },
  line2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, default: "India" },
  isDefault: { type: Boolean, default: false }, // for selecting default address
});

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    image: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    addresses: [addressSchema], 
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;

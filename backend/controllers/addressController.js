const User = require("../models/userModel");

// ✅ Add new address
const addAddress = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      fullName,
      phoneNumber,
      line1,
      line2,
      city,
      state,
      postalCode,
      country,
    } = req.body;

    // Validate basic fields
    if (!fullName || !phoneNumber || !line1 || !city || !state || !postalCode) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });



    // Add address to user's address list
    user.addresses.push({
      fullName,
      phoneNumber,
      line1,
      line2,
      city,
      state,
      postalCode,
      country: country || "India",
      isDefault: user.addresses.length === 0, // first address becomes default
    });

    await user.save();

    return res.status(201).json({
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get all saved addresses
const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ addresses: user.addresses });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Delete address (optional)
const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== addressId
    );
    await user.save();

    res.status(200).json({
      message: "Address deleted successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { addAddress, getAddresses, deleteAddress };

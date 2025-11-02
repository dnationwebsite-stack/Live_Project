"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  IconButton,
  Snackbar,
  Alert,
  Avatar,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Check";
import { motion } from "framer-motion";
import { useUserStore } from "../../store/UserSlice";

export default function ProfilePage() {
  const { user, shippingAddresses } = useUserStore();

  const [profile, setProfile] = useState({ name: "", phoneNumber: "" });
  const [editingField, setEditingField] = useState(null);
  const [address, setAddress] = useState({});
  const [addressEditing, setAddressEditing] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name || "", phoneNumber: user.phoneNumber || "" });
      if (shippingAddresses.length > 0) setAddress(shippingAddresses[0]);
    }
  }, [user, shippingAddresses]);

  const handleSaveProfile = () => {
    setEditingField(null);
    setOpenSnackbar(true);
  };

  const handleSaveAddress = () => {
    setAddressEditing(false);
    setOpenSnackbar(true);
  };

  return (
    <Box className="min-h-screen pt-48 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 p-8">
      <motion.div
        className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Left Section — Profile Summary */}
        <Card className="flex flex-col items-center justify-center gap-3 w-full md:w-1/3 p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg text-center">
          <Avatar
            src={user?.avatar || "/default-avatar.png"}
            alt={user?.name || "User"}
            sx={{
              width: 120,
              height: 120,
              border: "3px solid white",
              boxShadow: "0 0 20px rgba(0,0,0,0.1)",
            }}
          />
          <Typography variant="h5" sx={{ fontWeight: "bold", mt: 2 }}>
            {profile.name || "Guest User"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {user?.email || "user@example.com"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {profile.phoneNumber ? `📞 ${profile.phoneNumber}` : "No Phone Added"}
          </Typography>
        </Card>

        {/* Right Section — Editable Details */}
        <Box className="flex flex-col gap-6 w-full md:w-2/3">
          {/* Personal Details */}
          <Card className="p-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-md border border-gray-100">
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#4c1d95", mb: 2 }}
            >
              ✨ Personal Details
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box className="flex flex-col gap-3">
              {/* Name */}
              <Box className="flex items-center justify-between gap-3">
                <Typography className="font-semibold w-1/4 text-gray-700">
                  Name:
                </Typography>
                <Box className="flex-1 flex items-center justify-between">
                  {editingField === "name" ? (
                    <>
                      <input
                        value={profile.name}
                        onChange={(e) =>
                          setProfile({ ...profile, name: e.target.value })
                        }
                        className="border-b border-gray-400 focus:outline-none text-base px-1 py-0.5 w-full bg-transparent"
                      />
                      <IconButton onClick={handleSaveProfile}>
                        <SaveIcon color="success" />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <Typography className="text-gray-800">
                        {profile.name || "No Name"}
                      </Typography>
                      <IconButton onClick={() => setEditingField("name")}>
                        <EditIcon />
                      </IconButton>
                    </>
                  )}
                </Box>
              </Box>

              {/* Phone */}
              <Box className="flex items-center justify-between gap-3">
                <Typography className="font-semibold w-1/4 text-gray-700">
                  Phone:
                </Typography>
                <Box className="flex-1 flex items-center justify-between">
                  {editingField === "phone" ? (
                    <>
                      <input
                        value={profile.phoneNumber}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            phoneNumber: e.target.value,
                          })
                        }
                        className="border-b border-gray-400 focus:outline-none text-base px-1 py-0.5 w-full bg-transparent"
                      />
                      <IconButton onClick={handleSaveProfile}>
                        <SaveIcon color="success" />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <Typography className="text-gray-800">
                        {profile.phoneNumber || "No Phone Number"}
                      </Typography>
                      <IconButton onClick={() => setEditingField("phone")}>
                        <EditIcon />
                      </IconButton>
                    </>
                  )}
                </Box>
              </Box>
            </Box>
          </Card>

          {/* Address */}
          <Card className="p-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-md border border-gray-100">
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#4c1d95", mb: 2 }}
            >
              🏠 Shipping Address
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {addressEditing ? (
              <Box className="flex flex-col gap-3">
                {["line1", "line2", "city", "state", "postalCode"].map(
                  (field) => (
                    <input
                      key={field}
                      value={address[field] || ""}
                      onChange={(e) =>
                        setAddress({ ...address, [field]: e.target.value })
                      }
                      placeholder={
                        field === "line1"
                          ? "Address Line 1"
                          : field === "line2"
                          ? "Address Line 2"
                          : field === "city"
                          ? "City"
                          : field === "state"
                          ? "State"
                          : "Postal Code"
                      }
                      className="border-b border-gray-300 focus:outline-none px-1 py-1 text-base bg-transparent"
                    />
                  )
                )}
                <Button
                  variant="contained"
                  sx={{
                    mt: 1,
                    background: "linear-gradient(45deg, #6366f1, #a855f7)",
                    textTransform: "none",
                    fontWeight: "bold",
                  }}
                  onClick={handleSaveAddress}
                >
                  Save Address
                </Button>
              </Box>
            ) : (
              <Box className="flex justify-between items-start">
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: "500" }}>
                    {address.line1 || "No Address Added"}
                  </Typography>
                  <Typography color="text.secondary">
                    {[address.line2, address.city, address.state]
                      .filter(Boolean)
                      .join(", ")}{" "}
                    {address.postalCode ? `- ${address.postalCode}` : ""}
                  </Typography>
                </Box>
                <IconButton onClick={() => setAddressEditing(true)}>
                  <EditIcon />
                </IconButton>
              </Box>
            )}
          </Card>
        </Box>

        {/* Snackbar */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={2500}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert
            onClose={() => setOpenSnackbar(false)}
            severity="success"
            sx={{ width: "100%" }}
          >
            Saved successfully! 🎉
          </Alert>
        </Snackbar>
      </motion.div>
    </Box>
  );
}

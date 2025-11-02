"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography, Card, Button, IconButton, Snackbar, Alert } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Check";
import { useUserStore } from "../../store/UserSlice";

export default function ProfilePage() {
  const { user, shippingAddresses } = useUserStore();

  const [profile, setProfile] = useState({ name: "", phoneNumber: "" });
  const [editingField, setEditingField] = useState(null); // "name" or "phone"
  const [address, setAddress] = useState({});
  const [addressEditing, setAddressEditing] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name || "", phoneNumber: user.phoneNumber || "" });
      if (shippingAddresses.length > 0) setAddress(shippingAddresses[0]);
    }
  }, [user, shippingAddresses]);

  // ✅ Only local changes, no API call
  const handleSaveProfile = () => {
    setEditingField(null);
    setOpenSnackbar(true);
  };

  const handleSaveAddress = () => {
    setAddressEditing(false);
    setOpenSnackbar(true);
  };

  return (
    <Box className="min-h-screen bg-gray-50 p-6 md:p-12">
      <Box className="max-w-4xl mx-auto flex flex-col gap-8">

        {/* Personal Details Card */}
        <Card className="w-full p-6 shadow-md rounded-xl bg-white">
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>Personal Details</Typography>

          {/* Email */}
          <Typography variant="body2" color="textSecondary">Email</Typography>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>{user?.email || "user@example.com"}</Typography>

          {/* Name */}
          <Box className="flex justify-between items-center mb-3">
            {editingField === "name" ? (
              <>
                <input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="border-b border-gray-400 focus:outline-none text-lg px-1 py-0.5 w-full"
                  placeholder="Name"
                />
                <IconButton onClick={handleSaveProfile}><SaveIcon color="success" /></IconButton>
              </>
            ) : (
              <>
                <Typography variant="body1">{profile.name || "No Name"}</Typography>
                <IconButton onClick={() => setEditingField("name")}><EditIcon /></IconButton>
              </>
            )}
          </Box>

          {/* Phone */}
          <Box className="flex justify-between items-center mb-3">
            {editingField === "phone" ? (
              <>
                <input
                  value={profile.phoneNumber}
                  onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                  className="border-b border-gray-400 focus:outline-none text-lg px-1 py-0.5 w-full"
                  placeholder="Phone Number"
                />
                <IconButton onClick={handleSaveProfile}><SaveIcon color="success" /></IconButton>
              </>
            ) : (
              <>
                <Typography variant="body1">{profile.phoneNumber || "No Phone Number"}</Typography>
                <IconButton onClick={() => setEditingField("phone")}><EditIcon /></IconButton>
              </>
            )}
          </Box>
        </Card>

        {/* Address Card */}
        <Card className="w-full p-6 shadow-md rounded-xl bg-white">
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>Address</Typography>

          {addressEditing ? (
            <Box className="flex flex-col gap-2">
              <input
                value={address.line1 || ""}
                onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                placeholder="Address Line 1"
                className="border-b border-gray-400 focus:outline-none px-1 py-0.5 w-full"
              />
              <input
                value={address.line2 || ""}
                onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                placeholder="Address Line 2"
                className="border-b border-gray-400 focus:outline-none px-1 py-0.5 w-full"
              />
              <input
                value={address.city || ""}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                placeholder="City"
                className="border-b border-gray-400 focus:outline-none px-1 py-0.5 w-full"
              />
              <input
                value={address.state || ""}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                placeholder="State"
                className="border-b border-gray-400 focus:outline-none px-1 py-0.5 w-full"
              />
              <input
                value={address.postalCode || ""}
                onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                placeholder="Postal Code"
                className="border-b border-gray-400 focus:outline-none px-1 py-0.5 w-full"
              />
              <Button variant="contained" color="primary" onClick={handleSaveAddress}>Save Address</Button>
            </Box>
          ) : (
            <Box className="flex justify-between items-start">
              <Box>
                <Typography>{address.line1}, {address.line2}</Typography>
                <Typography>{address.city}, {address.state} - {address.postalCode}</Typography>
              </Box>
              <IconButton onClick={() => setAddressEditing(true)}><EditIcon /></IconButton>
            </Box>
          )}
        </Card>

        {/* Snackbar */}
        <Snackbar open={openSnackbar} autoHideDuration={2500} onClose={() => setOpenSnackbar(false)}>
          <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
            Saved successfully! 🎉
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}

"use client";
import React from "react";
import { Box, Card, Typography, Divider, Chip } from "@mui/material";
import useOrderStore from "../../store/OrderSlice";

export default function OrderPage() {
  const { orders } = useOrderStore();

  return (
    <Box className="min-h-screen bg-gray-50 p-6 md:p-12 mt-20">
      <Box className="max-w-5xl mx-auto flex flex-col gap-6">
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 4 }}>My Orders</Typography>

        {orders.length === 0 ? (
          <Typography align="center" color="text.secondary">You have no orders yet.</Typography>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="p-4 shadow-md rounded-xl bg-white">
              <Box className="flex justify-between items-center mb-2">
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>Order ID: {order.id}</Typography>
                <Chip
                  label={order.status}
                  color={order.status === "Delivered" ? "success" :
                         order.status === "Pending" ? "warning" : "error"}
                />
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Date: {order.date}</Typography>

              <Divider sx={{ mb: 2 }} />

              <Box className="flex flex-col gap-1 mb-2">
                {order.products.map((p, index) => (
                  <Box key={index} className="flex justify-between">
                    <Typography>{p.name} x{p.qty}</Typography>
                    <Typography>₹{p.price * p.qty}</Typography>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ fontWeight: "bold", textAlign: "right" }}>
                Total: ₹{order.total}
              </Typography>
            </Card>
          ))
        )}
      </Box>
    </Box>
  );
}

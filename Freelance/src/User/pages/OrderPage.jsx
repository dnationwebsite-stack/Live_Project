"use client";
import React from "react";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Divider } from "@mui/material";

export default function OrderPage() {
  const orders = [
    {
      id: "ORD12345",
      date: "2025-11-02",
      address: "221B Baker Street, London",
      status: "Delivered",
      total: 2999,
      products: [
        { name: "Classic White Shirt", qty: 2, size: "M", price: 899 },
        { name: "Denim Jeans", qty: 1, size: "32", price: 1200 },
      ],
    },
    {
      id: "ORD12346",
      date: "2025-10-28",
      address: "742 Evergreen Terrace, Springfield",
      status: "Pending",
      total: 1899,
      products: [
        { name: "Black Hoodie", qty: 1, size: "L", price: 999 },
        { name: "Joggers", qty: 1, size: "M", price: 900 },
      ],
    },
  ];

  return (
    <Box className="min-h-screen bg-gray-50 p-8 mt-20">
      <Box className="max-w-7xl mx-auto">
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", mb: 4, letterSpacing: 0.5 }}
        >
          My Orders
        </Typography>

        {orders.length === 0 ? (
          <Typography align="center" color="text.secondary">
            You have no orders yet.
          </Typography>
        ) : (
          <Paper
            elevation={0}
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f9f9f9" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>Order ID</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Address</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Product Details</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Qty</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Size</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: "bold", textAlign: "right" }}>
                      Total
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {orders.map((order) =>
                    order.products.map((product, idx) => (
                      <TableRow key={`${order.id}-${idx}`} hover>
                        {idx === 0 ? (
                          <>
                            <TableCell rowSpan={order.products.length}>
                              {order.id}
                            </TableCell>
                            <TableCell rowSpan={order.products.length}>
                              {order.date}
                            </TableCell>
                            <TableCell
                              rowSpan={order.products.length}
                              sx={{ whiteSpace: "pre-wrap" }}
                            >
                              {order.address}
                            </TableCell>
                          </>
                        ) : null}

                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.qty}</TableCell>
                        <TableCell>{product.size}</TableCell>
                        <TableCell>₹{product.price}</TableCell>

                        {idx === 0 ? (
                          <>
                            <TableCell rowSpan={order.products.length}>
                              <Chip
                                label={order.status}
                                size="small"
                                sx={{
                                  backgroundColor:
                                    order.status === "Delivered"
                                      ? "#e8f5e9"
                                      : order.status === "Pending"
                                      ? "#fff8e1"
                                      : "#ffebee",
                                  color:
                                    order.status === "Delivered"
                                      ? "#2e7d32"
                                      : order.status === "Pending"
                                      ? "#f9a825"
                                      : "#c62828",
                                  fontWeight: "bold",
                                }}
                              />
                            </TableCell>
                            <TableCell
                              rowSpan={order.products.length}
                              sx={{ textAlign: "right", fontWeight: "bold" }}
                            >
                              ₹{order.total}
                            </TableCell>
                          </>
                        ) : null}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider />
          </Paper>
        )}
      </Box>
    </Box>
  );
}

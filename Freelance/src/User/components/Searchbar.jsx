"use client";
import React, { useState, useEffect } from "react";
import {
  InputBase,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ClickAwayListener,
  Grow,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import useProductStore from "../../store/ProductSlice";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const { products, fetchProducts } = useProductStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSelect = (product) => {
    setQuery(product.name);
    setOpen(false);
    navigate(`/detailpage/${product._id}`);
  };

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <div style={{ position: "relative", width: "450px" }}>
        <Paper
          component="form"
          onSubmit={(e) => e.preventDefault()}
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            padding: "2px 8px",
            border: "1px solid #ddd",
            boxShadow: open ? "0 4px 20px rgba(0,0,0,0.15)" : "none",
            transition: "all 0.3s ease",
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search for products"
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
          />
          <IconButton type="submit" sx={{ p: "10px" }} aria-label="search">
            <SearchIcon />
          </IconButton>
        </Paper>

        <Grow in={open && query.length > 0}>
          <Paper
            sx={{
              position: "absolute",
              top: "110%",
              left: 0,
              right: 0,
              borderRadius: "12px",
              border: "1px solid #ddd",
              maxHeight: 250,
              overflowY: "auto",
              background: "#fff",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              zIndex: 10,
            }}
          >
            <List>
              {filtered.length > 0 ? (
                filtered.map((item, idx) => (
                  <ListItem key={item._id || idx} disablePadding>
                    <ListItemButton onClick={() => handleSelect(item)}>
                      <ListItemText primary={item.name} />
                    </ListItemButton>
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No results found" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grow>
      </div>
    </ClickAwayListener>
  );
}

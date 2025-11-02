import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material"

import { useUserStore } from "../../store/UserSlice";

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const requestOtp = useUserStore((state) => state.requestOtp);
const loading = useUserStore((state) => state.loading);
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!email) {
      setError("Email is required")
      return
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

   try {
      await requestOtp(email);

      navigate(`/otp?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f9fafb", padding: "1rem" }}>
      <Card sx={{ maxWidth: 400, width: "100%", boxShadow: 3, borderRadius: 3 }}>
        <CardHeader
          title={<Typography variant="h5" align="center" fontWeight="bold">Welcome Back</Typography>}
          subheader={<Typography variant="body2" align="center" color="text.secondary">Enter your email to continue</Typography>}
        />
        <CardContent>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!error}
              helperText={error}
              disabled={loading }
              fullWidth
            />
            <Button
  type="submit"
  variant="contained"
  color="primary"
  disabled={loading}
  fullWidth
  sx={{ paddingY: 1.2, borderRadius: 2 }}
>
  {loading ? <CircularProgress size={24} color="inherit" /> : "Continue"}
</Button>

            
          </form>
        </CardContent>
        <CardActions />
      </Card>
    </div>
  )
}

// components/Toast.jsx
// Place this ONCE in App.jsx — it will work everywhere

import { Snackbar, Alert, Slide } from "@mui/material";
import useToastStore from "../../store/ToastSlice";

function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

export default function Toast() {
  const { open, message, severity, duration, hideToast } = useToastStore();

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={hideToast}
      TransitionComponent={SlideTransition}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        onClose={hideToast}
        severity={severity}
        variant="filled"
        sx={{
          minWidth: "280px",
          fontSize: "0.95rem",
          borderRadius: "10px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
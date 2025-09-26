import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
        textAlign: "center",
        p: 2
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: 100, color: "#f44336" }} />
      <Typography variant="h1" component="h1" sx={{ fontSize: 80, fontWeight: "bold", mt: 2 }}>
        404
      </Typography>
      <Typography variant="h5" sx={{ mt: 2, mb: 4 }}>
        Oops! La página que buscas no existe.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={() => navigate("/")}
      >
        Volver al inicio
      </Button>
    </Box>
  );
}

import { Box, Typography, TextField, Button, Alert } from "@mui/material";
import { useState, useCallback,useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // Importa el hook\

import { useNavigate } from "react-router-dom";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const { login } = useAuth();


  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      // La redirección se maneja dentro del contexto, pero puedes añadir una aquí si quieres.
      // navigate("/dashboard");
    } catch (err) {
      setError(err.message); // Muestra el error de la API
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        minWidth: "100vw",
        display: "flex",
        justifyContent: { xs: "center", md: "left" },
        alignItems: "center",
        position: "relative",
        backgroundColor: "#f5f5f5",
        overflow: "hidden",
      }}
    >
      {/* Formulario */}
      <Box
        component="form" // Importante para manejar el envío
        onSubmit={handleLogin}
        sx={{
          p: 4,
          width: { xs: "90%", sm: "40%", md: "30%" },
          height: { xs: "auto", sm: "80%" },
          zIndex: 1,
          alignItems: "center",
          justifyContent: "center",
          marginLeft: { xs: 0, sm: 4, md: 8, lg: 16 }, // margen izquierdo en desktop
          marginTop: { xs: 0, sm: 4, md: 8, lg: 16 }, // margen superior en desktop
          backgroundColor: { xs: "background.paper", md: "transparent" }, // Fondo blanco en móvil
          borderRadius: { xs: 3, md: 0 }, // Bordes redondeados en móvil
          boxShadow: { xs: 3, md: "none" }, // Sombra en móvil
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          component="img"
          src="/img/herbart-logo.avif"
          sx={{
            width: "80%",
            height: "auto",
            alignItems: "center",
            marginBottom: 4,
          }}
        />
        <Typography
          variant="h3"
          fontWeight="bold"
          gutterBottom
          color="primary.main"
          sx={{ textShadow: "2px 2px 6px rgba(141, 130, 188, 0.4)" }}
        >
          INICIAR SESIÓN
        </Typography>

        <TextField
          label="Correo"
          fullWidth
          margin="normal"
          required
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Contraseña"
          fullWidth
          margin="normal"
          required
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
            {error}
          </Alert>
        )}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? "Iniciando..." : "Iniciar Sesión"}
        </Button>
      </Box>

      {/* Imagen flotante */}
      <Box
        sx={{
          position: "absolute",
          width: "100vw",
          height: "100vh",
        }}
      >
        <svg
          viewBox="0 0 1200 600"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1f3971" />
              <stop offset="50%" stopColor="#3e5aa0" />
              <stop offset="100%" stopColor="#15264d" />
            </linearGradient>
          </defs>
          <path
            d="M 0 0 L 0 113 Q 437 4 588 284 Q 748 642 1200 600 L 1200 600 L 1200 0 Z"
            fill="url(#grad1)"
          />
        </svg>
      </Box>
    </Box>
  );
}

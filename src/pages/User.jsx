import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Divider,
  Button,
  Stack,
  Container,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import {
  AccountCircle as AccountCircleIcon,
  Save as SaveIcon,
  Badge as BadgeIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Security as SecurityIcon,
} from "@mui/icons-material";

import { useAuth } from "../context/AuthContext.jsx";
import { useNotification } from "../components/modals/NotificationModal.jsx";
import { changeUsername, changePassword } from "../services/UserService.js";

export default function User() {
  const { user, token } = useAuth();
  const { showNotification, NotificationComponent } = useNotification();

  // --- Estados ---
  const [username, setUsername] = useState("");
  
  // Estados para contraseñas
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // NUEVO: Estado para confirmar contraseña
  
  // Estados para visibilidad de contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // NUEVO: Visibilidad para confirmar contraseña
  
  const [loading, setLoading] = useState(false);

  // Estado para errores de validación local
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState(""); // NUEVO: Error para confirmar contraseña

  // Inicializar el nombre de usuario
  useEffect(() => {
    if (user?.name) {
      setUsername(user.name);
    }
  }, [user]);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show); // NUEVO: Handler

  // --- Función de Validación de Contraseña ---
  const validarPassword = (pass) => {
    if (pass.length < 6)
      return "La contraseña debe tener al menos 6 caracteres.";
    return "";
  };

  const handleUpdate = async () => {
    // 1. Validar si hay cambios
    const cleanUsername = username.trim();
    const isUsernameChanged = cleanUsername !== user.name && cleanUsername.length > 0;
    const isPasswordChanged = password.length > 0;

    if (!isUsernameChanged && !isPasswordChanged) {
      showNotification("No hay cambios pendientes para guardar.", "info");
      return;
    }

    // 2. Validar contraseña si intenta cambiarla
    if (isPasswordChanged) {
      const errorMsg = validarPassword(password);
      if (errorMsg) {
        setPasswordError(errorMsg);
        showNotification("La contraseña no cumple con los requisitos.", "warning");
        return;
      }
      
      // NUEVO: Validar que las contraseñas coincidan
      if (password !== confirmPassword) {
        setConfirmPasswordError("Las contraseñas no coinciden.");
        showNotification("Las contraseñas no coinciden.", "error");
        return;
      }
    }
    
    // Limpiar errores previos
    setPasswordError(""); 
    setConfirmPasswordError("");

    setLoading(true);
    let successCount = 0;

    try {
      // ---------------------------------------------------------
      // 1. CAMBIO DE NOMBRE DE USUARIO
      // ---------------------------------------------------------
      if (isUsernameChanged) {
        await changeUsername(token, {
          newUsername: username,
          idusuario: user.id,
        });
        successCount++;
      }

      // ---------------------------------------------------------
      // 2. CAMBIO DE CONTRASEÑA
      // ---------------------------------------------------------
      if (isPasswordChanged) {
        await changePassword(token, {
          newPassword: password,
          idusuario: user.id,
        });
        successCount++;
        
        // Limpiamos los campos por seguridad tras el éxito
        setPassword(""); 
        setConfirmPassword(""); 
      }

      if (successCount > 0) {
        showNotification("Datos actualizados correctamente.", "success");
      }
    } catch (error) {
      console.error(error);
      showNotification(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Card elevation={6} sx={{ borderRadius: 4, overflow: "visible" }}>
        <CardHeader
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            pb: 3,
          }}
          avatar={
            <Avatar sx={{ bgcolor: "white", color: "primary.main", width: 50, height: 50 }}>
              <AccountCircleIcon fontSize="large" />
            </Avatar>
          }
          title={
            <Typography variant="h5" fontWeight="bold">
              Configuración de Cuenta
            </Typography>
          }
          subheader={
            <Typography variant="body2" sx={{ opacity: 0.9, color: "inherit" }}>
              Actualiza tus credenciales de acceso
            </Typography>
          }
        />

        <CardContent sx={{ pt: 4, px: 4 }}>
          <Stack spacing={4}>
            {/* Aviso Informativo */}
            <Alert severity="info" icon={<SecurityIcon />}>
              Mantén tus credenciales seguras. Si cambias tu nombre de usuario,
              se recomienda volver a iniciar sesión.
            </Alert>

            {/* Input: Username */}
            <Box>
              <TextField
                fullWidth
                label="Nombre de Usuario"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej. JuanPerez"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                helperText="Nombre visible en el sistema."
              />
            </Box>

            <Divider>
              <Typography variant="caption" color="textSecondary">
                SEGURIDAD
              </Typography>
            </Divider>

            {/* Input: Password */}
            <Box>
              <TextField
                fullWidth
                label="Nueva Contraseña"
                variant="outlined"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError("");
                  // Limpiar error de confirmación si el usuario empieza a borrar la principal
                  if (confirmPasswordError) setConfirmPasswordError(""); 
                }}
                error={!!passwordError}
                helperText={
                  passwordError ||
                  (password
                    ? "Presiona 'Actualizar Datos' para guardar la nueva contraseña"
                    : "Dejar vacío si no deseas cambiarla")
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowPassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* NUEVO Input: Confirm Password */}
            {/* Solo se muestra si el usuario ha empezado a escribir una contraseña nueva */}
            {password.length > 0 && (
              <Box>
                <TextField
                  fullWidth
                  label="Confirmar Nueva Contraseña"
                  variant="outlined"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (confirmPasswordError) setConfirmPasswordError(""); 
                  }}
                  error={!!confirmPasswordError}
                  helperText={confirmPasswordError || "Vuelve a escribir la nueva contraseña"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleClickShowConfirmPassword} edge="end">
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            )}

            {/* Botón Guardar */}
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<SaveIcon />}
              onClick={handleUpdate}
              disabled={loading}
              sx={{
                py: 1.5,
                fontWeight: "bold",
                textTransform: "none",
                fontSize: "1rem",
                borderRadius: 2,
                boxShadow: 3,
              }}
            >
              {loading ? "Guardando cambios..." : "Actualizar Datos"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {NotificationComponent}
    </Container>
  );
}
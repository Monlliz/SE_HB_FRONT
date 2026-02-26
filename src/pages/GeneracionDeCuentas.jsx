import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  TextField,
  Autocomplete,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Divider,
  Button,
  Stack,
  Container,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Email as EmailIcon,
  AccountCircle as AccountCircleIcon,
  Badge as BadgeIcon,
} from "@mui/icons-material"; // Asegúrate de tener @mui/icons-material instalado
import { useAuth } from "../context/AuthContext.jsx";
import { fetchDocenteGet } from "../services/docenteService.js";
import { fetchCrearUsuario } from "../services/UserService.js";
import { useNotification } from "../components/modals/NotificationModal.jsx";
export default function GeneracionDeCuentas() {
  const { token, user } = useAuth();

  // --- Lógica (Hooks) ---
  const [docentes, setDocentes] = useState([]);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState(null);
  const { showNotification, NotificationComponent } = useNotification();
  const fetchDocente = useCallback(async () => {
    if (user.nombre_rol !== "Director") return;

    try {
      if (!token) throw new Error("Autorización rechazada.");
      const data = await fetchDocenteGet(token);
      const listaDocentes = data.docentes || [];

      const docentesOrdenados = listaDocentes.sort((a, b) => {
        return a.apellidop.localeCompare(b.apellidop);
      });

      const docentesActivos = docentesOrdenados.filter(
        (docente) => docente.activo === true,
      );
      setDocentes(docentesActivos);
    } catch (error) {
      console.error(error);
    }
  }, [token, user.nombre_rol]);

  useEffect(() => {
    fetchDocente();
  }, [fetchDocente]);

  //  Validacion
  if (user.nombre_rol !== "Director") {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <Typography variant="h5" color="error">
          No autorizado
        </Typography>
      </Box>
    );
  }

  const payload = {
    iddocente: docenteSeleccionado ? docenteSeleccionado.iddocente : null,
    username: docenteSeleccionado ? docenteSeleccionado.nombres : "",
    correo: docenteSeleccionado ? docenteSeleccionado.correo : "",
  };

  const handleOnSave = async () => {
    try {
      if (!token) throw new Error("Autorización rechazada.");
      const response = await fetchCrearUsuario(token, payload);
      showNotification("Cuenta creada exitosamente", "success");
    } catch (error) {
      showNotification("Error al crear la cuenta: " + error.message, "error");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card elevation={4} sx={{ borderRadius: 3 }}>
        {/* Cabecera de la Tarjeta */}
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: "primary.main" }}>
              <PersonAddIcon />
            </Avatar>
          }
          title={
            <Typography variant="h6" fontWeight="bold">
              Generación de Cuentas
            </Typography>
          }
          subheader={
            <Box display="flex" flexDirection="column">
              <Typography variant="body2" color="textSecondary">
                Selecciona un trabajador para gestionar sus accesos
              </Typography>

              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                (Nota: El cambio de rol lo hace el área de TI)
              </Typography>
            </Box>
          }
        />

        <Divider />

        <CardContent>
          {/* Selector de Docente */}
          <Box sx={{ mb: 3 }}>
            <Autocomplete
              options={docentes}
              value={docenteSeleccionado}
              onChange={(event, newValue) => {
                setDocenteSeleccionado(newValue);
              }}
              getOptionLabel={(option) =>
                `${option.nombres} ${option.apellidop} ${option.apellidom}`
              }
              isOptionEqualToValue={(option, value) =>
                option.iddocente === value.iddocente
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buscar Trabajador"
                  variant="outlined"
                  placeholder="Escribe el nombre o apellido..."
                />
              )}
            />
          </Box>

          {/* Área de Visualización de Datos (Preview) */}
          {docenteSeleccionado ? (
            <Box
              sx={{
                bgcolor: "action.hover",
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="subtitle2"
                color="textSecondary"
                gutterBottom
              >
                DATOS DE LA CUENTA
              </Typography>

              <Stack spacing={2}>
                <Box display="flex" alignItems="center" gap={2}>
                  <BadgeIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Nombre Completo
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {docenteSeleccionado.nombres}{" "}
                      {docenteSeleccionado.apellidop}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={2}>
                  <EmailIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Correo Institucional
                    </Typography>
                    <Typography variant="body1">
                      {docenteSeleccionado.correo}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={2}>
                  <AccountCircleIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Usuario
                    </Typography>
                    <Typography
                      variant="body1"
                      color="primary"
                      fontWeight="bold"
                    >
                      {docenteSeleccionado.nombres}
                    </Typography>
                  </Box>
                </Box>
              </Stack>

              {/* Botón de Acción Final */}
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 3 }}
                onClick={() => handleOnSave()}
              >
                Confirmar y Crear Cuenta
              </Button>
              {NotificationComponent}
            </Box>
          ) : (
            // Estado vacío (cuando no hay selección)
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height={150}
              color="text.disabled"
              flexDirection="column"
            >
              <Typography variant="body2">Esperando selección...</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}

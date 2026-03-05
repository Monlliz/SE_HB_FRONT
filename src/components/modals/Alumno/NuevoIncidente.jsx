import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { fetchIncidentePost } from "../../../services/incidenteService";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Box,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography
} from "@mui/material";
import { AlertCircle } from "lucide-react"; // Importamos un ícono acorde al contexto

// Nota: Puedes mover esta función a un archivo utils.js e importarla
const toTitleCase = (str) => {
  return str
    .toLowerCase()
    .trim()
    .split(/\s+/) // Esto elimina cualquier cantidad de espacios extra
    .map((word) => {
      // Capitaliza la primera letra de CADA palabra
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" "); // Cámbialo a "" si lo quieres sin espacios
};

// Datos por default
const datosInicialesFormulario = {
  solicitante: "",
  motivo_incidencia: "",
  descripcion: "",
  fecha: new Date().toISOString().split("T")[0],
  numero_strike: "",
};

function NuevoIncidente({ open, onClose, onAccept, matricula, numero_strike }) {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [formulario, setFormulario] = useState(datosInicialesFormulario);
  const [errors, setErrors] = useState({});

  if (user.nombres != null) {
    const nombre_Completo = `${user.nombres} ${user.apellidop} ${user.apellidom}`;
    datosInicialesFormulario.solicitante = toTitleCase(nombre_Completo);
  } else {
    datosInicialesFormulario.solicitante = user.username;
  }
  datosInicialesFormulario.numero_strike = numero_strike + 1;

  // Limpiar formulario
  useEffect(() => {
    if (!open) {
      setFormulario(datosInicialesFormulario);
      setApiError(null);
      setErrors({});
    }
  }, [open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormulario((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: null,
      }));
    }
  };

  const opcionesSelect = {
    motivo_incidencia: [
      { value: "Conducta inapropiada dentro del aula", label: "Conducta inapropiada dentro del aula" },
      { value: "Interrupciones inadecuadas durante la clase", label: "Interrupciones inadecuadas durante la clase" },
      { value: "Agresion fisica hacia otra(s) persona(s)", label: "Agresion fisica hacia otra(s) persona(s)" },
      { value: "Salida del aula sin permiso", label: "Salida del aula sin permiso" },
      { value: "Llegada a clases con retardo", label: "Llegada a clases con retardo" },
      { value: "Agresion Verbal hacia otra(s) persona(s)", label: "Agresion Verbal hacia otra(s) persona(s)" },
      { value: "Ausentismo durante la clase", label: "Ausentismo durante la clase" },
      { value: "Uso de lenguaje inapropiado", label: "Uso de lenguaje inapropiado" },
      { value: "Uso indebido de dispositivos electronicos", label: "Uso indebido de dispositivos electronicos" },
      { value: "Incumplimiento del uniforme escolar", label: "Incumplimiento del uniforme escolar" },
      { value: "No cuenta con los recursos didacticos solicitados", label: "No cuenta con los recursos didacticos solicitados" },
      { value: "Vandalizacion de las instalaciones", label: "Vandalizacion de las instalaciones" },
      { value: "Plagio de actividades academicas", label: "Plagio de actividades academicas" },
      { value: "Acciones indebidas durante el examen", label: "Acciones indebidas durante el examen" },
      { value: "Otro", label: "Otro" },
    ],
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      "solicitante",
      "motivo_incidencia",
      "descripcion",
      "fecha",
    ];
    requiredFields.forEach((field) => {
      if (!formulario[field] || formulario[field].trim() === "") {
        newErrors[field] = "Este campo es requerido";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setApiError(null);
    
    const ahora = new Date();
    const fechaActual = ahora.toISOString().split("T")[0];
    const horaActual = ahora.toLocaleTimeString("es-MX", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    try {
      if (!token) {
        throw new Error("Autorización rechazada. No se encontró el token.");
      }
      const datosParaEnviar = {
        solicitante: formulario.solicitante,
        motivo_incidencia: formulario.motivo_incidencia,
        descripcion: formulario.descripcion,
        fecha: formulario.fecha,
        numero_strike: null,
        creado_por_user: user.username,
        creado_fecha: fechaActual,
        creado_hora: horaActual,
      };

      await fetchIncidentePost(token, matricula, datosParaEnviar);

      onAccept();
    } catch (err) {
      alert(`Error: ${err.message}`);
      setApiError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    return (
      <Box sx={{ p: 2 }}>
        {apiError && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: "#ffebee", color: "#c62828", border: "1px solid #ef9a9a" }}>
            <Typography variant="body2">Error: {apiError}</Typography>
          </Paper>
        )}

        <Paper
          elevation={0}
          sx={{
            p: 3,
            backgroundColor: "white",
            borderRadius: "1rem",
            border: "1px solid #eee",
          }}
        >
          <Stack spacing={3}>
            <TextField
              required
              name="solicitante"
              label="Solicitante"
              size="small"
              value={formulario.solicitante || ""}
              onChange={handleChange}
              error={!!errors.solicitante}
              helperText={errors.solicitante || ""}
            />
            <FormControl fullWidth size="small" error={!!errors.motivo_incidencia}>
              <InputLabel>Motivo del Incidente</InputLabel>
              <Select
                name="motivo_incidencia"
                value={formulario.motivo_incidencia || ""}
                label="Motivo del Incidente"
                onChange={handleChange}
              >
                {opcionesSelect.motivo_incidencia.map((opcion) => (
                  <MenuItem key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.motivo_incidencia && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.motivo_incidencia}
                </Typography>
              )}
            </FormControl>
            <TextField
              name="descripcion"
              label="Descripción"
              value={formulario.descripcion || ""}
              onChange={handleChange}
              error={!!errors.descripcion}
              helperText={errors.descripcion || "Máximo 100 caracteres"}
              multiline
              rows={4}
              placeholder="Escribe tu texto aquí..."
              variant="outlined"
              fullWidth
              inputProps={{ maxLength: 100 }}
            />
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                name="fecha"
                label="Fecha del Incidente"
                type="date"
                size="small"
                fullWidth
                value={formulario.fecha || ""}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                error={!!errors.fecha}
                helperText={errors.fecha || ""}
              />
             
            </Box>
          </Stack>
        </Paper>
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          backgroundColor: "primary.main",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <AlertCircle size={24} />
        NUEVO INCIDENTE
      </DialogTitle>
      
      <DialogContent
        sx={{
          backgroundColor: "#f5f7fa",
          p: 0, // Quitamos el padding por defecto para que el fondo gris cubra todo
        }}
      >
        {renderContent()}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: "1px solid #eee", backgroundColor: "#fff" }}>
        <Button onClick={onClose} disabled={isSubmitting} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleUpdate}
          variant="contained"
          disabled={loading || isSubmitting}
          type="button"
          sx={{ borderRadius: 2 }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Aceptar"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NuevoIncidente;
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
} from "@mui/material";

//necesito una archvivo para esto
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

//Datos por default
const datosInicialesFormulario = {
  solicitante: "",
  motivo_incidencia: "",
  descripcion: "",
  fecha: new Date().toISOString().split("T")[0],
  numero_strike: "",
};

function NuevoIncidente({ open, onClose, onAccept, matricula, numero_strike }) {
  console.log("numero" + numero_strike);
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null); // Estado para errores de API
  const [formulario, setFormulario] = useState(datosInicialesFormulario);
  const [errors, setErrors] = useState({}); // Estado para los errores de validación

  if (user.nombres != null) {
    const nombre_Completo = `${user.nombres} ${user.apellidop} ${user.apellidom}`;
    datosInicialesFormulario.solicitante = toTitleCase(nombre_Completo);
  } else {
    datosInicialesFormulario.solicitante = user.username;
  }
  datosInicialesFormulario.numero_strike = numero_strike + 1;
  //Limpiar formulario
  useEffect(() => {
    // Si la prop 'open' es false (es decir, el modal se está cerrando)
    if (!open) {
      // Resetea el estado del formulario y de los errores a su valor inicial
      setFormulario(datosInicialesFormulario);
      setApiError(null);
      setErrors({});
    }
  }, [open]); // Este efecto se ejecutará cada vez que el valor de 'open' cambie

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormulario((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    // Limpiar el error del campo cuando el usuario empieza a escribir en él
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: null,
      }));
    }
  };

  const opcionesSelect = {
    motivo_incidencia: [
      {
        value: "Conducta inapropiada dentro del aula",
        label: "Conducta inapropiada dentro del aula",
      },
      {
        value: "Interrupciones inadecuadas durante la clase",
        label: "Interrupciones inadecuadas durante la clase",
      },
      {
        value: "Agresion fisica hacia otra(s) persona(s)",
        label: "Agresion fisica hacia otra(s) persona(s)",
      },
      {
        value: "Salida del aula sin permiso",
        label: "Salida del aula sin permiso",
      },
      {
        value: "Llegada a clases con retardo",
        label: "Llegada a clases con retardo",
      },
      {
        value: "Agresion Verbal hacia otra(s) persona(s)",
        label: "Agresion Verbal hacia otra(s) persona(s)",
      },
      {
        value: "Ausentismo durante la clase",
        label: "Ausentismo durante la clase",
      },
      {
        value: "Uso de lenguaje inapropiado",
        label: "Uso de lenguaje inapropiado",
      },
      {
        value: "Uso indebido de dispositivos electronicos",
        label: "Uso indebido de dispositivos electronicos",
      },
      {
        value: "Incumplimiento del uniforme escolar",
        label: "Incumplimiento del uniforme escolar",
      },
      {
        value: "No cuenta con los recursos didacticos solicitados",
        label: "No cuenta con los recursos didacticos solicitados",
      },
      {
        value: "Vandalizacion de las instalaciones",
        label: "Vandalizacion de las instalaciones",
      },
      {
        value: "Plagio de actividades academicas",
        label: "Plagio de actividades academicas",
      },
      {
        value: "Acciones indebidas durante el examen",
        label: "Acciones indebidas durante el examen",
      },
      {
        value: "Otro",
        label: "Otro",
      },
    ],
  };

  //  Función de validación reutilizable
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
        // Asignamos un mensaje de error para cada campo vacío
        newErrors[field] = "Este campo es requerido";
      }
    });

    setErrors(newErrors);
    // La función devuelve `true` si no hay errores, y `false` si los hay.
    return Object.keys(newErrors).length === 0;
  }; //Fin de funcion de validación

  const handleUpdate = async () => {
    if (!validateForm()) {
      return; // Detiene el envío si el formulario no es válido
    }

    setIsSubmitting(true);
    setApiError(null); // Limpiar errores de API previos
    //Obtener tiempos
    // Obtén la fecha y hora actual justo antes de enviar los datos
    const ahora = new Date();

    // Formatea la fecha a "YYYY-MM-DD"
    const fechaActual = ahora.toISOString().split("T")[0];

    // Formatea la hora a "HH:MM:SS" para la zona horaria local
    const horaActual = ahora.toLocaleTimeString("es-MX", {
      hour12: false, // Formato de 24 horas
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
        fecha: formulario.fecha, //"2025-10-09"
        numero_strike: formulario.numero_strike,
        creado_por_user: user.username,
        creado_fecha: fechaActual,
        creado_hora: horaActual,
      };

      await fetchIncidentePost(token, matricula, datosParaEnviar);

      alert("Incidente ingresado con éxito");
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
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <CircularProgress />
        </Box>
      );
    }
    if (apiError) {
      return <Box sx={{ color: "red", my: 2 }}>Error: {apiError}</Box>;
    }
    return (
      <Stack spacing={3} sx={{ pt: 1 }}>
        <TextField
          required
          name="solicitante"
          label="Solicitante"
          value={formulario.solicitante || ""}
          onChange={handleChange}
          error={!!errors.solicitante} // `true` si hay un error para este campo
          helperText={errors.solicitante || ""} // Muestra el mensaje de error
        />
        <FormControl fullWidth>
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
        </FormControl>
        <TextField
          name="descripcion"
          label="descripcion"
          value={formulario.descripcion || ""}
          onChange={handleChange}
          error={!!errors.descripcion} // `true` si hay un error para este campo
          helperText={errors.descripcion || "Máximo 100 caracteres"} // Muestra el mensaje de error
          multiline
          rows={4} // Altura inicial de 4 líneas
          placeholder="Escribe tu texto aquí..."
          variant="outlined"
          fullWidth
          // Propiedades para el input interno
          inputProps={{
            maxLength: 100, // Límite de 100 caracteres
          }}
        />
        <TextField
          name="fecha"
          label="Fecha del Incidente"
          type="date"
          fullWidth
          value={formulario.fecha || ""} // El valor debe ser el formato "YYYY-MM-DD"
          onChange={handleChange} // Tu función handleChange existente funciona perfectamente
          // Esto es IMPORTANTE para que el label no se superponga con el formato de la fecha
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          disabled
          name="numero_strike"
          label="numero_strike"
          type="number"
          value={formulario.numero_strike || ""}
          onChange={handleChange}
          error={!!errors.numero_strike}
          helperText={errors.numero_strike || ""}
        />
      </Stack>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nuevo Incidente</DialogTitle>
      <DialogContent>{renderContent()}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          onClick={handleUpdate}
          variant="contained"
          disabled={loading || isSubmitting}
          type="button"
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

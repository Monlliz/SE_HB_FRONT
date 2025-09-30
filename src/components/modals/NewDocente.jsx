import React, { useState, useEffect } from "react";
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
} from "@mui/material";

function NewDocente({ open, onClose, onAccept }) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null); // Estado para errores de API
  const [formulario, setFormulario] = useState({});
  const [errors, setErrors] = useState({}); // Estado para los errores de validación

  //Limpiar formulario
  useEffect(() => {
    // Si la prop 'open' es false (es decir, el modal se está cerrando)
    if (!open) {
      // Resetea el estado del formulario y de los errores a su valor inicial
      setFormulario({});
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

  //  Función de validación reutilizable
  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      "nombres",
      "apellidop",
      "apellidom",
      "correo",
      "birthday",
    ];
    requiredFields.forEach((field) => {
      if (!formulario[field] || formulario[field].trim() === "") {
        // Asignamos un mensaje de error para cada campo vacío
        newErrors[field] = "Este campo es requerido";
      }
    });
    if (formulario.correo && !formulario.correo.endsWith('@colegioherbart.edu.mx')) {
     
      newErrors.correo = "El correo debe pertenecer al dominio @colegioherbart.edu.mx";
    }
    setErrors(newErrors);
    // La función devuelve `true` si no hay errores, y `false` si los hay.
    return Object.keys(newErrors).length === 0;
  };//Fin de funcion de validación

  const handleUpdate = async () => {
    if (!validateForm()) {
      return; // Detiene el envío si el formulario no es válido
    }

    setIsSubmitting(true);
    setApiError(null); // Limpiar errores de API previos

    try {
      const datosParaEnviar = {
        nombres: formulario.nombres,
        apellidop: formulario.apellidop,
        apellidom: formulario.apellidom,
        correo: formulario.correo,
        birthday: formulario.birthday,
      };
      const response = await fetch(`${apiUrl}/docente`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosParaEnviar),
      });

      if (!response.ok) {
        throw new Error("Error al ingresar un nuevo docente");
      }

      alert("Docente ingresado con éxito");
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
          name="nombres"
          label="Nombre"
          value={formulario.nombres || ""}
          onChange={handleChange}
          error={!!errors.nombres} // `true` si hay un error para este campo
          helperText={errors.nombres || ""} // Muestra el mensaje de error
        />
        <TextField
          required
          name="apellidop"
          label="Apellido Paterno"
          value={formulario.apellidop || ""}
          onChange={handleChange}
          error={!!errors.apellidop}
          helperText={errors.apellidop || ""}
        />
        <TextField
          required
          name="apellidom"
          label="Apellido Materno"
          value={formulario.apellidom || ""}
          onChange={handleChange}
          error={!!errors.apellidom}
          helperText={errors.apellidom || ""}
        />
        <TextField
          required
          name="correo"
          label="Correo"
          value={formulario.correo || ""}
          onChange={handleChange}
          error={!!errors.correo}
          helperText={errors.correo || ""}
        />
        <TextField
          required
          name="birthday"
          label="Fecha Nacimiento"
          value={formulario.birthday || ""}
          onChange={handleChange}
          error={!!errors.birthday}
          helperText={errors.birthday || ""}
        />
      </Stack>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Ingresar Nuevo Docente</DialogTitle>
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

export default NewDocente;

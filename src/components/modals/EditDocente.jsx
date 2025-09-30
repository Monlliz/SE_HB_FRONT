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

function EditDocente({ open, onClose, onAccept, docenteId }) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para el envío
  const [error, setError] = useState(null);

  // Es mejor inicializar el estado del formulario como un objeto vacío
  const [formulario, setFormulario] = useState({});

  useEffect(() => {
    if (open && docenteId) {
      const fetchDocente = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`${apiUrl}/docente/${docenteId}`);
          if (!response.ok)
            throw new Error("Error al cargar los datos del docente");
          const data = await response.json();
          // actualizamos el estado del formulario cuando llegan los datos
          setFormulario(data);
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };
      fetchDocente();
    }
  }, [open, docenteId, apiUrl]);

  // Para actualizar el useState del formulario
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormulario((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Función para enviar la actualización a la API
  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
        const datosParaEnviar = {
      nombres: formulario.nombres,
      apellidop: formulario.apellidop,
      apellidom: formulario.apellidom,
      correo: formulario.correo,
      birthday: formulario.birthday,
    };
      const response = await fetch(`${apiUrl}/docente/${docenteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosParaEnviar),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el docente");
      }

      alert("Docente actualizado con éxito");
      onAccept(); // Llama a la función del padre para cerrar y/o refrescar
    } catch (err) {
      alert(`Error: ${err.message}`);
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
    if (error) {
      return <Box sx={{ color: "red", my: 2 }}>Error: {error}</Box>;
    }
    return (
      <Stack spacing={2}>
        {/*`value` y `name` al estado 'formulario' */}
        <TextField
          name="nombres"
          label="Nombre"
          value={formulario.nombres || ""}
          onChange={handleChange}
        />
        <TextField
          name="apellidop"
          label="Apellido Paterno"
          value={formulario.apellidop || ""}
          onChange={handleChange}
        />
        <TextField
          name="apellidom"
          label="Apellido Materno"
          value={formulario.apellidom || ""}
          onChange={handleChange}
        />
        <TextField
          name="correo"
          label="Correo"
          value={formulario.correo || ""}
          onChange={handleChange}
        />
        <TextField
          name="birthday"
          label="Fecha N."
          value={formulario.birthday || ""}
          onChange={handleChange}
        />
      </Stack>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar Docente</DialogTitle>
      <DialogContent>
        <Box sx={{ marginTop: 2 }}>{renderContent()}</Box>
      </DialogContent>
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

export default EditDocente;

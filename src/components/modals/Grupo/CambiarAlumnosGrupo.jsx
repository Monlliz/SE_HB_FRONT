import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";

import { fetchGrupoCambio } from "../../services/grupoService";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Box,
  CircularProgress,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from "@mui/material";

function CambiarAlumnosGrupo({ open, onClose, onAccept, grupoId }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formulario, setFormulario] = useState({
  grupo: '', 

});
const handleChange = (event) => {
  const { name, value } = event.target;
  setFormulario(prevState => ({
    ...prevState,
    [name]: value
  }));
};

  const opcionesSelect = {
    grupo: [
      { value: "1A", label: "1A" },
      { value: "1B", label: "1B" },
      { value: "2A", label: "2A" },
      { value: "2B", label: "2B" },
      { value: "3A", label: "3A" },
      { value: "3B", label: "3B" },
      { value: "4A", label: "4A" },
      { value: "4B", label: "4B" },
      { value: "5A", label: "5A" },
      { value: "5B", label: "5B" },
      { value: "6A", label: "6A" },
      { value: "6B", label: "6B" },
    ],
  };
  const handlePut = async () => {
    try {
      if (!token) {
        throw new Error("Autorización rechazada. No se encontró el token.");
      }

      //Aqui va el fetch
      await fetchGrupoCambio(token,grupoId,formulario.grupo);
      alert(`Alumnos Cambiados de grupo`);
      onAccept();
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
      <>
        <Box sx={{ p: 2, minWidth: 350 }}>
          {" "}
          {/* Contenedor con padding */}
          <Stack spacing={2.5}>
            {" "}
            {/* Apila los elementos con 20px de espacio */}
            <Typography variant="body1">
              ¿A qué grupo deseas mover a todos los alumnos del{" "}
              <strong>Grupo {grupoId}</strong>?
            </Typography>
            <FormControl fullWidth>
              <InputLabel id="select-nuevo-grupo-label">Nuevo Grupo</InputLabel>
              <Select
                labelId="select-nuevo-grupo-label"
                name="grupo"
                onChange={handleChange}
                value={formulario.grupo} // Debería estar ligado a tu estado
                label="Nuevo Grupo" // Se conecta con el InputLabel
                // onChange={handleChange}
              >
                {opcionesSelect.grupo.map((opcion) => (
                  <MenuItem key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Box>
      </>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Cambio de grupo</DialogTitle>
      <DialogContent>{renderContent()}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={loading || isSubmitting}
          type="button"
          onClick={handlePut}
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

export default CambiarAlumnosGrupo;

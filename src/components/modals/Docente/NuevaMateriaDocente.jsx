import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { fetchMateriasGet } from "../../services/materiasService";
import { fetchDocenteMateriasPost } from "../../services/docenteService";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
} from "@mui/material";

function NuevaMateriaDocente({ open, onClose, onAccept, docenteId }) {
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      const fetchMaterias = async () => {
        if (!token) {
          throw new Error("Autorización rechazada. No se encontró el token.");
        }
        setLoading(true);
        setError(null);
        try {
          const { materias } = await fetchMateriasGet(token);
          setMaterias(materias);
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };
      fetchMaterias();
    }
  }, [open]);

  const handleAcceptClick = async () => {
    if (!materiaSeleccionada) {
      alert("Por favor, selecciona una materia.");
      return;
    }

    setIsSubmitting(true); // Empezamos el envío

    try {
      // Preparamos los datos para enviar
      await fetchDocenteMateriasPost(token, docenteId, materiaSeleccionada);
      // Si todo sale bien, ejecutamos la función `onAccept` del padre
      onAccept(materiaSeleccionada);
      alert("Materia asignada correctamente");
    } catch (error) {
      console.error("Error en el envío:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false); // Terminamos el envío (con éxito o error)
    }
  };

  const renderContent = () => {
    // Renderizado condicional basado en el estado de la llamada
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
      <FormControl fullWidth>
        <InputLabel id="select-materia-label">Materia</InputLabel>
        <Select
          labelId="select-materia-label"
          value={materiaSeleccionada}
          label="Materia"
          onChange={(e) => setMateriaSeleccionada(e.target.value)}
        >
          {materias.map((materia) => (
            <MenuItem key={materia.clave} value={materia.clave}>
              {materia.asignatura}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Seleccionar materia a agregar</DialogTitle>
      <DialogContent>
        <Box sx={{ marginTop: 2 }}>{renderContent()}</Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleAcceptClick}
          variant="contained"
          disabled={loading || error}
        >
          Aceptar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NuevaMateriaDocente;

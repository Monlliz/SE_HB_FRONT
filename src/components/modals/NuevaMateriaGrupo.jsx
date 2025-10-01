import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  CircularProgress,
  Autocomplete,
  TextField,
} from "@mui/material";

function NuevaMateriaGrupo({ open, onClose, onAccept, grupoId }) {
  // ✅ 2. Estado inicializado a null para funcionar bien con Autocomplete
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {

      setMateriaSeleccionada(null); 
      const fetchMaterias = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`${apiUrl}/materias`);
          if (!response.ok) throw new Error("Error al cargar materias");
          const data = await response.json();
          setMaterias(data);
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };
      fetchMaterias();
    }
  }, [open, apiUrl]); // apiUrl añadido a dependencias

  const handleAcceptClick = async () => {
 
    if (!materiaSeleccionada) {
      alert("Por favor, selecciona una materia.");
      return;
    }
    setIsSubmitting(true);
   
   try {
      const response = await fetch(
      
        `${apiUrl}/materias/grupo/${grupoId}/${materiaSeleccionada.clave}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Error al guardar la asignación");
      }
      
      onAccept(); 
      alert("Materia asignada correctamente");

    } catch (error) {
      console.error("Error en el envío:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
  
    if (loading) {
      return <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}><CircularProgress /></Box>;
    }
    if (error) {
      return <Box sx={{ color: "red", my: 2 }}>Error: {error}</Box>;
    }
    return (
      <Autocomplete
        options={materias}
        getOptionLabel={(option) => option.asignatura || ""}
        loading={loading}
        renderInput={(params) => <TextField {...params} label="Buscar Materia" />}
        value={materiaSeleccionada}
        onChange={(event, newValue) => {
          setMateriaSeleccionada(newValue);
        }}
        isOptionEqualToValue={(option, value) => option.clave === value.clave}
        noOptionsText="No se encontraron materias"
      />
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Seleccionar materia a agregar</DialogTitle>
      <DialogContent>
        <Box sx={{ marginTop: 2 }}>{renderContent()}</Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
        <Button onClick={handleAcceptClick} variant="contained" disabled={loading || error || isSubmitting}>
          {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Aceptar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NuevaMateriaGrupo;
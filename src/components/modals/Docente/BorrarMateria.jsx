import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { fetchBorrarMateriaDocente } from "../../../services/materiasService";
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
} from "@mui/material";

//ES BORRADO LOGICO, EN LA BD SE PONE UNA FECHA FIN Y EN LA BUSQUEDA DE MATERIA SE IGNORAN LAS QUE TIENEN FECHA FIN
function BorrarMateria({ open, onClose, onAccept, nombre, docenteId, clave,grupo,idMateriaDocente }) {
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    try {
      if (!token) {
        throw new Error("Autorización rechazada. No se encontró el token.");
      }
     
      await fetchBorrarMateriaDocente(token,docenteId, idMateriaDocente);
      alert("Materia eliminada con éxito");
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
    if (error) {
      return <Box sx={{ color: "red", my: 2 }}>Error: {error}</Box>;
    }
    return (
      <Typography> Esta seguro de eliminar la materia {nombre} {grupo} ?</Typography>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Desactivar Docente</DialogTitle>
      <DialogContent>{renderContent()}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={loading || isSubmitting}
          type="button"
          onClick={handleDelete}
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

export default BorrarMateria;

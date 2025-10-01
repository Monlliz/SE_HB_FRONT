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
  Typography,
} from "@mui/material";

//ES BORRADO FISICO CUIDADO
function BorrarMateriaGrupo({
  open,
  onClose,
  onAccept,
  nombre,
  grupoId,
  clave,
}) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
   

    try {
      const response = await fetch(`${apiUrl}/materias/grupo/${grupoId}/${clave}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al eliminar la materia");
      }

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
      <Typography>
        {" "}
        Esta seguro de eliminar la materia {nombre} ?
      </Typography>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>ELIMINAR MATERIA</DialogTitle>
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

export default BorrarMateriaGrupo;

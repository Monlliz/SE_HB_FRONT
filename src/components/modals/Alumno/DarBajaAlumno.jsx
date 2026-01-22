import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";

import {
  fetchAlumnoDeleteLogico,
  fetcthAlumnoReactivar,
} from "../../../services/alumnosService.js";
import { useNotification } from "../../modals/NotificationModal.jsx";
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
function DesactivarDocente({
  open,
  onClose,
  onConfirm,
  onAccept,
  nombres,
  apellidop,
  matricula,
}) {
  const { showNotification, NotificationComponent } = useNotification();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    try {
      if (!token) {
        throw new Error("Autorización rechazada. No se encontró el token.");
      }

      await fetchAlumnoDeleteLogico(token, matricula);

      onAccept();
      onClose();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivar = async () => {
    try {
      if (!token) {
        throw new Error("Autorización rechazada. No se encontró el token.");
      }

      await fetcthAlumnoReactivar(token, matricula);

      onAccept();
      onClose();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (!onConfirm) {
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
          Esta seguro de Desactivar al Alumno {nombres} {apellidop} ?
        </Typography>
      );
    } else {
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
          Esta seguro de activar al Alumno {nombres} {apellidop} ?
        </Typography>
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Baja a Alumno</DialogTitle>
      <DialogContent>{renderContent()}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={loading || isSubmitting}
          type="button"
          onClick={onConfirm ? handleActivar : handleDelete}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Aceptar"
          )}
        </Button>
      </DialogActions>
      {NotificationComponent}
    </Dialog>
  );
}

export default DesactivarDocente;

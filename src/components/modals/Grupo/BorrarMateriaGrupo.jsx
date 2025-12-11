import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { OctagonX } from "lucide-react";
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
import { fetchBorrarMateriaGrupo } from "../../../services/materiasService";

//ES BORRADO FISICO CUIDADO
function BorrarMateriaGrupo({
  open,
  onClose,
  onAccept,
  nombre,
  grupoId,
  clave,
}) {

  const {token} = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
   

    try {
       if (!token) {
          throw new Error("Autorización rechazada. No se encontró el token.");
        }
        await fetchBorrarMateriaGrupo(token,grupoId,clave);

      alert("Materia eliminada con éxito");
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
      <Typography fontSize={"1.2rem"}>
        ¿Está seguro de <strong>eliminar</strong> la materia {nombre}?
      </Typography>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle 
      sx={{
          backgroundColor: "#C91818",
          color: "white",
          textAlign: "center",
          py: 1.5,
          fontFamily: '"Poppins", sans-serif',
          fontWeight: 600
      }}>
        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
          <OctagonX  size={22} />
          ELIMINAR MATERIA
        </Box>
        </DialogTitle>
      <DialogContent
      sx={{
          marginTop: 2,
          justifyContent: "center",
          justifyItems: "center",
          textAlign: "center"
        }}>{renderContent()}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={loading || isSubmitting}
          type="button"
          onClick={handleDelete}
          sx={{
            backgroundColor:"#C91818"
          }}
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

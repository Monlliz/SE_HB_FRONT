import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import { OctagonX } from "lucide-react";

/**
 * @param {boolean} open - Si el modal está visible
 * @param {function} onClose - Función para cancelar/cerrar
 * @param {function} onConfirm - Función a ejecutar al aceptar
 * @param {string} title - Título del encabezado rojo (Default: "ELIMINAR REGISTRO")
 * @param {string|ReactNode} message - El mensaje central (puede ser texto o JSX)
 * @param {boolean} isLoading - Si está cargando, deshabilita botones y muestra spinner
 */
export default function ConfirmModal({ 
  open, 
  onClose, 
  onConfirm, 
  title = "ELIMINAR REGISTRO", 
  message,
  isLoading = false 
}) {
  return (
    <Dialog 
      open={open} 
      onClose={!isLoading ? onClose : undefined} // Evita cerrar si está cargando
      fullWidth 
      maxWidth="xs"
    >
      {/* --- ENCABEZADO ROJO --- */}
      <DialogTitle 
        sx={{
            backgroundColor: "#C91818",
            color: "white",
            textAlign: "center",
            py: 1.5,
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 600
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
          <OctagonX size={22} />
          {title.toUpperCase()}
        </Box>
      </DialogTitle>

      {/* --- CONTENIDO CENTRADO --- */}
      <DialogContent
        sx={{
            marginTop: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 1
        }}
      >
        {/* Renderizado del mensaje */}
        <Typography fontSize={"1.2rem"}>
           {message || "¿Estás seguro de que deseas realizar esta acción?"}
        </Typography>
      </DialogContent>

      {/* --- BOTONES DE ACCIÓN --- */}
      <DialogActions sx={{ pb: 2, px: 2 }}>
        <Button 
          onClick={onClose} 
          disabled={isLoading}
          color="inherit"
        >
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={isLoading}
          sx={{
            backgroundColor: "#C91818",
            "&:hover": { backgroundColor: "#a31313" } // Un rojo un poco más oscuro al hover
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Aceptar"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
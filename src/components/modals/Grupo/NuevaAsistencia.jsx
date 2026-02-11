import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Paper,
  Chip,
  IconButton,
  Avatar
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// Importa los colores e íconos desde el archivo de configuración
import { STATUS_COLORS, OPCIONES_ASISTENCIA } from "../../../config/colors&iconsConfig.jsx";
import { ListChecks} from 'lucide-react';
// Componente Modal de Nueva Asistencia
const AsistenciaModal = ({
  open,
  onClose,
  estudiantes = [],
  onSave,
  editDate = null,
  asistenciaActual = null,
}) => {
  const [fecha, setFecha] = useState(dayjs());
  const [estatusAsistencia, setEstatusAsistencia] = useState({});

  // ... (Tu useEffect de inicialización se queda IGUAL, no cambia la lógica) ...
  useEffect(() => {
    if (open) {
      if (editDate && asistenciaActual) {
        setFecha(dayjs(editDate));
        const editState = {};
        estudiantes.forEach((est) => {
          editState[est.matricula] = asistenciaActual[est.matricula] || "asistio";
        });
        setEstatusAsistencia(editState);
      } else {
        setFecha(dayjs());
        const initialState = {};
        estudiantes.forEach((est) => {
          initialState[est.matricula] = "asistio";
        });
        setEstatusAsistencia(initialState);
      }
    }
  }, [open, estudiantes, editDate, asistenciaActual]);

  const handleStatusChange = (matricula, nuevoEstatus) => {
    setEstatusAsistencia((prev) => ({
      ...prev,
      [matricula]: nuevoEstatus,
    }));
  };

  const handleGuardar = () => {
    const datosGuardar = {
      fecha: fecha.format("YYYY-MM-DD"),
      registros: Object.keys(estatusAsistencia).map((matricula) => ({
        matricula: matricula,
        estatus: estatusAsistencia[matricula],
      })),
    };
    onSave(datosGuardar);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" > {/* Aumenté el ancho a md */}

      {/* TU HEADER PERSONALIZADO */}
      <DialogTitle sx={{
        backgroundColor: "primary.main",
        textAlign: "center",
        py: 1.5,
        fontFamily: '"Poppins", sans-serif',
        color: "white",
        fontWeight: 600,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 1
      }}>
        <ListChecks size={24} />
        {editDate ? "EDITAR ASISTENCIA" : "NUEVA ENTRADA DE LISTA"}
      </DialogTitle>

      <DialogContent sx={{
        backgroundColor: "#f5f7fa",
        p: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden", //Oculta el scroll general del modal
        height: { xs: "70%", md: "75%" }
      }}>

        {/* SECCIÓN DE FECHA DESTACADA */}
        <Box sx={{
          backgroundColor: "white",
          px: 3,
          pt: 3,
          pb: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderBottom: "1px solid #e0e0e0",
          flexShrink: 0
        }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            SELECCIONA LA FECHA
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={fecha}
              format="DD/MM/YYYY"
              onChange={(nuevaFecha) => setFecha(nuevaFecha)}
              sx={{ width: "100%", maxWidth: "300px" }}
              slotProps={{ textField: { size: 'small' } }}
            />
          </LocalizationProvider>
        </Box>
{/* --- NUEVO: LEYENDA DE ESTATUS --- */}
        <Box sx={{ 
            display: "flex", 
            justifyContent: "center", 
            gap: 2, 
            py: 1, 
            backgroundColor: "white", 
            borderBottom: "1px solid #e0e0e0",
            flexShrink: 0,
            flexWrap: "wrap"
        }}>
            {OPCIONES_ASISTENCIA.map((opcion) => {
                const colorConfig = STATUS_COLORS[opcion.colorKey];
                const Icon = opcion.icon;

                return (
                    <Box 
                        key={opcion.value} 
                        sx={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: 0.5 
                        }}
                    >
                        {/* Indicador visual pequeño (Badge) */}
                        <Box sx={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            backgroundColor: colorConfig.light,
                            color: colorConfig.main,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: `1px solid ${colorConfig.main}40` // Borde muy sutil
                        }}>
                            <Icon size={10} strokeWidth={3} />
                        </Box>
                        
                        {/* Texto descriptivo */}
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                fontSize: "0.65rem", 
                                fontWeight: 600, 
                                color: "text.secondary",
                                textTransform: "uppercase"
                            }}
                        >
                            {colorConfig.label}
                        </Typography>
                    </Box>
                );
            })}
        </Box>
        {/* LISTA DE ESTUDIANTES TIPO TABLA/TARJETA */}
        <Box sx={{ p: 2, overflowY: "auto", flex: 1, minHeight: 0 }}> {/* Scroll contenido */}
          {estudiantes.map((estudiante, index) => {
            const estadoActual = estatusAsistencia[estudiante.matricula] || "asistio";
            const colorConfig = STATUS_COLORS[estadoActual] || STATUS_COLORS.asistio;

            return (
              <Paper
                key={estudiante.matricula}
                elevation={0}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2,
                  mb: 1.5,
                  backgroundColor: "white",
                  border: "1px solid #eee",
                  borderRadius: "1rem",
                  transition: "all 0.2s",
                  borderLeft: `5px solid ${colorConfig.main}`, // Borde izquierdo de color según estado
                  "&:hover": { boxShadow: "0 0.1rem 0.5rem rgba(0,0,0,0.05)" }
                }}
              >
                {/* Datos del Estudiante */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
                  <Avatar sx={{ bgcolor: "primary.main", width: "2rem", height: "2rem", fontSize: "0.9rem" }}>
                    {index + 1}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="600" sx={{ lineHeight: 1.2 }}>
                      {estudiante.apellidop} {estudiante.apellidom}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {estudiante.nombres}
                    </Typography>
                  </Box>
                </Box>

                {/* Botones de Acción (Chips Interactivos) */}
                <Box sx={{ display: "flex", gap: 1 }}>
                  {OPCIONES_ASISTENCIA.map((opcion) => {
                    const isActive = estadoActual === opcion.value;
                    const colorConfig = STATUS_COLORS[opcion.colorKey];
                    const Icon = opcion.icon;

                    return (
                      <Chip
                        key={opcion.value}
                        label={opcion.label}
                        icon={<Icon size={16} />}
                        onClick={() => handleStatusChange(estudiante.matricula, opcion.value)}
                        sx={{
                          cursor: "pointer",
                          fontWeight: "bold",
                          // Si está activo usa su color principal, si no transparente
                          bgcolor: isActive ? colorConfig.main : "transparent",
                          // Si está activo texto blanco, si no gris
                          color: isActive ? "white" : "text.disabled",
                          // Borde solo si no está activo
                          border: `1px solid ${isActive ? "transparent" : "#e0e0e0"}`,

                          // Heredar color para el icono
                          "& .MuiChip-icon": { color: "inherit" },

                          // Hover con el color light
                          "&:hover": {
                            bgcolor: colorConfig.light,
                            color: colorConfig.main,
                            borderColor: colorConfig.main
                          }
                        }}
                      />
                    );
                  })}
                </Box>
              </Paper>
            );
          })}
        </Box>

      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: "1px solid #eee", backgroundColor: "white" }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: "none" }}>Cancelar</Button>
        <Button
          onClick={handleGuardar}
          variant="contained"
          sx={{
            px: 2,
            borderRadius: "0.7rem",
            textTransform: "none",
            fontWeight: "bold",
            boxShadow: "none"
          }}

        >
          Guardar Asistencia
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AsistenciaModal;
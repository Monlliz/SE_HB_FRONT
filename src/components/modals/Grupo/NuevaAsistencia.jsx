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
  Paper,
  Chip,
  Avatar,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  STATUS_COLORS,
  OPCIONES_ASISTENCIA,
} from "../../../config/colors&iconsConfig.jsx";
import { ListChecks } from "lucide-react";

const AsistenciaModal = ({
  open,
  onClose,
  estudiantes = [],
  onSave,
  editDate = null,
  asistenciaActual = null,
  isDocente = false,
}) => {
  const [fecha, setFecha] = useState(dayjs());
  const [estatusAsistencia, setEstatusAsistencia] = useState({});

  // 🔥 LÓGICA DE ID (MANTENIDA PARA QUE FUNCIONE)
  const getId = (persona) => {
    if (!persona) return null;
    if (isDocente) {
      return persona.iddocente || persona.idDocente || persona.id;
    }
    // Aseguramos que lea matricula para alumnos
    return persona.matricula || persona.id;
  };

  useEffect(() => {
    if (open) {
      if (editDate) {
        setFecha(dayjs(editDate));
      } else {
        setFecha(dayjs());
      }

      const nuevoEstado = {};
      estudiantes.forEach((persona) => {
        const id = getId(persona);
        if (id) {
          const estadoPrevio = asistenciaActual ? asistenciaActual[id] : null;
          nuevoEstado[id] = estadoPrevio || "asistio";
        }
      });
      setEstatusAsistencia(nuevoEstado);
    }
  }, [open, estudiantes, editDate, asistenciaActual, isDocente]);

  const handleStatusChange = (idUsuario, nuevoEstatus) => {
    setEstatusAsistencia((prev) => ({
      ...prev,
      [idUsuario]: nuevoEstatus,
    }));
  };

  const handleGuardar = () => {
    const datosGuardar = {
      fecha: fecha.format("YYYY-MM-DD"),
      asistencias: estatusAsistencia,
    };
    onSave(datosGuardar);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      {" "}
      {/* Regresé a 'md' para más espacio */}
      <DialogTitle
        sx={{
          backgroundColor: "primary.main",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <ListChecks size={24} />
        {editDate ? "EDITAR ASISTENCIA" : "NUEVA ENTRADA"}
      </DialogTitle>
      <DialogContent
        sx={{
          backgroundColor: "#f5f7fa",
          p: 0,
          height: { xs: "70%", md: "75%" },
        }}
      >
        {/* SECCIÓN FECHA */}
        <Box
          sx={{
            backgroundColor: "white",
            p: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Typography variant="caption" color="text.secondary" gutterBottom>
            SELECCIONA LA FECHA
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={fecha}
              format="DD/MM/YYYY"
              onChange={(nf) => setFecha(nf)}
              slotProps={{ textField: { size: "small" } }}
              sx={{ width: "100%", maxWidth: "300px" }}
            />
          </LocalizationProvider>
        </Box>

        {/* LEYENDA DE COLORES (RESTAURADA) */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            py: 1,
            backgroundColor: "white",
            borderBottom: "1px solid #e0e0e0",
            flexWrap: "wrap",
          }}
        >
          {OPCIONES_ASISTENCIA.map((opcion) => {
            const colorConfig = STATUS_COLORS[opcion.colorKey];
            const Icon = opcion.icon;
            return (
              <Box
                key={opcion.value}
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <Box
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    backgroundColor: colorConfig.light,
                    color: colorConfig.main,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${colorConfig.main}40`,
                  }}
                >
                  <Icon size={10} strokeWidth={3} />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    color: "text.secondary",
                    textTransform: "uppercase",
                  }}
                >
                  {colorConfig.label}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* LISTA DE ESTUDIANTES */}
        <Box sx={{ p: 2, overflowY: "auto" }}>
          {estudiantes.map((persona, index) => {
            const id = getId(persona);
            if (!id) return null;

            const estadoActual = estatusAsistencia[id] || "asistio";
            // Si el estado actual no está en la config, usamos el default (asistio) para evitar crash
            const colorConfig =
              STATUS_COLORS[estadoActual] || STATUS_COLORS.asistio;

            const nombre = isDocente
              ? ` ${persona.apellidop} ${persona.apellidom} ${persona.nombres || ""}`
              : `${persona.apellidop} ${persona.apellidom} ${persona.nombres}`;

            return (
              <Paper
                key={id}
                elevation={0}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2,
                  mb: 1.5,
                  backgroundColor: "white",
                  borderRadius: "1rem",
                  border: "1px solid #eee",
                  borderLeft: `5px solid ${colorConfig.main}`, // Borde izquierdo dinámico
                  transition: "all 0.2s",
                }}
              >
                {/* Info Persona */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flex: 1,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "primary.main",
                      width: 30,
                      height: 30,
                      fontSize: "0.8rem",
                    }}
                  >
                    {index + 1}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {nombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {isDocente ? "Docente" : persona.matricula}
                    </Typography>
                  </Box>
                </Box>

                {/* BOTONES DE ACCIÓN (Con Texto Restaurado) */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                  }}
                >
                  {OPCIONES_ASISTENCIA.map((opcion) => {
                    const isActive = estadoActual === opcion.value;
                    const Icon = opcion.icon;
                    const btnColor = STATUS_COLORS[opcion.colorKey];

                    return (
                      <Chip
                        key={opcion.value}
                        label={opcion.label} // <--- TEXTO RESTAURADO
                        icon={<Icon size={16} />}
                        onClick={() => handleStatusChange(id, opcion.value)}
                        sx={{
                          cursor: "pointer",
                          fontWeight: "bold",
                          bgcolor: isActive ? btnColor.main : "transparent",
                          color: isActive ? "white" : "text.disabled",
                          border: `1px solid ${isActive ? "transparent" : "#e0e0e0"}`,

                          "& .MuiChip-icon": { color: "inherit" },
                          "&:hover": {
                            bgcolor: btnColor.light,
                            color: btnColor.main,
                            borderColor: btnColor.main,
                          },
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
      <DialogActions sx={{ p: 2, borderTop: "1px solid #eee" }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          variant="contained"
          sx={{ borderRadius: 2 }}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AsistenciaModal;

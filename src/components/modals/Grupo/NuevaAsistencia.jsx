import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import dayjs from "dayjs";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const NuevaAsistencia = ({ open, onClose, estudiantes, onSave }) => {
  const [fecha, setFecha] = useState(dayjs()); // Fecha, por defecto hoy
  const [estatusAsistencia, setEstatusAsistencia] = useState({});

  // Inicializa el estado de la asistencia cada vez que la lista de estudiantes cambia o el modal se abre
  useEffect(() => {
    if (open) {
      const initialState = {};
      estudiantes.forEach((estudiante) => {
        // Por defecto, todos asisten
        initialState[estudiante.matricula] = "asistio";
      });
      setEstatusAsistencia(initialState);
    }
  }, [open, estudiantes]);

  // Maneja el cambio de estatus para un estudiante
  const handleStatusChange = (matricula, nuevoEstatus) => {
    setEstatusAsistencia((prev) => ({
      ...prev,
      [matricula]: nuevoEstatus,
    }));
  };

  const handleGuardar = () => {
    const nuevaEntrada = {
      fecha: fecha.format("YYYY-MM-DD"), // Formato de fecha estándar
      registros: Object.keys(estatusAsistencia).map((matricula) => ({
        matricula: matricula,
        estatus: estatusAsistencia[matricula],
      })),
    };
    onSave(nuevaEntrada); // Envía los datos al componente padre

    onClose(); // Cierra el modal
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nueva Entrada de Lista</DialogTitle>
      <DialogContent>
        {/* Selector de Fecha */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Fecha de la asistencia"
            value={fecha}
            onChange={(nuevaFecha) => setFecha(nuevaFecha)}
            sx={{ my: 2 }}
          />
        </LocalizationProvider>

        {/* Lista de Estudiantes */}
        <Box sx={{ mt: 2 }}>
          {estudiantes.map((estudiante) => (
            <Box
              key={estudiante.matricula}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
                p: 1,
                borderBottom: "1px solid #eee",
                gap: 2,
              }}
            >
              <Typography sx={{ wordBreak: "break-word" }}>
                {" "}
                {estudiante.nombres+" " + estudiante.apellidop + " " + estudiante.apellidom}
              </Typography>
              <FormControl   sx={{ flexShrink: 0 }}>
                <RadioGroup
                  row
                  value={estatusAsistencia[estudiante.matricula] || ""}
                  onChange={(e) =>
                    handleStatusChange(estudiante.matricula, e.target.value)
                  }
                >
                  <FormControlLabel
                    value="asistio"
                    control={<Radio size="small" color="success" />}
                    label="Asistió"
                  />
                  <FormControlLabel
                    value="falta"
                    control={<Radio size="small" color="error" />}
                    label="Faltó"
                  />
                  <FormControlLabel
                    value="demorado"
                    control={<Radio size="small" color="warning" />}
                    label="Demorado"
                  />
                  <FormControlLabel
                    value="antes"
                    control={<Radio size="small" color="warning" />}
                    label="Antes"
                  />
                </RadioGroup>
              </FormControl>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleGuardar} variant="contained">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NuevaAsistencia;

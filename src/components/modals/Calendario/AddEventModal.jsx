import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Box,
  FormControlLabel,
  Checkbox,
  Typography,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import { CalendarPlus, Type, CalendarDays, CalendarRange } from "lucide-react";
import { EVENT_TYPES } from "../../../data/eventTypes";
import { TodayOutlined, Today } from "@mui/icons-material";

// Definimos el estado inicial para poder reutilizarlo
const initialState = {
  etiqueta: "",
  tipo: "",
  fecha: "",
  anual: false,
};

const AddEventModal = ({ open, onClose, onSave }) => {
  const theme = useTheme();

  // Usamos el estado inicial
  const [formData, setFormData] = useState(initialState);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target; // Extraemos 'checked' para checkbox

    setFormData({
      ...formData,
      // Usamos un ternario: si es un checkbox, usa 'checked'. Si no, usa 'value'.
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = () => {
    // La validación no debe incluir 'anual', ya que 'false' es un valor válido
    if (!formData.etiqueta || !formData.tipo || !formData.fecha) return;

    onSave(formData);
    setFormData(initialState); // Reseteamos al estado inicial
  };

  // --- ¡FUNCIÓN PARA CANCELAR! ---
  const handleCancel = () => {
    setFormData(initialState); // 1. Limpia el formulario
    onClose(); // 2. Cierra el modal
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          background: "linear-gradient(145deg, #f5faff 0%, #e3f2fd 100%)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: "primary.main",
          color: "white",
          textAlign: "center",
          py: 2,
          fontFamily: '"Poppins", sans-serif',
          fontWeight: 600,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
          <CalendarPlus size={22} />
          Añadir nuevo evento
        </Box>
      </DialogTitle>

      <DialogContent
        component={motion.div}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        sx={{ mt: 2 }}
      >
        {/* Campo: Nombre del evento */}
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <Type color={theme.palette.primary.main} size={20} />
          <TextField
            label="Nombre del evento"
            name="etiqueta"
            value={formData.etiqueta}
            onChange={handleChange}
            variant="outlined"
            fullWidth
          />
        </Box>

        {/* Campo: Tipo de evento */}
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <CalendarRange color={theme.palette.primary.main} size={20} />
          <TextField
            select
            label="Tipo de evento"
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            fullWidth
          >
            {Object.entries(EVENT_TYPES).map(([key, value]) => (
              <MenuItem key={key} value={key}>
                <Box display="flex" alignItems="center" gap={1}>
                  <value.icon size={18} />
                  <Typography>{value.label}</Typography>
                </Box>
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Campo: Fecha */}
        <Box display="flex" alignItems="center" gap={1}>
          <CalendarDays color={theme.palette.primary.main} size={20} />
          <TextField
            label="Fecha"
            name="fecha"
            type="date"
            value={formData.fecha}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Box>
        {/* Campo: Anual */}
        <Box display="flex" alignItems="center" gap={1}>
          <FormControlLabel
            control={
              <Checkbox
                name="anual"
                checked={formData.anual}
                onChange={handleChange}
                icon={<TodayOutlined sx={{ fontSize: 20}} />}
                checkedIcon={<Today sx={{ fontSize: 20}} />}

                // sx={{fontSize: 28}}
              />
            }
            label="Evento Anual"
            sx={{paddingTop: "0.3rem"}}
          />
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: 3,
          pb: 2,
        }}
      >
        <Button
          onClick={handleCancel}
          sx={{
            textTransform: "none",
            color: "#555",
            "&:hover": { backgroundColor: "rgba(0,0,0,0.05)" },
          }}
        >
          Cancelar
        </Button>

        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            textTransform: "none",
            background: "linear-gradient(135deg, primary.main, primary.light)",
            boxShadow: "0 4px 10px rgba(1, 81, 146, 0.48)",
            "&:hover": { background: "linear-gradient(135deg, primary.light, #6585d6ff)" },
          }}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEventModal;

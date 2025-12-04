import React, { useState } from "react";
import { Box, Tooltip, IconButton } from "@mui/material";
import { CalendarDays } from "lucide-react";
import AddEventModal from "./AddEventModal";
import { createEvent } from '../../../services/fechasService';
import { useAuth } from "../../../context/AuthContext";

function CalendarAddButton({ onEventAdded }) {
  const [openModal, setOpenModal] = useState(false);
  const { token } = useAuth();

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  const handleSave = async (nuevoEvento) => {
    //console.log("Nuevo evento guardado:", nuevoEvento);
    const fecha = new Date(nuevoEvento.fecha); //fechas en formato Date
    const { etiqueta, tipo, anual } = nuevoEvento;
    
    let yeao;
    if (anual) {
      yeao = null;
    } else{
      yeao = fecha.getFullYear();
    }

    const nuevoEventoFormateado = {
      yearf: yeao,
      mes: fecha.getMonth(),
      dia: fecha.getDate()+1,
      etiqueta,
      tipo
    };
    console.log(nuevoEventoFormateado);
    
    const data = await createEvent(token, nuevoEventoFormateado);
    console.log('Evento guardado exitosamente:', data);

    // Si el prop existe, llámalo.
    if (onEventAdded) {
      onEventAdded(); // Esto ejecutará 'fetchFechas' en el Dashboard
    }

    setOpenModal(false);
  };

  return (
    <>
      {/* === BOTÓN DEL CALENDARIO === */}
      <Tooltip title="Añadir nuevo evento">
        <Box sx={{ color: "primary.main" }}>
          <IconButton
            onClick={handleOpen}
            sx={{
              transition: "transform 0.2s ease, color 0.3s",
              "&:hover": {
                transform: "scale(1.1)",
                color: "primary.dark",
              },
            }}
          >
            <CalendarDays size={26} />
          </IconButton>
        </Box>
      </Tooltip>

      {/* === MODAL PARA AÑADIR EVENTO === */}
      <AddEventModal
        open={openModal}
        onClose={handleClose}
        onSave={handleSave}
      />
    </>
  );
}

export default CalendarAddButton;

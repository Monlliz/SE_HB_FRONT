import React from "react";
import { Box, Paper, Typography, Avatar } from "@mui/material";
import { EVENT_TYPES } from "../data/eventTypes"; // Ajusta la ruta
import {capitalizarPrimeraLetra} from '../utils/fornatters';
// --- Helpers de Estilo ---
// (Funciones para obtener el ícono y color, igual que en tu modal)

// --- Definición de la Animación ---
const tickerAnimation = {
  "@keyframes ticker": {
    "0%": { transform: "translateX(0)" },
    // Movemos -50% porque el contenido está duplicado (100% / 2 = 50%)
    "100%": { transform: "translateX(-50%)" },
  },
};

const EventTicker = ({ events = [] }) => {
  // Si no hay eventos, muestra un mensaje
  if (events.length === 0) {
    return (
      <Paper
        sx={{
          padding: "12px 16px",
          backgroundColor: "secondary.light", // Tu azul claro
          borderRadius: "12px",
          textAlign: "center",
        }}
      >
        <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 500 }}>
          No hay eventos programados para hoy.
        </Typography>
      </Paper>
    );
  }

  // Función para renderizar un solo item del ticker
  const renderEventItem = (event, index) => {
    // Busca la configuración del evento (ej: 'festivo')
    const eventType = EVENT_TYPES[event.tipo] || null; 
    // Obtén el color (con fallback)
    const itemColor = eventType?.color || EVENT_TYPES.default.color;
    
    // Obtén el COMPONENTE del ícono (con fallback)
    const IconComponent = eventType?.icon || EVENT_TYPES.default.icon;
    return (
      <Box
        key={`event-${index}`}
        sx={{
          display: "flex",
          alignItems: "center",
          mr: 4, // Espacio entre eventos
          flexShrink: 0, // Evita que los items se encojan
        }}
      >
        <Avatar
          sx={{
            bgcolor: itemColor,
            width: 24,
            height: 24,
            mr: 1.5,
          }}
        >
          <IconComponent sx={{ fontSize: "1rem" }} />
        </Avatar>
        <Typography
          variant="body2"
          sx={{
            color: "primary.contrastText",
            fontWeight: 500,
            fontFamily:"Inter",
            whiteSpace: "nowrap", // Evita que el texto se parta
          }}
        >
          {capitalizarPrimeraLetra(event.etiqueta)}
        </Typography>
      </Box>
    );
  };

  // Ajusta la duración de la animación basado en cuántos eventos hay
  // (Más eventos = animación más lenta para que se pueda leer)
  const animationDuration = events.length * 4; // 4 segundos por evento (ajusta a tu gusto)

  return (
    <Paper
      sx={{
        padding: "4% 0", // Delgado, como pediste
        backgroundColor: "primary.main", // Tu azul claro
        borderRadius: "1rem",
        overflow: "hidden", // ¡Muy importante para que funcione el carrusel!
        width: "100%",
        ...tickerAnimation, // Inyecta los keyframes
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: "fit-content", // Se ajusta al ancho de los eventos
          // Aplica la animación
          animation: `ticker ${animationDuration}s linear infinite`,
          "&:hover": {
            animationPlayState: "paused", // Pausa la animación con el mouse
          },
        }}
      >
        {/* Renderiza la lista 1ra vez */}
        {events.map(renderEventItem)}

        {/* Renderiza la lista 2da vez (para el bucle) */}
        {events.map((event, index) => renderEventItem(event, events.length + index))}
      </Box>
    </Paper>
  );
};

export default EventTicker;
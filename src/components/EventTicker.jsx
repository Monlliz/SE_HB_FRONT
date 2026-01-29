import React from "react";
import { Box, Paper, Typography, Avatar } from "@mui/material";
import { EVENT_TYPES } from "../data/eventTypes"; // Ajusta la ruta
import { capitalizarPrimeraLetra } from '../utils/fornatters';
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
  const commonPaperStyles = {
    padding: "2.5% 5%",
    borderRadius: "12px",
    // Si quieres el fondo AZUL OSCURO de la imagen 1, usa "primary.main"
    // Si quieres el fondo CLARO de la imagen 2, usa "secondary.light" o "#F0F4F8"
    backgroundColor: "primary.main",
    color: "primary.contrastText", // Texto blanco si el fondo es oscuro
    overflow: "hidden", // CRUCIAL: Corta lo que sobra
    position: "relative", // Necesario para contener lo absoluto
    display: "flex",
    alignItems: "center",
  
  };
// Ajusta la duración de la animación basado en cuántos eventos hay
  // (Más eventos = animación más lenta para que se pueda leer)
  const animationDuration = events.length * 4; // 4 segundos por evento (ajusta a tu gusto)

  // --- Caso: No hay eventos ---
  if (events.length === 0) {
    return (
      <Paper sx={{
        ...commonPaperStyles,
        justifyContent: "center", // Centrado si es texto estático
        backgroundColor: "secondary.light", // Color clarito para el mensaje
        color: "primary.main",
      }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
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
            fontWeight: "bold",
            fontFamily: "Inter",
            
          }}
        >
          {event.etiqueta}
        </Typography>
      </Box>
    );
  };

  
  return (
    <Paper
      sx={{
        ...commonPaperStyles,
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: "fit-content", // Se ajusta al ancho de los eventos
          // Aplica la animación
          whiteSpace: "nowrap",
          animation: `ticker ${animationDuration}s linear infinite`,
          ...tickerAnimation,
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
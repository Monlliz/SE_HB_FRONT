import React from "react";
import {
    Dialog,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Button,
    Box,
    Typography,
    IconButton
} from "@mui/material";

import { EVENT_TYPES } from "../../../data/eventTypes"; // importa el JSON
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import { Trash2 } from 'lucide-react';

function EventDetailsDialog({ open, onClose, date, events = [], onDeleteEvent }) {
    // Busca el evento "prioritario" para definir el color del encabezado
    const priorityEvent =
        events.find((f) => f.tipo === "festivo") ||
        events.find((f) => f.tipo === "noLaborable") ||
        (events.length > 0 ? events[0] : null);

    // Obtén los datos desde el JSON o usa valores por defecto
    const eventType = priorityEvent ? EVENT_TYPES[priorityEvent.tipo] : null;
    const headerColor = eventType?.color || "#1976d2";
    const HeaderIcon = eventType?.icon || EVENT_TYPES.default.icon;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            PaperProps={{
                sx: {
                    borderRadius: "1.125rem",
                    background: "linear-gradient(145deg, rgba(255,255,255,0.96) 0%, rgba(240, 240, 255, 0.98) 50%, rgba(255,255,255,0.98) 100%)",
                    boxShadow: "0 0.5rem 1.5rem rgba(0,0,0,0.08), 0 0.25rem 0.5rem rgba(0,0,0,0.04)",
                    overflow: "hidden",
                },
            }}
        >
            {/* ===== HEADER ===== */}
            <Box
                sx={{
                    background: `linear-gradient(135deg, ${headerColor} 0%, ${headerColor}cc 100%)`,
                    padding: "1.70rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                }}
            >
                <HeaderIcon sx={{ fontSize: 65, color: 'white' }} />
            </Box>

            {/* ===== CONTENIDO ===== */}
            <DialogContent sx={{ pt: 3, pb: 1 }}>
                <Typography
                    fontFamily='"Poppins", sans-serif'
                    fontSize="1.25rem"
                    component={motion.div}
                    textAlign="center"
                    gutterBottom
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    {date
                        ? `Eventos del ${format(date, "eeee, d 'de' MMMM", { locale: es })}`
                        : "Eventos"}
                </Typography>

                <List>
                    {events.length > 0 ? (
                        events.map((event, index) => {
                            const typeInfo = EVENT_TYPES[event.tipo] || EVENT_TYPES.otro;
                            const Icon = typeInfo.icon;

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -15 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index, duration: 0.3 }}
                                >
                                    <ListItem disableGutters>
                                        <ListItemAvatar>
                                            <Avatar
                                                sx={{
                                                    bgcolor: typeInfo.color,
                                                    color: "white",
                                                    boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
                                                }}
                                            >
                                                <Icon size={22} color="white" />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={event.etiqueta}
                                            secondary={typeInfo.label}
                                        />
                                        <IconButton 
                                                    edge="end" 
                                                    aria-label="delete"
                                                    onClick={() => onDeleteEvent(event)} // <--- LA MAGIA
                                                    sx={{ 
                                                        color: "#d32f2f", // Un rojo suave
                                                        "&:hover": { color: "#ffffff", bgcolor: "#d32f2f" }
                                                    }}
                                                >
                                                    <Trash2 size={20} />
                                                </IconButton>
                                    </ListItem>
                                </motion.div>
                            );
                        })
                    ) : (
                        <Typography textAlign="center">
                            No hay eventos para este día.
                        </Typography>
                    )}
                </List>
            </DialogContent>

            {/* ===== BOTÓN ===== */}
            <DialogActions
                sx={{ pt: 0, pb: 2, pr: 2, justifyContent: "center" }}
                component={motion.div}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <Button
                    onClick={onClose}
                    variant="contained"
                    sx={{
                        textTransform: "none",
                        borderRadius: "12px",
                        px: 3,
                        backgroundColor: headerColor,
                        "&:hover": { backgroundColor: `${headerColor}cc` },
                    }}
                >
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default EventDetailsDialog;

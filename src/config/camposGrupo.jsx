import React from "react";
import { Box } from "@mui/material";

//------------GRUPO----------------------------------------------
// Funcion que recibe el grupoId y devuelve la configuración de campos para el modal de cambio de grupo
export const getCambioGrupoFields = (grupoId) => [
  {
    name: "grupo",
    label: "Nuevo Grupo",
    type: "select",
    options: [
      { id: "1A", label: "1A" },
      { id: "1B", label: "1B" },
      { id: "2A", label: "2A" },
      { id: "2B", label: "2B" },
      { id: "3A", label: "3A" },
      { id: "3B", label: "3B" },
      { id: "4A", label: "4A" },
      { id: "4B", label: "4B" },
      { id: "5A", label: "5A" },
      { id: "5B", label: "5B" },
      { id: "6A", label: "6A" },
      { id: "6B", label: "6B" },
      { id: "EG", label: "EG" },
    ],
    required: true,
    // Aquí usamos el parámetro que recibimos
    instruction: (
      <span>
        ¿A qué grupo deseas mover a todos los alumnos del{" "}
        <Box component="span" fontWeight="bold" color="primary.main">
          Grupo {grupoId}
        </Box>
        ?
      </span>
    ),
  },
];

// 1. Configuración para AGREGAR Materia
export const getAddMateriaFields = (opcionesMaterias, loading) => [
  {
    name: "materiaClave",
    label: "Buscar Materia",
    type: "autocomplete", // Usamos tu nuevo tipo
    options: opcionesMaterias, // Pasamos las opciones cargadas desde la API
    required: true,
    disable: loading,
    instruction: "Selecciona la materia que deseas agregar al grupo.",
  }
];

//------------------------------------------------------------------
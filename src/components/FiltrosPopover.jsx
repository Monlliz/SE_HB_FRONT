import React, { useState } from "react";
import {
  Box,
  Button,
  Popover,
  TextField,
  Autocomplete,
  Stack,
  Typography,
  IconButton,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";

import { semestres, perfiles } from '../config/camposMateria';
// DATOS DE EJEMPLO (Reemplázalos con tus datos reales o props)


// Generamos años desde 2020 a 2030
const anios = Array.from({ length: 11 }, (_, i) => (2020 + i).toString());

export default function FiltrosPopover({ onApplyFilters }) {
  // Estado para controlar la apertura del Popover
  const [anchorEl, setAnchorEl] = useState(null);

  // Estado local para los valores de los filtros
  const [filters, setFilters] = useState({
    clave: "",
    semestre: null,
    perfil: null,
    year: null,
  });

  // Abrir Popover
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Cerrar Popover
  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  // Manejadores de cambios
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApply = () => {
    // Enviamos los filtros al componente padre
    onApplyFilters(filters);
    handleClose(); // Opcional: cerrar al aplicar
  };

  const handleClear = () => {
    const cleanFilters = {
      clave: "",
      semestre: null,
      perfil: null,
      year: null,
    };
    setFilters(cleanFilters);
    onApplyFilters(cleanFilters); // Limpiamos en el padre también
  };

  return (
    <>
      {/* --- BOTÓN ACTIVADOR (Como tu imagen) --- */}
      <Button
        aria-describedby={id}
        variant="outlined"
        onClick={handleClick}
        startIcon={<FilterListIcon />} // Opcional: icono de filtro
        sx={{
          borderRadius: "20px",
          textTransform: "none",
          borderColor: "#9CA3AF",
          color: "#374151",
          fontWeight: 500,
          "&:hover": {
            borderColor: "#6B7280",
            backgroundColor: "#F9FAFB",
          },
        }}
      >
        Ver Filtros
      </Button>

      {/* --- LA MINI VENTANA FLOTANTE --- */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left", // Se abre justo debajo
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        slotProps={{
          paper: {
            sx: { borderRadius: 2, mt: 1, boxShadow: 3 } // Estilo de la ventana
          }
        }}
      >
        <Box sx={{ p: 3, width: "100%" }}>
          {/* Encabezado del Popover */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              color: "primary.main",
            }}
          >
            <Typography variant="h1" fontSize="1.3rem">
              Filtrar Materias
            </Typography>
            <IconButton size="small" onClick={handleClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Stack spacing={2}>
            {/* 1. CLAVE (TextField simple) */}
            <TextField
              label="Clave"
              variant="outlined"
              size="small"
              fullWidth
              value={filters.clave}
              onChange={(e) => handleFilterChange("clave", e.target.value)}
            />

            {/* 2. SEMESTRE (Autocomplete: permite escribir y filtrar) */}
            <Autocomplete
              options={semestres}
              value={filters.semestre}
              onChange={(_, newValue) => handleFilterChange("semestre", newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Semestre" size="small" />
              )}
            />

            {/* 3. PERFIL (Autocomplete) */}
            <Autocomplete
              // A. Las opciones son el array de objetos
              options={perfiles}

              // B. Le decimos que muestre la propiedad 'label' en el texto
              getOptionLabel={(option) => option.label}

              // C. VALOR: Buscamos el objeto completo usando el ID guardado en el estado
              // Si filters.perfil es "BC", busca el objeto {id:"BC", label:"Sin Perfil"}
              value={perfiles.find((p) => p.id === filters.perfil) || null}

              // D. CAMBIO: Cuando seleccionan, guardamos solo el ID (option.id)
              onChange={(_, newValue) => {
                // newValue es el objeto completo o null (si borran)
                handleFilterChange("perfil", newValue ? newValue.id : null);
              }}

              // E. Renderizado normal
              renderInput={(params) => (
                <TextField {...params} label="Perfil" size="small" />
              )}
            />

            {/* 4. AÑO (Autocomplete) */}
            <Autocomplete
              options={anios}
              value={filters.year}
              onChange={(_, newValue) => handleFilterChange("year", newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Año Cohorte" size="small" />
              )}
            />

            {/* Botones de Acción */}
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button
                variant="outlined"
                color="inherit"
                fullWidth
                onClick={handleClear}
              >
                Limpiar
              </Button>
              <Button variant="contained" fullWidth onClick={handleApply}>
                Aplicar
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Popover>
    </>
  );
}
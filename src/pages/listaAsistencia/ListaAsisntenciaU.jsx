/**
 * @file ListaAsistenciaUnificada.jsx
 * @description Componente unificado para gestionar asistencias (General, Materia y Perfil).
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

// UI Components
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, Typography, Box, Tooltip, Button, FormControl,
  InputLabel, Select, MenuItem, Stack
} from "@mui/material";

// Icons
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DescriptionIcon from "@mui/icons-material/Description";
import InfoIcon from "@mui/icons-material/Info";

// Modal y Notificaciones
import NuevaAsistencia from "../../components/modals/Grupo/NuevaAsistencia";
// Asegúrate de que este path sea correcto para tu proyecto
import { useNotification } from "../../components/modals/NotificationModal.jsx";

// Servicios (Importamos TODOS los necesarios)
import {
  fetchDatosAsistencia,             // General
  fetchPostAsistencia,              // General POST
  fetchDatosAsistenciaMateria,      // Materia Normal
  fetchPostAsistenciaMateria,       // Materia POST
  fetchDatosAsistenciaMateriaPerfil // Materia Perfil
} from "../../services/asistenciaService.js";

// --- SUBCOMPONENTE DE ÍCONO ---
const IconoEstatus = ({ estatus }) => {
  switch (estatus) {
    case "asistio": return <Tooltip title="Asistió"><CheckCircleIcon color="success" /></Tooltip>;
    case "falta": return <Tooltip title="Faltó"><CancelIcon color="error" /></Tooltip>;
    case "demorado": return <Tooltip title="Demora"><DescriptionIcon color="warning" /></Tooltip>;
    case "antes": return <Tooltip title="Se retiró antes"><DescriptionIcon color="info" /></Tooltip>;
    default: return <Typography variant="caption">-</Typography>;
  }
};

/**
 * Componente Principal Unificado
 */
const ListaAsistencia = () => {
  const { token } = useAuth();
  const location = useLocation();
  // Usamos useNotification si está disponible en tu proyecto (tomado del archivo General)
  // Si no tienes este hook configurado globalmente, puedes volver a usar alert() o Snackbar simple.
  const { showNotification, NotificationComponent } = useNotification();

  // 1. Extracción de parámetros y Detección de MODO
  const {
    grupoId,
    year: initialYear,
    materiaClave,      // Solo en modos Materia/Perfil
    nombreMateria,     // Solo en modos Materia/Perfil
    idNormalizado,     // Solo en modo Perfil
    semestre           // Solo en modo Perfil
  } = location.state || {};

  // Lógica para determinar en qué modo estamos
  const isPerfil = Boolean(idNormalizado && semestre && materiaClave);
  const isMateria = Boolean(materiaClave && !isPerfil);
  // Si no hay materiaClave, asumimos que es el pase de lista general del grupo
  const isGeneral = Boolean(!materiaClave);

  // Estados
  const [modalOpen, setModalOpen] = useState(false);
  const [estudiantes, setEstudiantes] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filtros de fecha
  const [selectedYear, setSelectedYear] = useState(initialYear || new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // -----------------------------------------------------------------------
  // CARGA DE DATOS (Switch de Servicios)
  // -----------------------------------------------------------------------
  const cargarDatos = useCallback(async () => {
    if (!grupoId) {
      setError("No se proporcionó un ID de grupo.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      if (!token) throw new Error("Autorización rechazada. No se encontró el token.");

      let data;
      
      // >>> AQUÍ OCURRE LA MAGIA DE LA UNIFICACIÓN <<<
      if (isPerfil) {
        console.log("Cargando modo PERFIL");
        data = await fetchDatosAsistenciaMateriaPerfil(
          grupoId, idNormalizado, semestre, materiaClave, selectedYear, selectedMonth, token
        );
      } else if (isMateria) {
        console.log("Cargando modo MATERIA");
        data = await fetchDatosAsistenciaMateria(
          grupoId, materiaClave, selectedYear, selectedMonth, token
        );
      } else {
        console.log("Cargando modo GENERAL");
        data = await fetchDatosAsistencia(
          grupoId, selectedYear, selectedMonth, token
        );
      }

      setEstudiantes(data.estudiantes || []);
      setAsistencias(data.asistencias || []);

    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [grupoId, token, selectedYear, selectedMonth, isPerfil, isMateria, materiaClave, idNormalizado, semestre]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // -----------------------------------------------------------------------
  // GUARDADO DE DATOS (Switch de Servicios)
  // -----------------------------------------------------------------------
  const handleSaveAsistencia = async (estatusAsistencia) => {
    setIsSaving(true);
    try {
      if (isMateria || isPerfil) {
        // Asumiendo que Perfil y Materia usan el mismo endpoint de guardado por materia
        await fetchPostAsistenciaMateria(token, grupoId, materiaClave, estatusAsistencia);
      } else {
        // Modo General
        await fetchPostAsistencia(token, grupoId, estatusAsistencia);
      }
      
      if (showNotification) {
        showNotification("Asistencia guardada con éxito", "success");
      } else {
        alert("Asistencia guardada con éxito");
      }
      
      setModalOpen(false);
      cargarDatos();
    } catch (error) {
      console.error("Error saving:", error);
      if (showNotification) {
        showNotification("Error al guardar asistencia", "error");
      } else {
        alert("Error al guardar asistencia");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // -----------------------------------------------------------------------
  // PROCESAMIENTO DE DATOS (Igual para todos)
  // -----------------------------------------------------------------------
  const asistenciaMap = useMemo(() => {
    const map = {};
    asistencias.forEach((registro) => {
      const fechaKey = new Date(registro.fecha).toISOString().split("T")[0];
      if (!map[fechaKey]) map[fechaKey] = {};
      map[fechaKey][registro.alumno_matricula] = registro.estado;
    });
    return map;
  }, [asistencias]);

  const fechasUnicas = useMemo(
    () => Object.keys(asistenciaMap).sort((a, b) => new Date(a) - new Date(b)),
    [asistenciaMap]
  );

  // -----------------------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------------------
  
  // Título y Subtítulo dinámicos
  const getTitulo = () => {
    if (isPerfil || isMateria) return `Asistencia - ${nombreMateria || materiaClave}`;
    return `Asistencia General - Grupo ${grupoId}`;
  };

  const getSubtitulo = () => {
      if (isPerfil) return `Perfil ${grupoId} (Semestre ${semestre})`;
      if (isMateria) return `Grupo ${grupoId}`;
      return `Vista General`;
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error" align="center" sx={{ my: 4 }}>{error}</Typography>;

  return (
    <Box sx={{ p: 3, height: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
      
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Box>
          <Typography variant="h5">{getTitulo()}</Typography>
          <Typography variant="subtitle1" color="text.secondary">{getSubtitulo()}</Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Mostrando: {new Date(selectedYear, selectedMonth - 1).toLocaleString("es-MX", { month: "long", year: "numeric" })}
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl sx={{ m: 1, minWidth: 100 }} size="small">
            <InputLabel>Año</InputLabel>
            <Select value={selectedYear} label="Año" onChange={(e) => setSelectedYear(e.target.value)}>
              {[0, 1, 2, 3].map((off) => {
                 const y = new Date().getFullYear() - off;
                 return <MenuItem key={y} value={y}>{y}</MenuItem>;
              })}
            </Select>
          </FormControl>

          <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <InputLabel>Mes</InputLabel>
            <Select value={selectedMonth} label="Mes" onChange={(e) => setSelectedMonth(e.target.value)}>
              {Array.from({ length: 12 }, (_, i) => (
                <MenuItem key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString("es-MX", { month: "long" })}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)}>
            Nueva Entrada
          </Button>
        </Stack>
      </Box>

      {/* Tabla */}
      {estudiantes.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <InfoIcon color="action" sx={{ mr: 1, verticalAlign: "middle" }} />
          <Typography variant="subtitle1" component="span">
             No se encontraron estudiantes.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ flexGrow: 1 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {/* --- COLUMNA FIJA (STICKY) DE ALUMNO --- */}
                <TableCell
                  sx={{
                    position: "sticky",
                    left: 0,
                    backgroundColor: "#ffffff", // Fondo sólido necesario
                    zIndex: 101, // Mayor que las celdas normales
                    fontWeight: "bold",
                    minWidth: 250,
                    borderRight: "2px solid rgba(224, 224, 224, 1)",
                    boxShadow: "4px 0px 8px -2px rgba(0,0,0,0.05)",
                  }}
                >
                  Nombre del Estudiante
                </TableCell>
                {/* --- COLUMNAS DE FECHAS --- */}
                {fechasUnicas.map((fecha) => (
                  <TableCell key={fecha} align="center" sx={{ fontWeight: "bold", minWidth: 80 }}>
                    {new Date(fecha + "T00:00:00").toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {estudiantes.map((est) => (
                <TableRow key={est.matricula} hover>
                  {/* --- CELDA FIJA (STICKY) DE ALUMNO EN EL CUERPO --- */}
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{
                      position: "sticky",
                      left: 0,
                      backgroundColor: "#ffffff", // Fondo sólido (IMPORTANTE)
                      zIndex: 1, // Menor que header (101), mayor que resto (0)
                      fontWeight: "500",
                      borderRight: "2px solid rgba(224, 224, 224, 1)",
                      boxShadow: "4px 0px 8px -2px rgba(0,0,0,0.05)",
                    }}
                  >
                    {`${est.apellidop} ${est.apellidom} ${est.nombres}`}
                  </TableCell>
                  
                  {/* --- CELDAS DE ASISTENCIA --- */}
                  {fechasUnicas.map((fecha) => (
                    <TableCell key={`${est.matricula}-${fecha}`} align="center">
                      <IconoEstatus estatus={asistenciaMap[fecha]?.[est.matricula]} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal */}
      <NuevaAsistencia
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        estudiantes={estudiantes}
        onSave={handleSaveAsistencia}
        isSaving={isSaving}
      />
      {NotificationComponent}
    </Box>
  );
};

export default ListaAsistencia;
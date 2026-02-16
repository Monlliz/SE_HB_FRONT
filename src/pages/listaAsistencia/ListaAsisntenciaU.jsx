/**
 * @file ListaAsistenciaUnificada.jsx
 * @description Componente unificado para gestionar asistencias con UI/UX mejorada.
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { obtenerFechaFormateada } from "../../utils/fornatters.js";

// UI Components
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Box,
  Tooltip,
  Button,
  FormControl,
  Select,
  MenuItem,
  Stack,
  Menu,
  ListItemIcon,
  ListItemText,
  Checkbox,
  IconButton,
  Divider,
  Alert
} from "@mui/material";

// Icons (Lógica de negocio)
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import TimelapseIcon from "@mui/icons-material/Timelapse";

// Icons (UI/UX)
import InfoIcon from "@mui/icons-material/Info";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableViewIcon from "@mui/icons-material/TableView";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SettingsIcon from '@mui/icons-material/Settings'; // Para el menú de "Más"
import EmailIcon from '@mui/icons-material/Email';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

// Modal y Notificaciones
import NuevaAsistencia from "../../components/modals/Grupo/NuevaAsistencia";
import { useNotification } from "../../components/modals/NotificationModal.jsx";

// Servicios
import {
  fetchDatosAsistencia,
  fetchPostAsistencia,
  fetchDatosAsistenciaMateria,
  fetchPostAsistenciaMateria,
  fetchDatosAsistenciaMateriaPerfil,
} from "../../services/asistenciaService.js";

import { useExport } from "../../utils/useExport.js";

// --- SUBCOMPONENTE DE ÍCONO (INTACTO) ---
const IconoEstatus = ({ estatus }) => {
  switch (estatus) {
    case "asistio":
      return (
        <Tooltip title="Asistió">
          <CheckCircleIcon color="success" />
        </Tooltip>
      );
    case "falta":
      return (
        <Tooltip title="Faltó">
          <CancelIcon color="error" />
        </Tooltip>
      );
    case "demorado":
      return (
        <Tooltip title="Demora">
          <AccessTimeFilledIcon color="warning" />
        </Tooltip>
      );
    case "antes":
      return (
        <Tooltip title="Se retiró antes">
          <TimelapseIcon color="info" />
        </Tooltip>
      );
    default:
      return <Typography variant="caption" color="text.disabled">-</Typography>;
  }
};

/**
 * Componente Principal Unificado
 */
const ListaAsistencia = () => {
  const { token } = useAuth();
  const location = useLocation();
  const { showNotification, NotificationComponent } = useNotification();
  const { exportar } = useExport();

  // 1. Extracción de parámetros y Detección de MODO
  const {
    grupoId,
    year: initialYear,
    materiaClave,
    nombreMateria,
    idNormalizado,
    semestre,
  } = location.state || {};

  const isPerfil = Boolean(idNormalizado && semestre && materiaClave);
  const isMateria = Boolean(materiaClave && !isPerfil);

  // Estados
  const [modalOpen, setModalOpen] = useState(false);
  const [estudiantes, setEstudiantes] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [correoEnable, setCorreoEnable] = useState(false);
  
  // Estados Menús
  const [anchorElExport, setAnchorElExport] = useState(null);
  const openExportMenu = Boolean(anchorElExport);
  const [anchoDetalles, setAnchoDetalles] = useState(null);
  const openDetallesMenu = Boolean(anchoDetalles);
  
  // Filtros
  const [selectedYear] = useState(initialYear || new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // -----------------------------------------------------------------------
  // CARGA DE DATOS
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
      if (!token) throw new Error("Autorización rechazada.");

      let data;
      if (isPerfil) {
        data = await fetchDatosAsistenciaMateriaPerfil(grupoId, idNormalizado, semestre, materiaClave, selectedYear, selectedMonth, token);
      } else if (isMateria) {
        data = await fetchDatosAsistenciaMateria(grupoId, materiaClave, selectedYear, selectedMonth, token);
      } else {
        data = await fetchDatosAsistencia(grupoId, selectedYear, selectedMonth, token);
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
  // GUARDADO
  // -----------------------------------------------------------------------
  const handleSaveAsistencia = async (estatusAsistencia) => {
    setIsSaving(true);
    try {
      if (isMateria || isPerfil) {
        await fetchPostAsistenciaMateria(token, grupoId, materiaClave, estatusAsistencia);
      } else {
        await fetchPostAsistencia(token, grupoId, estatusAsistencia);
      }
      if (showNotification) showNotification("Asistencia guardada", "success");
      setModalOpen(false);
      cargarDatos();
    } catch (error) {
      console.error("Error saving:", error);
      if (showNotification) showNotification("Error al guardar", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // -----------------------------------------------------------------------
  // PROCESAMIENTO
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
    [asistenciaMap],
  );

  const [selectedDateToEdit, setSelectedDateToEdit] = useState(null);

  const handleEditAsistencia = (fecha) => {
    setSelectedDateToEdit(fecha);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDateToEdit(null);
  };

  //-------------------------------------------------------------------------
  // COPIAR CORREOS
  //-------------------------------------------------------------------------
  const handleCopyEmails = () => {
    if (estudiantes.length === 0) return;
    const correos = estudiantes.map((est) => est.correo).filter((correo) => !!correo).join(", ");

    if (correos) {
      navigator.clipboard.writeText(correos)
        .then(() => { if (showNotification) showNotification("Correos copiados al portapapeles", "success"); })
        .catch(() => { if (showNotification) showNotification("Error al copiar correos", "error"); });
    } else {
      if (showNotification) showNotification("No hay correos para copiar", "info");
    }
  };

  // -----------------------------------------------------------------------
  // MENÚS
  // -----------------------------------------------------------------------
  const handleMenuDetalles = (event) => setAnchoDetalles(event.currentTarget);
  const handleMenuDetallesClose = () => setAnchoDetalles(null);
  const handleExportClick = (event) => setAnchorElExport(event.currentTarget);
  const handleExportClose = () => setAnchorElExport(null);

  const getTituloDocumento = () => {
    const mat = nombreMateria || materiaClave || "General";
    return `Lista: ${mat} - Grupo: ${grupoId} - ${selectedYear}`;
  };

  // Exportar CON DATOS
  const handleExportData = (format) => {
    if (estudiantes.length === 0) { alert("No hay estudiantes."); return; }
    const dataExport = estudiantes.map((est) => {
      const row = {
        Matrícula: est.matricula,
        "Nombre Completo": `${est.apellidop} ${est.apellidom} ${est.nombres}`,
      };
      fechasUnicas.forEach((fecha) => {
        const estado = asistenciaMap[fecha]?.[est.matricula];
        let textoEstado = "-";
        if (estado === "asistio") textoEstado = "A";
        if (estado === "falta") textoEstado = "F";
        if (estado === "demorado") textoEstado = "R";
        if (estado === "antes") textoEstado = "S.A";
        row[fecha] = textoEstado;
      });
      return row;
    });
    exportar(dataExport, getTituloDocumento(), format);
    handleExportClose();
  };

  // Exportar VACÍA
  const handleExportVacia = (format) => {
    if (estudiantes.length === 0) { alert("No hay estudiantes."); return; }
    const dataExport = estudiantes.map((est) => ({
      Matrícula: est.matricula,
      "Nombre del Estudiante": `${est.apellidop} ${est.apellidom} ${est.nombres}`,
    }));
    const titulo = `LISTA DE ASISTENCIA - ${nombreMateria || "General"} - Gpo ${grupoId}`;
    exportar(dataExport, titulo, format);
    handleExportClose();
  };

  // Títulos
  const getTitulo = () => (isPerfil || isMateria) ? `Asistencia - ${nombreMateria || materiaClave}` : `Asistencia General - Grupo ${grupoId}`;
  const getSubtitulo = () => {
    if (isPerfil) return `Perfil ${grupoId} (Semestre ${semestre})`;
    if (isMateria) return `Grupo ${grupoId}`;
    return `Vista General`;
  };

  // -----------------------------------------------------------------------
  // RENDER UI ACTUALIZADA
  // -----------------------------------------------------------------------
  return (
    <Box sx={{ 
      p: 3, 
      height: "calc(100vh - 64px)", 
      bgcolor: "#f4f6f8", // Fondo gris suave
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* HEADER TIPO TARJETA */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          mb: 2, 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          borderRadius: 2,
          border: '1px solid #e0e0e0'
        }}
      >
        {/* IZQUIERDA: TÍTULOS E INFO */}
        <Box>
          <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonthIcon fontSize="small"/> {getTitulo()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {getSubtitulo()}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
            <EventAvailableIcon fontSize="small" color="disabled" sx={{ fontSize: 16 }} />
            <Typography variant="caption" color="text.secondary">
              Mostrando: {obtenerFechaFormateada(true)}
            </Typography>
          </Stack>
        </Box>

        {/* DERECHA: ACCIONES Y FILTROS */}
        <Stack direction="row" spacing={2} alignItems="center">
          
          {/* Selector de Mes (Estilo minimalista) */}
          <FormControl variant="standard" sx={{ minWidth: 120 }}>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              disableUnderline
              sx={{ fontWeight: 'bold', color: 'text.primary' }}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <MenuItem key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("es-MX", { month: "long" })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider orientation="vertical" flexItem sx={{ height: 20, alignSelf: 'center' }} />

          {/* Botones de Icono */}
          <Tooltip title="Configuración de vista">
            <IconButton onClick={handleMenuDetalles} size="small">
              <SettingsIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Exportar Lista">
            <IconButton onClick={handleExportClick} size="small" color="secondary">
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>

          {/* Botón Principal */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setModalOpen(true)}
            sx={{ borderRadius: 2, textTransform: 'none', px: 3, boxShadow: 'none' }}
          >
            Nueva Entrada
          </Button>

          {/* --- MENÚS DESPLEGABLES (Ocultos visualmente hasta activarse) --- */}
          <Menu anchorEl={anchorElExport} open={openExportMenu} onClose={handleExportClose}>
            <MenuItem disabled><Typography variant="caption">Reporte Actual</Typography></MenuItem>
            <MenuItem onClick={() => handleExportData("xlsx")}>
              <ListItemIcon><TableViewIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Excel (Con Datos)</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleExportData("pdf")}>
              <ListItemIcon><PictureAsPdfIcon fontSize="small" /></ListItemIcon>
              <ListItemText>PDF (Con Datos)</ListItemText>
            </MenuItem>
            <MenuItem disabled sx={{ mt: 1 }}><Typography variant="caption">Lista en Blanco</Typography></MenuItem>
            <MenuItem onClick={() => handleExportVacia("pdf")}>
              <ListItemIcon><PictureAsPdfIcon fontSize="small" /></ListItemIcon>
              <ListItemText>PDF (Lista Vacía)</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleExportVacia("xlsx")}>
              <ListItemIcon><TableViewIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Excel (Lista Vacía)</ListItemText>
            </MenuItem>
          </Menu>

          <Menu anchorEl={anchoDetalles} open={openDetallesMenu} onClose={handleMenuDetallesClose}>
            <MenuItem onClick={() => { setCorreoEnable(!correoEnable); handleMenuDetallesClose(); }}>
              <Checkbox checked={correoEnable} size="small" />
              <ListItemText>Mostrar Correos</ListItemText>
            </MenuItem>
          </Menu>
        </Stack>
      </Paper>

      {/* ESTADO DE CARGA Y ERROR */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {/* TABLA PRINCIPAL */}
      {!loading && !error && (
        estudiantes.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
            <InfoIcon color="action" sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
            <Typography variant="subtitle1" color="text.secondary">
              No se encontraron estudiantes en este grupo.
            </Typography>
          </Paper>
        ) : (
          <Paper 
            elevation={2} 
            sx={{ 
              flexGrow: 1, 
              overflow: "hidden", 
              borderRadius: 2, 
              display: 'flex', 
              flexDirection: 'column' 
            }}
          >
            <TableContainer sx={{ flexGrow: 1 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {/* Columna Correo (Opcional) */}
                    {correoEnable && (
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          bgcolor: '#f5f5f5',
                          minWidth: 200,
                          cursor: "pointer",
                          borderBottom: '2px solid #e0e0e0',
                          "&:hover": { backgroundColor: "#eeeeee" },
                        }}
                        onClick={handleCopyEmails}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <EmailIcon fontSize="small" color="action" /> Correo
                        </Box>
                      </TableCell>
                    )}

                    {/* Columna Nombre (Sticky) */}
                    <TableCell
                      sx={{
                        position: "sticky",
                        left: 0,
                        backgroundColor: "#fcfcfc",
                        zIndex: 101,
                        fontWeight: "bold",
                        minWidth: 250,
                        borderRight: "2px solid #e0e0e0",
                        borderBottom: '2px solid #e0e0e0',
                        color: 'text.secondary'
                      }}
                    >
                      ESTUDIANTE
                    </TableCell>

                    {/* Columnas Fechas */}
                    {fechasUnicas.map((fecha) => (
                      <TableCell
                        key={fecha}
                        align="center"
                        sx={{ 
                          fontWeight: "bold", 
                          minWidth: 80, 
                          cursor: "pointer",
                          bgcolor: '#fcfcfc',
                          borderBottom: '2px solid #e0e0e0',
                          color: 'text.secondary',
                          "&:hover": { bgcolor: "#f0f0f0" }
                        }}
                        onClick={() => handleEditAsistencia(fecha)}
                      >
                        <Tooltip title="Editar asistencia de este día">
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', color: '#000' }}>
                              {new Date(fecha + "T00:00:00").toLocaleDateString("es-MX", { day: "2-digit" })}
                            </span>
                            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>
                              {new Date(fecha + "T00:00:00").toLocaleDateString("es-MX", { month: "short" })}
                            </span>
                          </Box>
                        </Tooltip>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {estudiantes.map((est, index) => (
                    <TableRow 
                      key={est.matricula} 
                      hover
                      sx={{ bgcolor: index % 2 === 0 ? 'white' : '#fafafa' }}
                    >
                      {correoEnable && (
                        <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                          {est.correo || "-"}
                        </TableCell>
                      )}

                      <TableCell
                        component="th"
                        scope="row"
                        sx={{
                          position: "sticky",
                          left: 0,
                          bgcolor: index % 2 === 0 ? 'white' : '#fafafa',
                          zIndex: 100,
                          fontWeight: "500",
                          borderRight: "1px solid #f0f0f0",
                          fontSize: '0.85rem'
                        }}
                      >
                        {`${est.apellidop} ${est.apellidom} ${est.nombres}`}
                      </TableCell>

                      {fechasUnicas.map((fecha) => (
                        <TableCell 
                          key={`${est.matricula}-${fecha}`} 
                          align="center"
                          sx={{ p: 0.5 }}
                        >
                          <IconoEstatus estatus={asistenciaMap[fecha]?.[est.matricula]} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )
      )}

      {/* Modales y Notificaciones */}
      <NuevaAsistencia
        open={modalOpen}
        onClose={handleCloseModal}
        estudiantes={estudiantes}
        onSave={handleSaveAsistencia}
        editDate={selectedDateToEdit}
        isSaving={isSaving}
        asistenciaActual={selectedDateToEdit ? asistenciaMap[selectedDateToEdit] : {}}
      />
      {NotificationComponent}
    </Box>
  );
};

export default ListaAsistencia;
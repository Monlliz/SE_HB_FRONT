/**
 * @file ListaAsistenciaUnificada.jsx
 * @description Componente unificado y optimizado para gestionar asistencias (Alumnos y Docentes).
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
  Alert,
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
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SettingsIcon from "@mui/icons-material/Settings";
import EmailIcon from "@mui/icons-material/Email";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";

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
  fetchDatosAsistenciaDocente,
  fetchPostAsistenciaDocente,
} from "../../services/asistenciaService.js";

import { useExport } from "../../utils/useExport.js";

// --- HELPERS (Fuera del componente para evitar recreación) ---

/**
 * Normaliza y ordena la lista de usuarios (alumnos o docentes).
 * Crea una estructura común: { uid, nombreCompleto, email, ...datosOriginales }
 */
const prepararDatosUsuario = (listaCruda, esDocente) => {
  if (!listaCruda) return [];

  return listaCruda
    .map((usuario) => {
      // Normalización de datos
      const uid = esDocente ? usuario.iddocente : usuario.matricula;
      const nombreCompleto = `${usuario.apellidop || ""} ${usuario.apellidom || ""} ${usuario.nombres || ""}`.trim();
      const email = usuario.correo || "";

      return {
        ...usuario, // Mantenemos datos originales por si acaso
        uid,        // ID Unificado para la UI
        nombreCompleto, // Nombre listo para mostrar
        email,      // Email listo
      };
    })
    .sort((a, b) => 
      // Ordenamiento robusto (ignora mayúsculas/tildes)
      a.nombreCompleto.localeCompare(b.nombreCompleto, 'es', { sensitivity: 'base' })
    );
};

// --- SUBCOMPONENTE DE ÍCONO ---
const IconoEstatus = React.memo(({ estatus }) => {
  switch (estatus) {
    case "asistio":
    case "Presente":
      return (
        <Tooltip title="Asistió">
          <CheckCircleIcon color="success" />
        </Tooltip>
      );
    case "falta":
    case "Ausente":
      return (
        <Tooltip title="Faltó">
          <CancelIcon color="error" />
        </Tooltip>
      );
    case "demorado":
    case "Retardo":
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
      return (
        <Typography variant="caption" color="text.disabled">
          -
        </Typography>
      );
  }
});

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
  const isDocente = Boolean(grupoId === "docente");

  // Estados
  const [modalOpen, setModalOpen] = useState(false);
  const [estudiantes, setEstudiantes] = useState([]); // Lista normalizada { uid, nombreCompleto, ... }
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
  // CARGA DE DATOS (OPTIMIZADA)
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

      let listaCruda = [];
      let asistenciasCrudas = [];

      // Selección de servicio según el caso
      if (isDocente) {
        const result = await fetchDatosAsistenciaDocente(selectedYear, selectedMonth, token);
        listaCruda = (result.docentes || []).filter((d) => d.activo === true);
        asistenciasCrudas = result.asistencias || [];
      } else if (isPerfil) {
        const data = await fetchDatosAsistenciaMateriaPerfil(
          grupoId, idNormalizado, semestre, materiaClave, selectedYear, selectedMonth, token
        );
        listaCruda = data.estudiantes || [];
        asistenciasCrudas = data.asistencias || [];
      } else if (isMateria) {
        const data = await fetchDatosAsistenciaMateria(
          grupoId, materiaClave, selectedYear, selectedMonth, token
        );
        listaCruda = data.estudiantes || [];
        asistenciasCrudas = data.asistencias || [];
      } else {
        const data = await fetchDatosAsistencia(grupoId, selectedYear, selectedMonth, token);
        listaCruda = data.estudiantes || [];
        asistenciasCrudas = data.asistencias || [];
      }

      // Procesamiento unificado (Normaliza y Ordena aquí mismo)
      const listaProcesada = prepararDatosUsuario(listaCruda, isDocente);
      
      setEstudiantes(listaProcesada);
      setAsistencias(asistenciasCrudas);

    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError(err.message || "Error al cargar la lista");
    } finally {
      setLoading(false);
    }
  }, [grupoId, token, selectedYear, selectedMonth, isPerfil, isMateria, isDocente, materiaClave, idNormalizado, semestre]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // -----------------------------------------------------------------------
  // GUARDADO
  // -----------------------------------------------------------------------
  const handleSaveAsistencia = async (datosDesdeModal) => {
    setIsSaving(true);
    try {
      const fechaParaGuardar = datosDesdeModal.fecha || new Date().toISOString().split("T")[0];
      const mapaEstados = datosDesdeModal.asistencias || datosDesdeModal;

      if (isDocente) {
        const registros = Object.entries(mapaEstados).map(([id, estado]) => ({
          docente_id: parseInt(id),
          estado: estado,
        }));

        await fetchPostAsistenciaDocente(token, {
          fecha: fechaParaGuardar,
          registros: registros.filter((r) => !isNaN(r.docente_id)),
        });
      } else {
        const registrosAlumnos = Object.entries(mapaEstados).map(([matricula, estatus]) => ({
          matricula: matricula,
          estatus: estatus,
        }));

        const payloadAlumnos = {
          fecha: fechaParaGuardar,
          registros: registrosAlumnos,
        };

        if (isMateria || isPerfil) {
          await fetchPostAsistenciaMateria(token, grupoId, materiaClave, payloadAlumnos);
        } else {
          await fetchPostAsistencia(token, grupoId, payloadAlumnos);
        }
      }

      if (showNotification) showNotification("Asistencia guardada", "success");
      setModalOpen(false);
      cargarDatos();
    } catch (error) {
      console.error("Error saving:", error);
      if (showNotification) showNotification("Error al guardar: " + error.message, "error");
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
      // Determinar ID según el modo
      const userId = isDocente ? registro.docente_id : registro.alumno_matricula;

      if (!map[fechaKey]) map[fechaKey] = {};
      map[fechaKey][userId] = registro.estado;
    });
    return map;
  }, [asistencias, isDocente]);

  const fechasUnicas = useMemo(
    () => Object.keys(asistenciaMap).sort((a, b) => new Date(a) - new Date(b)),
    [asistenciaMap]
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
    const correos = estudiantes
      .map((est) => est.email) // Usamos la propiedad normalizada
      .filter((email) => !!email)
      .join(", ");

    if (correos) {
      navigator.clipboard.writeText(correos)
        .then(() => showNotification && showNotification("Correos copiados", "success"))
        .catch(() => showNotification && showNotification("Error al copiar", "error"));
    } else {
      showNotification && showNotification("No hay correos", "info");
    }
  };

  // -----------------------------------------------------------------------
  // MENÚS Y EXPORTACIÓN
  // -----------------------------------------------------------------------
  const handleMenuDetalles = (event) => setAnchoDetalles(event.currentTarget);
  const handleMenuDetallesClose = () => setAnchoDetalles(null);
  const handleExportClick = (event) => setAnchorElExport(event.currentTarget);
  const handleExportClose = () => setAnchorElExport(null);

  const getTituloDocumento = () => {
    if (isDocente) return `Asistencia Docentes - ${selectedYear}`;
    const mat = nombreMateria || materiaClave || "General";
    return `Lista: ${mat} - Grupo: ${grupoId} - ${selectedYear}`;
  };

  // Exportar CON DATOS (Simplificado)
  const handleExportData = (format) => {
    if (estudiantes.length === 0) return alert("Sin datos para exportar.");

    const dataExport = estudiantes.map((est) => {
      const row = {
        ID: est.uid,
        "Nombre Completo": est.nombreCompleto,
      };
      
      fechasUnicas.forEach((fecha) => {
        const estado = asistenciaMap[fecha]?.[est.uid];
        // Normalización visual de estados
        let textoEstado = "-";
        const e = estado ? estado.toLowerCase() : "";
        if (e.includes("asistio") || e.includes("presente")) textoEstado = "A";
        if (e.includes("falta") || e.includes("ausente")) textoEstado = "F";
        if (e.includes("demora") || e.includes("retardo")) textoEstado = "R";
        if (e.includes("antes")) textoEstado = "S.A";

        row[fecha] = textoEstado;
      });
      return row;
    });
    exportar(dataExport, getTituloDocumento(), format);
    handleExportClose();
  };

  // Exportar VACÍA (Simplificado)
  const handleExportVacia = (format) => {
    if (estudiantes.length === 0) return alert("Sin datos.");

    const dataExport = estudiantes.map((est) => ({
      ID: est.uid,
      Nombre: est.nombreCompleto,
    }));
    
    exportar(dataExport, getTituloDocumento(), format);
    handleExportClose();
  };

  // Títulos UI
  const getTitulo = () => {
    if (isDocente) return "Control de Asistencia Docente";
    return isPerfil || isMateria
      ? `Asistencia - ${nombreMateria || materiaClave}`
      : `Asistencia General - Grupo ${grupoId}`;
  };

  const getSubtitulo = () => {
    if (isDocente) return `Registro de entradas y salidas - ${selectedYear}`;
    if (isPerfil) return `Perfil ${grupoId} (Semestre ${semestre})`;
    if (isMateria) return `Grupo ${grupoId}`;
    return `Vista General`;
  };

  // -----------------------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------------------
  return (
    <Box sx={{ p: 3, height: "calc(100vh - 64px)", bgcolor: "#f4f6f8", display: "flex", flexDirection: "column" }}>
      {/* HEADER */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: 2, border: "1px solid #e0e0e0" }}>
        <Box>
          <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarMonthIcon fontSize="small" /> {getTitulo()}
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

        <Stack direction="row" spacing={2} alignItems="center">
          {/* Selector de Mes */}
          <FormControl variant="standard" sx={{ minWidth: 120 }}>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              disableUnderline
              sx={{ fontWeight: "bold", color: "text.primary" }}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <MenuItem key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("es-MX", { month: "long" })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider orientation="vertical" flexItem sx={{ height: 20, alignSelf: "center" }} />

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

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setModalOpen(true)}
            sx={{ borderRadius: 2, textTransform: "none", px: 3, boxShadow: "none" }}
          >
            Nueva Entrada
          </Button>

          {/* MENÚS */}
          <Menu anchorEl={anchorElExport} open={openExportMenu} onClose={handleExportClose}>
            <MenuItem onClick={() => handleExportData("xlsx")}>
              <ListItemIcon><TableViewIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Excel (Con Datos)</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleExportData("pdf")}>
              <ListItemIcon><PictureAsPdfIcon fontSize="small" /></ListItemIcon>
              <ListItemText>PDF (Con Datos)</ListItemText>
            </MenuItem>
            <Divider />
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

      {/* ALERT MODO DOCENTE */}
      {isDocente && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Estás viendo la lista de asistencias en modo <strong>Docente</strong>.
        </Alert>
      )}

      {/* LOADING & ERROR */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* TABLA */}
      {!loading && !error && (
        estudiantes.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
            <InfoIcon color="action" sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
            <Typography variant="subtitle1" color="text.secondary">
              No se encontraron registros.
            </Typography>
          </Paper>
        ) : (
          <Paper elevation={2} sx={{ flexGrow: 1, overflow: "hidden", borderRadius: 2, display: "flex", flexDirection: "column" }}>
            <TableContainer sx={{ flexGrow: 1 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {/* Columna Correo */}
                    {correoEnable && (
                      <TableCell
                        sx={{ fontWeight: "bold", bgcolor: "#f5f5f5", minWidth: 200, cursor: "pointer" }}
                        onClick={handleCopyEmails}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <EmailIcon fontSize="small" color="action" /> Correo
                        </Box>
                      </TableCell>
                    )}

                    {/* Columna Nombre */}
                    <TableCell
                      sx={{ position: "sticky", left: 0, bgcolor: "#fcfcfc", zIndex: 101, fontWeight: "bold", minWidth: 250, borderRight: "2px solid #e0e0e0" }}
                    >
                      {isDocente ? "DOCENTE" : "ESTUDIANTE"}
                    </TableCell>

                    {/* Columnas Fechas */}
                    {fechasUnicas.map((fecha) => (
                      <TableCell
                        key={fecha}
                        align="center"
                        sx={{ fontWeight: "bold", minWidth: 80, cursor: "pointer", bgcolor: "#fcfcfc", "&:hover": { bgcolor: "#f0f0f0" } }}
                        onClick={() => handleEditAsistencia(fecha)}
                      >
                        <Tooltip title="Editar asistencia">
                          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <span style={{ fontSize: "0.9rem", color: "#000" }}>
                              {new Date(fecha + "T00:00:00").toLocaleDateString("es-MX", { day: "2-digit" })}
                            </span>
                            <span style={{ fontSize: "0.65rem", textTransform: "uppercase" }}>
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
                    <TableRow key={est.uid} hover sx={{ bgcolor: index % 2 === 0 ? "white" : "#fafafa" }}>
                      
                      {/* Celda Correo */}
                      {correoEnable && (
                        <TableCell sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                          {est.email || "-"}
                        </TableCell>
                      )}

                      {/* Celda Nombre */}
                      <TableCell
                        component="th"
                        scope="row"
                        sx={{ position: "sticky", left: 0, bgcolor: index % 2 === 0 ? "white" : "#fafafa", zIndex: 100, fontWeight: "500", borderRight: "1px solid #f0f0f0", fontSize: "0.85rem" }}
                      >
                        {est.nombreCompleto}
                      </TableCell>

                      {/* Celdas Estados */}
                      {fechasUnicas.map((fecha) => (
                        <TableCell key={`${est.uid}-${fecha}`} align="center" sx={{ p: 0.5 }}>
                          <IconoEstatus estatus={asistenciaMap[fecha]?.[est.uid]} />
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

      {/* Modal */}
      <NuevaAsistencia
        open={modalOpen}
        onClose={handleCloseModal}
        estudiantes={estudiantes} // La lista ya está normalizada, asegúrate que tu modal soporte { uid, nombreCompleto }
        onSave={handleSaveAsistencia}
        editDate={selectedDateToEdit}
        isSaving={isSaving}
        asistenciaActual={selectedDateToEdit ? asistenciaMap[selectedDateToEdit] : {}}
        isDocente={isDocente}
      />
      {NotificationComponent}
    </Box>
  );
};

export default ListaAsistencia;
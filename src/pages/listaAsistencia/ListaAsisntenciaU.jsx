/**
 * @file ListaAsistenciaUnificada.jsx
 * @description Componente unificado para gestionar asistencias (General, Materia y Perfil).
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
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Menu,
  ListItemIcon,
  ListItemText,
  Checkbox,
} from "@mui/material";

// Icons
import AddIcon from "@mui/icons-material/Add";
//listas de asistencia
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import TimelapseIcon from "@mui/icons-material/Timelapse";
//--------------------------------------------------------------------------
import InfoIcon from "@mui/icons-material/Info";
import FileDownloadIcon from "@mui/icons-material/FileDownload"; // Nuevo
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"; // Nuevo
import TableViewIcon from "@mui/icons-material/TableView"; // Nuevo

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

// Importar Hook de Exportación (Asegúrate de la ruta correcta)
import { useExport } from "../../utils/useExport.js";

// --- SUBCOMPONENTE DE ÍCONO ---
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
      return <Typography variant="caption">-</Typography>;
  }
};

/**
 * Componente Principal Unificado
 */
const ListaAsistencia = () => {
  const { token } = useAuth();
  const location = useLocation();
  const { showNotification, NotificationComponent } = useNotification();
  const { exportar } = useExport(); // Usamos el hook

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
  const isGeneral = Boolean(!materiaClave);

  // Estados
  const [modalOpen, setModalOpen] = useState(false);
  const [estudiantes, setEstudiantes] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [correoEnable, setCorreoEnable] = useState(false);
  // Estados para el Menú de Exportación
  const [anchorElExport, setAnchorElExport] = useState(null);
  const openExportMenu = Boolean(anchorElExport);
  const [anchoDetalles, setAnchoDetalles] = useState(null);
  const openDetallesMenu = Boolean(anchoDetalles);
  // Filtros de fecha
  const [selectedYear, setSelectedYear] = useState(
    initialYear || new Date().getFullYear(),
  );
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
        data = await fetchDatosAsistenciaMateriaPerfil(
          grupoId,
          idNormalizado,
          semestre,
          materiaClave,
          selectedYear,
          selectedMonth,
          token,
        );
      } else if (isMateria) {
        data = await fetchDatosAsistenciaMateria(
          grupoId,
          materiaClave,
          selectedYear,
          selectedMonth,
          token,
        );
      } else {
        data = await fetchDatosAsistencia(
          grupoId,
          selectedYear,
          selectedMonth,
          token,
        );
      }

      setEstudiantes(data.estudiantes || []);
      console.log(data.estudiantes);
      setAsistencias(data.asistencias || []);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [
    grupoId,
    token,
    selectedYear,
    selectedMonth,
    isPerfil,
    isMateria,
    materiaClave,
    idNormalizado,
    semestre,
  ]);

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
        await fetchPostAsistenciaMateria(
          token,
          grupoId,
          materiaClave,
          estatusAsistencia,
        );
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

    // Filtrar estudiantes que tengan correo y unirlos por coma o salto de línea
    const correos = estudiantes
      .map((est) => est.correo)
      .filter((correo) => !!correo)
      .join(", ");

    if (correos) {
      navigator.clipboard
        .writeText(correos)
        .then(() => {
          if (showNotification)
            showNotification("Correos copiados al portapapeles", "success");
        })
        .catch(() => {
          if (showNotification)
            showNotification("Error al copiar correos", "error");
        });
    } else {
      if (showNotification)
        showNotification("No hay correos para copiar", "info");
    }
  };

  // -----------------------------------------------------------------------
  // LÓGICA DE menu detalles
  // -----------------------------------------------------------------------
  const handleMenuDetalles = (event) => {
    setAnchoDetalles(event.currentTarget);
  };
  const handleMenuDetallesClose = () => {
    setAnchoDetalles(null);
  };

  // -----------------------------------------------------------------------
  // LÓGICA DE EXPORTACIÓN
  // -----------------------------------------------------------------------
  const handleExportClick = (event) => {
    setAnchorElExport(event.currentTarget);
  };
  const handleExportClose = () => {
    setAnchorElExport(null);
  };

  const getNombreArchivoBase = (tipo) => {
    // Genera un nombre como: Asistencia_Matematicas_GrupoA_Reporte
    const mat = nombreMateria || materiaClave || "General";
    const mesStr = new Date(selectedYear, selectedMonth - 1).toLocaleString(
      "es-MX",
      { month: "long" },
    );
    return `Asistencia_${mat}_Gpo${grupoId}_${mesStr}_${tipo}`;
  };

  const getTituloDocumento = () => {
    const mat = nombreMateria || materiaClave || "General";
    // Este string aparecerá en el encabezado del PDF (gracias a tu hook)
    return `Lista: ${mat} - Grupo: ${grupoId} - ${selectedYear}`;
  };

  // Opción 1: Exportar CON DATOS (Reporte Mensual)
  const handleExportData = (format) => {
    if (estudiantes.length === 0) {
      alert("No hay estudiantes para exportar.");
      return;
    }

    // Transformamos los datos para que sean planos
    const dataExport = estudiantes.map((est) => {
      const row = {
        Matrícula: est.matricula,
        "Nombre Completo": `${est.apellidop} ${est.apellidom} ${est.nombres}`,
      };

      // Añadimos columnas dinámicas por fecha
      fechasUnicas.forEach((fecha) => {
        const estado = asistenciaMap[fecha]?.[est.matricula];
        // Convertimos códigos a texto legible
        let textoEstado = "-";
        if (estado === "asistio") textoEstado = "A"; // O "Asistencia"
        if (estado === "falta") textoEstado = "F";
        if (estado === "demorado") textoEstado = "R"; // Retardo
        if (estado === "antes") textoEstado = "S.A"; // Salida Anticipada

        row[fecha] = textoEstado;
      });

      return row;
    });

    const titulo = getTituloDocumento(); // Usamos el título como "FileNameBase" para el PDF
    exportar(dataExport, titulo, format);
    handleExportClose();
  };

  // Opción 2: Exportar LISTA VACÍA (Formato para imprimir)
  const handleExportVacia = (format) => {
    if (estudiantes.length === 0) {
      alert("No hay estudiantes.");
      return;
    }

    // Creamos columnas vacías para que el profe llene a mano

    const dataExport = estudiantes.map((est) => {
      const row = {
        Matrícula: est.matricula,
        "Nombre del Estudiante": `${est.apellidop} ${est.apellidom} ${est.nombres}`,
      };

      return row;
    });

    // El nombre del archivo servirá de encabezado en el PDF
    const titulo = `LISTA DE ASISTENCIA - ${nombreMateria || "General"} - Gpo ${grupoId}`;
    exportar(dataExport, titulo, format);
    handleExportClose();
  };

  // -----------------------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------------------

  const getTitulo = () => {
    if (isPerfil || isMateria)
      return `Asistencia - ${nombreMateria || materiaClave}`;
    return `Asistencia General - Grupo ${grupoId}`;
  };

  const getSubtitulo = () => {
    if (isPerfil) return `Perfil ${grupoId} (Semestre ${semestre})`;
    if (isMateria) return `Grupo ${grupoId}`;
    return `Vista General`;
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Typography color="error" align="center" sx={{ my: 4 }}>
        {error}
      </Typography>
    );

  return (
    <Box
      sx={{
        p: 3,
        height: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Box>
          <Typography variant="h5">{getTitulo()}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {getSubtitulo()}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Mostrando: {obtenerFechaFormateada(true)}{" "}
            {/* Usamos la función formateadora para mostrar el mes y año, usando true como parametro, sin paraetros, la muestra completa */}
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          {/* --- SELECTORES DE FECHA EXISTENTES (Resumido) --- */}
          {/*<FormControl sx={{ m: 1, minWidth: 100 }} size="small">
             <InputLabel>Año</InputLabel>
             <Select value={selectedYear} label="Año" onChange={(e) => setSelectedYear(e.target.value)}>
               {[0, 1, 2, 3].map((off) => <MenuItem key={off} value={new Date().getFullYear() - off}>{new Date().getFullYear() - off}</MenuItem>)}
             </Select>
           </FormControl>*/}

          <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <InputLabel>Mes</InputLabel>
            <Select
              value={selectedMonth}
              label="Mes"
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <MenuItem key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("es-MX", { month: "long" })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* --- BOTÓN NUEVA ENTRADA --- */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setModalOpen(true)}
          >
            Nueva Entrada
          </Button>
          {/* --- BOTÓN Filtros --- */}
          <Button
            variant="outlined"
            onClick={handleMenuDetalles}
            color="primary"
          >
            Mas
          </Button>

          {/* --- BOTÓN EXPORTAR --- */}
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportClick}
            color="secondary"
          >
            Exportar
          </Button>

          {/* --- MENÚ DESPLEGABLE DE EXPORTACIÓN --- */}
          <Menu
            anchorEl={anchorElExport}
            open={openExportMenu}
            onClose={handleExportClose}
          >
            <MenuItem disabled>
              <Typography variant="caption">Reporte Actual</Typography>
            </MenuItem>
            <MenuItem onClick={() => handleExportData("xlsx")}>
              <ListItemIcon>
                <TableViewIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Excel (Con Datos)</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleExportData("pdf")}>
              <ListItemIcon>
                <PictureAsPdfIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>PDF (Con Datos)</ListItemText>
            </MenuItem>

            <MenuItem disabled sx={{ mt: 1 }}>
              <Typography variant="caption">Lista en Blanco</Typography>
            </MenuItem>
            <MenuItem onClick={() => handleExportVacia("pdf")}>
              <ListItemIcon>
                <PictureAsPdfIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>PDF (Lista Vacía)</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleExportVacia("xlsx")}>
              <ListItemIcon>
                <TableViewIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Excel (Lista Vacía)</ListItemText>
            </MenuItem>
          </Menu>

          {/* Menu detalles */}
          <Menu
            anchorEl={anchoDetalles}
            open={openDetallesMenu}
            onClose={handleMenuDetallesClose}
            // Estas propiedades aseguran que el menú aparezca justo debajo del botón
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
          >
            <MenuItem
              onClick={() => {
                setCorreoEnable(!correoEnable);
                handleMenuDetallesClose();
              }}
            >
              <Checkbox checked={correoEnable} />
              <ListItemText>Mostrar Columna de Correos</ListItemText>
            </MenuItem>
          </Menu>
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
                {correoEnable && (
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      minWidth: 200,
                      cursor: "pointer",
                      backgroundColor: "#f5f5f5", // Un color ligero para indicar que es interactivo
                      "&:hover": { backgroundColor: "#eeeeee" },
                    }}
                    onClick={handleCopyEmails} // <--- Evento de click para copiar
                  >
                    <Tooltip title="Click para copiar todos los correos">
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        Correo <InfoIcon fontSize="inherit" />
                      </Box>
                    </Tooltip>
                  </TableCell>
                )}

                <TableCell
                  sx={{
                    position: "sticky",
                    left: 0,
                    backgroundColor: "#ffffff",
                    zIndex: 101,
                    fontWeight: "bold",
                    minWidth: 250,
                    borderRight: "2px solid rgba(224, 224, 224, 1)",
                    boxShadow: "4px 0px 8px -2px rgba(0,0,0,0.05)",
                  }}
                >
                  Nombre del Estudiante
                </TableCell>
                {fechasUnicas.map((fecha) => (
                  <TableCell
                    key={fecha}
                    align="center"
                    sx={{ fontWeight: "bold", minWidth: 80 }}
                    onClick={() => handleEditAsistencia(fecha)}
                    style={{ cursor: "pointer" }}
                  >
                    <Tooltip title="Click para editar">
                      <span>
                        {new Date(fecha + "T00:00:00").toLocaleDateString(
                          "es-MX",
                          { day: "2-digit", month: "short" },
                        )}
                      </span>
                    </Tooltip>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {estudiantes.map((est) => (
                <TableRow key={est.matricula} hover>
                  {correoEnable ? (
                    <TableCell sx={{ fontWeight: "bold", minWidth: 200 }}>
                      {est.correo || "Sin Correo"}
                    </TableCell>
                  ) : null}
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{
                      position: "sticky",
                      left: 0,
                      backgroundColor: "#ffffff",
                      zIndex: 1,
                      fontWeight: "500",
                      borderRight: "2px solid rgba(224, 224, 224, 1)",
                      boxShadow: "4px 0px 8px -2px rgba(0,0,0,0.05)",
                    }}
                  >
                    {`${est.apellidop} ${est.apellidom} ${est.nombres}`}
                  </TableCell>
                  {fechasUnicas.map((fecha) => (
                    <TableCell key={`${est.matricula}-${fecha}`} align="center">
                      <IconoEstatus
                        estatus={asistenciaMap[fecha]?.[est.matricula]}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modals */}
      <NuevaAsistencia
        open={modalOpen}
        onClose={handleCloseModal}
        estudiantes={estudiantes}
        onSave={handleSaveAsistencia}
        editDate={selectedDateToEdit}
        isSaving={isSaving}
        asistenciaActual={
          selectedDateToEdit ? asistenciaMap[selectedDateToEdit] : {}
        }
      />
      {NotificationComponent}
    </Box>
  );
};

export default ListaAsistencia;

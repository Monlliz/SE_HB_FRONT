/**
 * @file ListaAsistenciaMateria.jsx
 * @description Componente para visualizar y registrar la asistencia de un grupo de estudiantes.
 */

// Importaciones de React y hooks para estado, efectos, memoización y contexto.
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom"; // Hook para acceder a datos de la navegación.
import { useAuth } from "../context/AuthContext.jsx";
// Importaciones de componentes y iconos de Material-UI.
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DescriptionIcon from "@mui/icons-material/Description";
import InfoIcon from "@mui/icons-material/Info";

// Importación del modal y de los servicios de la API.
import NuevaAsistencia from "./modals/Grupo/NuevaAsistencia";
import {
  fetchDatosAsistenciaMateria,
  fetchPostAsistenciaMateria,
} from "./services/asistenciaService.js";

/**
 * Componente funcional para renderizar un ícono basado en el estado de la asistencia.
 * @param {{ estatus: string }} props - El estado de la asistencia ('asistio', 'falta', etc.).
 * @returns {JSX.Element} Un ícono con un Tooltip descriptivo.
 */
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
          <DescriptionIcon color="warning" />
        </Tooltip>
      );
    case "antes":
      return (
        <Tooltip title="Se retiró antes">
          <DescriptionIcon color="info" />
        </Tooltip>
      );
    default:
      // Si no hay un estado definido, muestra un guion.
      return <Typography variant="caption">-</Typography>;
  }
};

/**
 * Componente principal que construye y gestiona la lista de asistencia.
 * @returns {JSX.Element}
 */
const ListaAsistenciaMateria = () => {
  // --- HOOKS Y CONTEXTO ---

  /** Hook para obtener el token de autenticación del contexto global. */
  const { token } = useAuth();

  /** Hook para acceder al 'state' pasado a través de la navegación de React Router. */
  const location = useLocation();
  // Extrae el ID del grupo y otros datos. El objeto vacío previene errores si 'state' es nulo.
  const { grupoId, materiaClave, nombreMateria, year } = location.state || {};

  // --- ESTADOS DEL COMPONENTE ---

  /** @state {boolean} modalOpen - Controla la visibilidad del modal para añadir nueva asistencia. */
  const [modalOpen, setModalOpen] = useState(false);
  /** @state {Array} estudiantes - Almacena la lista de estudiantes del grupo. */
  const [estudiantes, setEstudiantes] = useState([]);
  /** @state {Array} asistencias - Almacena la lista plana de todos los registros de asistencia. */
  const [asistencias, setAsistencias] = useState([]);
  /** @state {boolean} loading - Indica si los datos iniciales se están cargando. */
  const [loading, setLoading] = useState(true);
  /** @state {string|null} error - Almacena mensajes de error si la carga de datos falla. */
  const [error, setError] = useState(null);
  /** @state {boolean} isSaving - Indica si se está guardando una nueva asistencia. */
  const [isSaving, setIsSaving] = useState(false);

  //  Estados para controlar el año y mes seleccionados
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // getMonth() es 0-11, sumamos 1
  // --- LÓGICA DE DATOS ---

  /**
   * @callback
   * Función para cargar los datos de estudiantes y asistencias desde la API.
   * Se envuelve en `useCallback` para evitar que se recree en cada render, optimizando el `useEffect`.
   */
  const cargarDatos = useCallback(async () => {
    if (!grupoId) {
      setError("No se proporcionó un ID de grupo.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (!token)
        throw new Error("Autorización rechazada. No se encontró el token.");

      const data = await fetchDatosAsistenciaMateria(
        grupoId,
        materiaClave,
        selectedYear,
        selectedMonth,
        token
      );
      setEstudiantes(data.estudiantes);

      setAsistencias(data.asistencias);
      console.log(asistencias);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error al cargar datos de asistencia:", err);
    } finally {
      setLoading(false);
    }
  }, [grupoId, token, selectedYear, selectedMonth]);

  /**
   * @effect
   * Se ejecuta una vez al montar el componente (y si `cargarDatos` cambia) para obtener los datos.
   */
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  /**
   * @memo
   * Transforma la lista plana de asistencias en un mapa anidado para búsqueda rápida.
   * La estructura es: { 'YYYY-MM-DD': { 'matricula_alumno': 'estado' } }
   * `useMemo` asegura que este cálculo solo se rehaga si la lista `asistencias` cambia.
   */
  const asistenciaMap = useMemo(() => {
    const map = {};
    asistencias.forEach((registro) => {
      const fechaKey = new Date(registro.fecha).toISOString().split("T")[0];
      if (!map[fechaKey]) {
        map[fechaKey] = {};
      }
      map[fechaKey][registro.alumno_matricula] = registro.estado;
    });
    return map;
  }, [asistencias]);

  /**
   * @memo
   * Extrae y ordena cronológicamente las fechas únicas del `asistenciaMap`.
   * Se usa para generar las columnas de la tabla. `useMemo` evita recalcular si el mapa no ha cambiado.
   */
  const fechasUnicas = useMemo(
    () => Object.keys(asistenciaMap).sort((a, b) => new Date(a) - new Date(b)),
    [asistenciaMap]
  );

  /**
   * Manejador para guardar la nueva lista de asistencia enviada desde el modal.
   * @param {Object} estatusAsistencia - Objeto con el estado de asistencia de cada estudiante.
   */
  const handleSaveAsistencia = async (estatusAsistencia) => {
    setIsSaving(true);
    try {
      await fetchPostAsistenciaMateria(
        token,
        grupoId,
        materiaClave,
        estatusAsistencia
      );
      alert("Asistencia guardada con éxito"); // Opcional: Reemplazar con Snackbar/Toast.
      setModalOpen(false);
      cargarDatos(); // Vuelve a cargar los datos para reflejar los cambios.
    } catch (error) {
      console.error("Error al guardar la asistencia:", error);
      alert("Hubo un error al guardar la asistencia."); // Informar al usuario.
    } finally {
      setIsSaving(false);
    }
  };

  // --- RENDERIZADO CONDICIONAL ---

  // Muestra un spinner mientras se cargan los datos.
  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );

  // Muestra un mensaje de error si algo falló.
  if (error)
    return (
      <Typography color="error" align="center" sx={{ my: 4 }}>
        {error}
      </Typography>
    );

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <Box
      sx={{
        p: 3,
        height: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        marginTop: "50px",
      }}
    >
      {/* Encabezado con título y botón para agregar nueva asistencia */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Box>
          <Typography variant="h4">Asistencia - {nombreMateria}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Grupo {grupoId}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {/* Título dinámico que refleja la selección */}
            Mostrando:{" "}
            {new Date(selectedYear, selectedMonth - 1).toLocaleString("es-MX", {
              month: "long",
              year: "numeric",
            })}
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Selector de Año */}
          <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <InputLabel>Año</InputLabel>
            <Select
              value={selectedYear}
              label="Año"
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {/* Genera los últimos  años dinámicamente */}
              {[0, 1, 2, 3].map((offset) => {
                const year = new Date().getFullYear() - offset;
                return (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {/* Selector de Mes */}
          <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <InputLabel>Mes</InputLabel>
            <Select
              value={selectedMonth}
              label="Mes"
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {/* Genera los 12 meses */}
              {Array.from({ length: 12 }, (_, i) => (
                <MenuItem key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("es-MX", { month: "long" })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setModalOpen(true)}
          >
            Nueva Entrada
          </Button>
        </Stack>
      </Box>

      {/* Vista condicional: mensaje si no hay estudiantes, o la tabla si los hay */}
      {estudiantes.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <InfoIcon color="action" sx={{ mr: 1, verticalAlign: "middle" }} />
          <Typography variant="subtitle1" component="span">
            No se encontraron estudiantes para este grupo.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ flexGrow: 1 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", minWidth: 250 }}>
                  Nombre del Estudiante
                </TableCell>
                {/* Genera una columna por cada fecha única */}
                {fechasUnicas.map((fecha) => (
                  <TableCell
                    key={fecha}
                    align="center"
                    sx={{ fontWeight: "bold" }}
                  >
                    {new Date(fecha + "T00:00:00").toLocaleDateString("es-MX", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Genera una fila por cada estudiante */}
              {estudiantes.map((estudiante) => (
                <TableRow key={estudiante.matricula} hover>
                  <TableCell component="th" scope="row">
                    {`${estudiante.apellidop} ${estudiante.apellidom} ${estudiante.nombres}`}
                  </TableCell>
                  {/* Para cada estudiante, genera una celda por cada fecha */}
                  {fechasUnicas.map((fecha) => {
                    // Busca el estado de asistencia en el mapa pre-calculado. ¡Muy eficiente!
                    const estatus =
                      asistenciaMap[fecha]?.[estudiante.matricula];
                    return (
                      <TableCell
                        key={`${estudiante.matricula}-${fecha}`}
                        align="center"
                      >
                        <IconoEstatus estatus={estatus} />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal para registrar nueva asistencia (controlado por el estado 'modalOpen') */}
      <NuevaAsistencia
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        estudiantes={estudiantes}
        onSave={handleSaveAsistencia}
        isSaving={isSaving}
      />
    </Box>
  );
};

export default ListaAsistenciaMateria;

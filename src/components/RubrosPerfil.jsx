// Importaciones de React y hooks
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import GestionarRubrosModal from "./modals/Gestion/GestionarRubrosModal.jsx";

// Importa tus servicios reales
import {
  fetchRubrosMateriaGet,
  syncCalificaciones_service,
  fetchRubrosCalificacionesGet,
} from "./services/rubroService.js";
import { fetchAlumnoPerfilGet } from "./services/alumnosService.js";

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
  Button,
  Stack,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField, // --- NUEVO ---
  IconButton, // --- NUEVO ---
  Tooltip, // --- NUEVO ---
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import EditIcon from "@mui/icons-material/Edit"; // --- NUEVO ---
import SaveIcon from "@mui/icons-material/Save"; // --- NUEVO ---
import CancelIcon from "@mui/icons-material/Cancel"; // --- NUEVO ---

// Lógica para generar los años (ej. [2025, 2024, 2023])
const currentYear = new Date().getFullYear();
const years = Array.from(new Array(3), (val, index) => currentYear - index);

/**
 * Componente principal para gestionar calificaciones de un grupo.
 */
const GestionarRubros = () => {
  const { token } = useAuth();
  const location = useLocation();
  const {
    grupoId,
    idNormalizado,
    semestre,
    materiaClave,
    nombreMateria,
    year: initialYear,
  } = location.state || {};

  // --- ESTADOS DE DATOS ---
  const [rubros, setRubros] = useState([]); // Configuración de Rubros (Columnas)
  const [alumnos, setAlumnos] = useState([]); // Lista de Alumnos (Filas)
  const [calificaciones, setCalificaciones] = useState([]); // Notas
  // --- NUEVO ---
  const [originalCalificaciones, setOriginalCalificaciones] = useState([]); // Para el botón "Cancelar"

  // --- ESTADOS DE FILTROS ---
  const [parcial, setParcial] = useState(1);
  const [selectedYear, setSelectedYear] = useState(initialYear || currentYear);

  // --- ESTADOS DE UI (Carga y Errores) ---
  const [loadingRubros, setLoadingRubros] = useState(true);
  const [errorRubros, setErrorRubros] = useState(null);
  const [loadingAlumnos, setLoadingAlumnos] = useState(true);
  const [errorAlumnos, setErrorAlumnos] = useState(null);
  const [loadingCalificaciones, setLoadingCalificaciones] = useState(false);
  const [errorCalificaciones, setErrorCalificaciones] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  // --- ESTADOS DE EDICIÓN ---
  const [isEditing, setIsEditing] = useState(false); // --- NUEVO ---
  const [isSaving, setIsSaving] = useState(false); // --- NUEVO ---
  const [saveError, setSaveError] = useState(null); // --- NUEVO ---

  // --- CARGA 1: RÚBROS (CONFIGURACIÓN DE COLUMNAS) ---
  const cargarRubros = useCallback(async () => {
    if (!materiaClave) {
      setErrorRubros("No se proporcionó una clave de materia.");
      setLoadingRubros(false);
      return;
    }
    setLoadingRubros(true);
    setErrorRubros(null);
    try {
      const data = await fetchRubrosMateriaGet(materiaClave, token);
      setRubros(data.rubros || []);
    } catch (err) {
      setErrorRubros(err.message);
    } finally {
      setLoadingRubros(false);
    }
  }, [materiaClave, token]);

  useEffect(() => {
    cargarRubros();
  }, [cargarRubros]);

  // --- CARGA 2: ALUMNOS (FILAS DE LA TABLA) ---
  useEffect(() => {
    const cargarAlumnos = async () => {
      // ... (tu lógica de loading y errores) ...
      try {
        const data = await fetchAlumnoPerfilGet(token, idNormalizado, semestre);
        console.log("Datos de alumnos recibidos:", data);
        // --- INICIO DE LA TRANSFORMACIÓN ---
        // Mapeamos los datos recibidos para que coincidan
        // con lo que el componente espera ("alumno_matricula")
        const alumnosNormalizados = (data.alumnos || []).map((a) => ({
          ...a,
          alumno_matricula: a.matricula,
        }));
        // --- FIN DE LA TRANSFORMACIÓN ---

        // Guardamos los datos normalizados en el estado
        setAlumnos(alumnosNormalizados);
      } catch (err) {
        setErrorAlumnos(err.message);
      } finally {
        setLoadingAlumnos(false);
      }
    };
    cargarAlumnos();
  }, [grupoId, token]);

  // --- CARGA 3: CALIFICACIONES (BASADO EN FILTROS) ---
  useEffect(() => {
    const cargarCalificaciones = async () => {
      if (!materiaClave || !parcial || !selectedYear) return;

      setLoadingCalificaciones(true);
      setErrorCalificaciones(null);
      // --- NUEVO ---
      setIsEditing(false); // Salir del modo edición al cambiar filtros
      setSaveError(null);

      try {
        const data = await fetchRubrosCalificacionesGet(
          materiaClave,
          parcial,
          selectedYear,
          token
        );
        setCalificaciones(data);

        // setOriginalCalificaciones(data); // --- NUEVO ---
      } catch (err) {
        console.error("Error cargando calificaciones:", err);
        setErrorCalificaciones(
          "Error al cargar calificaciones: " + err.message
        );
      } finally {
        setLoadingCalificaciones(false);
      }
    };

    // Solo carga calificaciones si los rubros y alumnos ya cargaron
    if (!loadingRubros && !loadingAlumnos) {
      cargarCalificaciones();
    }
  }, [
    materiaClave,
    parcial,
    selectedYear,
    token,
    loadingRubros,
    loadingAlumnos,
  ]); // Dependencias

  // --- COMBINACIÓN DE DATOS (ALUMNOS + CALIFICACIONES) ---
  const datosTabla = useMemo(() => {
    // 1. Crear un "mapa" de calificaciones para búsqueda rápida.
    const califMap = new Map();
    for (const calif of calificaciones) {
      if (!califMap.has(calif.alumno_matricula)) {
        califMap.set(calif.alumno_matricula, new Map());
      }
      califMap
        .get(calif.alumno_matricula)
        .set(calif.id_rubro, calif.calificacion);
    }

    // 2. Mapear la lista de alumnos (fuente de verdad)
    return alumnos.map((alumno) => {
      const susCalificaciones =
        califMap.get(alumno.alumno_matricula) || new Map();

      // --- Lógica de promedio MODIFICADA ---
      let sumaPonderada = 0;
      let ponderacionTotal = 0; // Para calcular promedio aunque falten notas

      for (const rubro of rubros) {
        const nota = susCalificaciones.get(rubro.id_rubro);
        // Solo promediar si la nota existe (es un número)
        if (nota !== null && nota !== undefined) {
          sumaPonderada += nota * Number(rubro.ponderacion);
          ponderacionTotal += Number(rubro.ponderacion);
        }
      }

      // Evitar división por cero si no hay notas ni rubros
      const promedio =
        ponderacionTotal > 0 ? sumaPonderada / ponderacionTotal : 0;
      // O si prefieres que el promedio sea sobre el 100% siempre:
      // const promedio = sumaPonderada; // (ya que sumaPonderada es nota * ponderacion)

      return {
        ...alumno,
        calificacionesMap: susCalificaciones,
        promedio: promedio,
      };
    });
  }, [alumnos, calificaciones, rubros]);

  // --- MANEJADORES DE EVENTOS ---

  // --- NUEVO ---
  const handleEdit = () => {
    setIsEditing(true);
    setSaveError(null);
  };

  // --- NUEVO ---
  const handleCancel = () => {
    setIsEditing(false);
    setCalificaciones(originalCalificaciones); // Revierte a los datos originales
    setSaveError(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    // 1. Preparamos el OBJETO que el backend espera
    const batchData = {
      grades: calificaciones, // El array de calificaciones
      idGrupo: grupoId,
      parcial: parcial,
      yearC: selectedYear,
    };

    try {
      // 2. Enviamos el objeto 'batchData'
      await syncCalificaciones_service(batchData, token);

      setIsEditing(false);
      setIsSaving(false);
      setOriginalCalificaciones(calificaciones);
    } catch (err) {
      console.error("Error al guardar:", err);
      setSaveError(err.message);
      setIsSaving(false);
    }
  };

  const handleGradeChange = (matricula, idRubro, valor) => {
    // Validar y convertir el valor
    const valorLimpio = valor.trim();
    let valorNumerico;

    if (valorLimpio === "") {
      valorNumerico = null; // Permitir borrar la calificación
    } else {
      valorNumerico = parseFloat(valorLimpio);
      // Validaciones
      if (isNaN(valorNumerico)) return; // Ignorar si no es número
      if (valorNumerico < 0) valorNumerico = 0;
      if (valorNumerico > 10) valorNumerico = 10;
    }

    setCalificaciones((prevCalificaciones) => {
      const newState = [...prevCalificaciones];
      const index = newState.findIndex(
        (c) =>
          c.alumno_matricula === matricula && c.id_rubro === Number(idRubro)
      );

      if (index > -1) {
        // Actualiza la calificación existente
        newState[index] = { ...newState[index], calificacion: valorNumerico };
      } else if (valorNumerico !== null) {
        // Añade la nueva calificación (si no es null)
        newState.push({
          alumno_matricula: matricula,
          id_rubro: Number(idRubro),
          calificacion: valorNumerico,
        });
      }
      return newState;
    });
  };

  // --- RENDERIZADO PRINCIPAL ---

  // Estado de carga general (Rubros y Alumnos son esenciales)
  const isEssentialLoading = loadingRubros || loadingAlumnos;
  const canEdit =
    !isEssentialLoading &&
    !errorRubros &&
    !errorAlumnos &&
    datosTabla.length > 0;

  return (
    <Box
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 50px)",
      }}
    >
      {/* Encabezado con título y botones de acción */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start", // Alinea verticalmente
          mb: 2,
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography variant="h5">Materia: {nombreMateria}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Calificaciones Grupo {grupoId}
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <FormControl
              size="small"
              sx={{ minWidth: 120 }}
              disabled={isEditing}
            >
              <InputLabel id="parcial-select-label">Parcial</InputLabel>
              <Select
                labelId="parcial-select-label"
                value={parcial}
                label="Parcial"
                onChange={(e) => setParcial(e.target.value)}
              >
                <MenuItem value={1}>Parcial 1</MenuItem>
                <MenuItem value={2}>Parcial 2</MenuItem>
                <MenuItem value={3}>Parcial 3</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>
        <Stack direction="row" spacing={1} alignItems="flex-start">
          {/* --- BLOQUE DE BOTONES MODIFICADO --- */}
          {isEditing ? (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={
                  isSaving ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancelar
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              disabled={!canEdit || loadingCalificaciones} // No editar si no hay datos
            >
              Editar Calificaciones
            </Button>
          )}

          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setModalAbierto(true)}
            disabled={isEssentialLoading || isEditing} // No configurar si carga o edita
          >
            Gestionar Rúbros
          </Button>
        </Stack>
      </Box>

      {/* --- Alerta de Error de Guardado --- */}
      {saveError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {saveError}
        </Alert>
      )}

      {/* Contenedor de la Tabla */}
      <Box
        sx={{
          flexGrow: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <TableContainer
          component={Paper}
          sx={{ flexGrow: 1, overflow: "auto" }}
        >
          <Table stickyHeader aria-label="tabla de calificaciones">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    minWidth: 200,
                    zIndex: 101,
                    left: 0,
                    position: "sticky",
                    backgroundColor: "background.paper",
                  }}
                >
                  Nombre Alumno
                </TableCell>

                {isEssentialLoading ? (
                  <TableCell align="center">
                    <CircularProgress size={20} />
                  </TableCell>
                ) : errorRubros ? (
                  <TableCell align="center" colSpan={5}>
                    <Alert severity="error">{errorRubros}</Alert>
                  </TableCell>
                ) : (
                  rubros.map((rubro) => (
                    <TableCell
                      key={rubro.id_rubro}
                      align="center"
                      sx={{ fontWeight: "bold", minWidth: 150 }}
                    >
                      {rubro.nombre_rubro}
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                      >
                        ({Number(rubro.ponderacion) * 100}%)
                      </Typography>
                    </TableCell>
                  ))
                )}

                <TableCell
                  sx={{ fontWeight: "bold", minWidth: 100 }}
                  align="center"
                >
                  Promedio
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isEssentialLoading ? (
                <TableRow>
                  <TableCell colSpan={rubros.length + 2} align="center">
                    <CircularProgress />
                    <Typography variant="caption" display="block">
                      Cargando datos esenciales...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : errorAlumnos ? (
                <TableRow>
                  <TableCell colSpan={rubros.length + 2} align="center">
                    <Alert severity="error">{errorAlumnos}</Alert>
                  </TableCell>
                </TableRow>
              ) : loadingCalificaciones ? (
                <TableRow>
                  <TableCell colSpan={rubros.length + 2} align="center">
                    <CircularProgress />
                    <Typography variant="caption" display="block">
                      Cargando calificaciones...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : errorCalificaciones ? (
                <TableRow>
                  <TableCell colSpan={rubros.length + 2} align="center">
                    <Alert severity="error">{errorCalificaciones}</Alert>
                  </TableCell>
                </TableRow>
              ) : datosTabla.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={rubros.length + 2} align="center">
                    No se encontraron alumnos en este grupo.
                  </TableCell>
                </TableRow>
              ) : (
                // Renderizado final de datos
                datosTabla.map((alumno) => (
                  <TableRow key={alumno.alumno_matricula} hover>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{
                        left: 0,
                        position: "sticky",
                        backgroundColor: "background.paper",
                        borderRight: "1px solid rgba(224, 224, 224, 1)",
                      }}
                    >
                      {` ${alumno.apellidop} ${alumno.apellidom}`}
                    </TableCell>

                    {rubros.map((rubro) => (
                      <TableCell
                        key={`${alumno.alumno_matricula}-${rubro.id_rubro}`}
                        align="center"
                      >
                        {isEditing ? (
                          <TextField
                            type="number"
                            size="small"
                            value={
                              alumno.calificacionesMap.get(rubro.id_rubro) ?? ""
                            }
                            onChange={(e) =>
                              handleGradeChange(
                                alumno.alumno_matricula,
                                rubro.id_rubro,
                                e.target.value
                              )
                            }
                            inputProps={{
                              min: 0,
                              max: 10,
                              step: 0.1,
                              style: { textAlign: "center" }, 
                            }}
             
                            sx={{
                              width: "60px", 
                              "& .MuiInputBase-input": {
                                padding: "4px",
                                fontSize: "0.85rem", 
                              },
                            }}
                            // -----------------------------
                            disabled={isSaving}
                          />
                        ) : (
                          alumno.calificacionesMap.get(rubro.id_rubro) ?? "-"
                        )}
                      </TableCell>
                    ))}

                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        color:
                          alumno.promedio >= 6 ? "success.main" : "error.main",
                      }}
                    >
                      {/* --- Muestra "Calculando..." si se edita --- */}
                      {isEditing ? (
                        <Tooltip title="El promedio final se actualizará al guardar">
                          <span style={{ fontStyle: "italic", color: "gray" }}>
                            {alumno.promedio.toFixed(2)}
                          </span>
                        </Tooltip>
                      ) : (
                        alumno.promedio.toFixed(2)
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Modal de Gestión de Rúbros */}
      {modalAbierto && (
        <GestionarRubrosModal
          open={modalAbierto}
          onClose={() => setModalAbierto(false)}
          rubrosActuales={rubros}
          materiaClave={materiaClave}
          nombreMateria={materiaClave}
          token={token}
          onGuardar={() => {
            setModalAbierto(false);
            cargarRubros(); // Recarga la configuración de rubros
          }}
        />
      )}
    </Box>
  );
};

export default GestionarRubros;

// Importaciones de React y hooks
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import GestionTrabajos from "../../components/modals/Gestion/GestionTrabajos.jsx";

// Importa tus servicios reales
import {
  fetchRubrosTCGet,
  syncCalificacionesTC_service,
  fetchCalificacionesTCGet,
} from "../../services/rubroService.js";
import { fetchAlumnoPerfilGet } from "../../services/alumnosService.js";

// Importaciones de MUI
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
  TextField,
  IconButton,
  Tooltip,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

// Lógica para generar los años (ej. [2025, 2024, 2023])
const currentYear = new Date().getFullYear();
const years = Array.from(new Array(3), (val, index) => currentYear - index);

/**
 * Componente principal para gestionar calificaciones de un grupo.
 */
const TrabajoCotidiano = () => {
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
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

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
      const datosEnviar = {
        materiaClave,
        idGrupo: grupoId,
        parcial,
        yearC: selectedYear,
      };
      console.log("Cargando rubros con:", datosEnviar);
      const data = await fetchRubrosTCGet(datosEnviar, token);

      setRubros(data || []);
      // ------------------
    } catch (err) {
      setErrorRubros(err.message);
    } finally {
      setLoadingRubros(false);
    }
  }, [materiaClave, grupoId, parcial, selectedYear, token]); // Añadidas todas las dependencias

  useEffect(() => {
    cargarRubros();
  }, [cargarRubros]);

  // --- CARGA 2: ALUMNOS (FILAS DE LA TABLA) ---
  useEffect(() => {
    const cargarAlumnos = async () => {
      // ... (tu lógica de loading y errores) ...
      try {
        const data = await fetchAlumnoPerfilGet(token, idNormalizado, semestre);
        const alumnosNormalizados = (data.alumnos || []).map((a) => ({
          ...a,
          alumno_matricula: a.matricula,
        }));
        setAlumnos(alumnosNormalizados);
      } catch (err) {
        setErrorAlumnos(err.message);
      } finally {
        setLoadingAlumnos(false);
      }
    };
    cargarAlumnos();
  }, [grupoId, token]);

  //Adaptar la función para obtener el string desde el valor numérico
  const getStringFromValor = (valorNumerico, ponderacionRubro) => {
    // Si la BD trae null, lo mantenemos como null (el select mostrará "Vacío")
    if (valorNumerico === null || valorNumerico === undefined) {
      return null;
    }

    const valor = Number(valorNumerico);
    const ponderacion = Number(ponderacionRubro);

    if (valor === 1) {
      // Asumimos que 1 siempre es "Si" al cargar.
      // "J" (Justificante) también se guarda como 1, pero es una entrada manual.
      return "Si";
    }
    if (valor === 0) {
      return "No";
    }
    // Si el valor numérico es IGUAL a la ponderación del rubro, es un "Retardo"
    if (ponderacion > 0 && valor === ponderacion) {
      return "R";
    }

    // Fallback para valores inesperados (o nulos que no se capturaron)
    return null;
  };

  // --- CARGA 3: CALIFICACIONES (BASADO EN FILTROS) ---
  useEffect(() => {
    const cargarCalificaciones = async () => {
      if (!materiaClave || !parcial || !selectedYear) return;

      setLoadingCalificaciones(true);
      setErrorCalificaciones(null);
      setIsEditing(false);
      setSaveError(null);

      // 1. Necesitas los rubros para saber la ponderación del "Retardo"
      const rubrosMap = new Map();
      for (const rubro of rubros) {
        rubrosMap.set(rubro.idrubrotc, rubro.ponderacion);
      }

      try {
        const context = {
          materiaClave,
          idGrupo: grupoId,
          parcial,
          yearC: selectedYear,
        };
        // data aquí es un array con calificaciones numéricas (ej: {..., calificacion: 1})
        const data = await fetchCalificacionesTCGet(context, token);
        console.log("Calificaciones numéricas cargadas:", data);

        // 2. Transforma los datos numéricos a strings ("Si", "No", "R")
        const calificacionesTransformadas = data.map((calif) => {
          // Busca la ponderación de este rubro específico
          const ponderacion = rubrosMap.get(calif.idrubrotc) || 0;
          return {
            ...calif,
            // Reemplaza el valor numérico (1, 0, 0.5) por el string ("Si", "No", "R")
            calificacion: getStringFromValor(calif.calificacion, ponderacion),
          };
        });

        console.log(
          "Calificaciones transformadas a string:",
          calificacionesTransformadas
        );

        // 3. Guarda los datos transformados (strings) en el estado
        setCalificaciones(calificacionesTransformadas);
        setOriginalCalificaciones(calificacionesTransformadas); // Guardar la versión transformada
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
    grupoId,
    parcial,
    selectedYear,
    token,
    loadingRubros,
    loadingAlumnos,
    rubros, // <--- 4. AÑADIR 'rubros' A LAS DEPENDENCIAS
  ]);

  // --- COMBINACIÓN DE DATOS (ALUMNOS + CALIFICACIONES) ---
  const datosTabla = useMemo(() => {
    // --- CAMBIO 1 ---
    // Esta función ahora devuelve los PUNTOS directos (1, 0, o la ponderación)
    const getPuntosObtenidos = (valorString, rubroPonderacion) => {
      switch (valorString) {
        case "Si":
          return 1;
        case "No":
          return 0;
        case "J":
          return 1;
        case "R":
          // "R" (Retardo) vale los puntos guardados en la ponderación
          return Number(rubroPonderacion);
        default:
          return 0; // Si es null o "", no suma puntos
      }
    };

    // El Map se crea igual (esto está bien)
    const califMap = new Map();
    for (const calif of calificaciones) {
      if (!califMap.has(calif.alumno_matricula)) {
        califMap.set(calif.alumno_matricula, new Map());
      }
      califMap
        .get(calif.alumno_matricula)
        .set(calif.idrubrotc, calif.calificacion);
    }

    return alumnos.map((alumno) => {
      const susCalificaciones =
        califMap.get(alumno.alumno_matricula) || new Map();

      let sumaPuntosObtenidos = 0;

      const totalPuntosPosibles = rubros.length;

      for (const rubro of rubros) {
        const notaString = susCalificaciones.get(rubro.idrubrotc);

        const puntos = getPuntosObtenidos(notaString, rubro.ponderacion);

        sumaPuntosObtenidos += puntos;
      }

      const promedio =
        totalPuntosPosibles > 0
          ? (sumaPuntosObtenidos / totalPuntosPosibles) * 10
          : 0;

      return {
        ...alumno,
        calificacionesMap: susCalificaciones,
        promedio: promedio,
      };
    });
  }, [alumnos, calificaciones, rubros]);

  const handleEdit = () => {
    setIsEditing(true);
    setSaveError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCalificaciones(originalCalificaciones);
    setSaveError(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    const rubrosMap = new Map();
    for (const rubro of rubros) {
      rubrosMap.set(rubro.idrubrotc, rubro.ponderacion);
    }
    const calificacionesParaDB = calificaciones.map((calif) => {
      const ponderacionDelRubro = rubrosMap.get(calif.idrubrotc) || 0;

      const valorNumerico = getValorNumericoParaDB(
        calif.calificacion,
        ponderacionDelRubro
      );

      return {
        ...calif,
        calificacion: valorNumerico,
      };
    });

    const batchData = {
      grades: calificacionesParaDB,
    };

    try {
      await syncCalificacionesTC_service(batchData, token);

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
    const valorFinal = valor === "" ? null : valor;

    setCalificaciones((prevCalificaciones) => {
      const newState = [...prevCalificaciones];
      const index = newState.findIndex(
        (c) =>
          c.alumno_matricula === matricula && c.idrubrotc === Number(idRubro)
      );

      if (index > -1) {
        // Guarda el string (o null) directamente en el estado
        newState[index] = { ...newState[index], calificacion: valorFinal };
      } else if (valorFinal !== null) {
        // O crea el nuevo registro con el string
        newState.push({
          alumno_matricula: matricula,
          idrubrotc: Number(idRubro),
          calificacion: valorFinal,
        });
      }
      return newState;
    });
  };

  // --- RENDERIZADO PRINCIPAL ---
  const isEssentialLoading = loadingRubros || loadingAlumnos;
  const canEdit =
    !isEssentialLoading &&
    !errorRubros &&
    !errorAlumnos &&
    datosTabla.length > 0;

  //Calificaciones
  const getValorNumericoParaDB = (valorString, ponderacion) => {
    switch (valorString) {
      case "Si":
        return 1;
      case "No":
        return 0;
      case "J":
        return 1; // Justificante
      case "R":
        return Number(ponderacion); // <-- CORREGIDO: Usa la ponderación
      default:
        return null; // "Vacío" o cualquier otra cosa es null
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 64px)",
      }}
    >
      {/* Encabezado con título y botones de acción */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2,
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography variant="h5">Materia: {nombreMateria}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Trabajo Cotidiano Grupo {grupoId}
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
          {/* Bloque de botones de Edición/Guardado */}
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
              disabled={!canEdit || loadingCalificaciones}
            >
              Editar Calificaciones
            </Button>
          )}

          <Button
            variant="outlined"
            onClick={() => setModalAbierto(true)}
            disabled={isEssentialLoading || isEditing}
          >
            + Actividad
          </Button>
        </Stack>
      </Box>

      {/* Alerta de Error de Guardado */}
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
                      key={rubro.idrubrotc}
                      align="center"
                      sx={{ fontWeight: "bold", minWidth: 150 }}
                    >
                      {rubro.nombre_rubro}
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                      >
                        {rubro.fecha_limite
                          ? rubro.fecha_limite
                              .split("T")[0]
                              .split("-")
                              .reverse()
                              .join("-")
                          : "-"}
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
                      {`${alumno.apellidop} ${alumno.apellidom} ${alumno.nombres} `}
                    </TableCell>

                    {rubros.map((rubro) => (
                      <TableCell
                        // --- CORRECCIÓN ---
                        key={`${alumno.alumno_matricula}-${rubro.idrubrotc}`}
                        align="center"
                      >
                        {isEditing ? (
                          <FormControl size="small" sx={{ width: "120px" }}>
                            <Select
                              value={
                                // Ahora el map.get() devuelve "Si", "No", "J", "R" o null
                                // Usamos ?? "" para manejar el null y que coincida con el MenuItem vacío
                                alumno.calificacionesMap.get(rubro.idrubrotc) ??
                                ""
                              }
                              onChange={(e) =>
                                handleGradeChange(
                                  alumno.alumno_matricula,
                                  rubro.idrubrotc,
                                  e.target.value
                                )
                              }
                              disabled={isSaving}
                              displayEmpty
                            >
                              <MenuItem value="">
                                <em>(Vacío)</em>
                              </MenuItem>
                              <MenuItem value={"Si"}>Si</MenuItem>
                              <MenuItem value={"No"}>No</MenuItem>
                              <MenuItem value={"J"}>Justificante</MenuItem>
                              <MenuItem value={"R"}>Retardo</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          alumno.calificacionesMap.get(rubro.idrubrotc) ?? "-"
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
        <GestionTrabajos
          open={modalAbierto}
          onClose={() => setModalAbierto(false)}
          rubrosActuales={rubros}
          token={token}
          // --- CORRECCIONES ---
          // Pasar las props dinámicas correctas
          materiaClave={materiaClave}
          nombreMateria={nombreMateria}
          idGrupo={grupoId}
          parcial={parcial}
          yearC={selectedYear}
          // --------------------
          onGuardar={() => {
            setModalAbierto(false);
            cargarRubros(); // Recarga la configuración de rubros
          }}
        />
      )}
    </Box>
  );
};

export default TrabajoCotidiano;

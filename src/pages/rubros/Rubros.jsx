/**
 * @file GestionarRubros.jsx
 * @description Componente principal para la gestión, visualización y edición de calificaciones
 * de los alumnos en base a rúbricas (rúbros) predefinidas y promedios automáticos.
 */

// Importaciones de React y hooks
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import GestionarRubrosModal from "../../components/modals/Gestion/GestionarRubrosModal.jsx";

// Servicios de API
import {
  fetchRubrosMateriaGet,
  syncCalificaciones_service,
  fetchRubrosCalificacionesGet,
  fetchPromediosTc_service,
  fetchPromediosTi_service,
} from "../../services/rubroService.js";

import {
  fetchAlumnoGrupoGet,
  fetchAlumnoPerfilGet,
} from "../../services/alumnosService.js";

// Utilidades
import { useExport } from "../../utils/useExport.js";

// Importaciones UI (Material-UI)
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
  Select,
  MenuItem,
  TextField,
  Tooltip,
  IconButton,
  Divider,
  Chip,
  InputAdornment,
} from "@mui/material";

// Iconos
import SettingsIcon from "@mui/icons-material/Settings";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SchoolIcon from "@mui/icons-material/School";
import SearchIcon from "@mui/icons-material/Search";

const currentYear = new Date().getFullYear();

/**
 * Componente principal para gestionar rubros.
 * @returns {JSX.Element} Vista completa de la tabla de calificaciones y controles.
 */
const GestionarRubros = () => {
  const { token } = useAuth();
  const location = useLocation();

  // Extracción de parámetros de navegación recibidos desde la vista anterior
  const {
    grupoId,
    idNormalizado,
    semestre,
    materiaClave,
    nombreMateria,
    year: initialYear,
  } = location.state || {};

  const { exportar } = useExport();

  // ==========================================
  // ESTADOS DE DATOS
  // ==========================================
  const [rubros, setRubros] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [originalCalificaciones, setOriginalCalificaciones] = useState([]);
  const [promediosTc, setPromediosTc] = useState([]);
  const [promediosTi, setPromediosTi] = useState([]);

  // ==========================================
  // ESTADOS DE BÚSQUEDA Y FILTROS
  // ==========================================
  const [searchTerm, setSearchTerm] = useState("");
  const [parcial, setParcial] = useState(1);
  const [selectedYear, setSelectedYear] = useState(initialYear || currentYear);

  // ==========================================
  // ESTADOS DE INTERFAZ DE USUARIO (UI)
  // ==========================================
  const [loadingRubros, setLoadingRubros] = useState(true);
  const [errorRubros, setErrorRubros] = useState(null);
  const [loadingAlumnos, setLoadingAlumnos] = useState(true);
  const [errorAlumnos, setErrorAlumnos] = useState(null);
  const [loadingCalificaciones, setLoadingCalificaciones] = useState(false);
  const [errorCalificaciones, setErrorCalificaciones] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  // ==========================================
  // ESTADOS DE MODO EDICIÓN
  // ==========================================
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  /**
   * Carga los rubros configurados para la materia y los ordena lógicamente.
   */
  const cargarRubros = useCallback(async () => {
    if (!materiaClave || !grupoId) return;
    setLoadingRubros(true);
    try {
      const data = await fetchRubrosMateriaGet(
        materiaClave,
        grupoId,
        selectedYear,
        token,
      );
      const rubrosRaw = data.rubros || [];

      // Sistema de asignación de prioridad (peso) para el renderizado de columnas
      const obtenerPeso = (nombre) => {
        const nombreLower = nombre.toLowerCase();
        if (nombreLower.includes("examen")) return 10; // Prioridad 1: Extremo izquierdo
        if (nombreLower.includes("trabajo cotidiano")) return 1; // Prioridad 100: Penúltimo
        if (nombreLower.includes("trabajo integrador")) return 2; // Prioridad 101: Extremo derecho
        return 50; // Rubros estándar van al medio
      };

      // Ordenar ascendente basado en el peso calculado
      const rubrosOrdenados = rubrosRaw.sort(
        (a, b) => obtenerPeso(a.nombre_rubro) - obtenerPeso(b.nombre_rubro),
      );

      setRubros(rubrosOrdenados);
    } catch (err) {
      setErrorRubros(err.message);
    } finally {
      setLoadingRubros(false);
    }
  }, [materiaClave, grupoId, selectedYear, token]);

  // Efecto: Ejecutar la carga de rúbros al montar el componente o cambiar dependencias
  useEffect(() => {
    cargarRubros();
  }, [cargarRubros]);

  /**
   * Carga la lista de alumnos pertenecientes al grupo o perfil.
   */
  useEffect(() => {
    const cargarAlumnos = async () => {
      setLoadingAlumnos(true);
      try {
        let data;
        // Soporta búsqueda por perfil normalizado o por ID de grupo
        if (idNormalizado && semestre) {
          data = await fetchAlumnoPerfilGet(token, idNormalizado, semestre);
        } else if (grupoId) {
          data = await fetchAlumnoGrupoGet(token, grupoId);
        }

        // Estandariza la propiedad "matricula"
        setAlumnos(
          (data.alumnos || []).map((a) => ({
            ...a,
            alumno_matricula: a.matricula,
          })),
        );
      } catch (err) {
        setErrorAlumnos(err.message);
      } finally {
        setLoadingAlumnos(false);
      }
    };
    if (grupoId || (idNormalizado && semestre)) cargarAlumnos();
  }, [grupoId, idNormalizado, semestre, token]);

  /**
   * Carga las calificaciones manuales y los promedios automáticos calculados en el backend.
   */
  useEffect(() => {
    const cargarCalificaciones = async () => {
      if (!materiaClave || !parcial || !selectedYear || !grupoId) return;
      setLoadingCalificaciones(true);
      try {
        // Carga secuencial de las calificaciones estáticas
        const data = await fetchRubrosCalificacionesGet(
          materiaClave,
          parcial,
          selectedYear,
          grupoId,
          token,
        );

        // Carga en paralelo de los promedios automáticos para optimizar el tiempo de respuesta
        const [datosPTC, datosPTI] = await Promise.all([
          fetchPromediosTc_service(
            { materiaClave, idGrupo: grupoId, parcial, yearC: selectedYear },
            token,
          ),
          fetchPromediosTi_service(
            { materiaClave, idGrupo: grupoId, parcial, yearC: selectedYear },
            token,
          ),
        ]);

        setPromediosTc(datosPTC || []);
        setPromediosTi(datosPTI || []);
        setCalificaciones(data);
        setOriginalCalificaciones(data); // Respaldo para poder cancelar la edición
      } catch (err) {
        setErrorCalificaciones(err.message);
      } finally {
        setLoadingCalificaciones(false);
      }
    };
    if (!loadingRubros && !loadingAlumnos) cargarCalificaciones();
  }, [
    materiaClave,
    parcial,
    selectedYear,
    grupoId,
    token,
    loadingRubros,
    loadingAlumnos,
  ]);

  // ==========================================
  // LÓGICA CORE: COMBINACIÓN DE DATOS Y CÁLCULOS
  // ==========================================

  const datosTabla = useMemo(() => {
    const califMap = new Map();
    calificaciones.forEach((calif) => {
      const mat = String(calif.alumno_matricula);
      if (!califMap.has(mat)) califMap.set(mat, new Map());
      califMap.get(mat).set(calif.id_rubro, calif.calificacion);
    });

    const tcMap = new Map();
    if (Array.isArray(promediosTc)) {
      promediosTc.forEach((item) =>
        tcMap.set(String(item.matricula), item.promedio_final),
      );
    }

    const tiMap = new Map();
    if (Array.isArray(promediosTi)) {
      promediosTi.forEach((item) =>
        tiMap.set(String(item.matricula), item.promedio_final),
      );
    }

    return alumnos.map((alumno) => {
      const matriculaStr = String(alumno.alumno_matricula);
      const susCalificaciones = califMap.get(matriculaStr) || new Map();
      const promedioTcValue = tcMap.get(matriculaStr);
      const promedioTiValue = tiMap.get(matriculaStr);
      let sumaPonderada = 0;

      rubros.forEach((rubro) => {
        const esTC = rubro.nombre_rubro === "Trabajo Cotidiano";
        const esTI = rubro.nombre_rubro === "Trabajo Integrador";

        const valorManual = susCalificaciones.get(rubro.id_rubro);
        const tieneOverride = valorManual !== undefined && valorManual !== null;

        let nota = 0;

        if (tieneOverride) {
          nota = Number(valorManual);
        } else if (esTC) {
          nota =
            promedioTcValue !== undefined && promedioTcValue !== null
              ? Number(promedioTcValue)
              : 0;
        } else if (esTI) {
          nota =
            promedioTiValue !== undefined && promedioTiValue !== null
              ? Number(promedioTiValue)
              : 0;
        } else {
          nota = 0;
        }

        sumaPonderada += nota * Number(rubro.ponderacion);
      });

      return {
        ...alumno,
        calificacionesMap: susCalificaciones,
        promedio: sumaPonderada,
        promedioTc: promedioTcValue,
        promedioTi: promedioTiValue,
      };
    });
  }, [alumnos, calificaciones, rubros, promediosTc, promediosTi]);

  const datosFiltrados = useMemo(() => {
    if (!searchTerm) return datosTabla;
    const lowerTerm = searchTerm.toLowerCase();

    return datosTabla.filter((al) => {
      const nombreCompleto =
        `${al.nombres} ${al.apellidop} ${al.apellidom}`.toLowerCase();
      return (
        nombreCompleto.includes(lowerTerm) ||
        String(al.alumno_matricula).includes(lowerTerm)
      );
    });
  }, [datosTabla, searchTerm]);

  // ==========================================
  // EXPORTACIÓN A EXCEL
  // ==========================================

  const transformarDatosParaExportar = useCallback(() => {
    if (!datosTabla.length) return [];

    const headers = [
      "Matrícula",
      "Primer Apellido",
      "Segundo Apellido",
      "Nombres",
      ...rubros.map(
        (r) => `Rúbro: ${r.nombre_rubro} (${Number(r.ponderacion) * 100}%)`,
      ),
      "Promedio Final",
    ];

    return datosTabla.map((alumno) => {
      const row = {};
      row["Matrícula"] = alumno.alumno_matricula;
      row["Primer Apellido"] = alumno.apellidop || "";
      row["Segundo Apellido"] = alumno.apellidom || "";
      row["Nombres"] = alumno.nombres || "";

      rubros.forEach((rubro, index) => {
        const headerKey = headers[index + 4];
        const esTC = rubro.nombre_rubro === "Trabajo Cotidiano";
        const esTI = rubro.nombre_rubro === "Trabajo Integrador";

        const valorManual = alumno.calificacionesMap.get(rubro.id_rubro);
        const tieneOverride = valorManual !== undefined && valorManual !== null;

        const valorAutomatico = esTC
          ? alumno.promedioTc
          : esTI
            ? alumno.promedioTi
            : null;

        const valorEfectivo = tieneOverride
          ? valorManual
          : esTC || esTI
            ? valorAutomatico
            : valorManual;

        row[headerKey] =
          valorEfectivo !== undefined && valorEfectivo !== null
            ? Number(valorEfectivo).toFixed(2)
            : "-";
      });

      row["Promedio Final"] = alumno.promedio.toFixed(2);
      return row;
    });
  }, [datosTabla, rubros]);

  const handleExport = useCallback(
    (format) => {
      const data = transformarDatosParaExportar();
      exportar(
        data,
        `Calif_${materiaClave}_P${parcial}_${selectedYear}`,
        format,
      );
    },
    [
      transformarDatosParaExportar,
      materiaClave,
      parcial,
      selectedYear,
      exportar,
    ],
  );

  // ==========================================
  // HANDLERS (CONTROLADORES DE EVENTOS)
  // ==========================================

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
    try {
      await syncCalificaciones_service(
        {
          grades: calificaciones,
          idGrupo: grupoId,
          parcial,
          yearC: selectedYear,
        },
        token,
      );

      setIsEditing(false);
      setIsSaving(false);
      setOriginalCalificaciones(calificaciones);
    } catch (err) {
      setSaveError(err.message);
      setIsSaving(false);
    }
  };

  const handleGradeChange = (matricula, idRubro, valor) => {
    const valorLimpio = valor.trim();
    let valorNumerico = valorLimpio === "" ? null : parseFloat(valorLimpio);

    if (
      valorNumerico !== null &&
      (isNaN(valorNumerico) || valorNumerico < 0 || valorNumerico > 10)
    )
      return;

    setCalificaciones((prev) => {
      const newState = [...prev];
      const idx = newState.findIndex(
        (c) =>
          c.alumno_matricula === matricula && c.id_rubro === Number(idRubro),
      );

      if (idx > -1) {
        newState[idx] = { ...newState[idx], calificacion: valorNumerico };
      } else if (valorNumerico !== null) {
        newState.push({
          alumno_matricula: matricula,
          id_rubro: Number(idRubro),
          calificacion: valorNumerico,
        });
      }
      return newState;
    });
  };

  // ==========================================
  // FLAGS PARA RENDER CONDICIONAL
  // ==========================================
  const isEssentialLoading = loadingRubros || loadingAlumnos;
  const canEdit =
    !isEssentialLoading &&
    !errorRubros &&
    !errorAlumnos &&
    datosTabla.length > 0;
  const isExportDisabled =
    isEssentialLoading || loadingCalificaciones || datosTabla.length === 0;

  // ==========================================
  // RENDER UI
  // ==========================================
  return (
    <Box
      sx={{
        p: 3,
        height: "calc(100vh - 64px)",
        bgcolor: "#f4f6f8",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: 2,
          border: "1px solid #e0e0e0",
        }}
      >
        <Stack direction="row" spacing={3} alignItems="center">
          <Box>
            <Typography
              variant="h6"
              fontWeight="bold"
              color="primary.main"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <SchoolIcon fontSize="small" /> {nombreMateria}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {idNormalizado
                ? `Perfil: ${idNormalizado} (${semestre})`
                : `Grupo: ${grupoId}`}
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <FormControl variant="standard" sx={{ minWidth: 100 }}>
            <Select
              value={parcial}
              onChange={(e) => setParcial(e.target.value)}
              disableUnderline
              sx={{ fontWeight: "bold", color: "text.primary" }}
              disabled={isEditing}
            >
              <MenuItem value={1}>Parcial 1</MenuItem>
              <MenuItem value={2}>Parcial 2</MenuItem>
              <MenuItem value={3}>Parcial 3</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Box
          sx={{ flexGrow: 1, display: "flex", justifyContent: "center", px: 4 }}
        >
          <TextField
            placeholder="Buscar alumno..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isEssentialLoading}
            sx={{
              width: "100%",
              maxWidth: 400,
              bgcolor: "white",
              borderRadius: 1,
              "& .MuiOutlinedInput-root": { borderRadius: 2 },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Exportar a Excel">
            <span>
              <IconButton
                onClick={() => handleExport("xlsx")}
                disabled={isExportDisabled}
                size="small"
              >
                <FileDownloadIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Gestionar Rúbros">
            <span>
              <IconButton
                onClick={() => setModalAbierto(true)}
                disabled={isEssentialLoading || isEditing}
                size="small"
              >
                <SettingsIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Divider
            orientation="vertical"
            flexItem
            sx={{ height: 20, alignSelf: "center" }}
          />

          {isEditing ? (
            <>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CloseIcon />}
                onClick={handleCancel}
                disabled={isSaving}
                size="small"
                sx={{ borderRadius: 2, textTransform: "none" }}
              >
                Cancelar
              </Button>
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
                size="small"
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  px: 3,
                  boxShadow: "none",
                }}
              >
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              disabled={!canEdit || loadingCalificaciones}
              size="small"
              sx={{
                borderRadius: 2,
                textTransform: "none",
                px: 3,
                boxShadow: "none",
              }}
            >
              Editar Calificaciones
            </Button>
          )}
        </Stack>
      </Paper>

      {saveError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {saveError}
        </Alert>
      )}

      <Paper
        elevation={2}
        sx={{
          flexGrow: 1,
          overflow: "hidden",
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TableContainer sx={{ flexGrow: 1 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    bgcolor: "#fcfcfc",
                    color: "text.secondary",
                    zIndex: 101,
                    left: 0,
                    position: "sticky",
                    borderBottom: "2px solid #e0e0e0",
                    width: "250px",
                  }}
                >
                  ESTUDIANTE
                </TableCell>

                {isEssentialLoading ? (
                  <TableCell>
                    <CircularProgress size={20} />
                  </TableCell>
                ) : (
                  !errorRubros &&
                  rubros.map((rubro) => (
                    <TableCell
                      key={rubro.id_rubro}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        bgcolor: "#fcfcfc",
                        color: "text.secondary",
                        borderBottom: "2px solid #e0e0e0",
                        minWidth: 100,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: "0.85rem" }}>
                          {rubro.nombre_rubro}
                        </span>
                        <Chip
                          label={`${(Number(rubro.ponderacion) * 100).toFixed(0)}%`}
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 16,
                            fontSize: "0.65rem",
                            mt: 0.5,
                            border: "none",
                            bgcolor: "#eef2f6",
                          }}
                        />
                      </Box>
                    </TableCell>
                  ))
                )}

                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    bgcolor: "#fcfcfc",
                    borderBottom: "2px solid #e0e0e0",
                    width: 80,
                  }}
                >
                  PROMEDIO
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isEssentialLoading || loadingCalificaciones ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 10 }}>
                    <CircularProgress />
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{ mt: 1 }}
                    >
                      Cargando datos...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                datosFiltrados.map((alumno, index) => (
                  <TableRow
                    key={alumno.alumno_matricula}
                    hover
                    sx={{ bgcolor: index % 2 === 0 ? "white" : "#fafafa" }}
                  >
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{
                        left: 0,
                        position: "sticky",
                        bgcolor: index % 2 === 0 ? "white" : "#fafafa",
                        zIndex: 100,
                        borderRight: "1px solid #f0f0f0",
                        fontSize: "0.85rem",
                      }}
                    >
                      {`${alumno.apellidop} ${alumno.apellidom} ${alumno.nombres}`}
                    </TableCell>

                    {rubros.map((rubro) => {
                      const esTC = rubro.nombre_rubro === "Trabajo Cotidiano";
                      const esTI = rubro.nombre_rubro === "Trabajo Integrador";
                      const esRubroEspecial = esTC || esTI;

                      const valorManual = alumno.calificacionesMap.get(
                        rubro.id_rubro,
                      );
                      const tieneOverride =
                        valorManual !== undefined && valorManual !== null;
                      const valorAutomatico = esTC
                        ? alumno.promedioTc
                        : esTI
                          ? alumno.promedioTi
                          : null;

                      const valorEfectivo = tieneOverride
                        ? valorManual
                        : esRubroEspecial
                          ? valorAutomatico
                          : valorManual;

                      return (
                        <TableCell
                          key={`${alumno.alumno_matricula}-${rubro.id_rubro}`}
                          align="center"
                        >
                          {isEditing ? (
                            <TextField
                              type="number"
                              fullWidth
                              value={valorEfectivo ?? ""}
                              onChange={(e) =>
                                handleGradeChange(
                                  alumno.alumno_matricula,
                                  rubro.id_rubro,
                                  e.target.value,
                                )
                              }
                              InputProps={{
                                disableUnderline: true,
                                sx: {
                                  fontSize: "0.9rem",
                                  textAlign: "center",
                                  color:
                                    tieneOverride && esRubroEspecial
                                      ? "error.main"
                                      : "inherit",
                                  fontWeight:
                                    tieneOverride && esRubroEspecial
                                      ? "bold"
                                      : "normal",
                                },
                              }}
                              inputProps={{
                                min: 0,
                                max: 10,
                                step: 0.1,
                                style: {
                                  textAlign: "center",
                                  padding: "12px 0",
                                  backgroundColor:
                                    index % 2 === 0 ? "transparent" : "#fafafa",
                                },
                              }}
                              variant="standard"
                              title={
                                esRubroEspecial && !tieneOverride
                                  ? "Valor calculado automáticamente. Edita para sobrescribir."
                                  : ""
                              }
                            />
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{
                                py: 1.5,
                                fontSize: "0.9rem",
                                color:
                                  esTC && !tieneOverride
                                    ? "primary.main"
                                    : esTI && !tieneOverride
                                      ? "secondary.main"
                                      : "text.primary",
                                fontWeight: "500",
                              }}
                            >
                              {valorEfectivo !== undefined &&
                              valorEfectivo !== null
                                ? Number(valorEfectivo).toFixed(2)
                                : "-"}

                              {tieneOverride && esRubroEspecial && (
                                <span
                                  style={{
                                    color: "red",
                                    fontSize: "10px",
                                    verticalAlign: "top",
                                  }}
                                >
                                  {" "}
                                  *
                                </span>
                              )}
                            </Typography>
                          )}
                        </TableCell>
                      );
                    })}

                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      <Box
                        sx={{
                          display: "inline-flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: 40,
                          height: 30,
                          borderRadius: 1,
                          bgcolor:
                            alumno.promedio >= 6
                              ? "success.light"
                              : "error.light",
                          color: "white",
                          opacity: 0.8,
                        }}
                      >
                        {alumno.promedio.toFixed(1)}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {modalAbierto && (
        <GestionarRubrosModal
          open={modalAbierto}
          onClose={() => setModalAbierto(false)}
          rubrosActuales={rubros}
          materiaClave={materiaClave}
          nombreMateria={nombreMateria}
          idGrupo={grupoId}
          yearAcademico={selectedYear}
          token={token}
          onGuardar={() => {
            setModalAbierto(false);
            cargarRubros();
          }}
        />
      )}
    </Box>
  );
};

export default GestionarRubros;

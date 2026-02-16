// Importaciones de React y hooks
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import GestionTrabajos from "../../components/modals/Gestion/GestionTrabajos.jsx";
import { useExport } from "../../utils/useExport.js";

// Importa AMBOS servicios de alumnos
import {
  fetchAlumnoPerfilGet,
  fetchAlumnoGrupoGet,
} from "../../services/alumnosService.js";

import {
  fetchRubrosTCGet,
  syncCalificacionesTC_service,
  fetchCalificacionesTCGet,
} from "../../services/rubroService.js";

import CopiarActividadesModal from "../../components/modals/Gestion/CopiarTrabajosModal.jsx";

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
  Select,
  MenuItem,
  Tooltip,
  IconButton,
  Divider,
  Chip,
} from "@mui/material";

// Iconos
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close"; // Más limpio para cancelar
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SchoolIcon from "@mui/icons-material/School";
import AssignmentIcon from "@mui/icons-material/Assignment";

const currentYear = new Date().getFullYear();

const TrabajoCotidiano = () => {
  const { token, user, isDirector } = useAuth();
  const location = useLocation();

  // 1. DESESTRUCTURACIÓN
  const {
    grupoId,
    materiaClave,
    nombreMateria,
    year: initialYear,
    idNormalizado,
    semestre,
  } = location.state || {};

  const listaGruposDisponibles = useMemo(() => {
    if (!grupoId || grupoId.length < 2) return [];
    const letra = grupoId.slice(-1).toUpperCase();
    const grado = grupoId.slice(0, -1);
    const letraContraria = letra === "A" ? "B" : "A";
    return [`${grado}${letraContraria}`];
  }, [grupoId]);

  const isPerfilMode = Boolean(idNormalizado && semestre);

  // --- ESTADOS ---
  const [rubros, setRubros] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [originalCalificaciones, setOriginalCalificaciones] = useState([]);

  // --- FILTROS ---
  const [parcial, setParcial] = useState(1);
  const [selectedYear, setSelectedYear] = useState(initialYear || currentYear);

  // --- UI ---
  const [loadingRubros, setLoadingRubros] = useState(true);
  const [errorRubros, setErrorRubros] = useState(null);
  const [loadingAlumnos, setLoadingAlumnos] = useState(true);
  const [errorAlumnos, setErrorAlumnos] = useState(null);
  const [loadingCalificaciones, setLoadingCalificaciones] = useState(false);
  const [errorCalificaciones, setErrorCalificaciones] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalCopiarAbierto, setModalCopiarAbierto] = useState(false);

  // --- EDICIÓN Y EXPORTACIÓN ---
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const { exportar } = useExport();
  const [totalRubros, setTotalRubros] = useState(0);
  const [ContadorCalificacionesPorAlumno, setContadorCalificacionesPorAlumno] =
    useState({});

  // -----------------------------------------------------------------------
  // CARGA 1: RÚBROS
  // -----------------------------------------------------------------------
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
      const data = await fetchRubrosTCGet(datosEnviar, token);
      const rubrosOrdenados = (data || []).sort((a, b) => {
        const fechaA = new Date(a.fecha_limite || 0);
        const fechaB = new Date(b.fecha_limite || 0);
        return fechaB - fechaA;
      });
      setRubros(rubrosOrdenados);
      setTotalRubros(rubrosOrdenados.length);
    } catch (err) {
      setErrorRubros(err.message);
    } finally {
      setLoadingRubros(false);
    }
  }, [materiaClave, grupoId, parcial, selectedYear, token]);

  useEffect(() => {
    cargarRubros();
  }, [cargarRubros]);

  // -----------------------------------------------------------------------
  // CARGA 2: ALUMNOS
  // -----------------------------------------------------------------------
  useEffect(() => {
    const cargarAlumnos = async () => {
      setLoadingAlumnos(true);
      setErrorAlumnos(null);
      try {
        let data;
        if (isPerfilMode)
          data = await fetchAlumnoPerfilGet(token, idNormalizado, semestre);
        else data = await fetchAlumnoGrupoGet(token, grupoId);

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
    if (token && (grupoId || (idNormalizado && semestre))) cargarAlumnos();
  }, [grupoId, idNormalizado, semestre, token, isPerfilMode]);

  // -----------------------------------------------------------------------
  // HELPERS
  // -----------------------------------------------------------------------
  const getStringFromValor = (valorNumerico, rubro) => {
    if (valorNumerico === null || valorNumerico === undefined) return null;
    const valor = Number(valorNumerico);
    const ponderacion = Number(rubro?.ponderacion || 0);
    const pInsuficiente = Number(rubro?.ponderacioninsuficiente || 0);
    if (valor === 1) return "Si";
    if (valor === 0) return "No";
    if (ponderacion > 0 && valor === ponderacion) return "R";
    if (pInsuficiente > 0 && valor === pInsuficiente) return "I";
    return null;
  };

  const getValorNumericoParaDB = (valorString, rubro) => {
    switch (valorString) {
      case "Si":
      case "J":
        return 1.0;
      case "No":
        return 0;
      case "R":
        return Number(rubro.ponderacion);
      case "I":
        return Number(rubro.ponderacioninsuficiente);
      default:
        return null;
    }
  };

  // -----------------------------------------------------------------------
  // CARGA 3: CALIFICACIONES
  // -----------------------------------------------------------------------
  useEffect(() => {
    const cargarCalificaciones = async () => {
      if (!materiaClave || !parcial || !selectedYear) return;
      if (loadingRubros || loadingAlumnos) return;
      setLoadingCalificaciones(true);

      const rubrosMap = new Map();
      rubros.forEach((r) => rubrosMap.set(r.idrubrotc, r));

      try {
        const context = {
          materiaClave,
          idGrupo: grupoId,
          parcial,
          yearC: selectedYear,
        };
        const data = await fetchCalificacionesTCGet(context, token);
        const calificacionesTransformadas = data.map((calif) => {
          const rubroInfo = rubrosMap.get(calif.idrubrotc);
          let valorParaUI = calif.estado;
          if (!valorParaUI && calif.calificacion !== null) {
            valorParaUI = getStringFromValor(calif.calificacion, rubroInfo);
          }
          return { ...calif, calificacion: valorParaUI };
        });

        setCalificaciones(calificacionesTransformadas);
        setOriginalCalificaciones(calificacionesTransformadas);

        const nuevosContadores = {};
        data.forEach((calif) => {
          const key = calif.alumno_matricula;
          if (calif.estado || (calif.calificacion && calif.calificacion > 0)) {
            nuevosContadores[key] = (nuevosContadores[key] || 0) + 1;
          }
        });
        setContadorCalificacionesPorAlumno(nuevosContadores);
      } catch (err) {
        setErrorCalificaciones("Error cargando notas: " + err.message);
      } finally {
        setLoadingCalificaciones(false);
      }
    };
    cargarCalificaciones();
  }, [
    materiaClave,
    grupoId,
    parcial,
    selectedYear,
    token,
    loadingRubros,
    loadingAlumnos,
    rubros,
  ]);

  // -----------------------------------------------------------------------
  // CÁLCULO DE PROMEDIOS
  // -----------------------------------------------------------------------
  const datosTabla = useMemo(() => {
    const califMap = new Map();
    calificaciones.forEach((c) => {
      if (!califMap.has(c.alumno_matricula))
        califMap.set(c.alumno_matricula, new Map());
      califMap.get(c.alumno_matricula).set(c.idrubrotc, c.calificacion);
    });

    return alumnos.map((alumno) => {
      const susCalificaciones =
        califMap.get(alumno.alumno_matricula) || new Map();
      let sumaPuntos = 0;
      rubros.forEach((rubro) => {
        const valString = susCalificaciones.get(rubro.idrubrotc);
        let puntos = 0;
        if (valString === "Si" || valString === "J") puntos = 1.0;
        else if (valString === "R") puntos = Number(rubro.ponderacion);
        else if (valString === "I")
          puntos = Number(rubro.ponderacioninsuficiente);
        sumaPuntos += puntos;
      });
      const promedio =
        rubros.length > 0 ? (sumaPuntos / rubros.length) * 10 : 0;
      return { ...alumno, calificacionesMap: susCalificaciones, promedio };
    });
  }, [alumnos, calificaciones, rubros]);

  // -----------------------------------------------------------------------
  // MANEJADORES
  // -----------------------------------------------------------------------
  const handleEdit = () => {
    setIsEditing(true);
    setSaveError(null);
  };
  const handleCancel = () => {
    setIsEditing(false);
    setCalificaciones(originalCalificaciones);
    setSaveError(null);
  };

  const handleGradeChange = (matricula, idRubro, valorLetra) => {
    const valorFinal = valorLetra === "" ? null : valorLetra;
    setCalificaciones((prev) => {
      const copia = [...prev];
      const idx = copia.findIndex(
        (c) =>
          c.alumno_matricula === matricula && c.idrubrotc === Number(idRubro),
      );
      if (idx > -1) copia[idx] = { ...copia[idx], calificacion: valorFinal };
      else
        copia.push({
          alumno_matricula: matricula,
          idrubrotc: Number(idRubro),
          calificacion: valorFinal,
        });
      return copia;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    const rubrosMap = new Map(rubros.map((r) => [r.idrubrotc, r]));
    const payload = calificaciones.map((c) => {
      const rubro = rubrosMap.get(c.idrubrotc);
      const estadoLetra = c.calificacion;
      return {
        idrubrotc: c.idrubrotc,
        alumno_matricula: c.alumno_matricula,
        calificacion: getValorNumericoParaDB(estadoLetra, rubro),
        estado: estadoLetra,
      };
    });
    try {
      await syncCalificacionesTC_service({ grades: payload }, token);
      setIsEditing(false);
      setOriginalCalificaciones(calificaciones);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = useCallback(() => {
    if (!datosTabla.length) return;
    const headers = [
      "Matrícula",
      "Primer Apellido",
      "Segundo Apellido",
      "Nombres",
      ...rubros.map((r) => `${r.nombre_rubro}`),
      "Promedio Final",
    ];
    const data = datosTabla.map((al) => {
      const row = {
        Matrícula: al.alumno_matricula,
        "Primer Apellido": al.apellidop || "",
        "Segundo Apellido": al.apellidom || "",
        Nombres: al.nombres || "",
      };
      rubros.forEach((r, i) => {
        row[headers[i + 4]] = al.calificacionesMap.get(r.idrubrotc) || "-";
      });
      row["Promedio Final"] = al.promedio.toFixed(2);
      return row;
    });
    exportar(
      data,
      `TC_${materiaClave}_${isPerfilMode ? "Perfil" : "Gpo"}_${parcial}`,
      "xlsx",
    );
  }, [datosTabla, rubros, materiaClave, parcial, isPerfilMode, exportar]);

  const isEssentialLoading = loadingRubros || loadingAlumnos;
  const canEdit =
    !isEssentialLoading &&
    !errorRubros &&
    !errorAlumnos &&
    datosTabla.length > 0;

  // -----------------------------------------------------------------------
  // RENDER UI MEJORADA
  // -----------------------------------------------------------------------
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
          border: "1px solid #e0e0e0",
        }}
      >
        {/* IZQUIERDA: INFORMACIÓN Y SELECTOR */}
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
              {isPerfilMode
                ? `Trabajo Cotidiano - Perfil ${grupoId}`
                : `Trabajo Cotidiano - Grupo ${grupoId}`}
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
              {[1, 2, 3].map((p) => (
                <MenuItem key={p} value={p}>
                  Parcial {p}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* DERECHA: ACCIONES */}
        <Stack direction="row" spacing={1} alignItems="center">
          {/* BOTONES ICONOS */}
          {!isPerfilMode && (
            <Tooltip title="Copiar de otro grupo">
              <span>
                <IconButton
                  onClick={() => setModalCopiarAbierto(true)}
                  disabled={isEssentialLoading || isEditing}
                  size="small"
                >
                  <ContentCopyIcon />
                </IconButton>
              </span>
            </Tooltip>
          )}

          <Tooltip title="Exportar a Excel">
            <span>
              <IconButton
                onClick={handleExport}
                disabled={isEssentialLoading || isEditing}
                size="small"
              >
                <FileDownloadIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Nueva Actividad">
            <span>
              <IconButton
                onClick={() => setModalAbierto(true)}
                disabled={isEssentialLoading || isEditing}
                size="small"
                color="primary"
              >
                <AddCircleOutlineIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Divider
            orientation="vertical"
            flexItem
            sx={{ height: 20, alignSelf: "center" }}
          />

          {/* BOTÓN PRINCIPAL */}
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
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              disabled={!canEdit}
              size="small"
              sx={{
                borderRadius: 2,
                textTransform: "none",
                px: 3,
                boxShadow: "none",
              }}
            >
              Editar Notas
            </Button>
          )}
        </Stack>
      </Paper>

      {saveError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {saveError}
        </Alert>
      )}

      {/* ÁREA DE TABLA */}
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

                {rubros.map((r) => (
                  <TableCell
                    key={r.idrubrotc}
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
                      <span
                        style={{
                          fontSize: "0.85rem",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <AssignmentIcon sx={{ fontSize: 14, opacity: 0.6 }} />
                        {r.nombre_rubro}
                      </span>
                      <Typography
                        variant="caption"
                        sx={{ fontSize: "0.65rem", color: "text.disabled" }}
                      >
                        {r.fecha_limite?.split("T")[0] || "Sin fecha"}
                      </Typography>
                    </Box>
                  </TableCell>
                ))}

                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    bgcolor: "#fcfcfc",
                    borderBottom: "2px solid #e0e0e0",
                    width: 80,
                    right: 0,
                    position: "sticky",
                    zIndex: 101,
                    borderLeft: "1px solid #e0e0e0",
                  }}
                >
                  PROMEDIO
                </TableCell>

                {isDirector && (
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      bgcolor: "#fcfcfc",
                      borderBottom: "2px solid #e0e0e0",
                    }}
                  >
                    ENTREGAS
                  </TableCell>
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {isEssentialLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={rubros.length + 3}
                    align="center"
                    sx={{ py: 10 }}
                  >
                    <CircularProgress />
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{ mt: 1 }}
                    >
                      Cargando actividades...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                datosTabla.map((al, index) => (
                  <TableRow
                    key={al.alumno_matricula}
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
                      {`${al.apellidop} ${al.apellidom} ${al.nombres}`}
                    </TableCell>

                    {rubros.map((r) => (
                      <TableCell key={r.idrubrotc} align="center" sx={{ p: 0 }}>
                        {isEditing ? (
                          <Select
                            size="small"
                            value={al.calificacionesMap.get(r.idrubrotc) ?? ""}
                            onChange={(e) =>
                              handleGradeChange(
                                al.alumno_matricula,
                                r.idrubrotc,
                                e.target.value,
                              )
                            }
                            displayEmpty
                            variant="standard"
                            disableUnderline
                            sx={{
                              width: "100%",
                              fontSize: "0.9rem",
                              textAlign: "center",
                              "& .MuiSelect-select": {
                                py: 1.5,
                                textAlign: "center",
                              },
                            }}
                          >
                            <MenuItem value="">
                              <em style={{ color: "#ccc" }}>-</em>
                            </MenuItem>
                            <MenuItem value="Si" sx={{ color: "success.main" }}>
                              Si (1.0)
                            </MenuItem>
                            <MenuItem value="No" sx={{ color: "error.main" }}>
                              No (0)
                            </MenuItem>
                            <MenuItem value="J" sx={{ color: "warning.main" }}>
                              J (1.0)
                            </MenuItem>
                            <MenuItem value="R" sx={{ color: "info.main" }}>
                              R ({Number(r.ponderacion)})
                            </MenuItem>
                            <MenuItem
                              value="I"
                              sx={{ color: "text.secondary" }}
                            >
                              I ({Number(r.ponderacioninsuficiente)})
                            </MenuItem>
                          </Select>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{
                              py: 1.5,
                              color:
                                al.calificacionesMap.get(r.idrubrotc) === "Si"
                                  ? "success.main"
                                  : al.calificacionesMap.get(r.idrubrotc) ===
                                      "No"
                                    ? "error.light"
                                    : "text.primary",
                              fontWeight: al.calificacionesMap.get(r.idrubrotc)
                                ? "500"
                                : "400",
                            }}
                          >
                            {al.calificacionesMap.get(r.idrubrotc) ?? "-"}
                          </Typography>
                        )}
                      </TableCell>
                    ))}

                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        right: 0,
                        position: "sticky",
                        bgcolor: index % 2 === 0 ? "#f9f9f9" : "#f0f0f0",
                        borderLeft: "1px solid #e0e0e0",
                        zIndex: 99,
                      }}
                    >
                      <Box
                        sx={{
                          display: "inline-flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: 40,
                          height: 28,
                          borderRadius: 1,
                          bgcolor:
                            al.promedio >= 6 ? "success.light" : "error.light",
                          color: "white",
                          opacity: 0.9,
                          fontSize: "0.85rem",
                        }}
                      >
                        {al.promedio.toFixed(1)}
                      </Box>
                    </TableCell>

                    {isDirector && (
                      <TableCell align="center">
                        <Chip
                          label={`${ContadorCalificacionesPorAlumno[al.alumno_matricula] || 0} / ${totalRubros}`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: "0.7rem", height: 20 }}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* MODALES (MISMOS QUE ANTES) */}
      {modalAbierto && (
        <GestionTrabajos
          open={modalAbierto}
          onClose={() => setModalAbierto(false)}
          rubrosActuales={rubros}
          token={token}
          materiaClave={materiaClave}
          nombreMateria={nombreMateria}
          idGrupo={grupoId}
          parcial={parcial}
          yearC={selectedYear}
          onGuardar={() => {
            setModalAbierto(false);
            cargarRubros();
          }}
        />
      )}

      {modalCopiarAbierto && (
        <CopiarActividadesModal
          open={modalCopiarAbierto}
          onClose={() => setModalCopiarAbierto(false)}
          materiaClave={materiaClave}
          grupoActualId={grupoId}
          parcial={parcial}
          yearC={selectedYear}
          token={token}
          listaGrupos={listaGruposDisponibles}
          onSuccess={() => {
            cargarRubros();
          }}
        />
      )}
    </Box>
  );
};

export default TrabajoCotidiano;

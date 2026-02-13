// Importaciones de React y hooks
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import GestionarRubrosModal from "../../components/modals/Gestion/GestionarRubrosModal.jsx";

// Importa tus servicios reales
import {
  fetchRubrosMateriaGet,
  syncCalificaciones_service,
  fetchRubrosCalificacionesGet,
} from "../../services/rubroService.js";

// CAMBIO CRUCIAL: Importar AMBOS servicios de alumnos
import { 
  fetchAlumnoGrupoGet, 
  fetchAlumnoPerfilGet 
} from "../../services/alumnosService.js";

// Hook de exportación
import { useExport } from "../../utils/useExport.js";

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
  Tooltip,
} from "@mui/material";

import SettingsIcon from "@mui/icons-material/Settings";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import DownloadIcon from "@mui/icons-material/Download";

const currentYear = new Date().getFullYear();
const years = Array.from(new Array(3), (val, index) => currentYear - index);

/**
 * Componente principal unificado para gestionar calificaciones de un grupo o perfil.
 */
const GestionarRubros = () => {
  const { token } = useAuth();
  const location = useLocation();
  const {
    grupoId,
    idNormalizado, // Existirá solo si es modo Perfil
    semestre,      // Existirá solo si es modo Perfil
    materiaClave,
    nombreMateria,
    year: initialYear,
  } = location.state || {};

  // --- Hook de exportación ---
  const { exportar } = useExport();

  // --- ESTADOS DE DATOS ---
  const [rubros, setRubros] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [originalCalificaciones, setOriginalCalificaciones] = useState([]);

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

  // --- CARGA 1: RÚBROS ---
  const cargarRubros = useCallback(async () => {
    if (!materiaClave || !grupoId) {
      setErrorRubros("Faltan datos de materia o grupo para cargar los rúbros.");
      setLoadingRubros(false);
      return;
    }
    setLoadingRubros(true);
    setErrorRubros(null);
    try {
      const data = await fetchRubrosMateriaGet(
        materiaClave,
        grupoId,
        selectedYear,
        token
      );
      setRubros(data.rubros || []);
    } catch (err) {
      setErrorRubros(err.message);
    } finally {
      setLoadingRubros(false);
    }
  }, [materiaClave, grupoId, selectedYear, token]);

  useEffect(() => {
    cargarRubros();
  }, [cargarRubros]);

  // --- CARGA 2: ALUMNOS (LÓGICA HÍBRIDA CORREGIDA) ---
  useEffect(() => {
    const cargarAlumnos = async () => {
      setLoadingAlumnos(true);
      setErrorAlumnos(null);
      try {
        let data;
        
        // Si tenemos idNormalizado y semestre, es modo PERFIL
        if (idNormalizado && semestre) {
          data = await fetchAlumnoPerfilGet(token, idNormalizado, semestre);
        } 
        // Si solo tenemos grupoId, es modo GRUPO NORMAL
        else if (grupoId) {
          data = await fetchAlumnoGrupoGet(token, grupoId);
        } 
        else {
          throw new Error("No se proporcionaron identificadores válidos.");
        }
        
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
    
    // Condición de ejecución: Debe haber grupoId (para grupo) o idNormalizado+semestre (para perfil)
    if (grupoId || (idNormalizado && semestre)) {
      cargarAlumnos();
    } else {
      setLoadingAlumnos(false);
      setErrorAlumnos("Faltan datos de identificación del grupo o perfil.");
    }
  }, [grupoId, idNormalizado, semestre, token]);

  // --- CARGA 3: CALIFICACIONES ---
  useEffect(() => {
    const cargarCalificaciones = async () => {
      if (!materiaClave || !parcial || !selectedYear || !grupoId) return;

      setLoadingCalificaciones(true);
      setErrorCalificaciones(null);
      setIsEditing(false);
      setSaveError(null);

      try {
        const data = await fetchRubrosCalificacionesGet(
          materiaClave,
          parcial,
          selectedYear,
          grupoId,
          token
        );
        setCalificaciones(data);
        setOriginalCalificaciones(data);
      } catch (err) {
        console.error("Error cargando calificaciones:", err);
        setErrorCalificaciones("Error al cargar calificaciones: " + err.message);
      } finally {
        setLoadingCalificaciones(false);
      }
    };

    if (!loadingRubros && !loadingAlumnos) {
      cargarCalificaciones();
    }
  }, [
    materiaClave,
    parcial,
    selectedYear,
    grupoId,
    token,
    loadingRubros,
    loadingAlumnos,
  ]);

  // --- COMBINACIÓN DE DATOS ---
  const datosTabla = useMemo(() => {
    const califMap = new Map();
    for (const calif of calificaciones) {
      if (!califMap.has(calif.alumno_matricula)) {
        califMap.set(calif.alumno_matricula, new Map());
      }
      califMap
        .get(calif.alumno_matricula)
        .set(calif.id_rubro, calif.calificacion);
    }

    return alumnos.map((alumno) => {
      const susCalificaciones = califMap.get(alumno.alumno_matricula) || new Map();

      let sumaPonderada = 0;
      let ponderacionTotal = 0;

      for (const rubro of rubros) {
        const nota = susCalificaciones.get(rubro.id_rubro);
        if (nota !== null && nota !== undefined) {
          sumaPonderada += nota * Number(rubro.ponderacion);
          ponderacionTotal += Number(rubro.ponderacion);
        }
      }

      const promedio = ponderacionTotal > 0 ? sumaPonderada / ponderacionTotal : 0;

      return {
        ...alumno,
        calificacionesMap: susCalificaciones,
        promedio: promedio,
      };
    });
  }, [alumnos, calificaciones, rubros]);

  // --- LÓGICA DE EXPORTACIÓN ---
  const transformarDatosParaExportar = useCallback(() => {
    if (!datosTabla.length) return [];

    const headers = [
      "Matrícula",
      "Primer Apellido",
      "Segundo Apellido",
      "Nombres",
      ...rubros.map(
        (rubro) => `Rúbro: ${rubro.nombre_rubro} (${Number(rubro.ponderacion) * 100}%)`
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
        const idRubro = rubro.id_rubro;
        const valorDelMapa = alumno.calificacionesMap.get(idRubro);
        const calificacionNumerica = parseFloat(valorDelMapa);
        const headerKey = headers[index + 4];

        if (typeof calificacionNumerica === "number" && !isNaN(calificacionNumerica)) {
          row[headerKey] = calificacionNumerica.toFixed(2);
        } else {
          row[headerKey] = "-";
        }
      });

      row["Promedio Final"] = alumno.promedio.toFixed(2);
      return row;
    });
  }, [datosTabla, rubros]);

  const handleExport = useCallback(
    (format) => {
      const dataToExport = transformarDatosParaExportar();
      const fileNameBase = `Calificaciones_${materiaClave}_P${parcial}_${selectedYear}`;
      exportar(dataToExport, fileNameBase, format);
    },
    [transformarDatosParaExportar, materiaClave, parcial, selectedYear, exportar]
  );

  // --- MANEJADORES DE EVENTOS ---
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

    const batchData = {
      grades: calificaciones,
      idGrupo: grupoId,
      parcial: parcial,
      yearC: selectedYear,
    };

    try {
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
    const valorLimpio = valor.trim();
    let valorNumerico;

    if (valorLimpio === "") {
      valorNumerico = null;
    } else {
      valorNumerico = parseFloat(valorLimpio);
      if (isNaN(valorNumerico)) return;
      if (valorNumerico < 0) valorNumerico = 0;
      if (valorNumerico > 10) valorNumerico = 10;
    }

    setCalificaciones((prevCalificaciones) => {
      const newState = [...prevCalificaciones];
      const index = newState.findIndex(
        (c) => c.alumno_matricula === matricula && c.id_rubro === Number(idRubro)
      );

      if (index > -1) {
        newState[index] = { ...newState[index], calificacion: valorNumerico };
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

  // --- RENDERIZADO PRINCIPAL ---
  const isEssentialLoading = loadingRubros || loadingAlumnos;
  const canEdit = !isEssentialLoading && !errorRubros && !errorAlumnos && datosTabla.length > 0;
  const isExportDisabled = isEssentialLoading || loadingCalificaciones || datosTabla.length === 0;

  return (
    <Box
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 64px)",
      }}
    >
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
            {/* Mostrar el título dinámico dependiendo de si es perfil o grupo */}
            Calificaciones {idNormalizado ? `Perfil ${idNormalizado} (${semestre})` : `Grupo ${grupoId}`}
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }} disabled={isEditing}>
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
          <span>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport("xlsx")}
              disabled={isExportDisabled}
            >
              Exportar XLSX
            </Button>
          </span>

          {isEditing ? (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
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
            startIcon={<SettingsIcon />}
            onClick={() => setModalAbierto(true)}
            disabled={isEssentialLoading || isEditing}
          >
            Gestionar Rúbros
          </Button>
        </Stack>
      </Box>

      {saveError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {saveError}
        </Alert>
      )}

      <Box
        sx={{
          flexGrow: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <TableContainer component={Paper} sx={{ flexGrow: 1, overflow: "auto" }}>
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
                      <Typography variant="caption" display="block" color="text.secondary">
                        ({Number(rubro.ponderacion) * 100}%)
                      </Typography>
                    </TableCell>
                  ))
                )}

                <TableCell sx={{ fontWeight: "bold", minWidth: 100 }} align="center">
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
                datosTabla.map((alumno) => (
                  <TableRow key={alumno.alumno_matricula} hover sx={{ height: "35px" }}>
                    <TableCell
                      component="th"
                      scope="row"
                      size="small"
                      sx={{
                        left: 0,
                        position: "sticky",
                        backgroundColor: "#f9f9f9",
                        zIndex: 100,
                        fontWeight: "500",
                        borderRight: "2px solid rgba(224, 224, 224, 1)",
                        boxShadow: "4px 0px 8px -2px rgba(0,0,0,0.05)",
                      }}
                    >
                      {` ${alumno.apellidop} ${alumno.apellidom} ${alumno.nombres}`}
                    </TableCell>

                    {rubros.map((rubro) => (
                      <TableCell key={`${alumno.alumno_matricula}-${rubro.id_rubro}`} align="center">
                        {isEditing ? (
                          <TextField
                            type="number"
                            fullWidth
                            variant="standard"
                            value={alumno.calificacionesMap.get(rubro.id_rubro) ?? ""}
                            onChange={(e) =>
                              handleGradeChange(
                                alumno.alumno_matricula,
                                rubro.id_rubro,
                                e.target.value
                              )
                            }
                            InputProps={{
                              disableUnderline: true,
                              sx: { fontSize: "0.85rem" },
                            }}
                            inputProps={{
                              min: 0,
                              max: 10,
                              step: 0.1,
                              style: {
                                textAlign: "center",
                                padding: "5px 0",
                                backgroundColor: "#fafafa",
                              },
                            }}
                            disabled={isSaving}
                          />
                        ) : (
                          <div style={{ fontSize: "0.85rem", padding: "5px 0" }}>
                            {alumno.calificacionesMap.get(rubro.id_rubro) ?? "-"}
                          </div>
                        )}
                      </TableCell>
                    ))}

                    <TableCell
                      align="center"
                      size="small"
                      sx={{
                        padding: "4px",
                        fontWeight: "bold",
                        fontSize: "0.85rem",
                        color: alumno.promedio >= 6 ? "success.main" : "error.main",
                      }}
                    >
                      {isEditing ? (
                        <Tooltip title="El promedio final se actualizará al guardar">
                          <span style={{ fontStyle: "italic", color: "gray", opacity: 0.7 }}>
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
          nombreMateria={nombreMateria}
          idGrupo={grupoId}
          yearAcademico={selectedYear}
          token={token}
          onGuardar={() => {
            setModalAbierto(false);
            cargarRubros(); // Recarga la configuración
          }}
        />
      )}
    </Box>
  );
};

export default GestionarRubros;
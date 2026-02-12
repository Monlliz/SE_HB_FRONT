// Importaciones de React y hooks
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import GestionTrabajos from "../../components/modals/Gestion/GestionTrabajos.jsx";
import { useExport } from "../../utils/useExport.js";

// Importa AMBOS servicios de alumnos
import {
  fetchAlumnoPerfilGet, // Servicio para Modo Perfil
  fetchAlumnoGrupoGet, // Servicio para Modo General
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
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { ClipboardPaste } from "lucide-react";

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
        if (isPerfilMode) {
          data = await fetchAlumnoPerfilGet(token, idNormalizado, semestre);
        } else {
          data = await fetchAlumnoGrupoGet(token, grupoId);
        }

        const alumnosNormalizados = (data.alumnos || []).map((a) => ({
          ...a,
          alumno_matricula: a.matricula,
        }));

        setAlumnos(alumnosNormalizados);
      } catch (err) {
        console.error("Error cargando alumnos:", err);
        setErrorAlumnos(err.message);
      } finally {
        setLoadingAlumnos(false);
      }
    };

    if (token && (grupoId || (idNormalizado && semestre))) {
      cargarAlumnos();
    }
  }, [grupoId, idNormalizado, semestre, token, isPerfilMode]);

  // -----------------------------------------------------------------------
  // HELPERS (Lógica de negocio)
  // -----------------------------------------------------------------------
  
  // OPTIMIZACIÓN: Solo se usa como "fallback" si la BD no trae el estado explícito
  const getStringFromValor = (valorNumerico, rubro) => {
    if (valorNumerico === null || valorNumerico === undefined) return null;
    const valor = Number(valorNumerico);
    const ponderacion = Number(rubro?.ponderacion || 0);
    const pInsuficiente = Number(rubro?.ponderacioninsuficiente || 0);

    if (valor === 1) return "Si";
    if (valor === 0) return "No";
    // OJO: Si ponderacion y pInsuficiente son iguales, esto podría fallar,
    // pero gracias a la columna 'estado' ya no dependemos de esto.
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
  // CARGA 3: CALIFICACIONES (OPTIMIZADO CON ESTADO)
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
          
          // CAMBIO CLAVE: Prioridad a 'calif.estado'. 
          // Si existe el estado en BD, lo usamos directo (Optimización y Exactitud).
          // Si es null (dato legacy), intentamos deducirlo con getStringFromValor.
          let valorParaUI = calif.estado; 
          
          if (!valorParaUI && calif.calificacion !== null) {
              valorParaUI = getStringFromValor(calif.calificacion, rubroInfo);
          }

          return {
            ...calif,
            // En el estado de React guardamos la LETRA ('Si', 'R', etc.) para el Select
            calificacion: valorParaUI, 
          };
        });

        setCalificaciones(calificacionesTransformadas);
        setOriginalCalificaciones(calificacionesTransformadas);

        // Contador simple (si tiene letra asignada, cuenta como entregado/evaluado)
        const nuevosContadores = {};
        data.forEach((calif) => {
          const key = calif.alumno_matricula;
          // Contamos si existe estado o calificación positiva
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
  // CÁLCULO DE PROMEDIOS (MEMOIZADO & ROBUSTO)
  // -----------------------------------------------------------------------
  const datosTabla = useMemo(() => {
    const califMap = new Map();
    calificaciones.forEach((c) => {
      if (!califMap.has(c.alumno_matricula))
        califMap.set(c.alumno_matricula, new Map());
      // Aquí 'c.calificacion' ya contiene la LETRA ('Si', 'R', 'I') gracias a la carga optimizada
      califMap.get(c.alumno_matricula).set(c.idrubrotc, c.calificacion);
    });

    return alumnos.map((alumno) => {
      const susCalificaciones =
        califMap.get(alumno.alumno_matricula) || new Map();
      let sumaPuntos = 0;

      rubros.forEach((rubro) => {
        // Obtenemos la letra directamente
        const valString = susCalificaciones.get(rubro.idrubrotc);
        
        // Lógica de puntos basada en la letra (No adivinamos decimales)
        let puntos = 0;
        if (valString === "Si" || valString === "J") puntos = 1.0;
        else if (valString === "R") puntos = Number(rubro.ponderacion);
        else if (valString === "I") puntos = Number(rubro.ponderacioninsuficiente);
        // "No" o null suman 0

        sumaPuntos += puntos;
      });

      const promedio =
        rubros.length > 0 ? (sumaPuntos / rubros.length) * 10 : 0;

      return {
        ...alumno,
        calificacionesMap: susCalificaciones,
        promedio,
      };
    });
  }, [alumnos, calificaciones, rubros]);

  // -----------------------------------------------------------------------
  // MANEJADORES (HANDLERS)
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
    // valorLetra es "Si", "R", "I", etc.
    const valorFinal = valorLetra === "" ? null : valorLetra;
    
    setCalificaciones((prev) => {
      const copia = [...prev];
      const idx = copia.findIndex(
        (c) =>
          c.alumno_matricula === matricula && c.idrubrotc === Number(idRubro),
      );
      
      if (idx > -1) {
          copia[idx] = { ...copia[idx], calificacion: valorFinal };
      } else {
        copia.push({
          alumno_matricula: matricula,
          idrubrotc: Number(idRubro),
          calificacion: valorFinal, // Guardamos la letra en el estado
        });
      }
      return copia;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    const rubrosMap = new Map(rubros.map((r) => [r.idrubrotc, r]));

    // CAMBIO IMPORTANTE: Preparar payload con ESTADO y CALIFICACIÓN
    const payload = calificaciones.map((c) => {
        const rubro = rubrosMap.get(c.idrubrotc);
        const estadoLetra = c.calificacion; // En el state tenemos la letra

        return {
            idrubrotc: c.idrubrotc,
            alumno_matricula: c.alumno_matricula,
            // 1. Enviamos el número calculado con la regla actual
            calificacion: getValorNumericoParaDB(estadoLetra, rubro),
            // 2. Enviamos la letra explícita para el historial
            estado: estadoLetra
        };
    });

    try {
      await syncCalificacionesTC_service({ grades: payload }, token);
      setIsEditing(false);
      // Al guardar, el estado actual se convierte en el "original"
      setOriginalCalificaciones(calificaciones);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Exportar Excel
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

  // -----------------------------------------------------------------------
  // RENDER (Sin cambios mayores, solo uso de la lógica actualizada)
  // -----------------------------------------------------------------------
  return (
    <Box
      sx={{
        p: 3,
        "@media (orientation: portrait)": {
          marginTop: 10,
        },
        height: "calc(100vh )",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Box>
          <Typography variant="h5">Materia: {nombreMateria}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {isPerfilMode
              ? `Trabajo Cotidiano - Perfil  ${grupoId}`
              : `Trabajo Cotidiano - Grupo ${grupoId}`}
          </Typography>

          <FormControl size="small" sx={{ mt: 2, minWidth: 120 }}>
            <InputLabel>Parcial</InputLabel>
            <Select
              value={parcial}
              label="Parcial"
              onChange={(e) => setParcial(e.target.value)}
              disabled={isEditing}
            >
              {[1, 2, 3].map((p) => (
                <MenuItem key={p} value={p}>
                  Parcial {p}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Stack direction="row" spacing={2} alignItems="flex-start">
          {isPerfilMode ? null : (
            <Button
              startIcon={<ClipboardPaste />}
              onClick={() => setModalCopiarAbierto(true)}
              variant="outlined"
              color="primary"
              disabled={isEssentialLoading || isEditing}
            >
              Copiar
            </Button>
          )}

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={isEssentialLoading || isEditing}
          >
            Exportar
          </Button>

          {isEditing ? (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={handleSave}
                disabled={isSaving}
                startIcon={
                  isSaving ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
              >
                Guardar
              </Button>
              <Button
                variant="outlined"
                color="Primary"
                onClick={handleCancel}
                disabled={isSaving}
                startIcon={<CancelIcon />}
              >
                Cancelar
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={handleEdit}
              disabled={isEssentialLoading || datosTabla.length === 0}
              startIcon={<EditIcon />}
            >
              Editar
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

      {saveError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {saveError}
        </Alert>
      )}

      {/* Tabla */}
      <TableContainer component={Paper} sx={{ flexGrow: 1, overflow: "auto" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
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
                Alumno
              </TableCell>
              {rubros.map((r) => (
                <TableCell
                  key={r.idrubrotc}
                  align="center"
                  sx={{ fontWeight: "bold", minWidth: 100 }}
                >
                  {r.nombre_rubro}
                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                  >
                    {r.fecha_limite?.split("T")[0] || "-"}
                  </Typography>
                </TableCell>
              ))}
              {isDirector ? (
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Promedio
                </TableCell>
              ) : (
                <TableCell
                  align="center"
                  sx={{
                    right: 0,
                    position: "sticky",
                    backgroundColor: "#f9f9f9",
                    zIndex: 110,
                    fontWeight: "bold",
                    borderLeft: "2px solid rgba(224, 224, 224, 1)",
                    boxShadow: "-2px 0px 5px rgba(0,0,0,0.1)",
                  }}
                >
                  Promedio
                </TableCell>
              )}
              {isDirector ? (
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Total Act
                </TableCell>
              ) : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {isEssentialLoading ? (
              <TableRow>
                <TableCell colSpan={rubros.length + 2} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : datosTabla.length === 0 ? (
              <TableRow>
                <TableCell colSpan={rubros.length + 2} align="center">
                  No hay alumnos.
                </TableCell>
              </TableRow>
            ) : (
              datosTabla.map((al) => (
                <TableRow key={al.alumno_matricula} hover>
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
                    {al.apellidop} {al.apellidom} {al.nombres}
                  </TableCell>

                  {rubros.map((r) => (
                    <TableCell key={r.idrubrotc} align="center">
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
                          sx={{ width: 100 }}
                        >
                          <MenuItem value="">
                            <em>-</em>
                          </MenuItem>
                          <MenuItem value="Si">Si</MenuItem>
                          <MenuItem value="No">No</MenuItem>
                          <MenuItem value="J">J</MenuItem>
                          <MenuItem value="R">R</MenuItem>
                          <MenuItem value="I">I</MenuItem>
                        </Select>
                      ) : (
                        (al.calificacionesMap.get(r.idrubrotc) ?? "-")
                      )}
                    </TableCell>
                  ))}

                  {user.nombre_rol === "Docente" ? (
                    <TableCell
                      align="center"
                      sx={{
                        position: "sticky",
                        right: 0,
                        backgroundColor: "#ffffff",
                        zIndex: 1,
                        borderRight: "2px solid rgba(224, 224, 224, 1)",
                        boxShadow: "4px 0px 8px -2px rgba(0,0,0,0.05)",
                        fontWeight: "bold",
                        color: al.promedio >= 6 ? "success.main" : "error.main",
                      }}
                    >
                      {al.promedio.toFixed(2)}
                    </TableCell>
                  ) : (
                    <TableCell
                      align="center"
                      sx={{
                        position: "sticky",
                        right: 0,
                        backgroundColor: "#ffffff",
                        zIndex: 1,
                        borderRight: "2px solid rgba(224, 224, 224, 1)",
                        boxShadow: "4px 0px 8px -2px rgba(0,0,0,0.05)",
                        fontWeight: "bold",
                        color: al.promedio >= 6 ? "success.main" : "error.main",
                      }}
                    >
                      {al.promedio.toFixed(2)}
                    </TableCell>
                  )}
                  {isDirector ? (
                    <TableCell align="center">
                      {ContadorCalificacionesPorAlumno[al.alumno_matricula] ||
                        0}{" "}
                      / {totalRubros}
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modales */}
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
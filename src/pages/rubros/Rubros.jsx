// Importaciones de React y hooks
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import GestionarRubrosModal from "../../components/modals/Gestion/GestionarRubrosModal.jsx";

// Servicios
import {
  fetchRubrosMateriaGet,
  syncCalificaciones_service,
  fetchRubrosCalificacionesGet,
  fetchPromediosTc_service,
} from "../../services/rubroService.js";

import {
  fetchAlumnoGrupoGet,
  fetchAlumnoPerfilGet,
} from "../../services/alumnosService.js";

// Hook de exportación
import { useExport } from "../../utils/useExport.js";

// Importaciones UI
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
  Chip
} from "@mui/material";

// Iconos
import SettingsIcon from "@mui/icons-material/Settings";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close"; // Icono más limpio para cancelar
import FileDownloadIcon from "@mui/icons-material/FileDownload"; // Icono más standard
import SchoolIcon from '@mui/icons-material/School';

const currentYear = new Date().getFullYear();

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

  const { exportar } = useExport();

  // --- ESTADOS DE DATOS ---
  const [rubros, setRubros] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [originalCalificaciones, setOriginalCalificaciones] = useState([]);
  const [promediosTc, setPromediosTc] = useState([]);

  // --- ESTADOS DE FILTROS ---
  const [parcial, setParcial] = useState(1);
  const [selectedYear, setSelectedYear] = useState(initialYear || currentYear);

  // --- ESTADOS DE UI ---
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

  // ... (TODA TU LÓGICA DE CARGA CARGAR_RUBROS, CARGAR_ALUMNOS, CARGAR_CALIFICACIONES SE MANTIENE IGUAL) ...
  // COPIA AQUÍ TUS USE_EFFECT DE CARGA ORIGINALES O MANTENLOS SI YA ESTÁN EN EL ARCHIVO
  // (Para brevedad, asumo que la lógica de fetch y useEffects está aquí tal cual tu código anterior)
  
  // --- REPLICA DE LA LÓGICA DE CARGA (Simplificada para el ejemplo visual, asegurate de tenerla) ---
  const cargarRubros = useCallback(async () => {
     if (!materiaClave || !grupoId) return;
     setLoadingRubros(true);
     try {
       const data = await fetchRubrosMateriaGet(materiaClave, grupoId, selectedYear, token);
       setRubros(data.rubros || []);
     } catch (err) { setErrorRubros(err.message); } 
     finally { setLoadingRubros(false); }
  }, [materiaClave, grupoId, selectedYear, token]);

  useEffect(() => { cargarRubros(); }, [cargarRubros]);

  useEffect(() => {
    const cargarAlumnos = async () => {
      setLoadingAlumnos(true);
      try {
        let data;
        if (idNormalizado && semestre) data = await fetchAlumnoPerfilGet(token, idNormalizado, semestre);
        else if (grupoId) data = await fetchAlumnoGrupoGet(token, grupoId);
        
        setAlumnos((data.alumnos || []).map(a => ({ ...a, alumno_matricula: a.matricula })));
      } catch (err) { setErrorAlumnos(err.message); }
      finally { setLoadingAlumnos(false); }
    };
    if (grupoId || (idNormalizado && semestre)) cargarAlumnos();
  }, [grupoId, idNormalizado, semestre, token]);

  useEffect(() => {
    const cargarCalificaciones = async () => {
      if (!materiaClave || !parcial || !selectedYear || !grupoId) return;
      setLoadingCalificaciones(true);
      try {
        const data = await fetchRubrosCalificacionesGet(materiaClave, parcial, selectedYear, grupoId, token);
        const datosPTC = await fetchPromediosTc_service({ materiaClave, idGrupo: grupoId, parcial, yearC: selectedYear }, token);
        setPromediosTc(datosPTC || []);
        setCalificaciones(data);
        setOriginalCalificaciones(data);
      } catch (err) { setErrorCalificaciones(err.message); }
      finally { setLoadingCalificaciones(false); }
    };
    if (!loadingRubros && !loadingAlumnos) cargarCalificaciones();
  }, [materiaClave, parcial, selectedYear, grupoId, token, loadingRubros, loadingAlumnos]);


  // --- COMBINACIÓN DE DATOS (CON LA CORRECCIÓN DEL PROMEDIO) ---
  const datosTabla = useMemo(() => {
    const califMap = new Map();
    calificaciones.forEach((calif) => {
      const mat = String(calif.alumno_matricula);
      if (!califMap.has(mat)) califMap.set(mat, new Map());
      califMap.get(mat).set(calif.id_rubro, calif.calificacion);
    });

    const tcMap = new Map();
    if (Array.isArray(promediosTc)) {
      promediosTc.forEach((item) => tcMap.set(String(item.matricula), item.promedio_final));
    }

    return alumnos.map((alumno) => {
      const matriculaStr = String(alumno.alumno_matricula);
      const susCalificaciones = califMap.get(matriculaStr) || new Map();
      const promedioTcValue = tcMap.get(matriculaStr);
      let sumaPonderada = 0;

      rubros.forEach((rubro) => {
        const esTC = rubro.nombre_rubro === "Trabajo Cotidiano";
        let nota = null;
        if (esTC) {
          nota = (promedioTcValue !== undefined && promedioTcValue !== null) ? Number(promedioTcValue) : 0;
        } else {
          const valorMapa = susCalificaciones.get(rubro.id_rubro);
          nota = (valorMapa !== undefined && valorMapa !== null) ? Number(valorMapa) : 0;
        }
        sumaPonderada += nota * Number(rubro.ponderacion);
      });

      return {
        ...alumno,
        calificacionesMap: susCalificaciones,
        promedio: sumaPonderada,
        promedioTc: promedioTcValue,
      };
    });
  }, [alumnos, calificaciones, rubros, promediosTc]);

  // --- LOGICA EXPORT ---
  const transformarDatosParaExportar = useCallback(() => {
    if (!datosTabla.length) return [];
    const headers = [
      "Matrícula", "Primer Apellido", "Segundo Apellido", "Nombres",
      ...rubros.map(r => `Rúbro: ${r.nombre_rubro} (${Number(r.ponderacion) * 100}%)`),
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
        if (rubro.nombre_rubro === "Trabajo Cotidiano") {
          row[headerKey] = alumno.promedioTc ? Number(alumno.promedioTc).toFixed(2) : "-";
        } else {
          const val = parseFloat(alumno.calificacionesMap.get(rubro.id_rubro));
          row[headerKey] = !isNaN(val) ? val.toFixed(2) : "-";
        }
      });
      row["Promedio Final"] = alumno.promedio.toFixed(2);
      return row;
    });
  }, [datosTabla, rubros]);

  const handleExport = useCallback((format) => {
    const data = transformarDatosParaExportar();
    exportar(data, `Calif_${materiaClave}_P${parcial}_${selectedYear}`, format);
  }, [transformarDatosParaExportar, materiaClave, parcial, selectedYear, exportar]);

  // --- HANDLERS ---
  const handleEdit = () => { setIsEditing(true); setSaveError(null); };
  const handleCancel = () => { setIsEditing(false); setCalificaciones(originalCalificaciones); setSaveError(null); };
  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await syncCalificaciones_service({ grades: calificaciones, idGrupo: grupoId, parcial, yearC: selectedYear }, token);
      setIsEditing(false);
      setIsSaving(false);
      setOriginalCalificaciones(calificaciones);
    } catch (err) { setSaveError(err.message); setIsSaving(false); }
  };

  const handleGradeChange = (matricula, idRubro, valor) => {
    const valorLimpio = valor.trim();
    let valorNumerico = valorLimpio === "" ? null : parseFloat(valorLimpio);
    if (valorNumerico !== null && (isNaN(valorNumerico) || valorNumerico < 0 || valorNumerico > 10)) return;

    setCalificaciones((prev) => {
      const newState = [...prev];
      const idx = newState.findIndex(c => c.alumno_matricula === matricula && c.id_rubro === Number(idRubro));
      if (idx > -1) newState[idx] = { ...newState[idx], calificacion: valorNumerico };
      else if (valorNumerico !== null) newState.push({ alumno_matricula: matricula, id_rubro: Number(idRubro), calificacion: valorNumerico });
      return newState;
    });
  };

  // --- RENDER ---
  const isEssentialLoading = loadingRubros || loadingAlumnos;
  const canEdit = !isEssentialLoading && !errorRubros && !errorAlumnos && datosTabla.length > 0;
  const isExportDisabled = isEssentialLoading || loadingCalificaciones || datosTabla.length === 0;

  return (
    <Box sx={{ 
      p: 3, 
      height: "calc(100vh - 64px)", 
      bgcolor: "#f4f6f8", // Fondo gris muy suave para que resalte la tabla blanca
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
        {/* IZQUIERDA: INFORMACIÓN Y SELECTOR */}
        <Stack direction="row" spacing={3} alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolIcon fontSize="small"/> {nombreMateria}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {idNormalizado ? `Perfil: ${idNormalizado} (${semestre})` : `Grupo: ${grupoId}`}
            </Typography>
          </Box>
          
          <Divider orientation="vertical" flexItem />

          <FormControl variant="standard" sx={{ minWidth: 100 }}>
            {/* Selector Minimalista */}
            <Select
              value={parcial}
              onChange={(e) => setParcial(e.target.value)}
              disableUnderline
              sx={{ fontWeight: 'bold', color: 'text.primary' }}
              disabled={isEditing}
            >
              <MenuItem value={1}>Parcial 1</MenuItem>
              <MenuItem value={2}>Parcial 2</MenuItem>
              <MenuItem value={3}>Parcial 3</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* DERECHA: ACCIONES DISCRETAS */}
        <Stack direction="row" spacing={1} alignItems="center">
          
          {/* BOTONES SECUNDARIOS (ICONOS) */}
          <Tooltip title="Exportar a Excel">
            <span>
              <IconButton onClick={() => handleExport("xlsx")} disabled={isExportDisabled} size="small">
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

          <Divider orientation="vertical" flexItem sx={{ height: 20, alignSelf: 'center' }} />

          {/* BOTÓN PRINCIPAL (CON TEXTO) */}
          {isEditing ? (
            <>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CloseIcon />}
                onClick={handleCancel}
                disabled={isSaving}
                size="small"
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleSave}
                disabled={isSaving}
                size="small"
                sx={{ borderRadius: 2, textTransform: 'none', px: 3, boxShadow: 'none' }}
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
              sx={{ borderRadius: 2, textTransform: 'none', px: 3, boxShadow: 'none' }}
            >
              Editar Calificaciones
            </Button>
          )}
        </Stack>
      </Paper>

      {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}

      {/* ÁREA DE TABLA PROTAGONISTA */}
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
                <TableCell 
                  sx={{ 
                    fontWeight: "bold", 
                    bgcolor: '#fcfcfc', 
                    color: 'text.secondary',
                    zIndex: 101, 
                    left: 0, 
                    position: "sticky",
                    borderBottom: '2px solid #e0e0e0',
                    width: '250px' // Ancho fijo para nombres
                  }}
                >
                  ESTUDIANTE
                </TableCell>
                
                {isEssentialLoading ? (
                  <TableCell><CircularProgress size={20}/></TableCell>
                ) : !errorRubros && rubros.map((rubro) => (
                  <TableCell 
                    key={rubro.id_rubro} 
                    align="center"
                    sx={{ 
                      fontWeight: "bold", 
                      bgcolor: '#fcfcfc', 
                      color: 'text.secondary',
                      borderBottom: '2px solid #e0e0e0',
                      minWidth: 100
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem' }}>{rubro.nombre_rubro}</span>
                      <Chip 
                        label={`${(Number(rubro.ponderacion) * 100).toFixed(0)}%`} 
                        size="small" 
                        variant="outlined"
                        sx={{ height: 16, fontSize: '0.65rem', mt: 0.5, border: 'none', bgcolor: '#eef2f6' }} 
                      />
                    </Box>
                  </TableCell>
                ))}

                <TableCell align="center" sx={{ fontWeight: "bold", bgcolor: '#fcfcfc', borderBottom: '2px solid #e0e0e0', width: 80 }}>
                  PROMEDIO
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {/* Manejo de estados de carga y error (simplificado visualmente) */}
              {isEssentialLoading || loadingCalificaciones ? (
                <TableRow>
                   <TableCell colSpan={10} align="center" sx={{ py: 10 }}>
                     <CircularProgress /> 
                     <Typography variant="caption" display="block" sx={{ mt: 1 }}>Cargando datos...</Typography>
                   </TableCell>
                </TableRow>
              ) : datosTabla.map((alumno, index) => (
                <TableRow 
                  key={alumno.alumno_matricula} 
                  hover 
                  sx={{ 
                    // Alternar colores suavemente (zebra striping)
                    bgcolor: index % 2 === 0 ? 'white' : '#fafafa' 
                  }}
                >
                  <TableCell 
                    component="th" 
                    scope="row" 
                    sx={{ 
                      left: 0, 
                      position: "sticky", 
                      bgcolor: index % 2 === 0 ? 'white' : '#fafafa', 
                      zIndex: 100,
                      borderRight: '1px solid #f0f0f0',
                      fontSize: '0.85rem'
                    }}
                  >
                    {`${alumno.apellidop} ${alumno.apellidom} ${alumno.nombres}`}
                  </TableCell>

                  {rubros.map((rubro) => {
                    const esTrabajoCotidiano = rubro.nombre_rubro === "Trabajo Cotidiano";
                    return (
                      <TableCell 
                        key={`${alumno.alumno_matricula}-${rubro.id_rubro}`} 
                        align="center"
                        sx={{ 
                          // Resalte sutil para trabajo cotidiano (borde izquierdo azul)
                          borderLeft: esTrabajoCotidiano ? '3px solid #1976d2' : 'none',
                          bgcolor: esTrabajoCotidiano ? 'rgba(25, 118, 210, 0.04)' : 'inherit',
                          p: 0
                        }}
                      >
                        {esTrabajoCotidiano ? (
                           <Typography variant="body2" color="primary" fontWeight="500" sx={{ fontSize: '0.9rem' }}>
                              {alumno.promedioTc ? Number(alumno.promedioTc).toFixed(2) : "-"}
                           </Typography>
                        ) : isEditing ? (
                          <TextField
                            type="number"
                            fullWidth
                            value={alumno.calificacionesMap.get(rubro.id_rubro) ?? ""}
                            onChange={(e) => handleGradeChange(alumno.alumno_matricula, rubro.id_rubro, e.target.value)}
                            InputProps={{ disableUnderline: true, sx: { fontSize: "0.9rem", textAlign: 'center' } }}
                            inputProps={{ 
                              min: 0, max: 10, step: 0.1, 
                              style: { textAlign: "center", padding: "12px 0", backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa' } 
                            }}
                            variant="standard"
                          />
                        ) : (
                          <Typography variant="body2" color="text.primary" sx={{ py: 1.5 }}>
                            {alumno.calificacionesMap.get(rubro.id_rubro) ?? "-"}
                          </Typography>
                        )}
                      </TableCell>
                    );
                  })}

                  <TableCell align="center" sx={{ fontWeight: "bold" }}>
                     <Box sx={{ 
                       display: 'inline-flex', 
                       justifyContent: 'center', 
                       alignItems: 'center',
                       width: 40, height: 30, 
                       borderRadius: 1,
                       bgcolor: alumno.promedio >= 6 ? 'success.light' : 'error.light',
                       color: 'white',
                       opacity: 0.8
                     }}>
                        {alumno.promedio.toFixed(1)}
                     </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modal se mantiene igual */}
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
          onGuardar={() => { setModalAbierto(false); cargarRubros(); }}
        />
      )}
    </Box>
  );
};

export default GestionarRubros;
/**
 * @file ResumenTc.jsx
 * @description Componente para visualizar el resumen y generar reportes PDF.
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // <--- Agregamos useNavigate
import { useAuth } from "../context/AuthContext.jsx";

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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";

import InfoIcon from "@mui/icons-material/Info";
import PrintIcon from "@mui/icons-material/Print"; // <--- Icono para el reporte

import { fetchDatosAsistencia } from "../services/asistenciaService.js";
import {
  conteoEntregasTc_service,
  conteoTrabajosTc_service,
} from "../services/rubroService.js";

const ResumenTc = () => {
  // --- HOOKS Y CONTEXTO ---
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate(); // <--- Hook de navegación
  const { grupoId, year } = location.state || {};

  // --- ESTADOS ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [estudiantes, setEstudiantes] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [entregas, setEntregas] = useState([]);

  const [parcial, setParcial] = useState(1);

  // --- LÓGICA DE DATOS ---
  const cargarDatos = useCallback(async () => {
    if (!grupoId) {
      setError("No se proporcionó un ID de grupo.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (!token) throw new Error("No se encontró el token de autorización.");

      const currentYear = year || new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      const datosBody = {
        idGrupo: grupoId,
        parcial: parcial,
        yearC: currentYear,
      };

      const [dataEstudiantes, dataMaterias, dataEntregas] = await Promise.all([
        fetchDatosAsistencia(grupoId, currentYear, currentMonth, token),
        conteoTrabajosTc_service(datosBody, token),
        conteoEntregasTc_service(datosBody, token),
      ]);

      setEstudiantes(dataEstudiantes.estudiantes || []);
      setMaterias(dataMaterias || []);
      setEntregas(dataEntregas || []);
      setError(null);
    } catch (err) {
      console.error("Error al cargar resumen TC:", err);
      setError(err.message || "Error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  }, [grupoId, token, parcial, year]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // --- MEMOIZACIÓN ---
  const entregasMap = useMemo(() => {
    const map = {};
    entregas.forEach((item) => {
      const key = `${item.alumno_matricula}-${item.materia_clave}`;
      map[key] = item.total_entregadas;
    });
    return map;
  }, [entregas]);

  //Generar reporte
  const handleGenerarReporte = (estudiante) => {
    // 1. Calculamos las materias pendientes para este alumno específico
    const materiasPendientes = [];

    materias.forEach((m) => {
      const key = `${estudiante.matricula}-${m.materia_clave}`;
      const entregadas = entregasMap[key] || 0;
      const total = m.total_actividades;

      // Si debe actividades (Total > Entregadas) y el total no es 0
      if (entregadas < total && total > 0) {
        materiasPendientes.push({
          nombre: m.nombre_materia,
          faltantes: total - entregadas, // Calculamos cuántas debe (ej: 12/20 -> debe 8)
          total: total,
        });
      }
    });

    navigate("/reporte-tc", {
      state: {
        estudiante: {
          nombres: estudiante.nombres,
          apellidop: estudiante.apellidop,
          apellidom: estudiante.apellidom,
          matricula: estudiante.matricula,
        },
        parcial: parcial,
        materiasPendientes: materiasPendientes,
      },
    });
  };

  // --- RENDERIZADO ---

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center" sx={{ my: 4 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        p: 3,
        height: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Box>
          <Typography variant="h5">
            Resumen de Trabajos (TC) - {grupoId}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Año: {year || new Date().getFullYear()}
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <InputLabel>Parcial</InputLabel>
            <Select
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

      {/* TABLA */}
      {estudiantes.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <InfoIcon color="action" sx={{ mr: 1, verticalAlign: "middle" }} />
          <Typography variant="subtitle1" component="span">
            No se encontraron estudiantes.
          </Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          sx={{ flexGrow: 1, maxHeight: "80vh" }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {/* Columna Nombre */}
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    minWidth: 200,
                    bgcolor: "#f5f5f5",
                    zIndex: 10,
                  }}
                >
                  Estudiante
                </TableCell>

                {/* Columna Acciones (PDF) - NUEVA */}
                {/*  <TableCell
                  align="center"
                  sx={{ fontWeight: "bold", bgcolor: "#f5f5f5", width: 50 }}
                >
                  Reporte
                </TableCell>*/}

                {/* Columnas Dinámicas */}
                {materias.map((m) => (
                  <TableCell
                    key={m.materia_clave}
                    align="center"
                    sx={{ bgcolor: "#f5f5f5", minWidth: 120 }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: "bold", fontSize: "0.75rem" }}
                      >
                        {m.nombre_materia}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontSize: "0.65rem" }}
                      >
                        {m.nombre_docente}
                      </Typography>
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {estudiantes.map((estudiante) => (
                <TableRow key={estudiante.matricula} hover>
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{ fontWeight: 500 }}
                  >
                    {`${estudiante.apellidop} ${estudiante.apellidom} ${estudiante.nombres}`}
                  </TableCell>

                  {/* <TableCell align="center">
                    <Tooltip title="Generar Reporte PDF">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleGenerarReporte(estudiante)}
                      >
                        <PrintIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>*/}

                  {/* Celdas de Datos */}
                  {materias.map((m) => {
                    const entregadas =
                      entregasMap[
                        `${estudiante.matricula}-${m.materia_clave}`
                      ] || 0;
                    const total = m.total_actividades;
                    const esCompleto = entregadas >= total && total > 0;

                    return (
                      <TableCell key={m.materia_clave} align="center">
                        <Typography
                          variant="body2"
                          sx={{
                            color: esCompleto ? "success.main" : "error.main", // Rojo si debe, verde si cumple
                            fontWeight: esCompleto ? "bold" : "normal",
                          }}
                        >
                          {entregadas} / {total}
                        </Typography>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ResumenTc;

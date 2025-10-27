// Importaciones de React y hooks
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import GestionarRubrosModal from "./modals/rubros/GestionarRubrosModal.jsx"
import { fetchRubrosMateriaGet } from "./services/rubroService.js";
// Importaciones de Material-UI
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
  TextField,
  Stack,
  Alert,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings"; // Un buen ícono para "Gestionar"

const GestionarRubros = () => {
  const { token } = useAuth();
  //Estados a usar
  const [rubros, setRubros] = useState([]);
  const [loading, setLoading] = useState(true);
  //Modal de rubros
  const [modalAbierto, setModalAbierto] = useState(false);

  const location = useLocation();
  //variables que obtienes de antes de llamar la ruta
  const { grupoId, materiaClave, nombreMateria, year } = location.state || {};

  // Los datos a usar
  const cargarDatos = useCallback(async () => {
    if (!grupoId) {
      setError("No se proporcionó un ID de grupo.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchRubrosMateriaGet(materiaClave, token);
      console.log(data);
      setRubros(data.rubros);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, [grupoId, token]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <Box
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        marginTop: "50px",
      }}
    >
      {/* Encabezado con título y botones de acción */}
      <Box
        sx={{
          height: "10%",
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h5">Materia: {nombreMateria}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Calificaciones Grupo {grupoId}
          </Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setModalAbierto(true)} // Abre el modal
          >
            Gestionar Rúbros
          </Button>
        </Box>
      </Box>
      {/*Caja de abajo */}
      <Box
        sx={{
          height: "80%", // El 80% del contenedor padre
          width: "100%",
          display: "flex", // Usamos flex para que la tabla crezca
          flexDirection: "column",
        }}
      >
        {/* TableContainer: Es el contenedor principal.
        Usamos component={Paper} para darle el fondo blanco y la sombra.
        El 'sx' es clave para que la tabla ocupe el espacio y tenga scroll.
      */}
        <TableContainer
          component={Paper}
          sx={{ flexGrow: 1, overflow: "auto" }}
        >
          <Table stickyHeader aria-label="tabla de calificaciones">
            {/* TableHead: El encabezado de la tabla */}
            <TableHead>
              <TableRow>
                {/* TableCell: Celdas del encabezado. Es buena idea usar 'sx' para ponerlas en negrita */}
                <TableCell sx={{ fontWeight: "bold" }}>Nombre Alumno</TableCell>
                {/*Los rubros de manera dinamica */}
                {rubros.map((rubro) => (
                  <TableCell
                    key={rubro.id_rubro} // El 'key' es vital para React
                    align="right" // Alineamos a la derecha, ya que mostrará números (calificaciones)
                    sx={{ fontWeight: "bold", minWidth: 150 }} // Damos un ancho mínimo
                  >
                    {/* Mostramos el nombre del rubro */}
                    {rubro.nombre_rubro}

                    {/* Opcional: Si también quieres mostrar la ponderación */}
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                    >
                      ({Number(rubro.ponderacion) * 100}%)
                    </Typography>
                  </TableCell>
                ))}

                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Promedio
                </TableCell>
              </TableRow>
            </TableHead>

            {/* TableBody: El cuerpo de la tabla */}
          </Table>
        </TableContainer>
      </Box>

      {/*Los modales */}
      <GestionarRubrosModal
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        rubrosActuales={rubros}
        materiaClave={materiaClave}
        token={token}
        // Pasamos una función para recargar los rúbros después de guardar
        onGuardar={() => {
          setModalAbierto(false);
          cargarDatos(); // Vuelve a cargar los rúbros frescos
        }}
      />
    </Box>
  );
};

export default GestionarRubros;

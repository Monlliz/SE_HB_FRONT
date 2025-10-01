import { useState, useEffect, useCallback } from "react";
// Modales de materias
import NuevaMateriaGrupo from "../modals/NuevaMateriaGrupo.jsx";
import BorrarMateriaGrupo from "../modals/BorrarMateriaGrupo.jsx";
import {
  Box,
  Button,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";

// El nombre del componente era UserGrupo, lo que sugiere que el `id` es de un grupo.
export default function UserGrupo({ id }) {
  // Estados necesarios solo para materias
  const [materias, setMaterias] = useState([]);
  const [selectedMateriaClave, setSelectedMateriaClave] = useState(null);
  const [modalMateriaOpen, setModalMateriaOpen] = useState(false);
  const [modalBorrarMateriaOpen, setModalBorrarMateriaOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Estado de carga para la tabla

  // URL de la API
  const apiUrl = import.meta.env.VITE_API_URL;

  // Función para obtener las materias del grupo
  const fetchMaterias = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      setSelectedMateriaClave(null);
      // Usamos el año actual dinámicamente
      const anioActual = new Date().getFullYear();
      const resMaterias = await fetch(`${apiUrl}/materias/grupo/${id}/${anioActual}`);
      if (!resMaterias.ok) throw new Error("Error al cargar materias");
      const dataMaterias = await resMaterias.json();
      setMaterias(dataMaterias?.materias || []);
    } catch (err) {
      console.error(err);
      setMaterias([]);
    } finally {
      setLoading(false);
    }
  }, [id, apiUrl]);

  // Renderizado inicial
  useEffect(() => {
    fetchMaterias();
  }, [fetchMaterias]);

  // Función para manejar el "Aceptar" del modal de agregar materia
  const handleAcceptMateria = () => {
    setModalMateriaOpen(false);
    fetchMaterias();
  };
  
  // Función para manejar el "Aceptar" del modal de borrar materia
  const handleAcceptBorrar = () => {
    setModalBorrarMateriaOpen(false);
    fetchMaterias();
  };

  if (loading) {
    return <Typography>Cargando materias...</Typography>;
  }

  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        width: "100%",
        flexDirection: "column",
      }}
    >
      {/* Controles de Materias */}
      <Box
        sx={{
          display: "flex",
          p: 2,
          alignItems: "center",
          gap: 2,
          flexShrink: 0, // Evita que esta caja se encoja
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Materias
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setModalMateriaOpen(true)}
        >
          Agregar
        </Button>
        <Button
          variant="outlined"
          color="error"
          disabled={!selectedMateriaClave}
          onClick={() => setModalBorrarMateriaOpen(true)}
        >
          Eliminar
        </Button>
      </Box>

      {/* Tabla de Materias */}
      <Box
        sx={{
          flexGrow: 1, // Permite que esta caja ocupe el espacio restante
          overflowY: "auto", // Scroll solo si es necesario
          p: 2,
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Clave</TableCell>
              <TableCell>Nombre</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {materias.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  No hay materias asignadas a este grupo.
                </TableCell>
              </TableRow>
            ) : (
              materias.map((m) => (
                <TableRow
                  key={m.clave}
                  hover
                  selected={m.clave === selectedMateriaClave}
                  onClick={() => setSelectedMateriaClave(m.clave)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>{m.clave}</TableCell>
                  <TableCell>{m.asignatura}</TableCell> 
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>

      {/* --- Modales --- */}
      <NuevaMateriaGrupo
        open={modalMateriaOpen}
        onClose={() => setModalMateriaOpen(false)}
        onAccept={handleAcceptMateria}
        grupoId={id} // Cambiado a grupoId para mayor claridad
      />

      <BorrarMateriaGrupo
        open={modalBorrarMateriaOpen}
        onClose={() => setModalBorrarMateriaOpen(false)}
        onAccept={handleAcceptBorrar}
        grupoId={id}
        clave={selectedMateriaClave}
        nombre={
          materias.find((m) => m.clave === selectedMateriaClave)?.asignatura || ""
        }
      />
    </Box>
  );
}
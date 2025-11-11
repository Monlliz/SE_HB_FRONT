import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// Modales de materias
import NuevaMateriaGrupo from "../modals/Grupo/NuevaMateriaGrupo.jsx";
import BorrarMateriaGrupo from "../modals/Grupo/BorrarMateriaGrupo.jsx";
import CambiarAlumnosGrupo from "../modals/Grupo/CambiarAlumnosGrupo.jsx";
//Servicios (apis)
import { fetchMateriasGrupo } from "../services/materiasService.js";

//Iconos
import ListAltIcon from "@mui/icons-material/ListAlt";
import ChecklistIcon from "@mui/icons-material/Checklist";
import GroupIcon from "@mui/icons-material/Group";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import {
  Box,
  Button,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from "@mui/material";

// El nombre del componente era UserGrupo, lo que sugiere que el `id` es de un grupo.
export default function UserGrupo({ id }) {
  // Estados necesarios solo para materias
  const [materias, setMaterias] = useState([]);
  const [selectedMateriaClave, setSelectedMateriaClave] = useState(null);
  const [selectedMateriaNombre, setSelectedMateriaNombre] = useState(null);
  const [modalGrupoCambio, setModalGrupoCambio] = useState(false);
  const [modalMateriaOpen, setModalMateriaOpen] = useState(false);
  const [modalBorrarMateriaOpen, setModalBorrarMateriaOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Estado de carga para la tabla

  // URL de la API
  const apiUrl = import.meta.env.VITE_API_URL;
  // Inicializa el hook
  const navigate = useNavigate();

  // Función que se ejecutará al hacer clic en el botón asistencia
  const handleNavigateToLista = () => {
    // 1. Encuentra el nombre de la materia seleccionada
    const materiaSeleccionada = materias.find(
      (m) => m.clave === selectedMateriaClave
    );
    if (!materiaSeleccionada) {
      setSelectedMateriaClave(null);
    }
    // 2. Prepara los datos que quieres enviar
    const datosParaEnviar = {
      grupoId: id,
      materiaNombre: [],
      year: new Date().getFullYear(),
    };
    // 3. Navega a la nueva ruta, pasando los datos en el `state`
    navigate("/listaAsistencia", { state: datosParaEnviar });
  };

  const handleNavigateToListaMateria = () => {
    // 1. Encuentra el nombre de la materia seleccionada
    const materiaSeleccionada = materias.find(
      (m) => m.clave === selectedMateriaClave
    );
    if (!materiaSeleccionada) {
      setSelectedMateriaClave(null);
    }
    // 2. Prepara los datos que quieres enviar
    const datosParaEnviar = {
      grupoId: id,
      materiaClave: selectedMateriaClave,
      year: new Date().getFullYear(),
      nombreMateria: materias.find((m) => m.clave === selectedMateriaClave)
        ?.asignatura,
    };
    navigate("/listaAsistenciamateria", { state: datosParaEnviar });
  };

  const handleNavigateToActividades = () => {
    // 1. Encuentra el nombre de la materia seleccionada
    const materiaSeleccionada = materias.find(
      (m) => m.clave === selectedMateriaClave
    );
    if (!materiaSeleccionada) {
      setSelectedMateriaClave(null);
    }
    // 2. Prepara los datos que quieres enviar
    const datosParaEnviar = {
      grupoId: id,
      materiaClave: selectedMateriaClave,
      year: new Date().getFullYear(),
      nombreMateria: materias.find((m) => m.clave === selectedMateriaClave)
        ?.asignatura,
    };
    console.log(datosParaEnviar);
    navigate("/trabajo", { state: datosParaEnviar });
  };

  const handleNavigateToCalifacacionesParcilaes = () => {
    // 1. Encuentra el nombre de la materia seleccionada
    const materiaSeleccionada = materias.find(
      (m) => m.clave === selectedMateriaClave
    );
    if (!materiaSeleccionada) {
      setSelectedMateriaClave(null);
    }
    // 2. Prepara los datos que quieres enviar
    const datosParaEnviar = {
      grupoId: id,
      materiaClave: selectedMateriaClave,
      year: new Date().getFullYear(),
      nombreMateria: materias.find((m) => m.clave === selectedMateriaClave)
        ?.asignatura,
    };
    console.log(datosParaEnviar);
    navigate("/rubros", { state: datosParaEnviar });
  };

  // Función para obtener las materias del grupo
  const fetchMaterias = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token"); // Obtiene el token
      if (!token) {
        throw new Error("Autorización rechazada. No se encontró el token.");
      }
      setSelectedMateriaClave(null);
      setSelectedMateriaNombre(null);
      // Usamos el año actual dinámicamente
      const anioActual = new Date().getFullYear();
      const { materias } = await fetchMateriasGrupo(token, id, anioActual);
      setMaterias(materias.materias);
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
      <Box
        sx={{
          height: "10%",
          display: "flex",
          p: 2,
          alignItems: "center",
          gap: 2,
          flexShrink: 0, // Evita que esta caja se encoja
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Grupo - {id}
        </Typography>

        <IconButton aria-label="lista" onClick={handleNavigateToLista}>
          <ListAltIcon />
        </IconButton>

        <IconButton
          aria-label="lista"
          onClick={() => setModalGrupoCambio(true)}
        >
          <GroupIcon />
        </IconButton>
      </Box>
      {/* Controles de Materias */}
      <Box
        sx={{
          height: "10%",
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

        <IconButton
          aria-label="lista"
          disabled={!selectedMateriaClave}
          onClick={handleNavigateToListaMateria}
        >
          <ListAltIcon />
        </IconButton>
        <IconButton
          aria-label="actvidades"
          disabled={!selectedMateriaClave}
          onClick={handleNavigateToActividades}
        >
          <HistoryEduIcon />
        </IconButton>
        <IconButton
          aria-label="calificaciones_parciales"
          disabled={!selectedMateriaClave}
          onClick={handleNavigateToCalifacacionesParcilaes}
        >
          <ChecklistIcon />
        </IconButton>
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
                  onClick={() => {
                    setSelectedMateriaClave(m.clave);
                    setSelectedMateriaNombre(m.asignatura);
                  }}
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
          materias.find((m) => m.clave === selectedMateriaClave)?.asignatura ||
          ""
        }
      />

      <CambiarAlumnosGrupo
        open={modalGrupoCambio}
        onClose={() => setModalGrupoCambio(false)}
        onAccept={() => {
          setModalGrupoCambio(false);
        }}
        grupoId={id}
      />
    </Box>
  );
}

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// --- SERVICIOS ---
import { fetchMateriasPerfil, fetchMateriasGrupo } from "../../services/materiasService.js";

// --- MODALES (Importamos todos) ---
// Grupo
import NuevaMateriaGrupo from "../modals/Grupo/NuevaMateriaGrupo.jsx";
import BorrarMateriaGrupo from "../modals/Grupo/BorrarMateriaGrupo.jsx";
import CambiarAlumnosGrupo from "../modals/Grupo/CambiarAlumnosGrupo.jsx";
// Perfil
import NuevaMateriaPerfil from "../modals/Grupo/Perfiles/NuevaMateriaPerfil.jsx";
import BorrarMateriaPerfil from "../modals/Grupo/Perfiles/BorrarMateriaPerfil.jsx";

// --- ICONOS ---
import ListAltIcon from "@mui/icons-material/ListAlt";
import ChecklistIcon from "@mui/icons-material/Checklist";
import GroupIcon from "@mui/icons-material/Group";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
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
  Tooltip,
} from "@mui/material";

/**
 * Componente unificado para gestionar materias.
 * @param {string} id - El ID del grupo o perfil.
 * @param {'grupo' | 'perfil'} mode - Determina el comportamiento del componente (APIs, rutas, modales).
 */
export default function MateriasManager({ id, mode = "grupo" }) {
  const navigate = useNavigate();
  
  // -- ESTADOS --
  const [materias, setMaterias] = useState([]);
  const [selectedMateriaClave, setSelectedMateriaClave] = useState(null);
  const [selectedMateriaNombre, setSelectedMateriaNombre] = useState(null); 
  
  // Modales
  const [modalMateriaOpen, setModalMateriaOpen] = useState(false);
  const [modalBorrarMateriaOpen, setModalBorrarMateriaOpen] = useState(false);
  const [modalGrupoCambio, setModalGrupoCambio] = useState(false); // Solo para modo 'grupo'
  
  const [loading, setLoading] = useState(true);

  // -- LOGICA DE ID (Parseo para Perfil) --
  // Si es perfil, el ID viene como "semestre-grupoId", si es grupo viene limpio.
  const { semestre, idNormalizado } = useMemo(() => {
    if (mode === "perfil" && id) {
      const parts = id.split("-");
      return { semestre: parts[0], idNormalizado: parts[1] };
    }
    return { semestre: null, idNormalizado: id };
  }, [id, mode]);

  // -- HELPER PARA DATOS DE NAVEGACIÓN --
  // Construye el objeto que recibirá el componente unificado
  const getNavigationPayload = (materiaClave = selectedMateriaClave) => {
    const materia = materias.find((m) => m.clave === materiaClave);
    
    // Base común
    const payload = {
      grupoId: id, // ID original (usado por fetchs generales)
      materiaClave: materiaClave,
      year: new Date().getFullYear(),
      nombreMateria: materia?.asignatura || selectedMateriaNombre || "Materia",
    };

    // Datos extra específicos para activar el "Modo Perfil" en el componente destino
    if (mode === "perfil") {
      payload.semestre = semestre;
      payload.idNormalizado = idNormalizado;
    }

    return payload;
  };

  // -- FUNCIONES DE NAVEGACIÓN --

  // 1. Lista de Asistencia General (Solo Grupo)
  const handleNavigateToListaGeneral = () => {
    // Navegamos a la ruta unificada SIN materiaClave -> Activa Modo General
    navigate("/listaAsistencia", {
      state: {
        grupoId: id,
        year: new Date().getFullYear(),
      },
    });
  };

  // 2. Lista de Asistencia por Materia (UNIFICADO AQUÍ)
  const handleNavigateToListaMateria = () => {
    if (!selectedMateriaClave) return;
    
    // CAMBIO IMPORTANTE:
    // Antes separábamos rutas (/listaAsistenciamateria vs ...Perfil).
    // Ahora apuntamos a la misma ruta unificada.
    // El 'state' generado por getNavigationPayload() lleva la diferencia.
    navigate("/listaAsistencia", { state: getNavigationPayload() });
  };

  // 3. Actividades (Ya estaba unificado a /trabajo)
  const handleNavigateToActividades = () => {
    if (!selectedMateriaClave) return;
    console.log(`Navegando modo ${mode.toUpperCase()}:`, getNavigationPayload());
    // Recuerda que tu componente de TrabajoCotidiano también debe ser el unificado
    navigate("/trabajo", { state: getNavigationPayload() });
  };

  // 4. Calificaciones / Rubros
  // (Si también unificaste Rubros, podrías hacer lo mismo aquí)
  const handleNavigateToRubros = () => {
    if (!selectedMateriaClave) return;
    // Asumiendo que aún tienes rutas separadas para rubros, lo dejamos igual.
    // Si unificas rubros, cámbialo a una sola ruta.
    const path = mode === "perfil" ? "/rubrosperfil" : "/rubros";
    navigate(path, { state: getNavigationPayload() });
  };

  // -- API FETCH --
  const fetchMaterias = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      setSelectedMateriaClave(null);
      setSelectedMateriaNombre(null);
      
      const anioActual = new Date().getFullYear();
      let response;

      // Selección de servicio según el modo
      if (mode === "perfil") {
        response = await fetchMateriasPerfil(token, id, anioActual);
      } else {
        response = await fetchMateriasGrupo(token, id, anioActual);
      }

      setMaterias(response.materias?.materias || []); 
    } catch (err) {
      console.error(err);
      setMaterias([]);
    } finally {
      setLoading(false);
    }
  }, [id, mode]);

  useEffect(() => {
    fetchMaterias();
  }, [fetchMaterias]);

  // -- HANDLERS MODALES --
  const handleAcceptMateria = () => {
    setModalMateriaOpen(false);
    fetchMaterias();
  };

  const handleAcceptBorrar = () => {
    setModalBorrarMateriaOpen(false);
    fetchMaterias();
  };

  if (loading) return <Typography>Cargando materias...</Typography>;

  return (
    <Box sx={{ display: "flex", height: "100%", width: "100%", flexDirection: "column" }}>
      
      {/* HEADER TÍTULO */}
      <Box sx={{ height: "10%", display: "flex", p: 2, alignItems: "center", gap: 2, flexShrink: 0 }}>
        <Typography variant="h5" fontWeight="bold">
          {mode === "perfil" ? "Perfil" : "Grupo"} - {id}
        </Typography>

        {/* Botones extra exclusivos de GRUPO */}
        {mode === "grupo" && (
          <>
            <Tooltip title="Lista general del grupo">
              <IconButton aria-label="lista" onClick={handleNavigateToListaGeneral}>
                <ListAltIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cambio de alumnos del grupo" enterTouchDelay={0} leaveTouchDelay={3000}>
              <IconButton aria-label="grupo" onClick={() => setModalGrupoCambio(true)}>
                <GroupIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>

      {/* TOOLBAR MATERIAS */}
      <Box sx={{ height: "10%", display: "flex", p: 2, alignItems: "center", gap: 2, flexShrink: 0 }}>
        <Typography variant="h5" fontWeight="bold">Materias</Typography>
        
        <Tooltip title={mode === "perfil" ? "Agregar materia al perfil" : "Agregar materias al grupo"}>
          <Button variant="contained" color="primary" onClick={() => setModalMateriaOpen(true)}>
            Agregar
          </Button>
        </Tooltip>
        
        <Tooltip title="Eliminar materia">
          <Button
            variant="outlined"
            color="error"
            disabled={!selectedMateriaClave}
            onClick={() => setModalBorrarMateriaOpen(true)}
          >
            Eliminar
          </Button>
        </Tooltip>

        <Tooltip title="Lista de Asistencia por Materia">
          <span> 
            <IconButton disabled={!selectedMateriaClave} onClick={handleNavigateToListaMateria}>
              <ListAltIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Actividades Cotidianas">
          <span>
            <IconButton disabled={!selectedMateriaClave} onClick={handleNavigateToActividades}>
              <AutoStoriesIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Calificaciones Parciales">
          <span>
            <IconButton disabled={!selectedMateriaClave} onClick={handleNavigateToRubros}>
              <ChecklistIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {/* TABLA */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
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
                  No hay materias asignadas.
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

      {/* --- RENDERIZADO CONDICIONAL DE MODALES --- */}
      
      {/* Modales de AGREGAR */}
      {modalMateriaOpen && (
        mode === "perfil" ? (
          <NuevaMateriaPerfil
            open={modalMateriaOpen}
            onClose={() => setModalMateriaOpen(false)}
            onAccept={handleAcceptMateria}
            grupoId={id}
          />
        ) : (
          <NuevaMateriaGrupo
            open={modalMateriaOpen}
            onClose={() => setModalMateriaOpen(false)}
            onAccept={handleAcceptMateria}
            grupoId={id}
          />
        )
      )}

      {/* Modales de BORRAR */}
      {modalBorrarMateriaOpen && (
        mode === "perfil" ? (
          <BorrarMateriaPerfil
            open={modalBorrarMateriaOpen}
            onClose={() => setModalBorrarMateriaOpen(false)}
            onAccept={handleAcceptBorrar}
            grupoId={id}
            clave={selectedMateriaClave}
            nombre={selectedMateriaNombre || ""}
          />
        ) : (
          <BorrarMateriaGrupo
            open={modalBorrarMateriaOpen}
            onClose={() => setModalBorrarMateriaOpen(false)}
            onAccept={handleAcceptBorrar}
            grupoId={id}
            clave={selectedMateriaClave}
            nombre={selectedMateriaNombre || ""}
          />
        )
      )}

      {/* Modal Extra de GRUPO */}
      {mode === "grupo" && (
        <CambiarAlumnosGrupo
          open={modalGrupoCambio}
          onClose={() => setModalGrupoCambio(false)}
          onAccept={() => setModalGrupoCambio(false)}
          grupoId={id}
        />
      )}
    </Box>
  );
}
/**
 * @file alumno.jsx
 * @description Componente para buscar, visualizar y añadir nuevos alumnos.
 */
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchAlumnoGet } from "../services/alumnosService.js";
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import UserDocente from "../components/users/UserDocente.jsx"; // Componente 'Detalle'
import UserAlumno from "../components/users/UserAlumno.jsx";
import PostAlumno from "../components/modals/Alumno/PostAlumno.jsx";
import NewDocente from "../components/modals/Docente/NewDocente.jsx"; // Modal para crear alumno

/**
 * Componente principal que gestiona la interfaz de alumnos.
 * @returns {JSX.Element}
 */
export default function alumno() {
  // --- ESTADOS Y CONTEXTO ---

  const { token } = useAuth();
  /** @state {string} search - Almacena el término de búsqueda introducido por el usuario. */
  const [search, setSearch] = useState("");
  /** @state {Array} alumnos - Almacena la lista completa de alumnos obtenida de la API. (Nota: por convención, debería llamarse 'alumnos' en minúscula). */
  const [alumnos, setAlumnos] = useState([]);
  /** @state {Array} resultados - Almacena la lista filtrada de alumnos que se muestra en la interfaz. */
  const [resultados, setResultados] = useState([]);
  /** @state {string|null} selectedAlumnosId - Guarda el ID del alumno seleccionado para mostrar sus detalles. */
  const [selectedAlumnosId, setSelectedAlumnosId] = useState("");
  /** @state {boolean} modalNewOpen - Controla la visibilidad del modal para añadir un nuevo alumno. */
  const [modalNewOpen, setModalNewOpen] = useState(false);
  /** @state {boolean} loading - Indica si se están cargando los datos de la API. */
  const [loading, setLoading] = useState(false);
  /** @state {string|null} error - Almacena mensajes de error si la carga de datos falla. */
  const [error, setError] = useState(null);

  // --- LÓGICA DE DATOS ---

  /**
   * @callback
   * Carga la lista completa de alumnos desde la API.
   * `useCallback` evita que esta función se recree en cada render, optimizando su uso en `useEffect`.
   */
  const fetchAlumno = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!token)
        throw new Error("Autorización rechazada. No se encontró el token.");
      const data = await fetchAlumnoGet(token);
      setAlumnos(data.alumnos);
    } catch (error) {
      console.error("Error al cargar alumnos:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [token]); // Depende del token. Se recreará si el token cambia.

  /**
   * @effect
   * Llama a `fetchAlumno` una vez cuando el componente se monta para obtener los datos iniciales.
   */
  useEffect(() => {
    fetchAlumno();
  }, [fetchAlumno]);

  /**
   * @effect
   * Filtra la lista de alumnos cada vez que el término de búsqueda (`search`) o la lista maestra (`alumnos`) cambian.
   */
  useEffect(() => {
    // Si no hay texto de búsqueda, la lista de resultados se vacía.
    if (!search) {
      setResultados([]);
      return;
    }
    // Filtra la lista de alumnos si existe y el término de búsqueda no está vacío.
    const filtered = (alumnos ?? []).filter((alumno) => {
      // Obtenemos todos los campos de forma segura
      const nombres = alumno?.nombres ?? "";
      const apellidoP = alumno?.apellidop ?? "";
      const apellidoM = alumno?.apellidom ?? "";

      // Creamos un solo string con el nombre completo para buscar
      const nombreCompleto = `${nombres} ${apellidoP} ${apellidoM}`;

      // Convertimos todo a minúsculas para una búsqueda sin distinción de mayúsculas/minúsculas
      const busquedaNormalizada = search.toLowerCase();

      return nombreCompleto.toLowerCase().includes(busquedaNormalizada);
    });
    setResultados(filtered);
  }, [search, alumnos]);

  // --- MANEJADORES DE EVENTOS ---

  /**
   * Se ejecuta al hacer clic en un alumno de la lista.
   * @param {Object} alumno - El objeto del alumno seleccionado.
   */
  const handleClick = (alumno) => {
    setSelectedAlumnosId(alumno.matricula);

    // La llamada a fetchAlumno() aquí es innecesaria y se ha eliminado.
  };

  /**
   * Se ejecuta después de que el modal de "Nuevo alumno" se cierra con éxito.
   * Vuelve a cargar la lista de alumnos para incluir el nuevo registro.
   */
  const handleAcceptNew = () => {
    setModalNewOpen(false); // Cierra el modal.
    fetchAlumno(); // Actualiza la lista de alumnos.
  };

  // --- RENDERIZADO DEL COMPONENTE ---

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "calc(100vh - 80px)",
      }}
    >
      {/* Panel Izquierdo (20%): Búsqueda y Lista (Maestro) */}
      <Paper
        sx={{
          width: "20%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          p: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Escribe un nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Tooltip title="Añadir Nuevo alumno">
            <IconButton onClick={() => setModalNewOpen(true)} sx={{ ml: 1 }}>
              <PersonAddAlt1Icon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Modal para crear un nuevo alumno */}
        <PostAlumno
          open={modalNewOpen}
          onClose={() => setModalNewOpen(false)}
          onAccept={handleAcceptNew}
        />

        <List sx={{ width: "100%", flexGrow: 1, overflowY: "auto" }}>
          {loading && (
            <ListItem>
              <ListItemText primary="Cargando..." />
            </ListItem>
          )}
          {error && (
            <ListItem>
              <ListItemText primary={error} sx={{ color: "red" }} />
            </ListItem>
          )}
          {!loading &&
            !error &&
            (search && resultados.length > 0 ? (
              resultados.map((alumno) => (
                <ListItem
                  key={alumno.matricula}
                  onClick={() => handleClick(alumno)}
                  selected={selectedAlumnosId === alumno.matricula}
                  sx={{
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                  }}
                  divider
                >
                  <ListItemText
                    primary={alumno.nombres}
                    secondary={`${alumno.apellidop} ${alumno.apellidom}`}
                  />
                </ListItem>
              ))
            ) : search ? (
              <ListItem>
                <ListItemText primary="No se encontraron alumnos" />
              </ListItem>
            ) : (
              <ListItem>
                <ListItemText primary="Escribe un nombre para buscar..." />
              </ListItem>
            ))}
        </List>
      </Paper>

      {/* Panel Derecho (80%): Detalles del alumno (Detalle) */}
      <Box sx={{ width: "80%", height: "100%", p: 2 }}>
        {selectedAlumnosId ? (
          <UserAlumno matricula={selectedAlumnosId} />
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <p>Selecciona un alumno de la lista para ver sus detalles.</p>
          </Box>
        )}
      </Box>
    </Box>
  );
}

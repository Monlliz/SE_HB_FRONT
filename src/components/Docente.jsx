/**
 * @file Docente.jsx
 * @description Componente para buscar, visualizar y añadir nuevos docentes.
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchDocenteGet } from "./services/docenteService.js";
import {
  Box, TextField, List, ListItem, ListItemText, Paper, IconButton,Tooltip
} from "@mui/material";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import UserDocente from "./users/UserDocente"; // Componente 'Detalle'
import NewDocente from "./modals/Docente/NewDocente"; // Modal para crear docente

/**
 * Componente principal que gestiona la interfaz de docentes.
 * @returns {JSX.Element}
 */
export default function Docente() {
  // --- ESTADOS Y CONTEXTO ---

  const { token } = useAuth();
  /** @state {string} search - Almacena el término de búsqueda introducido por el usuario. */
  const [search, setSearch] = useState("");
  /** @state {Array} docentes - Almacena la lista completa de docentes obtenida de la API. (Nota: por convención, debería llamarse 'docentes' en minúscula). */
  const [docentes, setDocentes] = useState([]);
  /** @state {Array} resultados - Almacena la lista filtrada de docentes que se muestra en la interfaz. */
  const [resultados, setResultados] = useState([]);
  /** @state {string|null} selectedDocenteId - Guarda el ID del docente seleccionado para mostrar sus detalles. */
  const [selectedDocenteId, setSelectedDocenteId] = useState(null);
  /** @state {boolean} modalNewOpen - Controla la visibilidad del modal para añadir un nuevo docente. */
  const [modalNewOpen, setModalNewOpen] = useState(false);
  /** @state {boolean} loading - Indica si se están cargando los datos de la API. */
  const [loading, setLoading] = useState(false);
  /** @state {string|null} error - Almacena mensajes de error si la carga de datos falla. */
  const [error, setError] = useState(null);

  // --- LÓGICA DE DATOS ---

  /**
   * @callback
   * Carga la lista completa de docentes desde la API.
   * `useCallback` evita que esta función se recree en cada render, optimizando su uso en `useEffect`.
   */
  const fetchDocente = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!token) throw new Error("Autorización rechazada. No se encontró el token.");
      const data = await fetchDocenteGet(token);
      setDocentes(data.docentes);
    } catch (error) {
      console.error("Error al cargar Docentes:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [token]); // Depende del token. Se recreará si el token cambia.

  /**
   * @effect
   * Llama a `fetchDocente` una vez cuando el componente se monta para obtener los datos iniciales.
   */
  useEffect(() => {
    fetchDocente();
  }, [fetchDocente]);

  /**
   * @effect
   * Filtra la lista de docentes cada vez que el término de búsqueda (`search`) o la lista maestra (`docentes`) cambian.
   */
  useEffect(() => {
    // Si no hay texto de búsqueda, la lista de resultados se vacía.
    if (!search) {
      setResultados([]);
      return;
    }
    // Filtra la lista de docentes si existe y el término de búsqueda no está vacío.
    const filtered = (docentes ?? []).filter((docente) => {
      const nombres = docente?.nombres ?? "";
      return nombres.toLowerCase().includes(search.toLowerCase());
    });
    setResultados(filtered);
  }, [search, docentes]);

  // --- MANEJADORES DE EVENTOS ---

  /**
   * Se ejecuta al hacer clic en un docente de la lista.
   * @param {Object} docente - El objeto del docente seleccionado.
   */
  const handleClick = (docente) => {
    setSelectedDocenteId(docente.iddocente);
    // La llamada a fetchDocente() aquí es innecesaria y se ha eliminado.
  };

  /**
   * Se ejecuta después de que el modal de "Nuevo Docente" se cierra con éxito.
   * Vuelve a cargar la lista de docentes para incluir el nuevo registro.
   */
  const handleAcceptNew = () => {
    setModalNewOpen(false); // Cierra el modal.
    fetchDocente(); // Actualiza la lista de docentes.
  };

  // --- RENDERIZADO DEL COMPONENTE ---

  return (
    <Box sx={{ display: "flex", width: "100%", height: "calc(100vh - 80px)"}}>
      {/* Panel Izquierdo (20%): Búsqueda y Lista (Maestro) */}
      <Paper sx={{ width: "20%", height: "100%", display: "flex", flexDirection: "column", p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Escribe un nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Tooltip title="Añadir Nuevo Docente">
            <IconButton onClick={() => setModalNewOpen(true)} sx={{ ml: 1 }}>
              <PersonAddAlt1Icon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Modal para crear un nuevo docente */}
        <NewDocente
          open={modalNewOpen}
          onClose={() => setModalNewOpen(false)}
          onAccept={handleAcceptNew}
        />

        <List sx={{ width: "100%", flexGrow: 1, overflowY: "auto" }}>
          {loading && <ListItem><ListItemText primary="Cargando..." /></ListItem>}
          {error && <ListItem><ListItemText primary={error} sx={{ color: "red" }} /></ListItem>}
          {!loading && !error && (
            search && resultados.length > 0 ? (
              resultados.map((docente) => (
                <ListItem
                  key={docente.iddocente}
                  onClick={() => handleClick(docente)}
                  selected={selectedDocenteId === docente.iddocente}
                  sx={{ cursor: "pointer", "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" } }}
                  divider
                >
                  <ListItemText primary={docente.nombres} secondary={`${docente.apellidop} ${docente.apellidom}`} />
                </ListItem>
              ))
            ) : search ? (
              <ListItem><ListItemText primary="No se encontraron docentes" /></ListItem>
            ) : (
              <ListItem><ListItemText primary="Escribe un nombre para buscar..." /></ListItem>
            )
          )}
        </List>
      </Paper>

      {/* Panel Derecho (80%): Detalles del Docente (Detalle) */}
      <Box sx={{ width: "80%", height: "100%", p: 2 }}>
        {selectedDocenteId ? (
          <UserDocente id={selectedDocenteId} />
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <p>Selecciona un docente de la lista para ver sus detalles.</p>
          </Box>
        )}
      </Box>
    </Box>
  );
}
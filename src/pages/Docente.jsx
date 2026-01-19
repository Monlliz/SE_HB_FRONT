/**
 * @file Docente.jsx
 * @description Componente para buscar, visualizar y añadir nuevos docentes.
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchDocenteGet } from "../services/docenteService.js";
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  Paper,
  IconButton,
  Tooltip,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import UserDocente from "../components/users/UserDocente.jsx"; // Componente 'Detalle'
import NewDocente from "../components/modals/Docente/NewDocente"; // Modal para crear docente

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
  /** @state {boolean} showAll - Controla si se muestran todos los docentes o solo los filtrados. */
  const [showAll, setShowAll] = useState(false);

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
      if (!token) throw new Error("Autorización rechazada.");
      const data = await fetchDocenteGet(token);
      const docentesOrdenados = (data.docentes || []).sort((a, b) => {
        return a.apellidop.localeCompare(b.apellidop);
      });
      setDocentes(docentesOrdenados);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

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
    let filtered = docentes ?? [];

    if (!showAll) {
      // Si no se marca "Ver todos", requiere que haya algo en el buscador
      if (!search) {
        setResultados([]);
        return;
      }
      filtered = filtered.filter((docente) => {
        const nombreCompleto =
          `${docente.nombres} ${docente.apellidop} ${docente.apellidom}`.toLowerCase();
        return nombreCompleto.includes(search.toLowerCase());
      });
    } else {
      // Si "Ver todos" es true, aún podemos aplicar el filtro de búsqueda sobre la lista completa
      if (search) {
        filtered = filtered.filter((docente) => {
          const nombreCompleto =
            `${docente.nombres} ${docente.apellidop} ${docente.apellidom}`.toLowerCase();
          return nombreCompleto.includes(search.toLowerCase());
        });
      }
    }

    setResultados(filtered);
  }, [search, docentes, showAll]);

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
    <Box sx={{ display: "flex", width: "100%", height: "calc(100vh - 80px)" }}>
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
          <Tooltip title="Añadir Nuevo Docente">
            <IconButton onClick={() => setModalNewOpen(true)} sx={{ ml: 1 }}>
              <PersonAddAlt1Icon />
            </IconButton>
          </Tooltip>
        </Box>
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={showAll}
              onChange={(e) => setShowAll(e.target.checked)}
            />
          }
          label={
            showAll ? "Mostrando todos los docentes" : "Ver todos los docentes"
          }
          sx={{
            mb: 1,
            "& .MuiFormControlLabel-label": { fontSize: "0.85rem" },
          }}
        />
        {/* Modal para crear un nuevo docente */}
        <NewDocente
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

          {!loading && !error && (
            <>
              {/* Si hay resultados, los mapeamos directamente */}
              {resultados.length > 0 ? (
                resultados.map((docente) => (
                  <ListItem
                    key={docente.iddocente}
                    onClick={() => handleClick(docente)}
                    selected={selectedDocenteId === docente.iddocente}
                    sx={{
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                    }}
                    divider
                  >
                    <ListItemText
                      primary={docente.nombres}
                      secondary={`${docente.apellidop} ${docente.apellidom}`}
                    />
                  </ListItem>
                ))
              ) : (
                /* Si no hay resultados, mostramos el mensaje de ayuda contextual */
                <ListItem>
                  <ListItemText
                    primary={
                      search
                        ? "No se encontraron coincidencias"
                        : "Usa el buscador o marca 'Mostrar lista completa'"
                    }
                  />
                </ListItem>
              )}
            </>
          )}
        </List>
      </Paper>

      {/* Panel Derecho (80%): Detalles del Docente (Detalle) */}
      <Box sx={{ width: "80%", height: "100%", p: 2 }}>
        {selectedDocenteId ? (
          <UserDocente id={selectedDocenteId} />
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <p>Selecciona un docente de la lista para ver sus detalles.</p>
          </Box>
        )}
      </Box>
    </Box>
  );
}

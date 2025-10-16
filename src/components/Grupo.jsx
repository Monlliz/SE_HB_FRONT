/**
 * @file Grupo.jsx
 * @description Componente de interfaz Maestro-Detalle para buscar y visualizar grupos.
 */

// Importaciones de React, hooks y componentes.
import { useState, useEffect, useCallback } from "react";
import UserGrupo from "./users/UserGrupo.jsx"; // Componente 'Detalle' que muestra la info de un grupo.
import { useAuth } from "../context/AuthContext.jsx"; // Contexto para la autenticación.
import { fetchGrupoGet } from "./services/grupoService.js"; // Servicio para la llamada a la API.
import {
  Box, TextField, List, ListItem, ListItemText, Paper,
} from "@mui/material";

/**
 * Componente principal que gestiona la búsqueda y visualización de grupos.
 * @returns {JSX.Element}
 */
export default function Grupo() {
  // --- ESTADOS Y CONTEXTO ---

  /** Obtiene el token de autenticación del contexto global. */
  const { token } = useAuth();

  /** @state {string} search - Almacena el texto de entrada del campo de búsqueda. */
  const [search, setSearch] = useState("");

  /** @state {Array} Grupos - Almacena la lista completa y sin filtrar de grupos traída de la API. Es la 'fuente de verdad'. */
  const [Grupos, setGrupos] = useState([]);

  /** @state {Array} resultados - Almacena la lista de grupos filtrada que se muestra al usuario. */
  const [resultados, setResultados] = useState([]);

  /** @state {string|null} selectGrupo - Almacena el ID del grupo actualmente seleccionado. Controla la vista 'Detalle'. */
  const [selectGrupo, setSelectGrupo] = useState(null);

  /** @state {boolean} loading - Indica si se están cargando los datos de los grupos. */
  const [loading, setLoading] = useState(true);

  /** @state {Error|null} error - Almacena cualquier error que ocurra durante la carga de datos. */
  const [error, setError] = useState(null);

  // --- LÓGICA DE DATOS (EFECTOS Y CALLBACKS) ---

  /**
   * @callback
   * Función memoizada con `useCallback` para obtener la lista de grupos desde la API.
   */
  const fetchGrupo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!token) throw new Error("Autorización rechazada. No se encontró el token.");
      
      const { grupos } = await fetchGrupoGet(token);
      setGrupos(grupos);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [token]); // La dependencia es el token. Si cambia, la función se recrea.

  /**
   * @effect
   * Se ejecuta al montar el componente (y si `fetchGrupo` cambia) para cargar la lista inicial de grupos.
   */
  useEffect(() => {
    fetchGrupo();
  }, [fetchGrupo]);

  /**
   * @effect
   * Se ejecuta cada vez que el término de búsqueda (`search`) o la lista maestra de grupos (`Grupos`) cambia.
   * Filtra los grupos y actualiza el estado `resultados`.
   */
  useEffect(() => {
    const resultadosFiltrados = search
      ? Grupos.filter((grupo) =>
          String(grupo.idgrupo ?? "") // Conversión segura a string
            .toLowerCase()
            .includes(search.toLowerCase())
        )
      : Grupos; // Si no hay búsqueda, muestra todos los grupos.

    setResultados(resultadosFiltrados);
  }, [search, Grupos]);

  // --- MANEJADORES DE EVENTOS ---

  /**
   * Manejador que se activa al hacer clic en un grupo de la lista.
   * @param {Object} grupo - El objeto del grupo seleccionado.
   */
  const handleClick = (grupo) => {
    setSelectGrupo(grupo.idgrupo);
    // Nota: La llamada a fetchGrupo() aquí es redundante y se puede eliminar.
    // Los datos ya están cargados.
  };

  // --- RENDERIZADO DEL COMPONENTE ---

  return (
    <Box
      sx={{ display: "flex", width: "100%", height: "calc(100vh - 80px)", marginTop: "40px" }}
    >
      {/* Panel Izquierdo (20%): Búsqueda y Lista de Grupos (Maestro) */}
      <Paper
        sx={{ width: "20%", height: "100%", display: "flex", flexDirection: "column", p: 2 }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Busca un grupo por ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2 }}
        />
        <List sx={{ width: "100%", flexGrow: 1, overflowY: "auto" }}>
          {/* Muestra un spinner, un error, o la lista de resultados */}
          {loading ? (
            <ListItem><ListItemText primary="Cargando..." /></ListItem>
          ) : error ? (
            <ListItem><ListItemText primary="Error al cargar" secondary={error.message} /></ListItem>
          ) : resultados.length > 0 ? (
            resultados.map((grupo) => (
              <ListItem
                key={grupo.idgrupo}
                onClick={() => handleClick(grupo)}
                selected={selectGrupo === grupo.idgrupo} // Resalta el item seleccionado
                sx={{ cursor: "pointer", "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" } }}
                divider
              >
                <ListItemText primary= {grupo.idgrupo} />
              </ListItem>
            ))
          ) : (
            <ListItem><ListItemText primary="No se encontraron grupos" /></ListItem>
          )}
        </List>
      </Paper>

      {/* Panel Derecho (80%): Detalles del Grupo (Detalle) */}
      <Box sx={{ width: "80%", height: "100%", p: 2 }}>
        {selectGrupo ? (
          // Si hay un grupo seleccionado, renderiza el componente de detalle.
          <UserGrupo id={selectGrupo} />
        ) : (
          // Si no, muestra un mensaje para que el usuario seleccione un grupo.
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <p>Selecciona un grupo de la lista para ver sus detalles.</p>
          </Box>
        )}
      </Box>
    </Box>
  );
}
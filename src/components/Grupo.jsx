/**
 * @file Grupo.jsx
 * @description Componente de interfaz Maestro-Detalle para buscar y visualizar grupos.
 */

// Importaciones de React, hooks y componentes.
import { useState, useEffect, useCallback } from "react";
import UserGrupo from "./users/UserGrupo.jsx";
import UserPerfil from "./users/userPerfil.jsx"; // (Asegúrate que la 'u' sea minúscula como tu import)
import { useAuth } from "../context/AuthContext.jsx";
import { fetchGrupoGet, fetchPerfilGet } from "./services/grupoService.js";

//  Imports para los botones de filtro
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  Paper,
  CircularProgress, // Añadido para un mejor 'loading'
  Typography,     // Añadido para un mejor 'loading'
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

/**
 * Componente principal que gestiona la búsqueda y visualización de grupos.
 * @returns {JSX.Element}
 */
export default function Grupo() {
  // --- ESTADOS Y CONTEXTO ---
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const [Grupos, setGrupos] = useState([]);
  const [perfiles, setPerfiles] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [selectGrupo, setSelectGrupo] = useState(null);
  const [selectPerfil, setSelectPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //  Estado para el filtro de paridad
  const [filtroParidad, setFiltroParidad] = useState("todos"); // "todos", "pares", "impares"

  // --- LÓGICA DE DATOS (EFECTOS Y CALLBACKS) ---

  const fetchGrupo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!token)
        throw new Error("Autorización rechazada. No se encontró el token.");
      
      // Llamadas en paralelo para más eficiencia
      const [dataGrupos, dataPerfiles] = await Promise.all([
         fetchGrupoGet(token),
         fetchPerfilGet(token)
      ]);
      
      const { grupos } = dataGrupos;
      const { perfiles } = dataPerfiles;

      const idGrupoOcultar = "EG";

      // Bug del filtro de perfiles eliminado.
      // Ahora guarda TODOS los perfiles que llegan de la API.
      setPerfiles(perfiles);

      const gruposFiltrados = grupos.filter(
        (grupo) => grupo.idgrupo !== idGrupoOcultar
      );
      setGrupos(gruposFiltrados);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  /**
   * @effect
   * Se ejecuta al montar el componente (y si `fetchGrupo` cambia) para cargar la lista inicial de grupos.
   */
  // Este es el useEffect que llama a la API.
  useEffect(() => {
    fetchGrupo();
  }, [fetchGrupo]);

  /**
   * @effect
   * Se ejecuta CADA VEZ que la búsqueda, los datos, o el filtro de PARIDAD cambian.
   * Combina, filtra por búsqueda y filtra por paridad.
   */
  useEffect(() => {
    // 1. Estandarizar Grupos
    const gruposConFormato = Grupos.map((g) => ({
      id: g.idgrupo,
      label: g.idgrupo, // El texto a mostrar y buscar
      type: "grupo", // Para saber en qué hicimos clic
    }));

    // 2. Estandarizar Perfiles
    const perfilesConFormato = perfiles.map((p) => ({
      id: p.idperfil,
      label: p.idperfil, // El texto a mostrar y buscar
      type: "perfil", // Para saber en qué hicimos clic
    }));

    // 3. Combinarlos en una sola lista
    const itemsCombinados = [...gruposConFormato, ...perfilesConFormato];

    // 4. Filtrar por término de búsqueda
    const resultadosDeBusqueda = search
      ? itemsCombinados.filter((item) =>
          String(item.label ?? "") // Conversión segura a string
            .toLowerCase()
            .includes(search.toLowerCase())
        )
      : itemsCombinados; // Si no hay búsqueda, muestra todos.

    //: Filtrar por paridad (Pares/Impares)
    const resultadosFinales = resultadosDeBusqueda.filter((item) => {
      // Si el filtro es "todos", no hagas nada
      if (filtroParidad === "todos") {
        return true;
      }

      // Obtener el primer carácter del ID (ej: "5" de "5B" o "5-EA")
      const primerChar = String(item.id ?? "").charAt(0);
      const numero = parseInt(primerChar, 10);

      // Si el primer carácter no es un número, lo descartamos
      if (isNaN(numero)) {
        return false;
      }

      // Aplicar el filtro de paridad
      if (filtroParidad === "pares") {
        return numero % 2 === 0; // Es Par
      }
      if (filtroParidad === "impares") {
        return numero % 2 !== 0; // Es Impar
      }
      return true; // (fallback, no debería llegar aquí)
    });

    setResultados(resultadosFinales);
  }, [search, Grupos, perfiles, filtroParidad]); // 'filtroParidad' es una dependencia



  // --- MANEJADORES DE EVENTOS ---

  const handleClick = (item) => {
    if (item.type === "grupo") {
      setSelectGrupo(item.id);
      setSelectPerfil(null);
    } else if (item.type === "perfil") {
      setSelectPerfil(item.id);
      setSelectGrupo(null);
    }
  };

  //  Manejador para los botones de filtro
  const handleFiltroParidadChange = (event, newFiltro) => {
    // El 'ToggleButtonGroup' exclusivo permite deseleccionar (valor null).
    // Forzamos a que siempre haya uno seleccionado (mínimo "todos").
    if (newFiltro !== null) {
      setFiltroParidad(newFiltro);
    } else {
      setFiltroParidad("todos"); // Si el usuario deselecciona, vuelve a "todos"
    }
  };

  // --- RENDERIZADO DEL COMPONENTE ---

  return (
    <Box sx={{ display: "flex", width: "100%", height: "calc(100vh - 80px)" }}>
      {/* Panel Izquierdo (20%): Búsqueda y Lista de Grupos (Maestro) */}
      <Paper
        sx={{
          width: "20%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          p: 2,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Busca un grupo por ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2 }}
        />
        
        {/* Botones de Filtro Pares/Impares */}
        <ToggleButtonGroup
          value={filtroParidad}
          exclusive
          onChange={handleFiltroParidadChange}
          aria-label="Filtro de paridad"
          fullWidth
          size="small"
          sx={{ mb: 2 }}
        >
          <ToggleButton value="todos" aria-label="todos" sx={{ flexGrow: 1 }}>
            Todos
          </ToggleButton>
          <ToggleButton value="pares" aria-label="pares" sx={{ flexGrow: 1 }}>
            Par
          </ToggleButton>
          <ToggleButton value="impares" aria-label="impares" sx={{ flexGrow: 1 }}>
            Impar
          </ToggleButton>
        </ToggleButtonGroup>

        <List sx={{ width: "100%", flexGrow: 1, overflowY: "auto" }}>
          {/* Muestra un spinner, un error, o la lista de resultados */}
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, gap: 2 }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">Cargando...</Typography>
            </Box>
          ) : error ? (
            <ListItem>
              <ListItemText
                primary="Error al cargar"
                secondary={error.message}
                sx={{ color: "error.main" }}
              />
            </ListItem>
          ) : resultados.length > 0 ? (
            resultados.map((item) => (
              <ListItem
                key={item.type + "-" + item.id}
                onClick={() => handleClick(item)}
                selected={selectGrupo === item.id || selectPerfil === item.id}
                sx={{
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                }}
                divider
              >
                <ListItemText
                  primary={item.label}
                  secondary={item.type === "grupo" ? "Grupo" : "Perfil"}
                />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="No se encontraron resultados" />
            </ListItem>
          )}
        </List>
      </Paper>

      {/* Panel Derecho (80%): Detalles del Grupo (Detalle) */}
      <Box sx={{ width: "80%", height: "100%", p: 2, overflowY: 'auto' }}>
        {selectGrupo ? (
          <UserGrupo id={selectGrupo} />
        ) : selectPerfil ? (
          <UserPerfil id={selectPerfil} />
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Selecciona un grupo o perfil de la lista para ver sus detalles.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
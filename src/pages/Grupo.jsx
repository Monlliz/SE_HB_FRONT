/**
 * @file Grupo.jsx
 * @description Componente de interfaz Maestro-Detalle para buscar y visualizar grupos.
 */

// Importaciones de React, hooks y componentes.
import { useState, useEffect, useCallback } from "react";

// --- CAMBIO AQUÍ: Importamos el componente unificado ---
import MateriasManager from "../components/users/UserGrupoU.jsx"; 

import { useAuth } from "../context/AuthContext.jsx";
import { fetchGrupoGet, fetchPerfilGet } from "../services/grupoService.js";

//  Imports para los botones de filtro
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  Paper,
  CircularProgress,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

export default function Grupo() {
  // --- ESTADOS Y CONTEXTO ---
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const [Grupos, setGrupos] = useState([]);
  const [perfiles, setPerfiles] = useState([]);
  const [resultados, setResultados] = useState([]);
  
  // Estados de selección
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
        fetchPerfilGet(token),
      ]);

      const { grupos } = dataGrupos;
      const { perfiles } = dataPerfiles;

      const idGrupoOcultar = ["EG", "BI"];

      const perfilesFiltrados = perfiles.filter((perfil) => {
        const tieneNumero = /^\d+-/.test(perfil.idperfil); // verifica si inicia con número y guion
        const esBC = perfil.idperfil.includes("BC");
        return tieneNumero && !esBC;
      });

      setPerfiles(perfilesFiltrados);

      const gruposFiltrados = grupos.filter(
        (grupo) => !idGrupoOcultar.includes(grupo.idgrupo)
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
   * @effect Carga inicial
   */
  useEffect(() => {
    fetchGrupo();
  }, [fetchGrupo]);

  /**
   * @effect Filtrado y Búsqueda
   */
  useEffect(() => {
    // 1. Estandarizar Grupos
    const gruposConFormato = Grupos.map((g) => ({
      id: g.idgrupo,
      label: g.idgrupo,
      type: "grupo",
    }));

    // 2. Estandarizar Perfiles
    const perfilesConFormato = perfiles.map((p) => ({
      id: p.idperfil,
      label: p.idperfil,
      type: "perfil",
    }));

    // 3. Combinarlos
    const itemsCombinados = [...gruposConFormato, ...perfilesConFormato];

    // 4. Filtrar por término de búsqueda
    const resultadosDeBusqueda = search
      ? itemsCombinados.filter((item) =>
          String(item.label ?? "")
            .toLowerCase()
            .includes(search.toLowerCase())
        )
      : itemsCombinados;

    // 5. Filtrar por paridad (Pares/Impares)
    const resultadosFinales = resultadosDeBusqueda.filter((item) => {
      if (filtroParidad === "todos") return true;

      const primerChar = String(item.id ?? "").charAt(0);
      const numero = parseInt(primerChar, 10);

      if (isNaN(numero)) return false;

      if (filtroParidad === "pares") return numero % 2 === 0;
      if (filtroParidad === "impares") return numero % 2 !== 0;
      
      return true;
    });

    setResultados(resultadosFinales);
  }, [search, Grupos, perfiles, filtroParidad]);

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

  const handleFiltroParidadChange = (event, newFiltro) => {
    if (newFiltro !== null) {
      setFiltroParidad(newFiltro);
    } else {
      setFiltroParidad("todos");
    }
  };

  // --- RENDERIZADO DEL COMPONENTE ---

  return (
    <Box sx={{ display: "flex", width: "100%", height: "calc(100vh - 80px)" }}>
      {/* Panel Izquierdo (20%): Búsqueda y Lista */}
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
          {loading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 4,
                gap: 2,
              }}
            >
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                Cargando...
              </Typography>
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

      {/* Panel Derecho (80%): Detalles del Grupo/Perfil */}
      <Box sx={{ width: "80%", height: "100%", p: 2, overflowY: "auto" }}>
        
        {/* --- CAMBIO AQUÍ: Usamos el componente unificado --- */}
        {selectGrupo ? (
          <MateriasManager id={selectGrupo} mode="grupo" />
        ) : selectPerfil ? (
          <MateriasManager id={selectPerfil} mode="perfil" />
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
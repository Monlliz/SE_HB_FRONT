/**
 * @file Grupo.jsx
 */
import { useState, useEffect, useCallback } from "react";
// 1. IMPORTANTE: Importamos useSearchParams
import { useSearchParams } from "react-router-dom";

import MateriasManager from "../components/users/UserGrupoU.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchGrupoGet, fetchPerfilGet } from "../services/grupoService.js";
import { codificarParams, decodificarParams } from "../utils/cifrado.js";

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
  const { token } = useAuth();

  // 2. Hook para manipular la URL
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [Grupos, setGrupos] = useState([]);
  const [perfiles, setPerfiles] = useState([]);
  const [resultados, setResultados] = useState([]);

  // 3. ELIMINAMOS los useState locales de selección:
  // const [selectGrupo, setSelectGrupo] = useState(null);
  // const [selectPerfil, setSelectPerfil] = useState(null);

  // 4. CREAMOS variables derivadas directamente de la URL.
  // Si la URL es /grupo?id=EG-202&type=grupo, estas variables lo capturan automáticamente.

  const paramQ = searchParams.get("q");
  const { id: currentId, type: currentType } = paramQ
    ? decodificarParams(paramQ)
    : { id: null, type: null };

  const selectGrupo = currentType === "grupo" ? currentId : null;
  const selectPerfil = currentType === "perfil" ? currentId : null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroParidad, setFiltroParidad] = useState("todos");

  const fetchGrupo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!token) throw new Error("Autorización rechazada.");

      const [dataGrupos, dataPerfiles] = await Promise.all([
        fetchGrupoGet(token),
        fetchPerfilGet(token),
      ]);

      const { grupos } = dataGrupos;
      const { perfiles } = dataPerfiles;
      const idGrupoOcultar = ["EG", "BI"];

      const perfilesFiltrados = perfiles.filter((perfil) => {
        const tieneNumero = /^\d+-/.test(perfil.idperfil);
        const esBC = perfil.idperfil.includes("BC");
        return tieneNumero && !esBC;
      });

      setPerfiles(perfilesFiltrados);
      const gruposFiltrados = grupos.filter(
        (grupo) => !idGrupoOcultar.includes(grupo.idgrupo),
      );
      setGrupos(gruposFiltrados);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchGrupo();
  }, [fetchGrupo]);

  useEffect(() => {
    const gruposConFormato = Grupos.map((g) => ({
      id: g.idgrupo,
      label: g.idgrupo,
      type: "grupo",
    }));

    const perfilesConFormato = perfiles.map((p) => ({
      id: p.idperfil,
      label: p.idperfil,
      type: "perfil",
    }));

    const itemsCombinados = [...gruposConFormato, ...perfilesConFormato];

    const resultadosDeBusqueda = search
      ? itemsCombinados.filter((item) =>
          String(item.label ?? "")
            .toLowerCase()
            .includes(search.toLowerCase()),
        )
      : itemsCombinados;

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

  // 5. MODIFICAMOS el handleClick para guardar en la URL
  const handleClick = (item) => {
    // En lugar de pasar id y type legibles, los codificamos
    const hash = codificarParams(item.id, item.type);
    setSearchParams({ q: hash });
  };

  const handleFiltroParidadChange = (event, newFiltro) => {
    if (newFiltro !== null) {
      setFiltroParidad(newFiltro);
    } else {
      setFiltroParidad("todos");
    }
  };

  return (
    <Box sx={{ display: "flex", width: "100%", height: "calc(100vh - 80px)" }}>
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

        <ToggleButtonGroup
          value={filtroParidad}
          exclusive
          onChange={handleFiltroParidadChange}
          aria-label="Filtro de paridad"
          fullWidth
          size="small"
          sx={{ mb: 2 }}
        >
          <ToggleButton value="todos">Todos</ToggleButton>
          <ToggleButton value="pares">Par</ToggleButton>
          <ToggleButton value="impares">Impar</ToggleButton>
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
                // 6. Usamos las variables derivadas para saber si está seleccionado
                selected={currentId === item.id && currentType === item.type}
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

      <Box sx={{ width: "80%", height: "100%", p: 2, overflowY: "auto" }}>
        {/* Como selectGrupo y selectPerfil ahora vienen de la URL, 
            al dar "Atrás" el navegador restaura la URL y esto se renderiza automáticamente */}
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

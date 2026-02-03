/**
 * @file alumno.jsx
 * @description Componente para buscar, visualizar y añadir nuevos alumnos con Estado en URL.
 */
import { useState, useEffect, useCallback } from "react";
// 1. Importamos useSearchParams
import { useSearchParams } from "react-router-dom";

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
import UserAlumno from "../components/users/UserAlumno.jsx";
import PostAlumno from "../components/modals/Alumno/PostAlumno.jsx";

// --- HELPERS PARA "CIFRAR" URL (Fuera del componente) ---
const codificarParams = (id) => {
  const data = JSON.stringify({ id });
  return btoa(data); 
};

const decodificarParams = (encodedStr) => {
  try {
    const jsonStr = atob(encodedStr);
    return JSON.parse(jsonStr);
  } catch (e) {
    return { id: null };
  }
};

/**
 * Componente principal que gestiona la interfaz de alumnos.
 * @returns {JSX.Element}
 */
export default function alumno() {
  const { token } = useAuth();
  
  // 2. Hook para manipular la URL
  const [searchParams, setSearchParams] = useSearchParams();

  // --- ESTADOS LOCALES ---
  const [search, setSearch] = useState("");
  const [alumnos, setAlumnos] = useState([]);
  const [resultados, setResultados] = useState([]);
  
  // 3. ELIMINAMOS el estado local de selección
  // const [selectedAlumnosId, setSelectedAlumnosId] = useState("");

  // 4. CREAMOS la variable derivada de la URL
  const paramQ = searchParams.get("q");
  const { id: currentMatricula } = paramQ 
    ? decodificarParams(paramQ) 
    : { id: null };

  const [modalNewOpen, setModalNewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- LÓGICA DE DATOS ---

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
  }, [token]);

  useEffect(() => {
    fetchAlumno();
  }, [fetchAlumno]);

  useEffect(() => {
    if (!search) {
      setResultados([]);
      return;
    }
    const filtered = (alumnos ?? []).filter((alumno) => {
      const nombres = alumno?.nombres ?? "";
      const apellidoP = alumno?.apellidop ?? "";
      const apellidoM = alumno?.apellidom ?? "";
      const nombreCompleto = `${nombres} ${apellidoP} ${apellidoM}`;
      const busquedaNormalizada = search.toLowerCase();
      return nombreCompleto.toLowerCase().includes(busquedaNormalizada);
    });
    setResultados(filtered);
  }, [search, alumnos]);

  // --- MANEJADORES DE EVENTOS ---

  /**
   * 5. ACTUALIZAMOS el click para escribir en la URL
   */
  const handleClick = (alumno) => {
    // Guardamos la matrícula en la URL cifrada
    const hash = codificarParams(alumno.matricula);
    setSearchParams({ q: hash });
  };

  const handleAcceptNew = () => {
    setModalNewOpen(false);
    fetchAlumno();
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

        <PostAlumno
          open={modalNewOpen}
          onClose={() => setModalNewOpen(false)}
          onAccept={handleAcceptNew}
        />

        <List sx={{ width: "100%", flexGrow: 1, overflowY: "auto" }}>
          {loading && (
            <ListItem><ListItemText primary="Cargando..." /></ListItem>
          )}
          {error && (
            <ListItem><ListItemText primary={error} sx={{ color: "red" }} /></ListItem>
          )}
          {!loading && !error &&
            (search && resultados.length > 0 ? (
              resultados.map((alumno) => (
                <ListItem
                  key={alumno.matricula}
                  onClick={() => handleClick(alumno)}
                  // 6. Usamos currentMatricula para saber si está seleccionado
                  selected={currentMatricula === alumno.matricula}
                  button // Añadimos button para mejor UX
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
              <ListItem><ListItemText primary="No se encontraron alumnos" /></ListItem>
            ) : (
              <ListItem><ListItemText primary="Escribe un nombre para buscar..." /></ListItem>
            ))}
        </List>
      </Paper>

      {/* Panel Derecho (80%): Detalles del alumno */}
      <Box sx={{ width: "80%", height: "100%", p: 2 }}>
        
        {/* 7. Renderizamos usando la variable de la URL */}
        {currentMatricula ? (
          <UserAlumno matricula={currentMatricula} />
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
/**
 * @file Docente.jsx
 * @description Componente para buscar, visualizar y añadir nuevos docentes con Estado en URL.
 */

import { useState, useEffect, useCallback } from "react";
// 1. IMPORTANTE: Importamos useSearchParams
import { useSearchParams } from "react-router-dom"; 

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
import UserDocente from "../components/users/UserDocente.jsx"; 
import { camposNuevoDocente } from "../config/camposDocente-Alumno.jsx"; 
import ReusableModal from "../components/modals/ReusableModal.jsx";
import { fetchDocentePost } from "../services/docenteService.js";
import { User } from "lucide-react";
import { codificarParams, decodificarParams } from "../utils/cifrado.js";

/**
 * Componente principal que gestiona la interfaz de docentes.
 */
export default function Docente() {
  const { token, isDirector } = useAuth();
  
  // 2. Hook para manipular la URL
  const [searchParams, setSearchParams] = useSearchParams();

  // --- ESTADOS LOCALES ---
  const [search, setSearch] = useState("");
  const [docentes, setDocentes] = useState([]);
  const [resultados, setResultados] = useState([]);
  
  // 3. ELIMINAMOS el estado local:
  // const [selectedDocenteId, setSelectedDocenteId] = useState(null);

  // 4. CREAMOS la variable derivada de la URL
  const paramQ = searchParams.get("q");
  // Si existe 'q', decodificamos. Si no, el id es null.
  const { id: currentDocenteId } = paramQ 
    ? decodificarParams(paramQ) 
    : { id: null };

  const [modalNewOpen, setModalNewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  // --- LÓGICA DE DATOS ---

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

  useEffect(() => {
    fetchDocente();
  }, [fetchDocente]);

  useEffect(() => {
    let filtered = docentes ?? [];

    if (!showAll) {
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
   * 5. ACTUALIZAMOS el click para escribir en la URL
   */
  const handleClick = (docente) => {
    // En lugar de guardar en estado, guardamos en la URL cifrada
    const hash = codificarParams(docente.iddocente);
    setSearchParams({ q: hash });
  };

  const handleSaveDocente = async (formData) => {
    try {
      if (!token) throw new Error("No token found");
      await fetchDocentePost(token, formData);
      alert("Docente ingresado con éxito");
      setModalNewOpen(false); 
      fetchDocente(); 
    } catch (error) {
      console.error(error);
      alert(`Error: ${error.message}`);
    }
  };

  // --- RENDERIZADO DEL COMPONENTE ---

  return (
    <Box sx={{ display: "flex", width: "100%", height: "calc(100vh - 80px)" }}>
      {/* Panel Izquierdo (20%) */}
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
          {isDirector && (
          <Tooltip title="Añadir Nuevo Docente">
            <IconButton onClick={() => setModalNewOpen(true)} sx={{ ml: 1 }}>
              <PersonAddAlt1Icon />
            </IconButton>
          </Tooltip>
          )}
        </Box>
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={showAll}
              onChange={(e) => setShowAll(e.target.checked)}
            />
          }
          label={showAll ? "Mostrando todos" : "Ver todos"}
          sx={{ mb: 1, "& .MuiFormControlLabel-label": { fontSize: "0.85rem" } }}
        />
        
        <ReusableModal
          open={modalNewOpen}
          onClose={() => setModalNewOpen(false)}
          iconEntity={User}
          title="Ingresar Nuevo Docente"
          fields={camposNuevoDocente}
          initialValues={{}}
          onSubmit={handleSaveDocente}
        />

        <List sx={{ width: "100%", flexGrow: 1, overflowY: "auto" }}>
          {loading && (
            <ListItem><ListItemText primary="Cargando..." /></ListItem>
          )}
          {error && (
            <ListItem><ListItemText primary={error} sx={{ color: "red" }} /></ListItem>
          )}

          {!loading && !error && (
            <>
              {resultados.length > 0 ? (
                resultados.map((docente) => (
                  <ListItem
                    key={docente.iddocente}
                    onClick={() => handleClick(docente)}
                    // 6. Usamos la variable derivada de la URL para la selección
                    selected={currentDocenteId === docente.iddocente}
                    button // Añadido para mejor UX
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
                <ListItem>
                  <ListItemText
                    primary={search ? "No se encontraron coincidencias" : "Usa el buscador..."}
                  />
                </ListItem>
              )}
            </>
          )}
        </List>
      </Paper>

      {/* Panel Derecho (80%): Detalles del Docente */}
      <Box sx={{ width: "80%", height: "100%", p: 2 }}>
        
        {/* 7. Renderizamos usando currentDocenteId */}
        {currentDocenteId ? (
          <UserDocente id={currentDocenteId} />
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
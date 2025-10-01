import { useState, useEffect, useCallback } from "react";
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  Paper,
  Button,
  IconButton,
} from "@mui/material";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import UserDocente from "./users/UserDocente";
import NewDocente from "./modals/NewDocente";
export default function Docente() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [search, setSearch] = useState("");
  const [Docente, setDocente] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [selectedDocenteId, setSelectedDocenteId] = useState(null); // <- ID seleccionado
  const [modalNewOpen, setModalNewOpen] = useState(false);
  // Traemos todos los Docente una vez al cargar el componente

  useEffect(() => {
    fetchDocente();
  }, [apiUrl]);

  const fetchDocente = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/docente`);
      const data = await res.json();
      setDocente(data);
    } catch (error) {
      console.error("Error al cargar Docentes:", error);
    }
  }, [apiUrl]);

  // Filtrado dinámico en front según search
  useEffect(() => {
    if (!search) {
      setResultados([]);
      return;
    }
    const filtered = Docente.filter((docente) =>
      docente.nombres.toLowerCase().includes(search.toLowerCase())
    );
    setResultados(filtered);
  }, [search, Docente]);

  // Función al hacer click en un docente
  const handleClick = (docente) => {
    setSelectedDocenteId(docente.iddocente); // Guardamos el ID
    fetchDocente();
  };

  //Nuevo docente
  const handleAcceptNew = () => {
    setModalNewOpen(false); // Cierra el modal
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "calc(100vh - 80px)",
        marginTop: "40px",
      }}
    >
      {/* Box del 20% */}
      <Paper
        sx={{
          width: "20%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 2,
          borderRadius: 2,
          backgroundColor: "#fff",
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Escribe un nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            mb: 3,
            backgroundColor: "#fff",
            borderRadius: 1,
          }}
        />
        <IconButton
          aria-label="PersonAddAlt1Icon"
          onClick={() => setModalNewOpen(true)}
        >
          <PersonAddAlt1Icon />
        </IconButton>
        <NewDocente
          open={modalNewOpen}
          onClose={() => setModalNewOpen(false)}
          onAccept={handleAcceptNew}
        />
        <List
          sx={{
            width: "100%",
            flexGrow: 1,
            overflowY: "auto",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: 1,
            p: 1,
          }}
        >
          {search && resultados.length > 0 ? (
            resultados.map((docente) => (
              <ListItem
                key={docente.iddocente}
                onClick={() => handleClick(docente)}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.08)",
                  },
                }}
                divider
              >
                <ListItemText primary={docente.nombres} />
              </ListItem>
            ))
          ) : search ? (
            <ListItem>
              <ListItemText primary="No se encontraron Docentes" />
            </ListItem>
          ) : (
            <ListItem>
              <ListItemText primary="Busca Docente" />
            </ListItem>
          )}
        </List>
      </Paper>

      {/* Box del 80% */}
      <Box
        sx={{
          width: "80%",
          height: "100%",

          borderRadius: 2,
          p: 2,
        }}
      >
        {selectedDocenteId ? (
          <UserDocente id={selectedDocenteId} />
        ) : (
          <Box sx={{ color: "#fff" }}></Box>
        )}
      </Box>
    </Box>
  );
}

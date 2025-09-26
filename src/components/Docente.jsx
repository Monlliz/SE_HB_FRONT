import { useState, useEffect } from "react";
import { Box, TextField, List, ListItem, ListItemText, Paper } from "@mui/material";
import UserDocente from "./users/UserDocente";

export default function Alumnos() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [search, setSearch] = useState("");
  const [alumnos, setAlumnos] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [selectedDocenteId, setSelectedDocenteId] = useState(null); // <- ID seleccionado

  // Traemos todos los alumnos una vez al cargar el componente
  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        const res = await fetch(`${apiUrl}/docente`);
        const data = await res.json();
        setAlumnos(data);
      } catch (error) {
        console.error("Error al cargar Docentes:", error);
      }
    };
    fetchAlumnos();
  }, []);

  // Filtrado dinámico en front según search
  useEffect(() => {
    if (!search) {
      setResultados([]);
      return;
    }

    const filtered = alumnos.filter((alumno) =>
      alumno.nombres.toLowerCase().includes(search.toLowerCase())
    );
    setResultados(filtered);
  }, [search, alumnos]);

  // Función al hacer click en un docente
  const handleClick = (alumno) => {
    setSelectedDocenteId(alumno.iddocente

    ); // Guardamos el ID
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
            resultados.map((alumno) => (
              <ListItem
                key={alumno.iddocente}
                onClick={() => handleClick(alumno)}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.08)",
                  },
                }}
                divider
              >
                <ListItemText primary={alumno.nombres} />
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
      
          borderRadius:2,
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

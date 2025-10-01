import { useState, useEffect, useCallback } from "react";
import UserGrupo from "./users/UserGrupo.jsx";
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


export default function Grupo() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [search, setSearch] = useState("");
  const [Grupos, setGrupos] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [selectGrupo, setSelectGrupo] = useState(null);
  useEffect(() => {
    fetchGrupo();
  }, [apiUrl]);

  const fetchGrupo = useCallback(async () => {
    fetch(`${apiUrl}/grupos`)
      .then((response) => response.json())
      .then((data) => setGrupos(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, [apiUrl]);

  useEffect(() => {
    const resultadosFiltrados = search
      ? Grupos.filter((grupo) =>
          grupo.idgrupo.toLowerCase().includes(search.toLowerCase())
        )
      : Grupos;

    setResultados(resultadosFiltrados);
  }, [search, Grupos]);

  //obtener el id del grupo seleccionado
  const handleClick = (grupo) => {
    setSelectGrupo(grupo.idgrupo);

    fetchGrupo();
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
          placeholder="Busca un grupo..."
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
          {resultados.length > 0 ? (
            resultados.map((grupo) => (
              <ListItem
                key={grupo.idgrupo}
                onClick={() => handleClick(grupo)} // Asegúrate de tener esta función definida
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.08)",
                  },
                }}
                divider
              >
                <ListItemText primary={grupo.idgrupo} />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="No se encontraron Grupos" />
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
        {selectGrupo ? (
          <UserGrupo id={selectGrupo} />
        ) : (
          <Box sx={{ color: "#fff" }}></Box>
        )}
      </Box>
    </Box>
  );
}

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  IconButton,
  Menu,
  Button,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useNavigate } from "react-router-dom";

const headCells = [
  { id: "clave", label: "Clave" },
  { id: "asignatura", label: "Asignatura" },
];

export default function Grupos() {
  const navigate = useNavigate();
  const { idgrupo } = useParams();
  console.log(idgrupo);
  // Llamada a la API
  const [materiasData, setmateriasData] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${apiUrl}/materias/grupo/${idgrupo}/2025`)
      .then((response) => response.json())
      .then((data) => {
        setmateriasData(Array.isArray(data.materias) ? data.materias : []);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [apiUrl]);
  console.log(materiasData);
  // estados para búsqueda y filtros
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    clave: "",
    asignatura: "",
  });

  const open = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // Filtrado de datos
  const filteredData = materiasData.filter((materia) => {
    return (
      (search === "" ||
        materia.clave.toString().toUpperCase().includes(search.toUpperCase()) ||
        materia.asignatura
          .toString()
          .toUpperCase()
          .includes(search.toUpperCase())) &&
      (filters.clave === "" ||
        materia.clave
          .toString()
          .toUpperCase()
          .includes(filters.clave.toUpperCase())) &&
      (filters.asignatura === "" ||
        materia.asignatura
          .toString()
          .toUpperCase()
          .includes(filters.asignatura.toUpperCase()))
    );
  });

  return (
    <Box
      sx={{
        height: "89vh",
        width: "96.6vw",
        marginTop: "8vh",
        p: 0,
        overflow: "hidden",
      }}
    >
      <Paper sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Encabezado */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            m: 0,
            borderBottom: "1px solid #ddd",
          }}
        >
          <Typography
            variant="h2"
            sx={{
              color: "primary.main",
              fontSize: "2.5rem",
            }}
          >
            Materias Grupo {idgrupo}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TextField
              size="small"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* Menú de filtros */}
            <IconButton onClick={handleClick}>
              <FilterListIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{
                sx: { p: 2, width: 280 },
              }}
            >
              <Typography variant="subtitle1" gutterBottom>
                Filtros
              </Typography>

              {/* Input Clave */}
              <TextField
                fullWidth
                label="Clave"
                size="small"
                value={filters.clave} // usar el nombre correcto del estado
                onChange={(e) =>
                  setFilters({ ...filters, clave: e.target.value })
                }
                onKeyDown={(e) => e.stopPropagation()} // evita que la tecla cierre el menu
                sx={{ mb: 2 }}
              />

              {/* Input Asignatura */}
              <TextField
                fullWidth
                label="Asignatura"
                size="small"
                value={filters.asignatura} // usar el nombre correcto del estado
                onChange={(e) =>
                  setFilters({ ...filters, asignatura: e.target.value })
                }
                onKeyDown={(e) => e.stopPropagation()} // evita que la tecla cierre el menu
                sx={{ mb: 2 }}
              />

              <Button fullWidth variant="contained" onClick={handleClose}>
                Aplicar
              </Button>
            </Menu>
          </Box>
        </Box>

        {/* Tabla */}
        <TableContainer sx={{ flexGrow: 1, width: "auto" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    sx={{ background: "#e5ecff", fontSize: "1.15rem" }}
                  >
                    {headCell.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody sx={{ fontSize: "0.95rem" }}>
              {filteredData.length > 0 ? (
                filteredData.map((materia) => (
                  <TableRow
                    key={materia.clave}
                    hover
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>{materia.clave}</TableCell>
                    <TableCell>{materia.asignatura}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={headCells.length}
                    align="center"
                    sx={{ fontSize: "0.95rem" }}
                  >
                    No se encontraron resultados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

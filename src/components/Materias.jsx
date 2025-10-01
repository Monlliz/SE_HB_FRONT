import { useState, useEffect } from "react";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useNavigate } from "react-router-dom";
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

const headCells = [
  { id: "clave", label: "clave" },
  { id: "asignatura", label: "asignatura" },
  { id: "semestre", label: "semestre" },
  { id: "year", label: "año" },
];

export default function Materias() {
  const navigate = useNavigate();

  // Llamada a la API
  const [materiasData, setMateriasData] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${apiUrl}/materias`)
      .then((response) => response.json())
      .then((data) => setMateriasData(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, [apiUrl]);

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
     
      (search === "" ||  materia.asignatura.toLowerCase().includes(search.toLowerCase())) &&
      (filters.asignatura === "" ||
        materia.asignatura.toString().includes(filters.asignatura))
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
            Materias
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
              <TextField
                fullWidth
                label="Grupo"
                size="small"
                value={filters.Grupo}
                onChange={(e) =>
                  setFilters({ ...filters, clave: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Asignatura"
                size="small"
                value={filters.asignatura}
                onChange={(e) =>
                  setFilters({ ...filters, asignatura: e.target.value })
                }
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
                    <TableCell>{materia.semestre}</TableCell>
                    <TableCell>{materia.yearm}</TableCell>
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

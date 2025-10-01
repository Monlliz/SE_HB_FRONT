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
  { id: "idgrupo", label: "Grupo" },
  { id: "semestre", label: "Semestre" },
];

export default function Grupos() {
  const navigate = useNavigate();

  // Llamada a la API
  const [gruposData, setGruposData] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${apiUrl}/grupos`)
      .then((response) => response.json())
      .then((data) => setGruposData(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, [apiUrl]);

  // estados para búsqueda y filtros
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    idgrupo: "",
    semestre: "",
  });

  const open = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // Filtrado de datos
  const filteredData = gruposData.filter((grupo) => {
    return (
      (search === "" ||
        grupo.idgrupo.toString().includes(search) ||
        grupo.semestre.toString().includes(search)) &&
      (filters.idgrupo === "" ||
        grupo.idgrupo.toString().includes(filters.idgrupo)) &&
      (filters.semestre === "" ||
        grupo.semestre.toString().includes(filters.semestre))
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
            Grupos
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
                value={filters.idgrupo}
                onChange={(e) =>
                  setFilters({ ...filters, idgrupo: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Semestre"
                size="small"
                value={filters.semestre}
                onChange={(e) =>
                  setFilters({ ...filters, semestre: e.target.value })
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
                filteredData.map((grupo) => (
                  <TableRow
                    key={grupo.idgrupo}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate(`/grupos/${grupo.idgrupo}`)}
                  >
                    <TableCell>{grupo.idgrupo}</TableCell>
                    <TableCell>{grupo.semestre}</TableCell>
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

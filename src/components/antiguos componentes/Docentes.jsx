import { use, useState, useEffect } from "react";

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
  { id: "apellidoP", label: "Apellido Paterno" },
  { id: "apellidoM", label: "Apellido Materno" },
  { id: "nombres", label: "Nombres" },
  { id: "birthday", label: "Fecha Nac." },
  { id: "correo", label: "Correo" },
];



export default function Docentes() {
 const navigate = useNavigate();
  
//Llamada a la API
  const [docentesData, setdocentesData] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;

  //La obtención de datos se hará en un useEffect
  useEffect(() => {
    fetch(`${apiUrl}/docente`)
      .then((response) => response.json())
      .then((docentesData) => setdocentesData(docentesData))
      .catch((error) => console.error("Error fetching data:", error));
  }, [apiUrl]);

  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  // estados para filtros
  const [filters, setFilters] = useState({
    apellidoP: "",
    apellidoM: "",
    correo: "",
    grupo: "",
    materia: "",
  });

  // abrir/cerrar menú de filtros
  const open = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // aplicar filtros
 const filteredData = docentesData.filter((docente) => {
  const fullName = `${docente.apellidop ?? ""} ${docente.apellidom ?? ""} ${docente.nombres ?? ""}`.toLowerCase();
 
  return (
    fullName.includes(search?.toLowerCase() ?? "") &&
    (docente.apellidop?.toLowerCase() ?? "").includes(filters.apellidoP?.toLowerCase() ?? "") &&
    (docente.apellidom?.toLowerCase() ?? "").includes(filters.apellidoM?.toLowerCase() ?? "") &&
    (docente.correo?.toLowerCase() ?? "").includes(filters.correo?.toLowerCase() ?? "") &&
    (docente.grupo?.toLowerCase() ?? "").includes(filters.grupo?.toLowerCase() ?? "") &&
    (docente.materia?.toLowerCase() ?? "").includes(filters.materia?.toLowerCase() ?? "")
  );
});


  return (
    // Contenedor principal
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
        {/* Encabezado con título, búsqueda e icono de filtros */}
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
            Docentes
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
                label="Apellido P"
                size="small"
                value={filters.apellidop}
                onChange={(e) =>
                  setFilters({ ...filters, apellidop: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Apellido M"
                size="small"
                value={filters.apellidom}
                onChange={(e) =>
                  setFilters({ ...filters, apellidom: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Correo"
                size="small"
                value={filters.correo}
                onChange={(e) =>
                  setFilters({ ...filters, correo: e.target.value })
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
                    sx={{ background: "#e5ecffff", fontSize: "1.15rem" }}
                  >
                    {headCell.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody sx={{ fontSize: "0.95rem" }}>
              {filteredData.length > 0 ? (
                filteredData.map((docente) => (
                  <TableRow key={docente.iddocente}
                  onClick={() => navigate(`/docente/${docente.iddocente}`)}
                  sx={{ cursor: 'pointer' }} hover
                  >
                    <TableCell>{docente.apellidop}</TableCell>
                    <TableCell>{docente.apellidom}</TableCell>
                    <TableCell>{docente.nombres}</TableCell>
                    <TableCell>{docente.birthday}</TableCell>
                    <TableCell>{docente.correo}</TableCell>
                    {/* <TableCell>{docente.grupo}</TableCell>
                    <TableCell>{docente.materia}</TableCell>*/}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
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

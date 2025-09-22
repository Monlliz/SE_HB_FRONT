import { useState } from "react";
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

// 🔹 JSON estático con docentes
const docentesData = [
  {
    id: 1,
    apellidoP: "García",
    apellidoM: "López",
    nombres: "María",
    birthday: "1980-01-20",
    correo: "maria.garcia@escuela.com",
    grupo: "A",
    materia: "Matemáticas",
  },
  {
    id: 2,
    apellidoP: "Hernández",
    apellidoM: "Martínez",
    nombres: "José",
    birthday: "1975-05-12",
    correo: "jose.hm@escuela.com",
    grupo: "B",
    materia: "Historia",
  },
  {
    id: 3,
    apellidoP: "Ramírez",
    apellidoM: "Díaz",
    nombres: "Lucía",
    birthday: "1990-08-05",
    correo: "lucia.rdz@escuela.com",
    grupo: "A",
    materia: "Física",
  },
  {
    id: 2,
    apellidoP: "Hernández",
    apellidoM: "Martínez",
    nombres: "José",
    birthday: "1975-05-12",
    correo: "jose.hm@escuela.com",
    grupo: "B",
    materia: "Historia",
  },
  {
    id: 3,
    apellidoP: "Ramírez",
    apellidoM: "Díaz",
    nombres: "Lucía",
    birthday: "1990-08-05",
    correo: "lucia.rdz@escuela.com",
    grupo: "A",
    materia: "Física",
  },
  {
    id: 2,
    apellidoP: "Hernández",
    apellidoM: "Martínez",
    nombres: "José",
    birthday: "1975-05-12",
    correo: "jose.hm@escuela.com",
    grupo: "B",
    materia: "Historia",
  },
  {
    id: 3,
    apellidoP: "Ramírez",
    apellidoM: "Díaz",
    nombres: "Lucía",
    birthday: "1990-08-05",
    correo: "lucia.rdz@escuela.com",
    grupo: "A",
    materia: "Física",
  },
  {
    id: 2,
    apellidoP: "Hernández",
    apellidoM: "Martínez",
    nombres: "José",
    birthday: "1975-05-12",
    correo: "jose.hm@escuela.com",
    grupo: "B",
    materia: "Historia",
  },
  {
    id: 3,
    apellidoP: "Ramírez",
    apellidoM: "Díaz",
    nombres: "Lucía",
    birthday: "1990-08-05",
    correo: "lucia.rdz@escuela.com",
    grupo: "A",
    materia: "Física",
  },
  {
    id: 2,
    apellidoP: "Hernández",
    apellidoM: "Martínez",
    nombres: "José",
    birthday: "1975-05-12",
    correo: "jose.hm@escuela.com",
    grupo: "B",
    materia: "Historia",
  },
  {
    id: 3,
    apellidoP: "Ramírez",
    apellidoM: "Díaz",
    nombres: "Lucía",
    birthday: "1990-08-05",
    correo: "lucia.rdz@escuela.com",
    grupo: "A",
    materia: "Física",
  },
  {
    id: 2,
    apellidoP: "Hernández",
    apellidoM: "Martínez",
    nombres: "José",
    birthday: "1975-05-12",
    correo: "jose.hm@escuela.com",
    grupo: "B",
    materia: "Historia",
  },
  {
    id: 3,
    apellidoP: "Ramírez",
    apellidoM: "Díaz",
    nombres: "Lucía",
    birthday: "1990-08-05",
    correo: "lucia.rdz@escuela.com",
    grupo: "A",
    materia: "Física",
  },
  {
    id: 2,
    apellidoP: "Hernández",
    apellidoM: "Martínez",
    nombres: "José",
    birthday: "1975-05-12",
    correo: "jose.hm@escuela.com",
    grupo: "B",
    materia: "Historia",
  },
  {
    id: 3,
    apellidoP: "Ramírez",
    apellidoM: "Díaz",
    nombres: "Lucía",
    birthday: "1990-08-05",
    correo: "lucia.rdz@escuela.com",
    grupo: "A",
    materia: "Física",
  },
  {
    id: 2,
    apellidoP: "Hernández",
    apellidoM: "Martínez",
    nombres: "José",
    birthday: "1975-05-12",
    correo: "jose.hm@escuela.com",
    grupo: "B",
    materia: "Historia",
  },
  {
    id: 3,
    apellidoP: "Raddmírez",
    apellidoM: "Díaz",
    nombres: "Lucía",
    birthday: "1990-08-05",
    correo: "lucia.rdz@escuela.com",
    grupo: "A",
    materia: "Fí78ica123",
  },
];

const headCells = [
  { id: "apellidoP", label: "Apellido Paterno" },
  { id: "apellidoM", label: "Apellido Materno" },
  { id: "nombres", label: "Nombres" },
  { id: "birthday", label: "Fecha Nac." },
  { id: "correo", label: "Correo" },
  { id: "grupo", label: "Grupo" },
  { id: "materia", label: "Materia" },
];

//FIN DATOS ESTATICOS

export default function Docentes() {
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
    const fullName = `${docente.apellidoP} ${docente.apellidoM} ${docente.nombres}`.toLowerCase();
    return (
      fullName.includes(search.toLowerCase()) &&
      docente.apellidoP.toLowerCase().includes(filters.apellidoP.toLowerCase()) &&
      docente.apellidoM.toLowerCase().includes(filters.apellidoM.toLowerCase()) &&
      docente.correo.toLowerCase().includes(filters.correo.toLowerCase()) &&
      docente.grupo.toLowerCase().includes(filters.grupo.toLowerCase()) &&
      docente.materia.toLowerCase().includes(filters.materia.toLowerCase())
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
          <Typography variant="h2" 
          sx={{
          color: "primary.main", 
          fontSize: "2.5rem",
          }}>Docentes</Typography>

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
                value={filters.apellidoP}
                onChange={(e) =>
                  setFilters({ ...filters, apellidoP: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Apellido M"
                size="small"
                value={filters.apellidoM}
                onChange={(e) =>
                  setFilters({ ...filters, apellidoM: e.target.value })
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
              <TextField
                fullWidth
                label="Grupo"
                size="small"
                value={filters.grupo}
                onChange={(e) =>
                  setFilters({ ...filters, grupo: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Materia"
                size="small"
                value={filters.materia}
                onChange={(e) =>
                  setFilters({ ...filters, materia: e.target.value })
                }
                sx={{ mb: 2 }}
              />

              <Button
                fullWidth
                variant="contained"
                onClick={handleClose}
              >
                Aplicar
              </Button>
            </Menu>
          </Box>
        </Box>

        {/* Tabla */}
        <TableContainer sx={{ flexGrow: 1, width: 'auto' }}>
          <Table stickyHeader>
            <TableHead  >
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell key={headCell.id} 
                  sx={{background:"#e5ecffff", fontSize:"1.15rem"}} >
                    {headCell.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody sx={{fontSize:"0.95rem"}} >
              {filteredData.length > 0 ? (
                filteredData.map((docente) => (
                  <TableRow key={docente.id}>
                    <TableCell >{docente.apellidoP}</TableCell>
                    <TableCell>{docente.apellidoM}</TableCell>
                    <TableCell>{docente.nombres}</TableCell>
                    <TableCell>{docente.birthday}</TableCell>
                    <TableCell>{docente.correo}</TableCell>
                    <TableCell>{docente.grupo}</TableCell>
                    <TableCell>{docente.materia}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{fontSize:"0.95rem"}}>
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

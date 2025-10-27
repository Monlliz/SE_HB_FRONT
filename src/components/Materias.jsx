/**
 * @file Materias.jsx
 * @description Componente para visualizar, buscar y filtrar una lista de materias.
 */

// Importaciones de React y hooks necesarios.
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Importaciones de componentes y iconos de Material-UI.
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

// Importaciones de contexto y servicios.
import { useAuth } from "../context/AuthContext.jsx";
import { fetchMateriasGet } from "./services/materiasService.js";

/**
 * Define la estructura y las etiquetas de las columnas de la tabla.
 * @type {Array<Object>}
 */
const headCells = [
  { id: "clave", label: "Clave" }, // Cambiado 'clave' por 'Clave' para mejor visualización
  { id: "asignatura", label: "Asignatura" },
  { id: "semestre", label: "Semestre" },
  { id: "year", label: "Año" },
];

/**
 * Componente principal que renderiza la página de materias.
 * @returns {JSX.Element} El componente de la tabla de materias.
 */
export default function Materias() {
  // Hook para la navegación programática (actualmente no se usa, pero está disponible).
  const navigate = useNavigate();

  // --- ESTADOS DEL COMPONENTE ---

  /** @state {Array} materiasData - Almacena la lista completa de materias traídas de la API. */
  const [materiasData, setMateriasData] = useState([]);

  /** @state {string} search - Almacena el valor del campo de búsqueda principal. */
  const [search, setSearch] = useState("");

  /** @state {HTMLElement|null} anchorEl - Referencia al elemento que ancla el menú de filtros. */
  const [anchorEl, setAnchorEl] = useState(null);

  /** @state {Object} filters - Almacena los valores de los campos de filtro del menú. */
  const [filters, setFilters] = useState({
    clave: "",
    asignatura: "",
  });

  // --- CONTEXTO Y EFECTOS SECUNDARIOS ---

  /** Obtiene el token de autenticación del contexto. */
  const { token } = useAuth();

  /**
   * @effect
   * Se ejecuta cuando el componente se monta o cuando el 'token' cambia.
   * Carga las materias desde la API de forma asíncrona.
   */
  useEffect(() => {
    const cargarMaterias = async () => {
      try {
        if (!token) {
          throw new Error("Autorización rechazada. No se encontró el token.");
        }
        // Llama al servicio para obtener los datos.
        const { materias } = await fetchMateriasGet(token);
        setMateriasData(materias);
      } catch (error) {
        console.error("Error al cargar las materias:", error);
      }
    };

    cargarMaterias();
  }, [token]); // El efecto depende del token. Se vuelve a ejecutar si el token cambia.
  // Nota: fetchMateriasGet fue removido del array de dependencias para evitar re-renderizados innecesarios.
  // Si la función se define fuera del componente, es seguro omitirla. Si no, se debería envolver en useCallback.

  // --- MANEJADORES DE EVENTOS ---

  /** Determina si el menú de filtros está abierto. */
  const open = Boolean(anchorEl);

  /**
   * Abre el menú de filtros, anclándolo al botón de filtro.
   * @param {React.MouseEvent<HTMLElement>} event - El evento de clic.
   */
  const handleClick = (event) => setAnchorEl(event.currentTarget);

  /** Cierra el menú de filtros. */
  const handleClose = () => setAnchorEl(null);

  // --- LÓGICA DE FILTRADO ---

  /**
   * Filtra la lista de materias basándose en el estado de 'search' y 'filters'.
   * @type {Array}
   */
  const filteredData = materiasData.filter((materia) => {
    // Convierte todos los valores a minúsculas para una comparación insensible a mayúsculas.
    const searchLower = search.toLowerCase();
    const asignaturaLower = materia.asignatura.toLowerCase();
    const claveLower = materia.clave.toLowerCase();
    
    // Condición para el campo de búsqueda principal (busca en asignatura).
    const matchesSearch = search === "" || asignaturaLower.includes(searchLower);

    // Condición para el filtro de asignatura del menú.
    const matchesFilterAsignatura =
      filters.asignatura === "" ||
      asignaturaLower.includes(filters.asignatura.toLowerCase());

    // Condición para el filtro de clave del menú.
    const matchesFilterClave =
      filters.clave === "" ||
      claveLower.includes(filters.clave.toLowerCase());
      
    // Devuelve true solo si todas las condiciones se cumplen.
    return matchesSearch && matchesFilterAsignatura && matchesFilterClave;
  });

  // --- RENDERIZADO DEL COMPONENTE ---

  return (
    <Box
      sx={{
        height: "89vh",
        width: "96.6vw",
        p: 0,
        overflow: "hidden",
      }}
    >
      <Paper sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Encabezado: Título, Búsqueda y Botón de Filtro */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            borderBottom: "1px solid #ddd",
          }}
        >
          <Typography variant="h2" sx={{ color: "primary.main", fontSize: "2.5rem" }}>
            Materias
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Campo de Búsqueda Principal */}
            <TextField
              size="small"
              placeholder="Buscar por asignatura..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* Menú de Filtros */}
            <IconButton onClick={handleClick}>
              <FilterListIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{ sx: { p: 2, width: 280, gap: 1.5, display: 'flex', flexDirection: 'column' } }}
            >
              <Typography variant="subtitle1">Filtros</Typography>
              {/* Filtro por Clave */}
              <TextField
                fullWidth
                label="Clave"
                size="small"
                value={filters.clave}
                onChange={(e) => setFilters({ ...filters, clave: e.target.value })}
              />
              {/* Filtro por Asignatura */}
              <TextField
                fullWidth
                label="Asignatura"
                size="small"
                value={filters.asignatura}
                onChange={(e) =>
                  setFilters({ ...filters, asignatura: e.target.value })
                }
              />
              <Button fullWidth variant="contained" onClick={handleClose}>
                Cerrar
              </Button>
            </Menu>
          </Box>
        </Box>

        {/* Contenedor de la Tabla */}
        <TableContainer sx={{ flexGrow: 1, width: "auto" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    sx={{ background: "#e5ecff", fontSize: "1.15rem", fontWeight: "bold" }}
                  >
                    {headCell.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length > 0 ? (
                // Mapea los datos filtrados para crear las filas de la tabla.
                filteredData.map((materia) => (
                  <TableRow key={materia.clave} hover sx={{ cursor: "pointer" }}>
                    <TableCell>{materia.clave}</TableCell>
                    <TableCell>{materia.asignatura}</TableCell>
                    <TableCell>{materia.semestre}</TableCell>
                    <TableCell>{materia.year}</TableCell> {/* Corregido: 'yearm' a 'year' */}
                  </TableRow>
                ))
              ) : (
                // Muestra un mensaje si no hay resultados.
                <TableRow>
                  <TableCell colSpan={headCells.length} align="center">
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
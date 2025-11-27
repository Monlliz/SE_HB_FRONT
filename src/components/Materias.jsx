/**
 * @file Materias.jsx
 * @description Tabla minimalista con funcionalidad de selección y hover.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
} from "@mui/material";

import { useAuth } from "../context/AuthContext.jsx";
import { fetchMateriasGet } from "./services/materiasService.js";

const headCells = [
  { id: "clave", label: "Clave", width: "15%" },
  { id: "asignatura", label: "Nombre", width: "45%" },
  { id: "semestre", label: "Semestre", width: "10%" },
  { id: "perfil", label: "Perfil", width: "10%" },
  { id: "year", label: "Año", width: "10%" },
];

export default function Materias() {
  const navigate = useNavigate();
  const [materiasData, setMateriasData] = useState([]);
  const [search, setSearch] = useState("");
  
  // 1. ESTADO NUEVO: Para guardar el ID (clave) de la fila seleccionada
  const [selectedClave, setSelectedClave] = useState(null);

  const { token } = useAuth();

  useEffect(() => {
    const cargarMaterias = async () => {
      try {
        if (!token) throw new Error("No token found");
        const { materias } = await fetchMateriasGet(token);
        setMateriasData(materias);
      } catch (error) {
        console.error("Error al cargar las materias:", error);
      }
    };
    cargarMaterias();
  }, [token]);

  const filteredData = materiasData.filter((materia) => {
    const searchLower = search.toLowerCase();
    const asignaturaLower = materia.asignatura.toLowerCase();
    return search === "" || asignaturaLower.includes(searchLower);
  });

  // Función para manejar el clic en la fila
const handleRowClick = (clave) => {
    if (selectedClave === clave) {
      setSelectedClave(null); // Si ya estaba seleccionada, la ponemos en null (desmarcar)
    } else {
      setSelectedClave(clave); // Si era diferente, la seleccionamos
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#fff",
        p: 4,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "secondary.contrastText" }}>
          Materias
        </Typography>

        <TextField
          placeholder="Buscar por asignatura..."
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            width: "25%",
            "& .MuiOutlinedInput-root": {
              borderRadius: "2rem",
              backgroundColor: "#f9f9f9",
              "& fieldset": { borderColor: "#eee" },
              "&:hover fieldset": { borderColor: "#ddd" },
            },
          }}
        />
      </Box>

      <TableContainer>
        <Table
          sx={{ minWidth: 650, borderCollapse: "collapse" }}
        >
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  sx={{
                    //fontWeight: "bold",
                    //color: "#000",
                    borderBottom: "1px solid #e0e0e0",
                    paddingY: 2,
                    paddingLeft: 0, 
                    width: headCell.width,
                  }}
                  align="left"
                >
                  {headCell.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((materia) => {
                // Verificamos si esta fila es la seleccionada
                const isSelected = selectedClave === materia.clave;

                return (
                  <TableRow
                    key={materia.clave}
                    onClick={() => handleRowClick(materia.clave)}
                    sx={{
                      cursor: "pointer", // El cursor de manita
                      // Lógica del color de fondo:
                      // Si está seleccionada usa gris (#f5f5f5), si no, blanco (inherit)
                      backgroundColor: isSelected ? "#DBDDE1" : "inherit",
                      transition: "background-color 0.2s", // Suaviza el cambio de color
                      "&:hover": {
                        backgroundColor: "#DBDDE1", // El mismo gris al pasar el mouse
                      },
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{
                        borderBottom: "1px solid #e0e0e0",
                        //paddingY: 3.5, // Mantenemos el estilo espacioso
                        paddingLeft: 0,
                        fontSize: "0.9rem",
                        fontWeight: 500,
                        color: "secondary.contrastText",
                      }}
                    >
                      {materia.clave}
                    </TableCell>

                    <TableCell
                      sx={{
                        borderBottom: "1px solid #e0e0e0",
                        //paddingY: 3.5,
                        fontSize: "0.9rem",
                        color: "secondary.contrastText",
                        textTransform: "uppercase",
                      }}
                    >
                      {materia.asignatura}
                    </TableCell>

                    <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                      {materia.semestre}
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                      {materia.perfil_id}
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                      {materia.yearm}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={headCells.length} align="center">
                  <Typography variant="body1" sx={{ py: 5, color: "#999" }}>
                    No se encontraron resultados
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
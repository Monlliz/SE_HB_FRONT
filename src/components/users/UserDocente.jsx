import { useState, useEffect, useCallback } from "react";
//los modales
import NuevaMateriaDocente from "../modals/NuevaMateriaDocente.jsx";
import EditDocente from "../modals/EditDocente.jsx";
import {
  Box,
  Button,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
//Funcion principal
export default function UserDocente({ id }) {
  //Todos los estados necesarios
  const [docente, setDocente] = useState(null);
  const [materias, setMaterias] = useState([]);
  const [selectedMateriaClave, setSelectedMateriaClave] = useState(null);
  const [modalMateriaOpen, setModalMateriaOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);


  //URL de la API
  const apiUrl = import.meta.env.VITE_API_URL;

  //la Api pa' materias
  const fetchMaterias = useCallback(async () => {
    if (!id) return;
    try {
      const resMaterias = await fetch(`${apiUrl}/docente/materias/${id}`);
      if (!resMaterias.ok) throw new Error("Error al cargar materias");
      const dataMaterias = await resMaterias.json();
      setMaterias(dataMaterias?.materias || []);
    } catch (err) {
      console.error(err);
      setMaterias([]); // En caso de error, asegurar que materias es un array vacío
    }
  }, [id]);

  // la Api pa' docentes
  const fetchDocente = useCallback(async () => {
    if (!id) return;

    const fetchInitialData = async () => {
      try {
        const resDocente = await fetch(`${apiUrl}/docente/${id}`);
        if (!resDocente.ok) throw new Error("Error al cargar docente");
        const dataDocente = await resDocente.json();
        setDocente(dataDocente);

        // Llamamos a la función que obtiene las materias
        fetchMaterias();
      } catch (err) {
        console.error(err);
      }
    };

    fetchInitialData();
  }, [id, apiUrl, fetchMaterias]);

  //El renderizado inicial
  useEffect(() => {
    fetchDocente();
    fetchMaterias();
  }, [fetchDocente, fetchMaterias]);

  //Función para manejar el "Aceptar" del modal
  const handleAcceptMateria = () => {
    setModalMateriaOpen(false); // Cierra el modal
    fetchMaterias(); // Vuelve a cargar las materias para que aparezca la nueva
  };
  const handleAcceptEdit = () => {
    setModalEditOpen(false); // Cierra el modal
    fetchDocente();
  };


  if (!docente) {
    return <Typography>Cargando docente...</Typography>;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
      }}
    >
      {/* Caja de arriba: Datos del docente */}
      <Box
        sx={{
          display: "flex",
          height: "40%",
          width: "100%",
          backgroundColor: "#fff",
          borderRadius: 3,
          boxShadow: 3,
          p: 3,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            backgroundColor: "#1976d2",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            fontWeight: "bold",
          }}
        >
          {`${docente.nombres[0]}${docente.apellidop[0]}`}
        </Box>

        <Box sx={{ ml: 3, flexGrow: 1 }}>
          <Typography variant="h5" fontWeight="bold">
            {docente.nombres} {docente.apellidop} {docente.apellidom}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Correo: {docente.correo}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Fecha de nacimiento: {docente.birthday}
          </Typography>
          <Typography
            sx={{
              mt: 1,
              fontWeight: "bold",
              color: docente.activo ? "green" : "red",
            }}
          >
            {docente.activo ? "Activo" : "Inactivo"}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => setModalEditOpen(true)}
          >
            Editar
          </Button>
          <EditDocente
            open={modalEditOpen}
            onClose={() => setModalEditOpen(false)}
            onAccept={handleAcceptEdit}
            docenteId={id}
          />
          <Button variant="outlined" color="error" size="small">
            Desactivar
          </Button>
        </Box>
      </Box>

      {/* Caja de abajo Materias */}
      <Box
        sx={{
          display: "flex",
          height: "60%",
          width: "100%",
          flexDirection: "column",
        }}
      >
        {/*Caja de arriba Materias*/}

        <Box
          sx={{
            display: "flex",
            height: "40%",
            width: "100%",

            borderRadius: 2,
            p: 2,
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 2,
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            Materias
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setModalMateriaOpen(true)}
          >
            Agregar
          </Button>

          <NuevaMateriaDocente
            open={modalMateriaOpen}
            onClose={() => setModalMateriaOpen(false)}
            onAccept={handleAcceptMateria}
            docenteId={id}
          />

          <Button
            variant="outlined"
            color="error"
            disabled={!selectedMateriaClave}
            onClick={() =>
              console.log("Eliminar materia", selectedMateriaClave)
            }
          >
            Eliminar
          </Button>
        </Box>
        <Box
          sx={{
            display: "flex",
            height: "60%",
            width: "100%",

            flexDirection: "column",
            mt: 1,
            borderRadius: 2,
            p: 2,
            overflowY: "auto",
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Clave</TableCell>
                <TableCell>Nombre</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materias.map((m) => (
                <TableRow
                  key={m.clave}
                  hover
                  selected={m.clave === selectedMateriaClave}
                  onClick={() => setSelectedMateriaClave(m.clave)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>{m.clave}</TableCell>
                  <TableCell>{m.nombre}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
}

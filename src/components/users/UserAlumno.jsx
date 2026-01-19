import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
//los modales
import EditAlumno from "../modals/Alumno/EditAlumno.jsx";
import DarBajaAlumno from "../modals/Alumno/DarBajaAlumno.jsx";
import NuevoIncidente from "../modals/Alumno/NuevoIncidente.jsx";
//import servicio

import { fetchAlumnoGetOne } from "../../services/alumnosService.js";
import { fetchIncidenteGet } from "../../services/incidenteService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  Box,
  Button,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Toolbar,
  TableContainer,
  Checkbox,
} from "@mui/material";
//Funcion principal
export default function UserDocente({ matricula }) {
  //Todos los estados necesarios
  // Estado para guardar los datos que vendrían de la API
  const [alumno, setAlumno] = useState(null);
  const [selectedMateriaClave, setSelectedMateriaClave] = useState(null);
  const [modalIncidenteOpen, setModalIncidenteOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [modalDesactivarOpen, setModalDesactivarOpen] = useState(false);
  const [modalBorrarMateriaOpen, setModalBorrarMateriaOpen] = useState(false);
  const [incidente, setIncidentes] = useState([]);

  //Para la navegacion a Reportes
   const navigate = useNavigate();
  const fetchIncidente = async () => {
    const { incidentes } = await fetchIncidenteGet(token, matricula);
    setIncidentes(incidentes);
  };
  // Estado para guardar los IDs de las filas seleccionadas
  const [selected, setSelected] = useState([]);

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      // Si no está seleccionado, se agrega
      newSelected = newSelected.concat(selected, id);
    } else {
      // Si ya está seleccionado, se quita
      newSelected = selected.filter((selectedId) => selectedId !== id);
    }
    setSelected(newSelected);
    setSelectedMateriaClave(newSelected.length >= 5);
  };

  const handleNavigateToReporte = ()=>{
     const incidentesSeleccionados = incidente.filter(item => selected.includes(item.id));

  const datosParaEnviar = {
      R_MATRICULA: matricula,
      R_NOMBRE : alumno.nombres,
      R_APELLIDOP: alumno.apellidop,
      R_APELLIDM:alumno.apellidom,
      R_INCIDENTES:incidentesSeleccionados 
    };
    console.log(datosParaEnviar);
        navigate("/reporte", { state: datosParaEnviar });
  }

  const isSelected = (id) => selected.indexOf(id) !== -1;

  //URL de la API
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token } = useAuth();

  // la Api pa' docentes
  const fetchAlumno = useCallback(async () => {
    if (!matricula) return;

    const fetchInitialData = async () => {
      try {
        if (!token) {
          throw new Error("Autorización rechazada. No se encontró el token.");
        }
        //LLamamos al servicio
        const { alumno } = await fetchAlumnoGetOne(token, matricula);
        setAlumno(alumno);
      } catch (err) {
        console.error(err);
      }
    };
    fetchIncidente();
    fetchInitialData();
  }, [matricula, apiUrl]);

  //El renderizado inicial
  useEffect(() => {
    fetchAlumno();
  }, [fetchAlumno]);

  //Funciones aceptar modales

  //Función para manejar el "Aceptar" del modal de agregar materia y borrar materia

  //La uso tambien para desactivar alumno.
  const handleAcceptEdit = () => {
    setModalEditOpen(false); // Cierra el modal
    setModalIncidenteOpen(false);
    fetchAlumno();
  };

  if (!alumno) {
    return <Typography>Cargando alumno...</Typography>;
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
      {/* Caja de arriba: Datos del alumno */}
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
          {`${alumno.nombres[0]}${alumno.apellidop[0]}`}
        </Box>

        <Box sx={{ ml: 3, flexGrow: 1 }}>
          <Typography variant="h5" fontWeight="bold">
            {alumno.nombres} {alumno.apellidop} {alumno.apellidom}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Matricula: {alumno.matricula}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Correo: {alumno.correo}
          </Typography>
          <Typography variant="body2" color="text.secondary">
           {alumno.grupo}  {alumno.perfil}  {alumno.ingles}
          </Typography>
          <Typography
            sx={{
              mt: 1,
              fontWeight: "bold",
              color: alumno.activo ? "green" : "red",
            }}
          >
            {alumno.activo ? "Activo" : "Inactivo"}
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
          <EditAlumno
            open={modalEditOpen}
            onClose={() => setModalEditOpen(false)}
            onAccept={handleAcceptEdit}
            matricula={matricula}
          />
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => setModalDesactivarOpen(true)}
          >
            Dar de Baja
          </Button>
          <DarBajaAlumno
            open={modalDesactivarOpen}
            onClose={() => setModalDesactivarOpen(false)}
            onAccept={handleAcceptEdit}
            matricula={matricula}
            nombres={alumno.nombres}
            apellidop={alumno.apellidop}
          />
        </Box>
      </Box>

      {/* Caja de abajo */}
      <Box
        sx={{
          display: "flex",
          height: "60%",
          width: "100%",
          flexDirection: "column",
        }}
      >
        {/*CRUD DE ABAJO */}

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
            Incidencias
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setModalIncidenteOpen(true)}
          >
            Agregar
          </Button>
          <NuevoIncidente
            open={modalIncidenteOpen}
            onClose={() => setModalIncidenteOpen(false)}
            onAccept={handleAcceptEdit}
            matricula={matricula}
          />
          <Button
            variant="outlined"
            color="error"
            disabled={!selectedMateriaClave}
            onClick={handleNavigateToReporte}
          >
            Generar reporte
          </Button>
        </Box>
        {/*TABLA DE ABAJo */}
        <Box
          sx={{
            display: "flex",
            // height: "60%", // Considera si esta altura es fija o puede ser más flexible
            width: "100%",
            justifyContent: "center",
            borderRadius: 2,
            p: 2,
            alignItems: "center",

            gap: 2,
          }}
        >
          {incidente.length === 0 ? (
            <Paper sx={{ width: "100%", padding: 4, textAlign: "center" }}>
              <Typography variant="h6" color="text.secondary">
                No hay incidencias para mostrar.
              </Typography>
            </Paper>
          ) : (
            // Para que el layout funcione bien, hacemos que el Paper use flexbox en columna
            <Paper
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                height: "40vh",
              }}
            >
              <Toolbar>
                {selected.length > 0 ? (
                  <Typography
                    sx={{ flex: "1 1 100%" }}
                    color="primary"
                    variant="h6"
                  >
                    {selected.length} incidente(s) seleccionado(s)
                  </Typography>
                ) : (
                  <Typography sx={{ flex: "1 1 100%" }} variant="h6">
                    Reporte de Incidencias
                  </Typography>
                )}
              </Toolbar>


              <TableContainer sx={{ overflow: "auto" }}>
  
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox" />
                      <TableCell>Solicitante</TableCell>
                      <TableCell>Motivo</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell align="center">Strike</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {incidente.map((incidente) => {
                      const isItemSelected = isSelected(incidente.id);
                      return (
                        <TableRow
                          key={incidente.id}
                          hover
                          onClick={(event) => handleClick(event, incidente.id)}
                          role="checkbox"
                          aria-checked={isItemSelected}
                          selected={isItemSelected}
                          sx={{ cursor: "pointer" }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              color="primary"
                              checked={isItemSelected}
                            />
                          </TableCell>
                          <TableCell>{incidente.solicitante}</TableCell>
                          <TableCell>{incidente.motivo_incidencia}</TableCell>
                          <TableCell>
                            {new Date(incidente.fecha).toLocaleDateString(
                              "es-MX",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {incidente.numero_strike}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
}

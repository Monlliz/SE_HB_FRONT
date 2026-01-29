import { useState, useEffect, useCallback, useMemo } from "react";
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
export default function userAlumno({ matricula }) {
  //Todos los estados necesarios

  // Estado para guardar los datos que vendrían de la API
  const [alumno, setAlumno] = useState(null);
  const [selectedMateriaClave, setSelectedMateriaClave] = useState(false);
  const [modalIncidenteOpen, setModalIncidenteOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [modalDesactivarOpen, setModalDesactivarOpen] = useState(false);
  const [altaBaja, setAltaBaja] = useState(false);

  const [incidente, setIncidentes] = useState([]);

  //Para la navegacion a Reportes
  const navigate = useNavigate();
  
  //URL de la API y Auth
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token } = useAuth();

  const fetchIncidente = async () => {
    // Nota: Asegúrate de que tu backend devuelva los incidentes ordenados cronológicamente
    const { incidentes } = await fetchIncidenteGet(token, matricula);
    setIncidentes(incidentes);
  };
  
  // Estado para guardar los IDs de las filas seleccionadas
  const [selected, setSelected] = useState([]);

  // --- LOGICA NUEVA PARA FILAS VIRTUALES ---

  // 1. Calculamos las filas a mostrar
  const processedRows = useMemo(() => {
    let rows = [];
    incidente.forEach((item, index) => {
      // Agregamos el incidente real
      rows.push({ ...item, isVirtual: false });

      // Si es múltiplo de 5, agregamos la fila virtual
      if ((index + 1) % 5 === 0) {
        const grupoIds = incidente.slice(index - 4, index + 1).map((i) => i.id);
        const numReporte = (index + 1) / 5; // Calculamos el número para mostrarlo visualmente también
        
        rows.push({
          id: `virtual-group-${index}`,
          isVirtual: true,
          groupIds: grupoIds,
          solicitante: "SISTEMA",
          // Mostramos visualmente qué reporte es
          motivo_incidencia: `>> REPORTE ACUMULADO #${numReporte} (Incidentes ${index - 3} al ${index + 1})`,
          fecha: item.fecha, 
          numero_strike: "N/A",
        });
      }
    });
    return rows;
  }, [incidente]);

  // 2. Manejador de Clics
  const handleClick = (event, row) => {
    let newSelected = [...selected];

    if (row.isVirtual) {
        const allSelected = row.groupIds.every(id => selected.includes(id));
        
        if (allSelected) {
            newSelected = newSelected.filter(id => !row.groupIds.includes(id));
        } else {
            const idsToAdd = row.groupIds.filter(id => !selected.includes(id));
            newSelected = [...newSelected, ...idsToAdd];
        }

    } else {
        const selectedIndex = selected.indexOf(row.id);
        if (selectedIndex === -1) {
            newSelected.push(row.id);
        } else {
            newSelected = newSelected.filter((selectedId) => selectedId !== row.id);
        }
    }

    setSelected(newSelected);
    setSelectedMateriaClave(newSelected.length >= 5);
  };

  const isRowSelected = (row) => {
    if (row.isVirtual) {
        return row.groupIds.every(id => selected.includes(id));
    }
    return selected.indexOf(row.id) !== -1;
  };

  // ------------------------------------------
  // LÓGICA AGREGADA AQUÍ PARA NUMERO Y FECHA DE INFORME
  // ------------------------------------------
  const handleNavigateToReporte = () => {
    // 1. Obtenemos los incidentes seleccionados reales
    // Nota: El filter respeta el orden del array original 'incidente'
    const incidentesSeleccionados = incidente.filter((item) =>
      selected.includes(item.id),
    );

    if (incidentesSeleccionados.length === 0) return;

    // 2. Identificamos el último incidente para sacar los cálculos
    const ultimoIncidente = incidentesSeleccionados[incidentesSeleccionados.length - 1];

    // 3. Calculamos la Fecha de Informe (Fecha del último incidente seleccionado)
    const fechaInforme = ultimoIncidente.fecha;

    // 4. Calculamos el Numero de Informe
    // Buscamos en qué posición estaba ese último incidente en la lista global
    const indiceOriginal = incidente.indexOf(ultimoIncidente); 
    // (Indice + 1) / 5 y redondeamos hacia arriba.
    // Ejemplo: Indice 4 (5to elemento) -> 5/5 = 1.
    // Ejemplo: Indice 9 (10mo elemento) -> 10/5 = 2.
    const numeroInforme = Math.ceil((indiceOriginal + 1) / 5);

    const datosParaEnviar = {
      R_MATRICULA: matricula,
      R_NOMBRE: alumno.nombres,
      R_APELLIDOP: alumno.apellidop,
      R_APELLIDM: alumno.apellidom,
      R_INCIDENTES: incidentesSeleccionados,
      // CAMPOS NUEVOS AGREGADOS:
      numero_informe: numeroInforme,
      fecha_informe: fechaInforme
    };
    
    console.log("Datos enviados a reporte:", datosParaEnviar);
    navigate("/reporte", { state: datosParaEnviar });
  };

  const fetchAlumno = useCallback(async () => {
    if (!matricula) return;

    const fetchInitialData = async () => {
      try {
        if (!token) {
          throw new Error("Autorización rechazada. No se encontró el token.");
        }
        const { alumno } = await fetchAlumnoGetOne(token, matricula);
        setAlumno(alumno);
      } catch (err) {
        console.error(err);
      }
    };
    fetchIncidente();
    fetchInitialData();
  }, [matricula, apiUrl]);

  useEffect(() => {
    fetchAlumno();
  }, [fetchAlumno]);

  const handleAcceptEdit = () => {
    setModalEditOpen(false);
    setModalIncidenteOpen(false);
    fetchAlumno();
  };

  if (!alumno) {
    return <Typography>Cargando alumno...</Typography>;
  }
  
  const numeroStrike =
    incidente.length > 0
      ? Math.max(...incidente.map((i) => i.numero_strike ?? 0))
      : 0;

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
            {alumno.grupo} {alumno.perfil} {alumno.ingles}
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

          {alumno.activo ? (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => {
                (setModalDesactivarOpen(true), setAltaBaja(false));
              }}
            >
              Dar de Baja
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="success"
              size="small"
              onClick={() => {
                (setModalDesactivarOpen(true), setAltaBaja(true));
              }}
            >
              Activar Estudiante
            </Button>
          )}
          <DarBajaAlumno
            open={modalDesactivarOpen}
            onClose={() => setModalDesactivarOpen(false)}
            onAccept={handleAcceptEdit}
            onConfirm={altaBaja}
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
            numero_strike={numeroStrike}
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
                    {processedRows.map((row) => {
                      const isItemSelected = isRowSelected(row);

                      return (
                        <TableRow
                          key={row.id}
                          hover
                          onClick={(event) => handleClick(event, row)}
                          role="checkbox"
                          aria-checked={isItemSelected}
                          selected={isItemSelected}
                          sx={{ 
                            cursor: "pointer",
                            backgroundColor: row.isVirtual ? "#e3f2fd" : "inherit",
                            "&.Mui-selected": {
                                backgroundColor: row.isVirtual ? "#bbdefb" : "rgba(25, 118, 210, 0.08)"
                            }
                          }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              color="primary"
                              checked={isItemSelected}
                            />
                          </TableCell>
                          
                          {row.isVirtual ? (
                             <>
                                <TableCell colSpan={1}>
                                    <Typography variant="body2" fontWeight="bold" color="primary">
                                        {row.solicitante}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight="bold" sx={{ fontStyle: 'italic' }}>
                                        {row.motivo_incidencia}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    {new Date(row.fecha).toLocaleDateString("es-MX")}
                                </TableCell>
                                <TableCell align="center">
                                    <strong>---</strong>
                                </TableCell>
                             </>
                          ) : (
                             <>
                                <TableCell>{row.solicitante}</TableCell>
                                <TableCell>{row.motivo_incidencia}</TableCell>
                                <TableCell>
                                    {new Date(row.fecha).toLocaleDateString("es-MX", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    })}
                                </TableCell>
                                <TableCell align="center">
                                    {row.numero_strike}
                                </TableCell>
                             </>
                          )}
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
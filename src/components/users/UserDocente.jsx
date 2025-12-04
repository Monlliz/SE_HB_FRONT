import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
//los modales
import NuevaMateriaDocente from "../modals/Docente/NuevaMateriaDocente.jsx";
import EditDocente from "../modals/Docente/EditDocente.jsx";
import DesactivarDocente from "../modals/Docente/DesactivarDocente.jsx";
import BorrarMateria from "../modals/Docente/BorrarMateria.jsx";
//iconos
import ListAltIcon from "@mui/icons-material/ListAlt";
import ChecklistIcon from "@mui/icons-material/Checklist";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
//import servicio
import {
  fetchDocenteGetOne,
  fetchDocenteMaterias,
} from "../../services/docenteService.js";
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
  IconButton,
} from "@mui/material";
//Funcion principal (El id es del docente)
export default function UserDocente({ id }) {
  //Todos los estados necesarios
  const [docente, setDocente] = useState(null);
  const [materias, setMaterias] = useState([]);
  const [selectedMateriaClave, setSelectedMateriaClave] = useState(null);
  //idMateriaDocente
  const [idMateriaDocente, setIdMateriaDocente] = useState(null);
  const [modalMateriaOpen, setModalMateriaOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [modalDesactivarOpen, setModalDesactivarOpen] = useState(false);
  const [modalBorrarMateriaOpen, setModalBorrarMateriaOpen] = useState(false);
  const navigate = useNavigate();
  //URL de la API
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token } = useAuth();
  //la Api pa' materias
  const fetchMaterias = useCallback(async () => {
    if (!id) return;
    try {
      if (!token) {
        throw new Error("Autorización rechazada. No se encontró el token.");
      }
      setSelectedMateriaClave(null);

      const { materias } = await fetchDocenteMaterias(token, id);

      setMaterias(materias.materias || []);
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
        if (!token) {
          throw new Error("Autorización rechazada. No se encontró el token.");
        }
        //LLamamos al servicio
        const { docente } = await fetchDocenteGetOne(token, id);
        setDocente(docente);
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

  //Funciones aceptar modales

  //Función para manejar el "Aceptar" del modal de agregar materia y borrar materia
  const handleAcceptMateria = () => {
    setModalMateriaOpen(false); // Cierra el modal
    fetchMaterias(); // Vuelve a cargar las materias para que aparezca la nueva
  };
  //La uso tambien para desactivar docente.
  const handleAcceptEdit = () => {
    setModalEditOpen(false); // Cierra el modal
    fetchDocente();
  };

  if (!docente) {
    return <Typography>Cargando docente...</Typography>;
  }

  //Navegacion a otras rutas

  const procesarNavegacion = (materia, rutaSimple, rutaPerfil) => {
    // Datos base que siempre van
    const baseData = {
      grupoId: materia.grupo,
      materiaClave: materia.clave,
      year: new Date().getFullYear(),
      nombreMateria: materia.nombre || materia.asignatura,
    };

    if (materia.grupo.length < 3) {
      navigate(rutaSimple, { state: baseData });
    } else {
      const [semestre, idNormalizado] = materia.grupo.split("-"); // Desestructuración limpia

      const perfilData = {
        ...baseData,
        semestre: semestre,
        idNormalizado: idNormalizado,
      };

      navigate(rutaPerfil, { state: perfilData });
    }
  };

  const handleNavigateToListaMateria = (materia) => {
    procesarNavegacion(
      materia,
      "/listaAsistenciamateria",
      "/listaAsistenciamateriaPerfil"
    );
  };

  const handleNavigateToCalifacacionesParcilaes = (materia) => {
    procesarNavegacion(materia, "/rubros", "/rubrosperfil");
  };

  const handleNavigateToActividades = (materia) => {
    procesarNavegacion(materia, "/trabajo", "/trabajoperfil");
  };

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
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => setModalDesactivarOpen(true)}
          >
            Desactivar
          </Button>
          <DesactivarDocente
            open={modalDesactivarOpen}
            onClose={() => setModalDesactivarOpen(false)}
            onAccept={handleAcceptEdit}
            docenteId={id}
            nombres={docente.nombres}
            apellidop={docente.apellidop}
          />
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
            onClick={() => setModalBorrarMateriaOpen(true)}
          >
            Eliminar
          </Button>
          <BorrarMateria
            open={modalBorrarMateriaOpen}
            onClose={() => setModalBorrarMateriaOpen(false)}
            onAccept={() => {
              setSelectedMateriaClave(null);
              fetchMaterias();
              setModalBorrarMateriaOpen(false);
            }}
            docenteId={id}
            clave={selectedMateriaClave}
            nombre={
              materias.find((m) => m.clave === selectedMateriaClave)?.nombre ||
              ""
            }
            grupo={
              materias.find((m) => m.idMateriaDocente === idMateriaDocente)
                ?.grupo || ""
            }
            idMateriaDocente={idMateriaDocente}
          />
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
                <TableCell>Grupo</TableCell>
                {/* 1. Nueva columna de encabezado */}
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materias.map((m) => (
                <TableRow
                  key={m.idMateriaDocente}
                  hover
                  // Puedes mantener la selección visual si quieres, pero ya no es estricta para los botones
                  selected={m.idMateriaDocente === idMateriaDocente}
                  onClick={() => {
                    setSelectedMateriaClave(m.clave),
                      setIdMateriaDocente(m.idMateriaDocente);
                  }}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>{m.clave}</TableCell>
                  <TableCell>{m.nombre}</TableCell>
                  <TableCell>{m.grupo}</TableCell>

                  {/* 2. Nueva celda con los botones agrupados */}
                  <TableCell align="center">
                    {/*stopPropagation evita que al hacer click en el botón se seleccione la fila entera*/}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: "flex",
                        gap: "5px",
                        justifyContent: "center",
                      }}
                    >
                      <IconButton
                        aria-label="lista"
                        size="small" // Recomiendo small para que no ensanche mucho la tabla
                        color="primary"
                        onClick={() => handleNavigateToListaMateria(m)}
                      >
                        <ListAltIcon />
                      </IconButton>

                      <IconButton
                        aria-label="actvidades"
                        size="small"
                        color="secondary"
                        onClick={() => handleNavigateToActividades(m)}
                      >
                        <AutoStoriesIcon />
                      </IconButton>

                      <IconButton
                        aria-label="calificaciones_parciales"
                        size="small"
                        color="success"
                        onClick={() =>
                          handleNavigateToCalifacacionesParcilaes(m)
                        }
                      >
                        <ChecklistIcon />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
}

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
//los modales
import ReusableModal from "../modals/ReusableModal.jsx";
import ConfirmModal from "../modals/ConfirmModal.jsx";

import NuevaMateriaDocente from "../modals/Docente/NuevaMateriaDocente.jsx";
import BorrarMateria from "../modals/Docente/BorrarMateria.jsx";
//iconos
import ListAltIcon from "@mui/icons-material/ListAlt";
import ChecklistIcon from "@mui/icons-material/Checklist";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import { Trash2, Plus, Pencil } from "lucide-react";


//import servicio

import {
  fetchDocenteGetOne,
  fetchDocenteMaterias,
  fetchDocenteActualizar,
  fetchDocenteDesactivar
} from "../../services/docenteService.js";

import { useAuth } from "../../context/AuthContext.jsx";
import { camposNuevoDocente } from "../../config/camposDocente.jsx"
import { useNotification } from "../../components/modals/NotificationModal.jsx";

//formatear fecha 
import { formatearFechaISO,obtenerFechaYYYYMMDD } from "../../utils/fornatters.js";
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
  Tooltip,
} from "@mui/material";
import { is } from "date-fns/locale";


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
  const [modalBorrarMateriaOpen, setModalBorrarMateriaOpen] = useState(false);
  const navigate = useNavigate();
  const { showNotification, NotificationComponent } = useNotification();
  //URL de la API
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token, isDirector } = useAuth();
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
        const {birthday, ...dataRes} = docente;
        const newData = {
          birthday: obtenerFechaYYYYMMDD(birthday) ,
          ...dataRes
        }
        setDocente(newData);
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

  //------------Editar docente--------


  // 3. Función para guardar (onSubmit del modal)
  const handleUpdateDocente = async (formData) => {
    try {
      const { activo, iddocente, ...datosParaEnviar } = formData;

      await fetchDocenteActualizar(token, id, datosParaEnviar);
      setModalEditOpen(false);
      showNotification("Docente actualizado con éxito", "success");
      handleAcceptEdit(); // función de refresco 

    } catch (error) {
      showNotification(`Error al guardar ${error.message}`, "error");

    }
  };

  //Fin editar docente---------------------------------------------------

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
  //fin 
  //Desactivar docente--------------------------------------------------------------

  const [loadingDelete, setLoadingDelete] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);


  // Función que ejecuta la desactivación
  const handleConfirmDesactivar = async () => {
    setLoadingDelete(true);
    try {
      if (!token) throw new Error("No token found");

      // Usamos el ID del docente seleccionado

      await fetchDocenteDesactivar(token, id);
      setModalDeleteOpen(false);

      showNotification("Docente desactivado con éxito", "success");
      // Cerramos modal y recargamos tabla

      handleAcceptEdit(); // Reutilizamos tu función de refrescar tabla

    } catch (err) {
      showNotification(`Error al desactivar ${err.message}`, "error");
    } finally {
      setLoadingDelete(false);
    }
  };
  //Fin desactivar docente----------------------------------------------------
  //----------------------------------------------------------------------------
  if (!docente) {
    return <Typography>Cargando docente...</Typography>;
  }
  //-----------------------------------------------------------------------------



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
      "/listaAsistencia",
      "/listaAsistencia",
    );
  };

  const handleNavigateToCalifacacionesParcilaes = (materia) => {
    procesarNavegacion(materia, "/rubros", "/rubros");
  };

  const handleNavigateToActividades = (materia) => {
    procesarNavegacion(materia, "/trabajo", "/trabajo");
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
            <Box component="span" fontWeight="bold">Correo:</Box> {docente.correo}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <Box component="span" fontWeight="bold">Fecha de nacimiento:</Box> {formatearFechaISO(docente.birthday)}
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
        {/*SOLO DIRECTOR   */}
        {isDirector && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<Pencil size={16} />}
              sx={{ color: "#0254acff" }}
              onClick={() => setModalEditOpen(true)}
            >
              Editar
            </Button>
            <ReusableModal
              open={modalEditOpen}
              onClose={() => setModalEditOpen(false)}
              iconEntity={Pencil} // Icono de edición
              title="Editar Docente"
              fields={camposNuevoDocente}
              initialValues={docente}
              // Para validar duplicados (opcional, pasa tu lista completa de docentes)
              //existingData={docentesData}
              onSubmit={handleUpdateDocente}
            />

            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<Trash2 size={17} />}
              onClick={() => setModalDeleteOpen(true)}
            >
              Desactivar
            </Button>
            <ConfirmModal
              open={modalDeleteOpen}
              onClose={() => setModalDeleteOpen(false)}
              onConfirm={handleConfirmDesactivar}
              isLoading={loadingDelete}
              title="DESACTIVAR DOCENTE"
              message={
                <span>
                  ¿Está seguro de desactivar al docente <strong>{docente.nombres} {docente.apellidop} {docente.apellidom}</strong>?
                </span>
              }
            />
          </Box>
        )}
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
            height: isDirector ? "40%" : "25%",
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
          {isDirector && (
            <Button
              variant="text"
              color="primary"
              startIcon={<Plus size={16} />}
              onClick={() => setModalMateriaOpen(true)}
            >
              Agregar
            </Button>)}

          <NuevaMateriaDocente
            open={modalMateriaOpen}
            onClose={() => setModalMateriaOpen(false)}
            onAccept={handleAcceptMateria}
            docenteId={id}
          />
          {isDirector && (
            <Button
              variant="text"
              color="error"
              startIcon={<Trash2 size={20} />}
              disabled={!selectedMateriaClave}
              onClick={() => setModalBorrarMateriaOpen(true)}
            >
              Eliminar
            </Button>)}

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
            height: "100%",
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
                {/* 1. Nueva columna de encabezado solo para director */}
                {isDirector && (
                  <TableCell align="center">Acciones</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {materias.map((m) => (
                <TableRow
                  key={m.iddm}
                  hover
                  // Puedes mantener la selección visual si quieres, pero ya no es estricta para los botones
                  selected={m.iddm === idMateriaDocente}
                  onClick={() => {
                    (setSelectedMateriaClave(m.clave),
                      setIdMateriaDocente(m.iddm));
                  }}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>{m.clave}</TableCell>
                  <TableCell>{m.nombre}</TableCell>
                  <TableCell>{m.grupo}</TableCell>

                  {/* 2. Nueva celda con los botones agrupados */}
                  {isDirector && (
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
                        <Tooltip title="Lista de asistencia por materia">
                          <IconButton
                            aria-label="lista"
                            size="small" // Recomiendo small para que no ensanche mucho la tabla
                            color="primary"
                            onClick={() => handleNavigateToListaMateria(m)}
                          >
                            <ListAltIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Actividades cotidianas">
                          <IconButton
                            aria-label="actvidades"
                            size="small"
                            color="secondary"
                            onClick={() => handleNavigateToActividades(m)}
                          >
                            <AutoStoriesIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Calificaciones parciales">
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
                        </Tooltip>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Box>
      {NotificationComponent}
    </Box>
  );
}

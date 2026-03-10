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
import EventNoteIcon from "@mui/icons-material/EventNote"; // <-- NUEVO ICONO PARA PLANEACIÓN
import { Trash2, Plus, Pencil } from "lucide-react";

//import servicio
import {
  fetchDocenteGetOne,
  fetchDocenteMaterias,
  fetchDocenteActualizar,
  fetchDocenteDesactivar,
} from "../../services/docenteService.js";

import { useAuth } from "../../context/AuthContext.jsx";
import { camposNuevoDocente } from "../../config/camposDocente.jsx";
import { useNotification } from "../../components/modals/NotificationModal.jsx";

//formatear fecha
import {
  formatearFechaISO,
  obtenerFechaYYYYMMDD,
} from "../../utils/fornatters.js";
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

//Funcion principal (El id es del docente)
export default function UserDocente({ id }) {
  const [docente, setDocente] = useState(null);
  const [materias, setMaterias] = useState([]);
  const [selectedMateriaClave, setSelectedMateriaClave] = useState(null);
  const [idMateriaDocente, setIdMateriaDocente] = useState(null);
  const [modalMateriaOpen, setModalMateriaOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [modalBorrarMateriaOpen, setModalBorrarMateriaOpen] = useState(false);
  const navigate = useNavigate();
  const { showNotification, NotificationComponent } = useNotification();
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token, isDirector } = useAuth();

  const fetchMaterias = useCallback(async () => {
    if (!id) return;
    try {
      if (!token)
        throw new Error("Autorización rechazada. No se encontró el token.");
      setSelectedMateriaClave(null);
      const { materias } = await fetchDocenteMaterias(token, id);
      setMaterias(materias.materias || []);
    } catch (err) {
      console.error(err);
      setMaterias([]);
    }
  }, [id, token]);

  const fetchDocente = useCallback(async () => {
    if (!id) return;
    const fetchInitialData = async () => {
      try {
        if (!token)
          throw new Error("Autorización rechazada. No se encontró el token.");
        const { docente } = await fetchDocenteGetOne(token, id);
        const { birthday, ...dataRes } = docente;
        const newData = {
          birthday: obtenerFechaYYYYMMDD(birthday),
          ...dataRes,
        };
        setDocente(newData);
        fetchMaterias();
      } catch (err) {
        console.error(err);
      }
    };
    fetchInitialData();
  }, [id, apiUrl, fetchMaterias, token]);

  useEffect(() => {
    fetchDocente();
    fetchMaterias();
  }, [fetchDocente, fetchMaterias]);

  const handleUpdateDocente = async (formData) => {
    try {
      const { activo, iddocente, ...datosParaEnviar } = formData;
      await fetchDocenteActualizar(token, id, datosParaEnviar);
      setModalEditOpen(false);
      showNotification("Docente actualizado con éxito", "success");
      handleAcceptEdit();
    } catch (error) {
      showNotification(`Error al guardar ${error.message}`, "error");
    }
  };

  const handleAcceptMateria = () => {
    setModalMateriaOpen(false);
    fetchMaterias();
  };

  const handleAcceptEdit = () => {
    setModalEditOpen(false);
    fetchDocente();
  };

  const [loadingDelete, setLoadingDelete] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);

  const handleConfirmDesactivar = async () => {
    setLoadingDelete(true);
    try {
      if (!token) throw new Error("No token found");
      await fetchDocenteDesactivar(token, id);
      setModalDeleteOpen(false);
      showNotification("Docente desactivado con éxito", "success");
      handleAcceptEdit();
    } catch (err) {
      showNotification(`Error al desactivar ${err.message}`, "error");
    } finally {
      setLoadingDelete(false);
    }
  };

  if (!docente) {
    return <Typography>Cargando docente...</Typography>;
  }

  // Navegacion a otras rutas
  const procesarNavegacion = (materia, rutaSimple, rutaPerfil) => {
    const baseData = {
      grupoId: materia.grupo,
      materiaClave: materia.clave,
      year: new Date().getFullYear(),
      nombreMateria: materia.nombre || materia.asignatura,
    };
    if (materia.grupo.length < 3) {
      navigate(rutaSimple, { state: baseData });
    } else {
      const [semestre, idNormalizado] = materia.grupo.split("-");
      const perfilData = {
        ...baseData,
        semestre: semestre,
        idNormalizado: idNormalizado,
      };
      navigate(rutaPerfil, { state: perfilData });
    }
  };

  const handleNavigateToListaMateria = (materia) =>
    procesarNavegacion(materia, "/listaAsistencia", "/listaAsistencia");
  const handleNavigateToCalifacacionesParcilaes = (materia) =>
    procesarNavegacion(materia, "/rubros", "/rubros");
  const handleNavigateToActividades = (materia) =>
    procesarNavegacion(materia, "/trabajo", "/trabajo");

  // <-- NUEVA FUNCIÓN DE NAVEGACIÓN A PLANEACIÓN -->
  const handleNavigateToPlaneacion = (materia) => {
   
    navigate("/planeacion", {
      state: {
        accesoDirecto: true,
        docenteSeleccionadoId: id,
        docenteInfo: `${docente.nombres} ${docente.apellidop} ${docente.apellidom}`,
        materiaSeleccionada: materia,
      },
    });
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
      {/* ... (Tu código de la Caja de Arriba se queda exactamente igual) ... */}
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
            <Box component="span" fontWeight="bold">
              Correo:
            </Box>{" "}
            {docente.correo}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <Box component="span" fontWeight="bold">
              Fecha de nacimiento:
            </Box>{" "}
            {formatearFechaISO(docente.birthday)}
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
              iconEntity={Pencil}
              title="Editar Docente"
              fields={camposNuevoDocente}
              initialValues={docente}
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
                  ¿Está seguro de desactivar al docente{" "}
                  <strong>
                    {docente.nombres} {docente.apellidop} {docente.apellidom}
                  </strong>
                  ?
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
            </Button>
          )}
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
            </Button>
          )}
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
                {isDirector && <TableCell align="center">Acciones</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {materias.map((m) => (
                <TableRow
                  key={m.iddm}
                  hover
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

                  {isDirector && (
                    <TableCell align="center">
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          display: "flex",
                          gap: "5px",
                          justifyContent: "center",
                        }}
                      >
                        {/* <-- NUEVO BOTÓN: PLANEACIÓN SEMANAL --> */}
                        <Tooltip title="Planeación Semanal">
                          <IconButton
                            aria-label="planeacion"
                            size="small"
                            color="info" 
                            onClick={() => handleNavigateToPlaneacion(m)}
                          >
                            <EventNoteIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Lista de asistencia por materia">
                          <IconButton
                            aria-label="lista"
                            size="small"
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

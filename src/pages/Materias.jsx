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
  Button,
  Snackbar,
  Alert
} from "@mui/material";

// Icons
import { BookPlus, BookOpen } from 'lucide-react';
import EditIcon from '@mui/icons-material/ModeEditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteForeverOutlined';
import AddIcon from '@mui/icons-material/AddOutlined';

// Context y servicios
import { useAuth } from "../context/AuthContext.jsx";
import { fetchMateriasGet, fetchMateriasPost, fetchMateriasPut, fetchMateriasDeleteLogico } from "../services/materiasService.js";
import ReusableModal from "../components/modals/ReusableModal.jsx";
import ConfirmModal from "../components/modals/ConfirmModal.jsx";
import FiltrosPopover from "../components/FiltrosPopover.jsx";
import { camposNuevaMateria, camposEditMateria, headCells } from "../config/camposMateria.jsx";


export default function Materias() {
  const navigate = useNavigate();
  const [materiasData, setMateriasData] = useState([]);
  const [search, setSearch] = useState("");

  // 1. ESTADO NUEVO: Para guardar el ID (clave) de la fila seleccionada
  const [selectedClave, setSelectedClave] = useState(null);

  const { token } = useAuth();
  //-----------Busqueda de filtros avanzada------------------//
  // Nuevo estado para los filtros avanzados
  const [advancedFilters, setAdvancedFilters] = useState({
    clave: "",
    semestre: null,
    perfil: null,
    year: null
  });

  // Esta función se ejecuta cuando le dan "Aplicar" en el popover
  const handleApplyFilters = (filters) => {
    setAdvancedFilters(filters);
    console.log("Filtros recibidos:", filters);
  };

  // Lógica de filtrado combinada
  const filteredData = materiasData.filter((materia) => {
    // 1. Filtro buscador general (el que ya tenías)
    const matchesGeneralSearch = 
        search === "" || 
        materia.asignatura.toLowerCase().includes(search.toLowerCase());

    // 2. Filtros Avanzados (Popover)
    const matchesClave = 
        !advancedFilters.clave || 
        materia.clave.toLowerCase().includes(advancedFilters.clave.toLowerCase());

    const matchesSemestre = 
        !advancedFilters.semestre || 
        String(materia.semestre) === String(advancedFilters.semestre);

    const matchesPerfil = 
        !advancedFilters.perfil || 
        materia.perfil_id === advancedFilters.perfil; // Ajusta si usas ID o Nombre

    const matchesYear = 
        !advancedFilters.year || 
        String(materia.yearm) === String(advancedFilters.year);

    // Deben cumplirse TODAS las condiciones
    return matchesGeneralSearch && matchesClave && matchesSemestre && matchesPerfil && matchesYear;
  });
  //-----------Fin búsqueda de filtros avanzada------------------//

  //----------------------Notificación Snackbar----------------------//
  // Estado para la notificación
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [alert, setAlert] = useState(false);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  //----------------------Fin notificación Snackbar----------------------//

  // Cargar materias al montar el componente
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

 /*  //--------------Filtro de búsqueda----------------------//
  // Filtrar materias según la asignatura
  const filteredData = materiasData.filter((materia) => {
    const searchLower = search.toLowerCase();
    const asignaturaLower = materia.asignatura.toLowerCase();
    return search === "" || asignaturaLower.includes(searchLower);
  }); */

  //----------------------Fin filtro de búsqueda----------------------//

  //--------------Crear y editar materia--------------//
  // Estados para el modal reutilizable
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("create"); // 'create' o 'edit'
  const [currentMateria, setCurrentMateria] = useState({});
  //mensaje de la alerta
  // 1. Función para abrir modal en modo CREAR
  const handleOpenCreate = () => {
    setModalAction("create");
    setCurrentMateria({}); // Valores vacíos
    setModalOpen(true);
  };

  // 2. Función para abrir modal en modo EDITAR
  const handleOpenEdit = () => {
    setModalAction("edit");
    setModalOpen(true);
  };

  // 3. Función que recibe los datos al dar click en "Guardar"
  const handleSaveData = async (formData) => {

    if (modalAction === "create") {
      try {
        if (!token) throw new Error("No token found");
        const { materias } = await fetchMateriasPost(token, formData);
        setMateriasData((prevMaterias) => [...prevMaterias, materias]);
        setAlert(true);
        setSnackbarOpen(true);
      } catch (error) {
        setAlert(false);
        setSnackbarOpen(true);
        console.error("Error al cargar guardar materias:", error);
      }
    } else if (modalAction === "edit") {
      try {
        if (!token) throw new Error("No token found");
        const { materias } = await fetchMateriasPut(token, currentMateria.clave, formData.asignatura);
        setMateriasData((prevMaterias) =>
          prevMaterias.map((materia) =>
            materia.clave === materias.clave ? materias : materia
          )
        );
        setAlert(true);
        setSnackbarOpen(true);
      } catch (error) {
        setAlert(false);
        setSnackbarOpen(true);
        console.error("Error al editar la materia:", error);
      }
    }
  };
  //---------------Fin crear y editar materia-----------//

  //----------------Eliminar materia----------------------//
  //estados para el modal de confirmación
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false); // Estado para el spinner

  // Cuando le dan click al botón de eliminar en la fila
  const onClickDelete = () => {
    setModalAction("delete");
    setConfirmOpen(true); // Abrimos el modal
  }
  // Cuando confirman en el modal
  const handleConfirmDelete = async () => {
    try {
      setLoadingDelete(true); // Activa el spinner en el botón rojo
      if (!token) throw new Error("No token found");
      await fetchMateriasDeleteLogico(token, selectedClave);

      // 2. Actualización del Estado: Usamos FILTER
      setMateriasData((prevMaterias) =>
        // "Déjame todas las materias EXCEPTO la que tenga la clave que acabo de borrar"
        prevMaterias.filter((materia) => materia.clave !== currentMateria.clave)
      );
      setAlert(true); //alerta de éxito
      setSnackbarOpen(true);//abrir snackbar
      setConfirmOpen(false);// Cerramos el modal
      setSelectedClave(null); // Desmarcamos la fila eliminada
    } catch (error) {
      setAlert(false);//alerta de error
      setSnackbarOpen(true);//abrir snackbar
      console.error(error);
    } finally {
      setLoadingDelete(false); // Apaga el spinner
    }
  };
  //----------------------Fin eliminar materia----------------------//

  //------------- Función para manejar el clic en la fila----------------//
  const handleRowClick = (dataRow) => {
    setCurrentMateria(dataRow); // Guardamos la fila completa para editar
    if (selectedClave === dataRow.clave) {
      setSelectedClave(null); // Si ya estaba seleccionada, la ponemos en null (desmarcar)
    } else {
      setSelectedClave(dataRow.clave); // Si era diferente, la seleccionamos
    }
  };
  //----------------------Fin selección de fila----------------------//

  //-------Mensaje de exito/fracaso en creación/edición-------//
  const getAlertMessage = () => {
    // Si ocurrió un error (alert es false, asumiendo que alert=true es éxito)
    if (!alert) {
      if (modalAction === "create") return "Error al crear la materia";
      if (modalAction === "edit") return "Error al editar la materia";
      if (modalAction === "delete") return "Error al eliminar la materia";
      return "Error desconocido";
    }

    // Si fue éxito
    if (modalAction === "create") return "Materia creada con éxito";
    if (modalAction === "edit") return "Materia editada con éxito";
    if (modalAction === "delete") return "Materia eliminada con éxito";

    return "";
  };

  //----------------------Fin mensaje de exito/fracaso----------------------//

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
          justifyContent: "space-between", // Separa el grupo izquierdo del derecho
          alignItems: "center",
          mb: 2,
        }}
      >
        {/* --- BARRA izquierda: Título + Botones + Buscador --- */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography
            variant="h5"
            fontWeight="bold"
            fontSize="2.5rem"
            color="secondary.contrastText"
          >
            Materias
          </Typography>

          <Button
            variant="text"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
          >
            Agregar
          </Button>
          <Button
            variant="text"
            startIcon={<EditIcon />}
            sx={{ color: "#0254acff" }}
            disabled={!selectedClave}
            onClick={handleOpenEdit}
          >
            Editar
          </Button>

          <Button
            variant="text"
            color="error"
            startIcon={<DeleteIcon />}
            disabled={!selectedClave}
            onClick={onClickDelete}
          >
            Eliminar
          </Button>
          {/*  <Button
            variant="contained"
            color="primary"
          // onClick={() => ...}
          >
            Agregar año cohorte
          </Button> */}
        </Box>

        {/* --- GRUPO DERECHO: Año Cohorte + Buscador --- */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>

          <TextField
            placeholder="Buscar por asignatura..."
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              width: "300px", // Le puse un ancho fijo en px para que no se deforme al agrupar
              "& .MuiOutlinedInput-root": {
                borderRadius: "2rem",
                backgroundColor: "#f9f9f9",
                "& fieldset": { borderColor: "#eee" },
                "&:hover fieldset": { borderColor: "#ddd" },
              },
            }}
          />
          <FiltrosPopover onApplyFilters={handleApplyFilters}/>
        </Box>
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
                    onClick={() => handleRowClick(materia)}
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
      {/*--- MODAL CREAR/EDITAR MATERIA ---*/}
      <ReusableModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        iconEntity={modalAction === "create" ? BookPlus : BookOpen}
        title={modalAction === "create" ? "Nueva Materia" : "Editar Materia"}
        fields={modalAction === "create" ? camposNuevaMateria : camposEditMateria}
        existingData={modalAction === "edit" ? materiasData : []}
        initialValues={currentMateria}
        onSubmit={handleSaveData}
      />
      {/*Modal para confirmar eliminacion */}
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={loadingDelete} // Pasamos el estado de carga
        title="ELIMINAR MATERIA"
        message={
          <span>
            ¿Está seguro de <strong>eliminar</strong> la materia {currentMateria.asignatura}?
          </span>
        }
      />
      {/* NOTIFICACIÓN FLOTANTE */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000} // Se cierra solo a los 3 segundos
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} // Posición en pantalla
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={alert ? "success" : "error"}
          //variant="filled" // Para que sea verde sólido y resalte más
          sx={{ width: '100%' }}
        >
          {getAlertMessage()}
        </Alert>
      </Snackbar>
    </Box>
  );
}
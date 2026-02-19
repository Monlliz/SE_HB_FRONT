import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../context/AuthContext.jsx";

// --- SERVICIOS ---
import {
  fetchMateriasPerfil,
  fetchMateriasGrupo,
  fetchMateriasGet,
  fetchBorrarMateriaGrupo,
} from "../../services/materiasService.js";
import {
  fetchGrupoCambio,
  fetchGrupoMateriaPost,
  fetchBorrarMateriaPerfil,
  fetchPerfilMateriaPost,
} from "../../services/grupoService.js";

// --- HOOKS Y CONFIGURACIÓN ---
import { useMateriasNavigation } from "../../hooks/useMateriasNavigation";
import {
  getCambioGrupoFields,
  getAddMateriaFields,
} from "../../config/camposGrupo.jsx";

// --- COMPONENTES ---
import ReusableModal from "../modals/ReusableModal.jsx";
import ConfirmModal from "../modals/ConfirmModal.jsx";
import { useNotification } from "../modals/NotificationModal.jsx";

// --- ICONOS Y UI ---
import { ListAlt, Checklist, Group, AutoStories } from "@mui/icons-material";
import { Trash2, Plus, FileUser, Users, BookOpen } from "lucide-react";
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

export default function MateriasManager({ id, mode = "grupo" }) {
  const { token, isDirector } = useAuth();
  const { showNotification, NotificationComponent } = useNotification();

  // -- ESTADOS DE DATOS --
  const [materias, setMaterias] = useState([]);
  const [catalogoMaterias, setCatalogoMaterias] = useState([]); // Para el select de agregar
  const [selectedMateria, setSelectedMateria] = useState({
    clave: null,
    nombre: null,
  });
  const [loading, setLoading] = useState(true);

  // -- ESTADO DE MODALES --
  const [activeModal, setActiveModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Para el loading del ConfirmModal

  // -- PARSEO DE ID --
  // Memoizamos el ID para saber si es un grupo normal o un perfil (semestre-usuario)
  const { semestre, idNormalizado } = useMemo(() => {
    if (mode === "perfil" && id) {
      const [s, i] = id.split("-");
      return { semestre: s, idNormalizado: i };
    }
    return { semestre: null, idNormalizado: id };
  }, [id, mode]);

  // -- HOOK DE NAVEGACIÓN --
  // Aquí se centraliza toda la lógica de rutas (listas, actividades, rubros)
  const nav = useMateriasNavigation(id, mode, semestre, idNormalizado);

  // -- CARGA DE DATOS (API) --
  const fetchMaterias = useCallback(async () => {
    if (!id || !token) return;
    setLoading(true);
    try {
      const anioActual = new Date().getFullYear();
      const response =
        mode === "perfil"
          ? await fetchMateriasPerfil(token, id, anioActual)
          : await fetchMateriasGrupo(token, id, anioActual);

      setMaterias(response.materias?.materias || []);
    } catch (err) {
      console.error(err);
      setMaterias([]);
    } finally {
      setLoading(false);
    }
  }, [id, mode, token]);

  useEffect(() => {
    fetchMaterias();
    setSelectedMateria({ clave: null, nombre: null });
  }, [fetchMaterias]);

  // -- LÓGICA DE MODALES --

  // 1. Abrir modal AGREGAR (Carga el catálogo bajo demanda)
  const handleOpenAdd = async () => {
    setActiveModal("ADD");
    if (catalogoMaterias.length === 0) {
      try {
        const { materias } = await fetchMateriasGet(token);
        const opciones = materias.map((m) => ({
          label: m.asignatura,
          value: m.clave,
          original: m,
        }));
        setCatalogoMaterias(opciones);
      } catch (e) {
        showNotification("Error cargando catálogo", "error");
      }
    }
  };

  // 2. Submit AGREGAR
  const handleSubmitAdd = async (formData) => {
    try {
      const materiaObj = catalogoMaterias.find(
        (op) => op.value === formData.materiaClave,
      )?.original;
      if (!materiaObj) throw new Error("Materia inválida");

      if (mode === "grupo") {
        await fetchGrupoMateriaPost(token, id, materiaObj);
      } else {
        await fetchPerfilMateriaPost(token, id, materiaObj);
      }
      showNotification("Materia agregada", "success");
      fetchMaterias();
    } catch (e) {
      throw e; // ReusableModal maneja el error visualmente
    }
  };

  // 3. Submit BORRAR
  const handleSubmitDelete = async () => {
    setIsSubmitting(true);
    try {
      if (mode === "grupo") {
        await fetchBorrarMateriaGrupo(token, id, selectedMateria.clave);
      } else {
        await fetchBorrarMateriaPerfil(token, id, selectedMateria.clave);
      }
      showNotification("Materia eliminada correctamente", "success");
      fetchMaterias();
      setActiveModal(null);
      setSelectedMateria({ clave: null, nombre: null });
    } catch (e) {
      showNotification(`Error: ${e.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Submit CAMBIO GRUPO
  const handleSubmitChangeGroup = async (formData) => {
    await fetchGrupoCambio(token, id, formData.grupo);
    showNotification("Grupo actualizado", "success");
  };

  // -- CONFIGURACIÓN DE FORMULARIOS --
  const getFormConfig = () => {
    switch (activeModal) {
      case "ADD":
        return {
          title: `Agregar Materia al ${mode}`,
          fields: getAddMateriaFields(
            catalogoMaterias,
            catalogoMaterias.length === 0,
          ),
          submitLabel: "Agregar",
          onSubmit: handleSubmitAdd,
          icon: BookOpen,
          initial: { materiaClave: null },
        };
      case "CHANGE_GROUP":
        return {
          title: "Cambio de Grupo Masivo",
          fields: getCambioGrupoFields(id),
          submitLabel: "Mover Alumnos",
          onSubmit: handleSubmitChangeGroup,
          icon: Users,
          initial: { grupo: "" },
        };
      default:
        return null;
    }
  };

  const formConfig = getFormConfig();

  if (loading) return <Typography>Cargando materias...</Typography>;

  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        width: "100%",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          height: "10%",
          display: "flex",
          p: 2,
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          {mode === "perfil" ? "Perfil" : "Grupo"} - {id}
        </Typography>

        {/* Acciones Generales (Solo Grupo) */}
        {mode === "grupo" && (
          <>
            <Tooltip title="Lista general">
              <IconButton onClick={nav.irAListaGeneral}>
                <ListAlt />
              </IconButton>
            </Tooltip>
            {isDirector && (
              <>
                <Tooltip title="Resumen TC">
                  <IconButton onClick={nav.irAResumenTC}>
                    <FileUser />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cambiar Grupo">
                  <IconButton onClick={() => setActiveModal("CHANGE_GROUP")}>
                    <Group />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </>
        )}
      </Box>

      {/* TOOLBAR (Acciones sobre Materia seleccionada) */}
      <Box
        sx={{
          height: "10%",
          display: "flex",
          p: 2,
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Materias
        </Typography>
        {isDirector && (
          <>
            <Tooltip title="Agregar">
              <Button
                variant="text"
                startIcon={<Plus />}
                onClick={handleOpenAdd}
              >
                Agregar
              </Button>
            </Tooltip>

            <Tooltip title="Eliminar">
              {/* Botón deshabilitado si no hay materia seleccionada */}
              <Button
                variant="text"
                color="error"
                startIcon={<Trash2 />}
                disabled={!selectedMateria.clave}
                onClick={() => setActiveModal("DELETE")}
              >
                Eliminar
              </Button>
            </Tooltip>

            {/* Botones de navegación usando el Hook (Requieren selección) */}
            <Tooltip title="Lista">
              <IconButton
                disabled={!selectedMateria.clave}
                onClick={() =>
                  nav.irAListaMateria(
                    selectedMateria.clave,
                    selectedMateria.nombre,
                  )
                }
              >
                <ListAlt />
              </IconButton>
            </Tooltip>

            <Tooltip title="Actividades">
              <IconButton
                disabled={!selectedMateria.clave}
                onClick={() =>
                  nav.irAActividades(
                    selectedMateria.clave,
                    selectedMateria.nombre,
                  )
                }
              >
                <AutoStories />
              </IconButton>
            </Tooltip>

            <Tooltip title="Rubros">
              <IconButton
                disabled={!selectedMateria.clave}
                onClick={() =>
                  nav.irARubros(selectedMateria.clave, selectedMateria.nombre)
                }
              >
                <Checklist />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>

      {/* TABLA */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
        <Table stickyHeader>
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
                selected={m.clave === selectedMateria.clave}
                onClick={() =>
                  setSelectedMateria({ clave: m.clave, nombre: m.asignatura })
                }
                sx={{ cursor: "pointer" }}
              >
                <TableCell>{m.clave}</TableCell>
                <TableCell>{m.asignatura}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {/* 1. MODAL REUTILIZABLE (Agregar / Cambiar Grupo) */}
      {formConfig && (
        <ReusableModal
          open={!!formConfig}
          onClose={() => setActiveModal(null)}
          title={formConfig.title}
          fields={formConfig.fields}
          onSubmit={formConfig.onSubmit}
          submitLabel={formConfig.submitLabel}
          iconEntity={formConfig.icon}
          initialValues={formConfig.initial}
          maxWidth="sm"
        />
      )}

      {/* 2. MODAL DE CONFIRMACIÓN (Eliminar) */}
      <ConfirmModal
        open={activeModal === "DELETE"}
        onClose={() => setActiveModal(null)}
        onConfirm={handleSubmitDelete}
        title="ELIMINAR MATERIA"
        type={false} // false = Rojo/Peligro
        isLoading={isSubmitting}
        message={
          <span>
            ¿Estás seguro de que deseas eliminar la materia{" "}
            <strong>{selectedMateria.nombre}</strong> del {mode}{" "}
            <strong>{id}</strong>?
          </span>
        }
      />

      {NotificationComponent}
    </Box>
  );
}

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../context/AuthContext.jsx";

// --- SERVICIOS ---
import { fetchMateriasPerfil, fetchMateriasGrupo, fetchMateriasGet,fetchBorrarMateriaGrupo } from "../../services/materiasService.js";
import { fetchGrupoCambio, fetchGrupoMateriaPost,fetchBorrarMateriaPerfil,fetchPerfilMateriaPost } from "../../services/grupoService.js";


// --- HOOKS Y CONFIGURACIÓN ---
import { useMateriasNavigation } from "../../hooks/useMateriasNavigation"; // <--- Hook Nuevo
import {getCambioGrupoFields, getAddMateriaFields } from "../../config/camposGrupo.jsx"; // <--- Config Nueva


// --- COMPONENTES ---
import ReusableModal from "../modals/ReusableModal.jsx";
import ConfirmModal from "../modals/ConfirmModal.jsx"; // Modal específico para confirmaciones
import { useNotification } from "../modals/NotificationModal.jsx";

// --- ICONOS Y UI ---
import { ListAlt, Checklist, Group, AutoStories } from "@mui/icons-material"; // Usando imports cortos si es posible
import { Trash2, Plus, FileUser, Users, BookOpen } from "lucide-react";
import { Box, Button, Typography, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Tooltip } from "@mui/material";

export default function MateriasManager({ id, mode = "grupo" }) {
  const { token, isDirector } = useAuth();
  const { showNotification, NotificationComponent } = useNotification();
  
  // -- ESTADOS DE DATOS --
  const [materias, setMaterias] = useState([]);
  const [catalogoMaterias, setCatalogoMaterias] = useState([]); // Para el select de agregar
  const [selectedMateria, setSelectedMateria] = useState({ clave: null, nombre: null });
  const [loading, setLoading] = useState(true);

  // -- ESTADO DE MODALES (Unificado) --
 const [activeModal, setActiveModal] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false); //Estado para el loading del ConfirmModal

  // -- PARSEO DE ID --
  const { semestre, idNormalizado } = useMemo(() => {
    if (mode === "perfil" && id) {
      const [s, i] = id.split("-");
      return { semestre: s, idNormalizado: i };
    }
    return { semestre: null, idNormalizado: id };
  }, [id, mode]);

  // -- HOOK DE NAVEGACIÓN --
  const nav = useMateriasNavigation(id, mode, semestre, idNormalizado);

  // -- CARGA DE DATOS --
  const fetchMaterias = useCallback(async () => {
    if (!id || !token) return;
    setLoading(true);
    try {
      const anioActual = new Date().getFullYear();
      const response = mode === "perfil" 
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

  useEffect(() => { fetchMaterias(); }, [fetchMaterias]);

  // -- LÓGICA DE MODALES (Preparación) --
  
  // 1. Abrir modal AGREGAR (Carga el catálogo)
  const handleOpenAdd = async () => {
    setActiveModal("ADD");
    // Cargamos el catálogo solo si no lo tenemos
    if (catalogoMaterias.length === 0) {
        try {
            const { materias } = await fetchMateriasGet(token);
            const opciones = materias.map(m => ({ label: m.asignatura, value: m.clave, original: m }));
            setCatalogoMaterias(opciones);
        } catch (e) { showNotification("Error cargando catálogo", "error"); }
    }
  };

  // 2. Submit AGREGAR
  const handleSubmitAdd = async (formData) => {
    try {
        const materiaObj = catalogoMaterias.find(op => op.value === formData.materiaClave)?.original;
        if (!materiaObj) throw new Error("Materia inválida");

        if (mode === "grupo") {
            await fetchGrupoMateriaPost(token, id, materiaObj);
        } else {
            // Lógica para perfil
            await fetchPerfilMateriaPost(token, id, materiaObj);
        }
        showNotification("Materia agregada", "success");
        fetchMaterias();
    } catch (e) { throw e; } // ReusableModal maneja el error visualmente
  };

  // 3. Submit BORRAR
const handleSubmitDelete = async () => {
    setIsSubmitting(true); // Activamos spinner del ConfirmModal
    try {
        if (mode === "grupo") {
            await fetchBorrarMateriaGrupo(token, id, selectedMateria.clave);
        } else {
            await fetchBorrarMateriaPerfil(token, id, selectedMateria.clave);
        }
        showNotification("Materia eliminada correctamente", "success");
        fetchMaterias();
        setActiveModal(null); // Cerramos modal
        setSelectedMateria({ clave: null, nombre: null });
    } catch (e) { 
        showNotification(`Error: ${e.message}`, "error");
    } finally {
        setIsSubmitting(false); // Apagamos spinner
    }
  };

  // 4. Submit CAMBIO GRUPO
  const handleSubmitChangeGroup = async (formData) => {
      await fetchGrupoCambio(token, id, formData.grupo);
      showNotification("Grupo actualizado", "success");
  };

  // -- RENDERIZADO --

 const getFormConfig = () => {
      switch(activeModal) {
          case "ADD":
              return {
                  title: `Agregar Materia al ${mode}`,
                  fields: getAddMateriaFields(catalogoMaterias, catalogoMaterias.length === 0),
                  submitLabel: "Agregar",
                  onSubmit: handleSubmitAdd,
                  icon: BookOpen,
                  initial: { materiaClave: null }
              };
          case "CHANGE_GROUP":
              return {
                  title: "Cambio de Grupo Masivo",
                  fields: getCambioGrupoFields(id),
                  submitLabel: "Mover Alumnos",
                  onSubmit: handleSubmitChangeGroup,
                  icon: Users,
                  initial: { grupo: "" }
              };
          default: return null;
      }
  };
  
  const formConfig = getFormConfig();

  if (loading) return <Typography>Cargando materias...</Typography>;

  return (
    <Box sx={{ display: "flex", height: "100%", width: "100%", flexDirection: "column" }}>
      
      {/* HEADER */}
      <Box sx={{ height: "10%", display: "flex", p: 2, alignItems: "center", gap: 2 }}>
        <Typography variant="h5" fontWeight="bold">{mode === "perfil" ? "Perfil" : "Grupo"} - {id}</Typography>
        {mode === "grupo" && (
          <>
            <Tooltip title="Lista general"><IconButton onClick={nav.irAListaGeneral}><ListAlt /></IconButton></Tooltip>
            {isDirector && (
              <>
                <Tooltip title="Resumen TC"><IconButton onClick={nav.irAResumenTC}><FileUser /></IconButton></Tooltip>
                <Tooltip title="Cambiar Grupo"><IconButton onClick={() => setActiveModal("CHANGE_GROUP")}><Group /></IconButton></Tooltip>
              </>
            )}
          </>
        )}
      </Box>

      {/* TOOLBAR */}
      <Box sx={{ height: "10%", display: "flex", p: 2, alignItems: "center", gap: 2 }}>
        <Typography variant="h5" fontWeight="bold">Materias</Typography>
        {isDirector && (
            <>
                <Tooltip title="Agregar"><Button variant="text" startIcon={<Plus />} onClick={handleOpenAdd}>Agregar</Button></Tooltip>
                <Tooltip title="Eliminar"><Button variant="text" color="error" startIcon={<Trash2 />} disabled={!selectedMateria.clave} onClick={() => setActiveModal("DELETE")}>Eliminar</Button></Tooltip>
                {/* Botones de navegación usando el Hook */}
                <Tooltip title="Lista"><IconButton disabled={!selectedMateria.clave} onClick={() => nav.irAListaMateria(selectedMateria.clave, selectedMateria.nombre)}><ListAlt /></IconButton></Tooltip>
                <Tooltip title="Actividades"><IconButton disabled={!selectedMateria.clave} onClick={() => nav.irAActividades(selectedMateria.clave, selectedMateria.nombre)}><AutoStories /></IconButton></Tooltip>
                <Tooltip title="Rubros"><IconButton disabled={!selectedMateria.clave} onClick={() => nav.irARubros(selectedMateria.clave, selectedMateria.nombre)}><Checklist /></IconButton></Tooltip>
            </>
        )}
      </Box>

      {/* TABLA */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
        <Table stickyHeader>
          <TableHead><TableRow><TableCell>Clave</TableCell><TableCell>Nombre</TableCell></TableRow></TableHead>
          <TableBody>
            {materias.map((m) => (
              <TableRow 
                key={m.clave} 
                hover 
                selected={m.clave === selectedMateria.clave} 
                onClick={() => setSelectedMateria({ clave: m.clave, nombre: m.asignatura })} 
                sx={{ cursor: "pointer" }}
              >
                <TableCell>{m.clave}</TableCell>
                <TableCell>{m.asignatura}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {/* 1. MODAL REUTILIZABLE (Para Formularios: Agregar y Cambiar Grupo) */}
      {formConfig && (
        <ReusableModal
            open={!!formConfig} // Si hay config, está abierto
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

      {/* 2. MODAL DE CONFIRMACIÓN (Específico para Eliminar) */}
      <ConfirmModal
        open={activeModal === "DELETE"}
        onClose={() => setActiveModal(null)}
        onConfirm={handleSubmitDelete}
        title="ELIMINAR MATERIA"
        type={false} // false = Rojo (Peligro)
        isLoading={isSubmitting} 
        message={
            <span>
              ¿Estás seguro de que deseas eliminar la materia <strong>{selectedMateria.nombre}</strong> del {mode} <strong>{id}</strong>?
            </span>
        }
      />

      {NotificationComponent}
    </Box>
  );
}
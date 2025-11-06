import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import { fetchMateriasGet } from "../../services/materiasService";
import { fetchDocenteMateriasPost } from "../../services/docenteService";
import { fetchGrupoGet, fetchPerfilGet } from "../../services/grupoService.js"; // <-- Devuelta
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  CircularProgress,
  Autocomplete,
  TextField,
  Radio, // <-- Nuevo
  RadioGroup, // <-- Nuevo
  FormControlLabel, // <-- Nuevo
  FormControl, // <-- Devuelta
  FormLabel, // <-- Nuevo
} from "@mui/material";

function NuevaMateriaDocente({ open, onClose, onAccept, docenteId }) {
  // Estados para Materias
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
  const [materias, setMaterias] = useState([]);

  // Estados para Grupos y Perfiles (reincorporados)
  const [Grupos, setGrupos] = useState([]);
  const [Perfiles, setPerfiles] = useState([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [perfilSeleccionado, setPerfilSeleccionado] = useState(null);

  // Estado para controlar qué selector mostrar (grupo o perfil)
  const [tipoAsociacion, setTipoAsociacion] = useState("grupo"); // 'grupo' o 'perfil'

  // Estados de carga y error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Función para cargar Grupos y Perfiles (reincorporada de tu código original)
  const fetchGruposYPerfiles = useCallback(async () => {
    try {
      if (!token)
        throw new Error("Autorización rechazada. No se encontró el token.");

      const [dataGrupos, dataPerfiles] = await Promise.all([
        fetchGrupoGet(token),
        fetchPerfilGet(token),
      ]);

      const { grupos } = dataGrupos;
      const { perfiles } = dataPerfiles;
      const idGrupoOcultar = "EG";

      const perfilesFiltrados = perfiles.filter((perfil) => {
        const tieneNumero = /^\d+-/.test(perfil.idperfil);
        const esBC = perfil.idperfil.includes("BC");
        return tieneNumero && !esBC;
      });
      setPerfiles(perfilesFiltrados);

      const gruposFiltrados = grupos.filter(
        (grupo) => grupo.idgrupo !== idGrupoOcultar
      );
      setGrupos(gruposFiltrados);
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error; // Lanza el error para que sea capturado por el 'catch' principal
    }
  }, [token]);

  // Función para cargar Materias
  const fetchMaterias = useCallback(async () => {
    try {
      if (!token)
        throw new Error("Autorización rechazada. No se encontró el token.");
      const { materias } = await fetchMateriasGet(token);
      setMaterias(materias);
    } catch (error) {
      console.error("Error fetching materias:", error);
      throw error; // Lanza el error
    }
  }, [token]);

  // useEffect principal para cargar todo al abrir
  useEffect(() => {
    if (open) {
      // Resetea todos los estados al abrir
      setMateriaSeleccionada(null);
      setGrupoSeleccionado(null);
      setPerfilSeleccionado(null);
      setTipoAsociacion("grupo");
      setLoading(true);
      setError(null);

      const loadAllData = async () => {
        try {
          // Carga todo en paralelo
          await Promise.all([fetchGruposYPerfiles(), fetchMaterias()]);
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

      loadAllData();
    }
  }, [open, token, fetchGruposYPerfiles, fetchMaterias]); // Dependencias correctas

  const handleAcceptClick = async () => {
    // --- Validación ---
    if (!materiaSeleccionada) {
      alert("Por favor, selecciona una materia.");
      return;
    }

    if (tipoAsociacion === "grupo" && !grupoSeleccionado) {
      alert("Por favor, selecciona un grupo.");
      return;
    }

    if (tipoAsociacion === "perfil" && !perfilSeleccionado) {
      alert("Por favor, selecciona un perfil.");
      return;
    }

    setIsSubmitting(true);

    // --- Preparación de datos ---
    const datosParaEnviar = {
      idDocente: docenteId,
      claveMateria: materiaSeleccionada.clave,
      idGrupo: tipoAsociacion === "grupo" ? grupoSeleccionado.idgrupo : null,
      idPerfil:
        tipoAsociacion === "perfil" ? perfilSeleccionado.idperfil : null,
    };

    const GrupoOPerfil =
      tipoAsociacion === "grupo"
        ? grupoSeleccionado.idgrupo
        : perfilSeleccionado.idperfil;

    console.log("Datos a enviar:", datosParaEnviar);

    try {
      await fetchDocenteMateriasPost(
        token,
        docenteId,
        materiaSeleccionada.clave,
        GrupoOPerfil
      );

      onAccept(datosParaEnviar); // Envía el objeto completo al padre
    } catch (error) {
      console.error("Error en el envío:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false); // Terminamos el envío (con éxito o error)
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <CircularProgress />
        </Box>
      );
    }
    if (error) {
      return <Box sx={{ color: "red", my: 2 }}>Error: {error}</Box>;
    }
    return (
      <>
        {/* 1. Selector de Materia */}
        <Autocomplete
          options={materias}
          getOptionLabel={(option) => option.asignatura || ""}
          loading={loading}
          renderInput={(params) => (
            <TextField {...params} label="Buscar Materia" />
          )}
          value={materiaSeleccionada}
          onChange={(event, newValue) => {
            setMateriaSeleccionada(newValue);
          }}
          isOptionEqualToValue={(option, value) => option.clave === value.clave}
          noOptionsText="No se encontraron materias"
        />

        {/* 2. Selector de Tipo de Asociación (Grupo o Perfil) */}
        <FormControl component="fieldset" sx={{ mt: 3, mb: 1 }}>
          <FormLabel component="legend">Asociar con:</FormLabel>
          <RadioGroup
            row
            value={tipoAsociacion}
            onChange={(e) => setTipoAsociacion(e.target.value)}
          >
            <FormControlLabel value="grupo" control={<Radio />} label="Grupo" />
            <FormControlLabel
              value="perfil"
              control={<Radio />}
              label="Perfil"
            />
          </RadioGroup>
        </FormControl>

        {/* 3. Selector condicional de Grupo */}
        {tipoAsociacion === "grupo" && (
          <Autocomplete
            options={Grupos}
            getOptionLabel={(option) => `${option.idgrupo}` || option.idgrupo} // Ajusta 'nombregrupo' si la prop se llama diferente
            loading={loading}
            renderInput={(params) => (
              <TextField {...params} label="Buscar Grupo" />
            )}
            value={grupoSeleccionado}
            onChange={(event, newValue) => {
              setGrupoSeleccionado(newValue);
              setPerfilSeleccionado(null); // Limpia la otra selección
            }}
            isOptionEqualToValue={(option, value) =>
              option.idgrupo === value.idgrupo
            }
            noOptionsText="No se encontraron grupos"
          />
        )}

        {/* 4. Selector condicional de Perfil */}
        {tipoAsociacion === "perfil" && (
          <Autocomplete
            options={Perfiles}
            getOptionLabel={(option) => option.idperfil || ""} // Los perfiles parecen no tener 'nombre'
            loading={loading}
            renderInput={(params) => (
              <TextField {...params} label="Buscar Perfil" />
            )}
            value={perfilSeleccionado}
            onChange={(event, newValue) => {
              setPerfilSeleccionado(newValue);
              setGrupoSeleccionado(null); // Limpia la otra selección
            }}
            isOptionEqualToValue={(option, value) =>
              option.idperfil === value.idperfil
            }
            noOptionsText="No se encontraron perfiles"
          />
        )}
      </>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Asignar materia a docente</DialogTitle>
      <DialogContent>
        <Box sx={{ marginTop: 2 }}>{renderContent()}</Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          onClick={handleAcceptClick}
          variant="contained"
          disabled={loading || !!error || isSubmitting}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Aceptar"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NuevaMateriaDocente;

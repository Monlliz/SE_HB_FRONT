// src/hooks/useMateriasNavigation.js
import { useNavigate } from "react-router-dom";

export const useMateriasNavigation = (grupoId, mode, semestre, idNormalizado) => {
  const navigate = useNavigate();

  // Helper interno
  const getPayload = (materiaClave, nombreMateria) => {
    const payload = {
      grupoId,
      materiaClave,
      year: new Date().getFullYear(),
      nombreMateria: nombreMateria || "Materia",
    };
    if (mode === "perfil") {
      payload.semestre = semestre;
      payload.idNormalizado = idNormalizado;
    }
    return payload;
  };

  return {
    irAListaGeneral: () => {
      navigate("/listaAsistencia", { state: { grupoId, year: new Date().getFullYear() } });
    },
    irAResumenTC: () => {
      navigate("/resumenTC", { state: { grupoId, year: new Date().getFullYear() } });
    },
    irAListaMateria: (clave, nombre) => {
      if (!clave) return;
      navigate("/listaAsistencia", { state: getPayload(clave, nombre) });
    },
    irAActividades: (clave, nombre) => {
      if (!clave) return;
      navigate("/trabajo", { state: getPayload(clave, nombre) });
    },
    irARubros: (clave, nombre) => {
      if (!clave) return;
      const path = mode === "perfil" ? "/rubros" : "/rubros";
      navigate(path, { state: getPayload(clave, nombre) });
    }
  };
};
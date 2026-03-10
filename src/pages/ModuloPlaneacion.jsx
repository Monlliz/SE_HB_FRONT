import React, { useState, useCallback, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import {
  fetchDocenteMaterias,
  fetchDocenteGet,
} from "../services/docenteService.js";

// Importamos los dos nuevos componentes hijos (ajusta la ruta según tu proyecto)
import SelectorMaterias from "../components/SelectorMaterias.jsx";
import FormularioPlaneacion from "../components/FormularioPlaneacion.jsx";

export default function ModuloPlaneacion() {
  const { token, user } = useAuth();
  const location = useLocation();
  const isDirector = user?.nombre_rol === "Director";
  const idDocenteLogueado = user?.idDocente || user?.iddocente;

  // Estados Generales
  const [docentesLista, setDocentesLista] = useState([]);
  const [docenteSeleccionadoId, setDocenteSeleccionadoId] = useState(
    location.state?.docenteSeleccionadoId ||
      (isDirector ? "" : idDocenteLogueado),
  );
  const [materiasDocente, setMaterias] = useState([]);
  const [docenteInfo, setDocenteInfo] = useState(
    location.state?.docenteInfo || null,
  );
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(
    location.state?.materiaSeleccionada || null,
  );

  // Cargar lista de todos los docentes SOLO si es Director
  useEffect(() => {
    const cargarDocentes = async () => {
      if (!isDirector || !token) return;

      try {
        const response = await fetchDocenteGet(token);

        const dataBruta = response?.docentes || [];

        const docentesNormalizados = dataBruta.map((doc) => ({
          idDocente: doc.iddocente || doc.idDocente || doc.id,
          nombres: doc.nombres || "",
          apellidoP: doc.apellidop || doc.apellidoP || "",
          apellidoM: doc.apellidom || doc.apellidoM || "",

          nombreCompleto:
            `${doc.nombres || ""} ${doc.apellidop || ""} ${doc.apellidom || ""}`.trim(),
        }));

        setDocentesLista(docentesNormalizados);
      } catch (error) {
        console.error("Error cargando docentes:", error);
      }
    };

    cargarDocentes();
  }, [isDirector, token]);
  // Obtener materias del docente seleccionado
  const fetchDocente = useCallback(async () => {
    if (!docenteSeleccionadoId || !token) return;
    try {
      const response = await fetchDocenteMaterias(token, docenteSeleccionadoId);
      if (response && response.materias) {
        setMaterias(response.materias.materias || []);
        setDocenteInfo(
          `${response.materias.nombre} ${response.materias.apellido_paterno} ${response.materias.apellido_materno || ""}`.trim(),
        );
      }
    } catch (err) {
      console.error("Error al obtener materias:", err);
      setMaterias([]);
      setDocenteInfo(null);
    }
  }, [docenteSeleccionadoId, token]);

  useEffect(() => {
    fetchDocente();
  }, [fetchDocente]);

  return (
    <Box>
      {!materiaSeleccionada ? (
        <SelectorMaterias
          isDirector={isDirector}
          docentesLista={docentesLista}
          docenteSeleccionadoId={docenteSeleccionadoId}
          setDocenteSeleccionadoId={setDocenteSeleccionadoId}
          setDocenteInfo={setDocenteInfo}
          docenteInfo={docenteInfo}
          materiasDocente={materiasDocente}
          setMateriaSeleccionada={setMateriaSeleccionada}
        />
      ) : (
        <FormularioPlaneacion
          isDirector={isDirector}
          materiaSeleccionada={materiaSeleccionada}
          docenteInfo={docenteInfo}
          docenteSeleccionadoId={docenteSeleccionadoId}
          volver={() => setMateriaSeleccionada(null)}
        />
      )}
    </Box>
  );
}

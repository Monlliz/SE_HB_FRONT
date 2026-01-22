import React, { useState, useEffect, act, useCallback } from "react";
import { Box, Button, Typography, FormControl, Select } from "@mui/material";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchDocenteGet } from "../services/docenteService.js";

export default function GeneracionDeCuentas() {
  //Logica de la pagina
  //Token y usuario
  const { token, user } = useAuth();

  //Estados
  const [docentes, setDocentes] = useState([]);

  //Pequeña validacion de rol
  if (user.nombre_rol !== "Director") {
    return <h1>No autorizado</h1>;
  }

  const fetchDocente = useCallback(async () => {
    try {
      if (!token) throw new Error("Autorización rechazada.");
      const data = await fetchDocenteGet(token);
      const docentesOrdenados = (data.docentes || []).sort((a, b) => {
        return a.apellidop.localeCompare(b.apellidop);
      });
      setDocentes(docentesOrdenados);
    } catch (error) {
    } finally {
    }
  }, [token]);

  //Llama a `fetchDocente` una vez cuando el componente se monta para obtener los datos iniciales.
  useEffect(() => {
    fetchDocente();
  }, [fetchDocente]);

  //Opciones de select
  const docenteOptions = docentes.map((docente) => ({
    value: docente.id,
    label: `${docente.nombres} ${docente.apellidop} ${docente.apellidom}`,
  }));

  const docentecorreo = docentes.map((docente) => ({
    value: docente.correo,
    label: `${docente.correo}`,
  }));

  //Construccion de la pagina
  return (
    <div>
      <Box>
        {docentecorreo.map((item, index) => (
          <Typography key={index}>{item.label}</Typography>
        ))}
      </Box>
    </div>
  );
}

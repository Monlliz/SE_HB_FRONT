import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { fetchAlumnoPost } from "../../services/alumnosService";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Box,
  CircularProgress,
  TextField,
  Select,
  MenuItem,
  Grid,
  InputLabel,
  FormControl,
} from "@mui/material";

function PostAlumno({ open, onClose, onAccept }) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para el envío
  const [error, setError] = useState(null);
  const { token } = useAuth();
  // Es mejor inicializar el estado del formulario como un objeto vacío

  const [formulario, setFormulario] = useState([]);
  //Cosas para el form
  const camposDeTexto = [
    { name: "matricula", label: "matricula" },
    { name: "nombres", label: "Nombre" },
    { name: "apellidop", label: "Apellido Paterno" },
    { name: "apellidom", label: "Apellido Materno" },
    { name: "correo", label: "Correo" },
  ];
  //Para el select
  const opcionesSelect = {
    ingles: [
      { value: "ENGLISH", label: "ENGLISH" },
      { value: "IHS", label: "IHS" },
    ],
    perfil: [
      { value: "BC", label: "BC" },
      { value: "FM", label: "FM" },
      { value: "QB", label: "QB" },
      { value: "EA", label: "EA" },
      { value: "SH", label: "SH" },
    ],
    grupo: [
      { value: "1A", label: "1A" },
      { value: "1B", label: "1B" },
      { value: "2A", label: "2A" },
      { value: "2B", label: "2B" },
      { value: "3A", label: "3A" },
      { value: "3B", label: "3B" },
      { value: "4A", label: "4A" },
      { value: "4B", label: "4B" },
      { value: "5A", label: "5A" },
      { value: "5B", label: "5B" },
      { value: "6A", label: "6A" },
      { value: "6B", label: "6B" },
    ],
    semestre: [
      { value: 1, label: 1 },
      { value: 2, label: 2 },
      { value: 3, label: 3 },
      { value: 4, label: 4 },
      { value: 5, label: 5 },
      { value: 6, label: 6 },
    ],
  };

  useEffect(() => {
    setFormulario({
      nombres: "",
      apellidop: "",
      apellidom: "",
      correo: "",
      ingles: "ENGLISH", // Puedes poner un valor por defecto
      perfil: "BC",
      grupo: "1A",
      semestre: 1,
    });
  }, [open, apiUrl]);

  // Para actualizar el useState del formulario
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormulario((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Función para enviar la actualización a la API
  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      const datosParaEnviar = {
        matricula: formulario.matricula,
        nombres: formulario.nombres,
        apellidoP: formulario.apellidop,
        apellidoM: formulario.apellidom,
        correo: formulario.correo,
        ingles: formulario.ingles,
        grupo: formulario.grupo,
        perfil: formulario.perfil,
        semestre: formulario.semestre,
      };
      console.log(datosParaEnviar);
      await fetchAlumnoPost(token, datosParaEnviar);
      alert("alumno dado de alta con éxito");
      onAccept(); // Llama a la función del padre para cerrar y/o refrescar
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
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
      // Contenedor principal
      <Grid container spacing={2}>
        {/* Fila #1: Contenedor para los campos de texto */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {camposDeTexto.map((campo) => (
              <Grid item xs={12} sm={6} key={campo.name}>
                <TextField
                  fullWidth
                  name={campo.name}
                  label={campo.label}
                  value={formulario[campo.name] || ""}
                  onChange={handleChange}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Fila #2: Contenedor para los menús de selección */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {/* Menú de Inglés */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Inglés</InputLabel>
                <Select
                  name="ingles"
                  value={formulario.ingles || ""}
                  label="Inglés"
                  onChange={handleChange}
                >
                  {opcionesSelect.ingles.map((opcion) => (
                    <MenuItem key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Menú de Perfil */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Perfil</InputLabel>
                <Select
                  name="perfil"
                  value={formulario.perfil || ""}
                  label="Perfil"
                  onChange={handleChange}
                >
                  {opcionesSelect.perfil.map((opcion) => (
                    <MenuItem key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Menú de Grupo */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Grupo</InputLabel>
                <Select
                  name="grupo"
                  value={formulario.grupo || ""}
                  label="Grupo"
                  onChange={handleChange}
                >
                  {opcionesSelect.grupo.map((opcion) => (
                    <MenuItem key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Menú de Semestre */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Semestre</InputLabel>
                <Select
                  name="semestre"
                  value={formulario.semestre || ""}
                  label="semestre"
                  onChange={handleChange}
                >
                  {opcionesSelect.semestre.map((opcion) => (
                    <MenuItem key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar alumno</DialogTitle>
      <DialogContent>
        <Box sx={{ marginTop: 2 }}>{renderContent()}</Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          onClick={handleUpdate}
          variant="contained"
          disabled={loading || isSubmitting}
          type="button"
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

export default PostAlumno;

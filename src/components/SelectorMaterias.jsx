import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  TextField,
  Autocomplete,
} from "@mui/material";

export default function SelectorMaterias({
  isDirector,
  docentesLista,
  docenteSeleccionadoId,
  setDocenteSeleccionadoId,
  setDocenteInfo,
  docenteInfo,
  materiasDocente,
  setMateriaSeleccionada,
}) {
  return (
    <Box p={3} sx={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* TÍTULO MINIMALISTA */}
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: 600, mb: 1, color: "text.primary" }}
      >
        {isDirector ? "Revisión de Planeaciones" : "Mis Materias"}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>
        {isDirector
          ? "Selecciona un docente para visualizar su carga académica y planeaciones semanales."
          : "Selecciona una materia para gestionar tu planeación semanal."}
      </Typography>

      {/* SELECTOR DE DOCENTE (SOLO DIRECTOR) - ESTILO PLANO/LIMPIO */}
      {isDirector && (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 6,
            borderRadius: 2,
            border: "1px solid #e0e0e0",
            backgroundColor: "#fff",
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <FormControl fullWidth variant="outlined" sx={{ minWidth: 300 }}>
          
                <Autocomplete
                  fullWidth
                  options={docentesLista}
                  getOptionLabel={(option) =>
                    ` ${option.apellidoP} ${option.apellidoM || ""} ${option.nombres}`
                  }
                  value={
                    docentesLista.find(
                      (d) => d.idDocente === docenteSeleccionadoId,
                    ) || null
                  }
                  onChange={(event, newValue) => {
                    if (newValue) {
                      setDocenteSeleccionadoId(newValue.idDocente);
                      setDocenteInfo(
                        `${newValue.nombres} ${newValue.apellidoP} ${newValue.apellidoM || ""}`.trim(),
                      );
                    } else {
                      setDocenteSeleccionadoId(null);
                      setDocenteInfo("");
                    }
                  }}
                  renderInput={(params) => (
                    <TextField {...params}  />
                  )}
                />
              </FormControl>
            </Grid>

            {/* INFORMACIÓN DEL DOCENTE MINIMALISTA */}
            <Grid item xs={12} md={5}>
              {docenteInfo && (
                <Box>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ letterSpacing: 1 }}
                  >
                    Docente Seleccionado
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 500, color: "text.primary" }}
                  >
                    {docenteInfo}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* RENDERIZADO DE MATERIAS */}
      {docenteSeleccionadoId ? (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Materias Asignadas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ({materiasDocente.length})
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {materiasDocente.length > 0 ? (
              materiasDocente.map((materia) => (
                <Grid item xs={12} sm={6} md={4} key={materia.iddm}>
                  <Card
                    elevation={0} // Quitamos la sombra estática para el minimalismo
                    sx={{
                      height: "100%",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      borderRadius: 2,
                      border: "1px solid #e0e0e0",
                      // MANTENEMOS EL EFECTO EXACTO QUE PEDISTE AL HACER HOVER
                      "&:hover": {
                        transform: "scale(1.03)",
                        boxShadow: "0 10px 20px rgba(0,0,0,0.12)",
                        borderColor: "primary.main",
                      },
                    }}
                    onClick={() => setMateriaSeleccionada(materia)}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                          fontWeight: 600,
                          minHeight: "3.5rem",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {materia.nombre}
                      </Typography>

                      <Box mt={3}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          Grupo:{" "}
                          <Typography
                            component="span"
                            fontWeight="500"
                            color="text.primary"
                          >
                            {materia.grupo}
                          </Typography>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Clave:{" "}
                          <Typography
                            component="span"
                            fontWeight="500"
                            color="text.primary"
                          >
                            {materia.clave}
                          </Typography>
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography
                  color="text.secondary"
                  sx={{ fontStyle: "italic", mt: 2 }}
                >
                  Este docente no tiene materias registradas para el ciclo
                  actual.
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      ) : (
        /* ESTADO VACÍO (SIN DOCENTE SELECCIONADO) */
        <Box sx={{ mt: 8, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" fontWeight="400">
            Aún no hay datos para mostrar.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

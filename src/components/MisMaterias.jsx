import React from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Grid,
  Tooltip,
} from "@mui/material";
import { BookOpenText as SubjectIcon, ArrowRightCircle } from "lucide-react";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ChecklistIcon from "@mui/icons-material/Checklist";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import { useNavigate } from "react-router-dom";

const MisMaterias = ({ materias = [] }) => {
  const navigate = useNavigate();
  const procesarNavegacion = (materia, rutaSimple, rutaPerfil) => {
    // Datos base que siempre van
    const baseData = {
      grupoId: materia.grupo,
      materiaClave: materia.clave,
      year: new Date().getFullYear(),
      nombreMateria: materia.nombre || materia.asignatura,
    };

    if (materia.grupo.length < 3) {
      navigate(rutaSimple, { state: baseData });
    } else {
      const [semestre, idNormalizado] = materia.grupo.split("-"); // Desestructuración limpia

      const perfilData = {
        ...baseData,
        semestre: semestre,
        idNormalizado: idNormalizado,
      };

      navigate(rutaPerfil, { state: perfilData });
    }
  };

    const handleNavigateToListaMateria = (materia) => {
    procesarNavegacion(
      materia,
      "/listaAsistencia",
      "/listaAsistencia",
    );
  };

  const handleNavigateToCalifacacionesParcilaes = (materia) => {
    procesarNavegacion(materia, "/rubros", "/rubrosperfil");
  };

  const handleNavigateToActividades = (materia) => {
    procesarNavegacion(materia, "/trabajo", "/trabajo");
  };

  const paperStyles = {
    backgroundColor: "secondary.light",
    borderRadius: "1.2rem", // Bordes muy redondeados
    padding: "2rem",
    width: { xs: "95%", md: "105%" },

    // 2. Centrado: Margen horizontal automático centra el bloque
    mx: "auto",
    boxShadow: 0, // Sin sombra
    mt: 2, // Margen superior para separarlo
  };

  const titleStyles = {
    fontSize: "2.5rem",
    fontWeight: 200,
    color: "primary.light",
    mb: 3,
    ml: 1,
  };
  // Si no hay materias, no mostramos nada (o podrías mostrar un mensaje de "Sin asignaciones")
  if (!materias || materias.length === 0) {
    return (
      <Paper elevation={0} sx={paperStyles}>
        {/* Título */}
        <Typography variant="h2" sx={titleStyles}>
          Mis Materias
        </Typography>

        {/* Contenido del Estado Vacío */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 6, // Espacio vertical
            opacity: 0.8, // Un poco de transparencia para que se vea sutil
          }}
        >
          <CategoryRoundedIcon
            sx={{ fontSize: 80, color: "primary.main", mb: 2 }}
          />
          <Typography
            variant="h3"
            sx={{
              color: "secondary.contrastText",
              fontWeight: 600,
              fontSize: "1.5rem",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            No tienes materias asignadas por el momento
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={paperStyles}>
      {/* Título con fuente estilo "cursiva" */}
      <Typography variant="h2" sx={titleStyles}>
        Mis Materias
      </Typography>

      {/*Scroll de materias */}
      <Box
        sx={{
          // Altura Máxima:(aprox 85px por tarjeta * 4 = ~340px)
          maxHeight: "5%",

          //Habilitar Scroll Vertical
          overflowY: "auto",

          // Ocultar Barra de Scroll (Scroll Invisible)
          "&::-webkit-scrollbar": { display: "none" }, // Chrome, Safari
          scrollbarWidth: "none", // Firefox
          "-ms-overflow-style": "none", // IE/Edge

          //Evitar corte de sombras (Padding interno y margen negativo para compensar)
          p: 1,
          mx: -1,
        }}
      >
        {/* Lista de Materias */}
        <Grid spacing={2} container>
          {materias.map((materia) => (
            <Grid item xs={12} key={materia.grupo} width={"100%"}>
              <Paper
                elevation={3}
                sx={{
                  backgroundColor: "primary.main",
                  color: "white",
                  borderRadius: "0.8rem",
                  padding: "0.7rem 1rem",
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  //justifyContent: "space-between",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 0.6rem 0.8rem rgba(0,0,0,0.2)",
                    cursor: "pointer",
                  },
                }}
              >
                {/* Izquierda: Icono y Nombre */}

                {/* Caja del Icono */}
                <Box
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderRadius: "0.5rem",
                    padding: "0.6rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <SubjectIcon size={24} color="white" />
                </Box>

                {/* Nombre de la Materia */}
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "0.065rem",
                    fontSize: { xs: "0.9rem", md: "1.1rem" },

                    flexGrow: 1, // Ocupa todo el espacio disponible en medio
                    textAlign: "center", // Centra el texto en ese espacio
                    px: 2,
                  }}
                >
                  {materia.nombre}
                </Typography>

                {/* Derecha: Asistentes y Flecha */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {/* Contador de Asistentes */}
                  <Box
                    sx={{
                      textAlign: "center",
                      minWidth: "80px",
                      display: { xs: "none", sm: "block" },
                    }}
                  >
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{ opacity: 0.7, fontSize: "0.7rem", lineHeight: 1 }}
                    >
                      GRUPO/PERFIL
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {materia.grupo}
                    </Typography>
                  </Box>

                  <Tooltip title="Lista de asistencia por materia">
                    <IconButton
                      aria-label="lista"
                      size="small" // Recomiendo small para que no ensanche mucho la tabla
                      sx={{ color: "white" }}
                      onClick={() => handleNavigateToListaMateria(materia)}
                    >
                      <ListAltIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Actividades cotidianas">
                    <IconButton
                      aria-label="actividades"
                      size="small"
                      sx={{ color: "#ff9800" }}
                      onClick={() => handleNavigateToActividades(materia)}
                    >
                      <AutoStoriesIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Calificaciones parciales">
                    <IconButton
                      aria-label="calificaciones_parciales"
                      size="small"
                      sx={{ color: "#4caf50" }}
                      onClick={() =>
                        handleNavigateToCalifacacionesParcilaes(materia)
                      }
                    >
                      <ChecklistIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>
  );
};

export default MisMaterias;

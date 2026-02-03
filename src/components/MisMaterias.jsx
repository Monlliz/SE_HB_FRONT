import React from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Grid,
  Tooltip,
} from "@mui/material";
import {
  BookOpenText as SubjectIcon,
  Users as GroupIcon
} from "lucide-react";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ChecklistIcon from "@mui/icons-material/Checklist";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import { useNavigate } from "react-router-dom";

const MisMaterias = ({ items = [], role = "Docente" }) => {
  const navigate = useNavigate();
  // --- CONFIGURACIÓN SEGÚN ROL ---
  const isPrefecto = role === "Prefecto";

  const config = {
    title: isPrefecto ? "Grupos" : "Mis Materias",
    emptyMessage: isPrefecto
      ? "No tienes grupos asignados"
      : "No tienes materias asignadas por el momento",
    MainIcon: isPrefecto ? GroupIcon : SubjectIcon,
  };

  // --- NAVEGACIÓN ---

  // 1. FUNCIÓN ESPECÍFICA PARA PREFECTO (Pase de lista general)
  const handleNavigateToListaGeneral = (item) => {
    // Navegamos a la ruta unificada SIN materiaClave -> Activa Modo General
    navigate("/listaAsistencia", {
      state: {
        grupoId: item.id, // Usamos el grupo del item actual
        year: new Date().getFullYear(),
      },
    });
  };

  // 2. FUNCIÓN PARA DOCENTE
  const procesarNavegacionDocente = (item, rutaSimple, rutaPerfil) => {
    const baseData = {
      grupoId: item.grupo,
      materiaClave: item.clave,
      year: new Date().getFullYear(),
      nombreMateria: item.nombre || item.asignatura,
    };

    if (item.grupo.length < 3) {
      navigate(rutaSimple, { state: baseData });
    } else {
      const [semestre, idNormalizado] = item.grupo.split("-");
      const perfilData = {
        ...baseData,
        semestre: semestre,
        idNormalizado: idNormalizado,
      };
      navigate(rutaPerfil, { state: perfilData });
    }
  };

  // Manejadores de Click (Docente)
  const handleNavigateToLista = (item) => {
    // Si es prefecto, usamos la general, si es docente, la específica
    if (isPrefecto) {
      handleNavigateToListaGeneral(item);
    } else {
      procesarNavegacionDocente(item, "/listaAsistencia", "/listaAsistencia");
    }
  };

  const handleNavigateToCalifacaciones = (item) => {
    procesarNavegacionDocente(item, "/rubros", "/rubrosperfil");
  };

  const handleNavigateToActividades = (item) => {
    procesarNavegacionDocente(item, "/trabajo", "/trabajo");
  };

  // --- ESTILOS BASE ---
  const paperStyles = {
    backgroundColor: "secondary.light",
    borderRadius: "1.2rem",
    padding: "2rem",
    width: { xs: isPrefecto ? "35%" : "95%", md: !isPrefecto ? "105%" : "35%" },
    mx: "auto",
    boxShadow: 0,
    mt: 2,
  };

  const titleStyles = {
    fontSize: "2.5rem",
    fontWeight: 200,
    color: "primary.light",
    mb: 3,
    ml: 1,
  };

  // --- RENDERIZADO VACÍO ---
  if (!items || items.length === 0) {
    return (
      <Paper elevation={0} sx={paperStyles}>
        <Typography variant="h2" sx={titleStyles}>
          {config.title}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 6,
            opacity: 0.8,
          }}
        >
          <CategoryRoundedIcon sx={{ fontSize: 80, color: "primary.main", mb: 2 }} />
          <Typography variant="h3" sx={{ color: "secondary.contrastText", fontWeight: 600, fontSize: "1.5rem", textTransform: "uppercase", textAlign: "center" }}>
            {config.emptyMessage}
          </Typography>
        </Box>
      </Paper>
    );
  }

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <Paper elevation={0} sx={paperStyles}>
      <Typography variant="h2" sx={titleStyles}>
        {config.title}
      </Typography>

      <Box
        sx={{
          maxHeight: "5%",
          minHeight: "300px",
          overflowY: "auto",
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
          "-ms-overflow-style": "none",
          p: 1,
          mx: -1,
        }}
      >
        <Grid spacing={2} container>
          {items.map((item, index) => (
            <Grid item xs={12} key={item.id || index} width={"100%"}>
              <Paper
                onClick={() => {
                  // SOLO si es prefecto, navega al hacer click en el icono
                  if (isPrefecto) handleNavigateToListaGeneral(item);
                }}
                elevation={3}
                sx={{
                  backgroundColor: "primary.main",
                  color: "white",
                  borderRadius: "0.8rem",
                  padding: "0.7rem 1rem",
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  cursor: isPrefecto ? "pointer" : "default",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 0.6rem 0.8rem rgba(0,0,0,0.2)",
                    //estilos prefecto
                    cursor: isPrefecto ? "pointer" : "default",
                    transition: "background-color 0.2s",
                    "&:hover": isPrefecto ? {
                      backgroundColor: "primary.light", // Efecto visual al pasar mouse
                    } : {}
                  },
                }}
              >
                {/* 1. ICONO IZQUIERDO (TRIGGER PARA PREFECTO) 
                    Aquí aplicamos la lógica que pediste
                */}
                
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
                    <config.MainIcon size={24} color="white" />
                  </Box>


                {/* 2. NOMBRE CENTRAL */}
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "0.065rem",
                    fontSize: { xs: isPrefecto ? "1.5rem" : "0.9rem", md: !isPrefecto ? "1.1rem" : "1.38rem" },
                    flexGrow: 1,
                    textAlign: "center",
                    px: 2,
                  }}
                >
                  {item.nombre || item.asignatura}
                </Typography>

                {/* 3. ACCIONES DERECHA */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>

                  {/* Subtexto Grupo (Solo Docente) */}
                  {!isPrefecto && (
                    <Box sx={{ textAlign: "center", minWidth: "80px", display: { xs: "none", sm: "block" } }}>
                      <Typography variant="caption" display="block" sx={{ opacity: 0.7, fontSize: "0.7rem", lineHeight: 1 }}>
                        GRUPO/PERFIL
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {item.grupo}
                      </Typography>
                    </Box>
                  )}

                  {/* Botones Extras (Solo Docente) */}
                  {!isPrefecto && (
                    <>
                      {/* Botón Lista */}
                      <Tooltip title="Lista de asistencia por materia">
                        <IconButton
                          aria-label="lista"
                          size="small"
                          sx={{ color: "white" }}
                          onClick={() => handleNavigateToLista(item)}
                        >
                          <ListAltIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Actividades cotidianas">
                        <IconButton
                          aria-label="actividades"
                          size="small"
                          sx={{ color: "#ff9800" }}
                          onClick={() => handleNavigateToActividades(item)}
                        >
                          <AutoStoriesIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Calificaciones parciales">
                        <IconButton
                          aria-label="calificaciones_parciales"
                          size="small"
                          sx={{ color: "#4caf50" }}
                          onClick={() => handleNavigateToCalifacaciones(item)}
                        >
                          <ChecklistIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
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
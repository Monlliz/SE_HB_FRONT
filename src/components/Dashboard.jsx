import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx"; // Contexto para la autenticación.
import EventDetailsDialog from "./modals/Calendario/EventDetailsDialog.jsx";

// Componentes de Material-UI
import {
  Grid,
  Box,
  Typography,
  Paper,
  Card,
  CardActionArea,
  CardContent,
  Badge,
} from "@mui/material";

// ¡Iconos de Lucide como pediste!
import { CalendarDays } from "lucide-react";

// Componentes de MUI X Date Pickers
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { es } from "date-fns/locale";
import { format } from "date-fns";

// Importa los enlaces de navegación
import { appLinks } from "../config/NavConfig.jsx";

//Servicio de fechas
import { fetchFechasGet } from "./services/fechasService.js";

//tipos de eventos
import { EVENT_TYPES } from "../data/eventTypes.jsx";
import CalendarAddButton from "./modals/Calendario/CalendarAddButton.jsx";
// Importa tu ilustración
// import MyIllustration from './path/to/your/illustration.png';
//Funcion para convertir a Title Case-------------------------------------
function toTitleCase(str) {
  if (!str) {
    return ""; // Devuelve un string vacío si la entrada es nula o vacía
  }

  // 1. Toma el primer carácter y ponlo en mayúscula.
  const firstLetter = str.charAt(0).toUpperCase();

  // 2. Toma el resto del string (desde la posición 1) y ponlo en minúsculas.
  const restOfString = str.slice(1).toLowerCase();

  // 3. Únelos.
  return firstLetter + restOfString;
}
//-----------------------------------------------------------------------
// Función para obtener los datos de la fecha
const getDatosFechas = (date, fechas) => {
  // Asegurarnos de que fechas sea un array antes de usar .find()
  if (!Array.isArray(fechas)) {
    return undefined;
  }

  return fechas.filter((fecha) => {
    // Comparamos el mes (0-11) + 1 con el mes de la API (1-12)
    const mesActual = date.getMonth();
    const diaActual = date.getDate();
    const yearActual = date.getFullYear();

    // Caso 1: Evento específico (ej: "Reunión", tiene año, mes y día)
    // Asumimos que tu API te da `ano` para estos eventos.
    if (fecha.yearf) {
      return (
        fecha.yearf === yearActual &&
        fecha.mes === mesActual &&
        fecha.dia === diaActual
      );
    }
    // Caso 2: Evento anual (ej: "Navidad", solo mes y día)
    return fecha.mes === mesActual && fecha.dia === diaActual;
  });

};


function DiaConBadge(props) {
  const { day, outsideCurrentMonth, fechas, onDayClick, ...other } = props;

  // 1. Obtenemos los datos de la fecha
  const datosFechas = !outsideCurrentMonth ? getDatosFechas(day, fechas) : [];
  const esImportante = datosFechas.length > 0;

  // 2. Color por defecto
  let colorDelBadge = "#3f51b5"; // color 'primary' por defecto

  if (esImportante) {
    // Encontramos el tipo prioritario (manteniendo tu orden original)
    const tipoPrioritario =
      datosFechas.find(f => f.tipo === "festivo") ||
      datosFechas.find(f => f.tipo === "noLaborable") ||
      datosFechas[0];

    // Buscamos el tipo dentro del JSON
    // Buscamos en EVENT_TYPES por clave (objeto, no array)
    const tipoConfig = EVENT_TYPES[tipoPrioritario.tipo?.toLowerCase()];

    if (tipoConfig && tipoConfig.color) {
      colorDelBadge = tipoConfig.color;
    }
  }

  // 2. Creamos el objeto `sx` para el Badge
  const badgeSx = {
    "& .MuiBadge-dot": {
      backgroundColor: colorDelBadge,
    },
  };

  // 4. Manejador de click
  const handleClick = (e) => {
    if (esImportante) {
      e.preventDefault(); // Previene selección normal
      onDayClick(day, datosFechas); // Abre el modal con los eventos
    }
  };

  // 5. Render
  return (
    <Badge
      key={day.toString()}
      overlap="circular"
      variant={esImportante ? "dot" : undefined}
      sx={esImportante ? badgeSx : {}}
    >
      <PickersDay
        {...other}
        outsideCurrentMonth={outsideCurrentMonth}
        day={day}
        onClick={handleClick}
      />
    </Badge>
  );
}

//----------------------------------------------------------------
function Dashboard() {
  // --- Añade el estado para la fecha seleccionada ---
  const [selectedDate, setSelectedDate] = useState(new Date());
  //Estado para fechas fetch
  const [fechas, setFechas] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();
  const fetchFechas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchFechasGet(token);
      setFechas(data.fechas);
    } catch (error) {
      console.error("Error al cargar fechas:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);


  //--------Estados y funciones para el modal de detalles de fecha -----
  // ======================================================================
  // AÑADIR ESTADO PARA EL MODAL
  // ======================================================================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEvents, setModalEvents] = useState([]);
  const [modalDate, setModalDate] = useState(null);

  //------------------------------------------------------------------------
  useEffect(() => {
    fetchFechas();
  }, [fetchFechas]);

  // ======================================================================
  // 2. AÑADIR MANEJADORES PARA EL MODAL
  // ======================================================================
  const handleDayClick = (day, events) => {
    setModalDate(day);
    setModalEvents(events);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Reseteamos por si acaso
    setModalEvents([]);
    setModalDate(null);
  };
  // ======================================================================

  //Validacion
  if (!user) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography>Cargando sesión...</Typography>
      </Box>
    );
  }

  // --- CÓDIGO PARA LA FECHA ACTUAL ---
  // 1. Obtener la fecha de hoy
  const today = new Date();

  // 2. Formatear el día de la semana (ej: "Martes")
  // Usamos 'es-MX' para español (puedes usar 'es' si prefieres)
  const dayFormatter = new Intl.DateTimeFormat("es-MX", { weekday: "long" });
  const dayOfWeek = toTitleCase(dayFormatter.format(today));

  // 3. Formatear el nombre del mes (ej: "Octubre")
  const monthFormatter = new Intl.DateTimeFormat("es-MX", { month: "long" });
  const monthName = toTitleCase(monthFormatter.format(today));

  // 4. Obtener el número del día (ej: 28)
  const dayOfMonth = today.getDate();
  // --- FIN DEL CÓDIGO DE FECHA ---

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box sx={{ flexGrow: 1, padding: 3, width: "100%" }}>
        <Grid
          container
          spacing={3}
          justifyContent="space-evenly"
          sx={{
            alignItems: "stretch",
          }}
        >
          {/* ====== 1. Banner Superior ====== */}
          <Grid item width={"100%"}>
            <Paper
              sx={{
                padding: "3% 3%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "primary.main", // Un azul claro
                borderRadius: "1rem",
                boxShadow: "none",
                //opacity: 0.9, // Control de transparencia general
              }}
            >
              <Typography variant="h4" sx={{ color: "white" }}>
                Hola, {user.username}
              </Typography>

              {/* Placeholder para tu ilustración */}
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                {/* Aquí pondrías tu componente de imagen.
                  Ej: <img src={MyIllustration} alt="Estudiando" style={{ height: '120px' }} /> 
                */}
                <Box
                  sx={{
                    width: 150,
                    height: 100,
                    backgroundColor: "primary.main",
                    borderRadius: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                ></Box>
              </Box>
            </Paper>
          </Grid>

          {/* ====== 2. Contenido Principal (3 columnas) ====== */}

          {/* --- Columna 1 (md={5}) --- */}
          <Grid item xs={12} sm={4} md={4}>
            <Paper
              sx={{ borderRadius: "1rem", backgroundColor: "secondary.light" }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "4% 4.5%",
                  borderBottom: "1.5px solid #eee",
                }}
              >
                <Typography
                  variant="h1"
                  fontWeight="400"
                  fontSize="1.5rem"
                  color="primary.main"
                >
                  Calendario
                </Typography>
              <CalendarAddButton onEventAdded={fetchFechas}/>
              </Box>

              <DateCalendar
                // Conecta el estado
                value={selectedDate}

                onChange={(newDate) => setSelectedDate(newDate)}
                // Usa el componente personalizado para renderizar los días
                slots={{
                  day: DiaConBadge,
                }}
                slotProps={{
                  day: {
                    fechas: fechas,
                    onDayClick: handleDayClick, // Pasa la función para abrir el modal
                  },
                }}
              />
            </Paper>
          </Grid>

          {/* --- Columna 2 (md={2}) --- */}
          <Grid
            item
            xs={12}
            sm={2}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Paper
              sx={{
                padding: "2rem 1.5rem",
                textAlign: "center",
                backgroundColor: "primary.main",
                // borderRadius: '16px', // Quita o comenta esta línea, clip-path lo sobrescribe en la parte inferior.
                position: "relative", // Mantén esto si el Paper se mueve o tiene otros elementos posicionados
                overflow: "hidden", // Asegura que el clip-path se aplique correctamente y no haya desbordamientos
                pb: "4rem",
                clipPath: "polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%)",
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                color="primary.contrastText"
              >
                {dayOfWeek}
              </Typography>
              <Typography
                variant="h3"
                fontWeight="bold"
                my={1}
                color="primary.contrastText"
              >
                {dayOfMonth}
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                color="primary.contrastText"
              >
                {monthName}
              </Typography>
            </Paper>
          </Grid>

          {/* --- Columna 3 (md={5}) --- */}
          <Grid item xs={12} sm={4} md={4}>
            <Grid
              container
              spacing={2}
              direction="column"
              xs={6} // 1x1 en Teléfonos (ocupa 12 de 12 columnas)
              sm={6} // 2x2 en Tablets (ocupa 6 de 12 columnas)
              md={12} // 1x1 en Desktop (ocupa 12 de 12 columnas)
              sx={{
                height: "50vh", // 1. Ocupa toda la altura
                overflowY: "auto", // 2. Permite el scroll
                flexWrap: "nowrap",

                // --- 3. TRUCO PARA OCULTAR LA BARRA DE SCROLL ---
                // Para Webkit (Chrome, Safari, Edge)
                "&::-webkit-scrollbar": {
                  display: "none",
                },
                // Para Firefox
                scrollbarWidth: "none",
                // Para IE
                "-ms-overflow-style": "none",
              }}
            >
              {appLinks.map((link) => (
                <Grid item key={link.label}>
                  <Card
                    sx={{
                      borderRadius: "1rem",
                      backgroundColor: "secondary.light",
                    }}
                  >
                    <CardActionArea
                      component={Link}
                      to={link.href}
                      sx={{ padding: "0.8rem" }}
                    >
                      <CardContent
                        sx={{ display: "flex", alignItems: "center", gap: 3 }}
                      >
                        <Box sx={{ color: "primary.main" }}>{link.icon}</Box>
                        <Typography
                          variant="h1"
                          fontSize="1.2rem"
                          fontWeight="400"
                          color="primary.main"
                        >
                          {toTitleCase(link.label)}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Box>
      <EventDetailsDialog
        open={isModalOpen}
        onClose={handleCloseModal}
        date={modalDate}
        events={modalEvents}
      />
     
    </LocalizationProvider>
  );
}

export default Dashboard;

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx"; // Contexto para la autenticación.
import EventDetailsDialog from "../components/modals/Calendario/EventDetailsDialog.jsx";
import EventTicker from "../components/EventTicker.jsx";
import { capitalizarPrimeraLetra, getFirstText,capitalizarCadaPalabra } from '../utils/fornatters.js';
//Mis materias
import MisMaterias from "../components/MisMaterias.jsx";
import { fetchDocenteMaterias } from "../services/docenteService.js";
import { fetchGrupoGet } from "../services/grupoService.js";
//Notificaciones--Eventos
import { useNotification } from "../components/modals/NotificationModal.jsx";
import ConfirmModal from "../components/modals/ConfirmModal.jsx";
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
import { fetchFechasGet, fetchDeleteEvent } from "../services/fechasService.js";
import { fetchDocenteGet } from "../services/docenteService.js";


//tipos de eventos
import { EVENT_TYPES } from "../data/eventTypes.jsx";
import CalendarAddButton from "../components/modals/Calendario/CalendarAddButton.jsx";

import BirthdayCelebration from "./BirthdayCelebration.jsx";
// Importa tu ilustración
// import MyIllustration from './path/to/your/illustration.png';

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
    const tipoConfig = EVENT_TYPES[tipoPrioritario.tipo];

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
  //Estado para fechas fetch--------------------------
  const [fechas, setFechas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [docentes, setDocentes] = useState([]);
  //------------------------------------------------------
  //Inicio de sesion y restriccion de cosas
  const { user, token, isDocente, isPrefecto } = useAuth();

  // --- 2. ESTADO PARA MATERIAS (Solo para docentes) ---
  const [materias, setMaterias] = useState([]);
//-------------------------------------------------------
  
    // --- FUNCIÓN UNIFICADA PARA CARGAR DATOS ---
  const fetchDatosDashboard = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      // 1. Ejecutamos ambas peticiones en paralelo para optimizar tiempo
      const [fechasData, docentesData] = await Promise.all([
        fetchFechasGet(token),
        fetchDocenteGet(token).catch(err => {
            console.error("Error al cargar docentes:", err);
            return { docentes: [] }; // Fallback para que no rompa si falla docentes
        })
      ]);

      const eventosCalendario = fechasData.fechas || [];
      const listaDocentes = docentesData.docentes || [];

      // Guardamos la lista de docentes por si se usa en otro lado
      const docentesOrdenados = [...listaDocentes].sort((a, b) => {
         return a.apellidop.localeCompare(b.apellidop);
      });
      setDocentes(docentesOrdenados);

      // 2. PROCESAR CUMPLEAÑOS
      const birthdayEvents = listaDocentes
        .filter(docente => docente.activo && docente.birthday) // Solo activos y con fecha
        .map(docente => {
            // Formato esperado: "2003-10-31T07:00:00.000Z"
            // Usamos split para evitar problemas de zona horaria del navegador
            const dateParts = docente.birthday.split('T')[0].split('-');
            const mes = parseInt(dateParts[1], 10) - 1; // Mes en JS es 0-11
            const dia = parseInt(dateParts[2], 10);

            return {
                id: `${docente._id}`,
                mes: mes,
                dia: dia,
                // Sin yearf para que se repita anualmente
                etiqueta: `🎉 Cumpleaños de  ${capitalizarCadaPalabra(docente.nombres +" "+ docente.apellidop)} 🎉`,
                tipo: 'birthday'
            };
        });

      // 3. COMBINAR EVENTOS
      setFechas([...eventosCalendario, ...birthdayEvents]);

    } catch (error) {
      console.error("Error general al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);
  //----------------------------------------------------------------------------
  // ======================================================================
  //  ELIMINAR EVENTO
  // ======================================================================
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);
  // A. Función que se llama al dar click en el bote de basura (Abre el Modal)
  const handleRequestDelete = (event) => {
    setEventToDelete(event);
    setIsConfirmOpen(true);
  };

  // B. Función que ejecuta el borrado real (Se pasa al ConfirmModal)
  const handleExecuteDelete = async () => {
    if (!eventToDelete) return;

    setIsDeletingEvent(true);
    try {
      const idEvento = eventToDelete.id;

      // 1. Llamada a la API
      await fetchDeleteEvent(token, idEvento);

      // 2. Actualizar estado GLOBAL (Calendario)
      await fetchDatosDashboard();

      // 3. Actualizar estado LOCAL (Lista dentro del EventDetailsDialog)
      setModalEvents((prevEvents) =>
        prevEvents.filter((e) => (e.id || e.id_fecha) !== idEvento)
      );

      // 4. Cerrar el modal de confirmación y limpiar
      setIsConfirmOpen(false);
      setEventToDelete(null);

    } catch (error) {
      console.error("Error eliminando:", error);
      useNotification(`Error: ${error.message}`, "error");
    } finally {
      setIsDeletingEvent(false);
    }
  };

  //--------Estados y funciones para el modal de detalles de fecha -----
  // ======================================================================
  // AÑADIR ESTADO PARA EL MODAL
  // ======================================================================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEvents, setModalEvents] = useState([]);
  const [modalDate, setModalDate] = useState(null);

  // ======================================================================
  //Fetch de materias si es docente
  const fetchMaterias = useCallback(async () => {
    if (!isDocente || !token) return;
    try {
      if (!token) {
        throw new Error("Autorización rechazada. No se encontró el token.");
      }
      //setSelectedMateriaClave(null);

      const { materias } = await fetchDocenteMaterias(token, user.iddocente);
      setMaterias(materias.materias || []);
    } catch (err) {
      console.error(err);
      setMaterias([]); // En caso de error, asegurar que materias es un array vacío
    }
  }, [user.iddocente]);
  //-----------------------------------------------------------------------
  //GRUPOS PREFECTO
  //---------------------------------------------------------------------
  const [gruposPrefecto, setGruposPrefecto] = useState([]);
  const fetchGruposPrefecto = useCallback(async () => {
    // Si no es prefecto o no hay token, no hacemos nada
    if (!isPrefecto || !token) return;

    setLoading(true);
    try {
      // 1. Solo llamamos a Grupos
      const { grupos } = await fetchGrupoGet(token);

      // 2. Definir si estamos en periodo PAR (Enero-Julio) o IMPAR (Agosto-Diciembre)
      const mesActual = new Date().getMonth(); // 0 = Enero, 6 = Julio
      const esPeriodoPar = mesActual <= 6; // true si es Ene-Jul

      const idGrupoOcultar = ["EG", "BI"];

      const gruposFiltrados = grupos.filter((grupo) => {
        // A. Ignorar los grupos prohibidos
        if (idGrupoOcultar.includes(grupo.idgrupo)) return false;

        // B. Obtener el número del semestre (ej: de "3B" saca el 3)
        // Asumimos que el primer caracter es el número
        const numeroSemestre = parseInt(grupo.idgrupo.charAt(0));

        // Si por alguna razón el grupo no empieza con número (ej: "ADM"), lo filtramos o lo dejas (depende de ti)
        if (isNaN(numeroSemestre)) return false;

        // C. Lógica de Par/Impar
        const esSemestrePar = numeroSemestre % 2 === 0;

        // Si es periodo Par, queremos semestres Pares.
        // Si es periodo Impar (else), queremos semestres Impares.
        return esPeriodoPar ? esSemestrePar : !esSemestrePar;
      });

      // 3. Formatear para que MisMaterias lo entienda
      // MisMaterias espera objetos con 'nombre' o 'asignatura' para el texto grande
      const gruposMapeados = gruposFiltrados.map(g => ({
        id: g.idgrupo,
        nombre: g.idgrupo, // Para que salga "3B" en grande
        //grupo: `Semestre ${g.grado}`, // Texto pequeño (opcional)
        // ... otros datos que necesites
      }));

      setGruposPrefecto(gruposMapeados);
    } catch (error) {
      console.error("Error cargando grupos:", error);
    } finally {
      setLoading(false);
    }
  }, [token, user.nombre_rol]);
  // ======================================================================
  useEffect(() => {
    fetchDatosDashboard();
    isDocente ? fetchMaterias() : null;
    isPrefecto ? fetchGruposPrefecto() : null;
  }, [fetchDatosDashboard]);

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
  const dayOfWeek = capitalizarPrimeraLetra(dayFormatter.format(today));

  // 3. Formatear el nombre del mes (ej: "Octubre")
  const monthFormatter = new Intl.DateTimeFormat("es-MX", { month: "long" });
  const monthName = capitalizarPrimeraLetra(monthFormatter.format(today));

  // 4. Obtener el número del día (ej: 28)
  const dayOfMonth = today.getDate();
  // --- FIN DEL CÓDIGO DE FECHA ---


  // Filtrar los eventos para hoy
  const todaysEvents = loading ? [] : getDatosFechas(today, fechas);

  const existsingEvents = Array.isArray(todaysEvents) && todaysEvents.length > 0;


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
                backgroundColor: "primary.main",
                borderRadius: "1rem",
                boxShadow: "none",
                //opacity: 0.9, // Control de transparencia general
              }}
            >
              <Typography variant="h4" sx={{ color: "white" }}>
                Hola,  {capitalizarPrimeraLetra(getFirstText(user.username))}
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
                  padding: "3% 4.5%",
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
                <CalendarAddButton onEventAdded={fetchDatosDashboard} />
              </Box>

              <DateCalendar
                // Conecta el estado
                value={selectedDate}
                sx={{
                  // Apunta a la clase CSS del label del header
                  ".MuiPickersCalendarHeader-label": {
                    textTransform: "capitalize", // Pone la primera letra en mayúscula
                  },

                }}
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


          {/* --- Columna 2 (Ticker Y Fecha) --- */}
          <Grid
            item
            xs={12}
            sm={4}
            md={4}
            sx={{
              display: "flex",
              flexDirection: "column", // <-- CAMBIO: Apila verticalmente
              alignItems: "center",
              justifyContent: "flex-start", // <-- CAMBIO: Alinea arriba
              gap: 4, // <-- CAMBIO: Añade espacio entre los items
              maxWidth: "40%",
              minWidth: existsingEvents
                ? { xs: "100%", sm: "40%" } // Si hay eventos (Ancho total o el que necesites)
                : { xs: "100%", sm: "20%" },
              overflow: "hidden" // Seguridad extra
            }}
          >
            {/* --- 2a. BARRA DE NOTIFICACIONES (NUEVA POSICIÓN) --- */}
            <Box sx={{

              width: existsingEvents
                ? { xs: "100%", sm: "90%" } // Si hay eventos (Ancho total o el que necesites)
                : { xs: "100%", sm: "98%" }
            }}>
              <EventTicker events={todaysEvents} />
            </Box>

            {/* --- 2b. Tarjeta de Fecha --- */}
            <Paper
              sx={{
                padding: "2rem 1.5rem",
                textAlign: "center",
                backgroundColor: "primary.main",
                position: "relative",
                overflow: "hidden",
                pb: "4rem",
                clipPath: "polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%)",
                width: existsingEvents
                  ? { xs: "100%", sm: "40%", lg: "30%" }
                  : { xs: "90%", sm: "60%", lg: "60%" },
              }}
            >
              <Typography
                variant="h6"
                //fontWeight="bold"
                fontFamily="Abyssinica SIL, serif"
                color="primary.contrastText"
              >
                {dayOfWeek}
              </Typography>
              <Typography
                variant="h3"
                fontWeight="bold"
                fontFamily="Abyssinica SIL, serif"
                my={1}
                color="primary.contrastText"
              >
                {dayOfMonth}
              </Typography>
              <Typography
                variant="h6"
                //fontWeight="bold"
                fontFamily="Abyssinica SIL, serif"
                color="primary.contrastText"
              >
                {monthName}
              </Typography>
            </Paper>
          </Grid>

          {/* --- Columna 3 navegacion --- */}
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
                paddingBottom: '1.2rem ',
                marginBottom: '1rem ',
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
              {appLinks
                .filter((link) => {
                  // 1. Ocultar SIEMPRE la etiqueta "INICIO"
                  if (link.label === "INICIO") return false;

                  // 2. Ocultar "GRUPOS" solo si es docente
                  if (isDocente && link.label === "GRUPOS") return false;

                  // Mostrar el resto
                  return true;
                })
                .map((link) => {
                  // Definimos el componente del icono antes del return
                  const IconComponent = link.icon;

                  return (
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
                            <Box sx={{ color: "primary.main" }}>
                              {/* Renderizamos el icono como componente con tamaño */}
                              <IconComponent size={50} />
                            </Box>
                            <Typography
                              variant="h1"
                              fontSize="1.2rem"
                              fontWeight="400"
                              color="primary.main"
                            >
                              {capitalizarPrimeraLetra(link.label)}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  );
                })}
            </Grid>
          </Grid>
          {isDocente && (
            <Grid item xs={12}>
              {/* Pasamos el array de materias al componente */}
              <MisMaterias items={materias} />
            </Grid>
          )}
          {/* CASO PREFECTO  */}
          {isPrefecto && (
            <Grid item xs={12}>
              <MisMaterias
                items={gruposPrefecto} // Le pasamos los grupos filtrados
                role="Prefecto"
              />
            </Grid>
          )}
        </Grid>

      </Box>
      <EventDetailsDialog
        open={isModalOpen}
        onClose={handleCloseModal}
        date={modalDate}
        events={modalEvents}
        onDeleteEvent={handleRequestDelete}
      />
      {/*MODAL DE CONFIRMACIÓN */}
      <ConfirmModal
        open={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setEventToDelete(null);
        }}
        onConfirm={handleExecuteDelete}
        isLoading={isDeletingEvent}
        title="ELIMINAR EVENTO"
        message={
          <span>
            ¿Estás seguro de eliminar el evento <strong>{eventToDelete?.etiqueta}</strong>?
          </span>
        }
      />
      {/* MODAL DE CELEBRACIÓN DE CUMPLEAÑOS */}
      {user?.birthday !="" && user?.nombres !="" && (
        <BirthdayCelebration
          userBirthday={user?.birthday}
          userName={user?.nombres}
        /> 
      )}
    </LocalizationProvider>
  );
}

export default Dashboard;

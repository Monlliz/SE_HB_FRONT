import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// Componentes de Material-UI
import { Grid, Box, Typography, Paper, Card, CardActionArea, CardContent, IconButton, Badge, Tooltip } from '@mui/material';


// ¡Iconos de Lucide como pediste!
import { CalendarDays } from 'lucide-react';

// Componentes de MUI X Date Pickers
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';

// Importa los enlaces de navegación
import { appLinks } from '../config/NavConfig.jsx';
// --- fechas importantes aquí ---
import { fechasImportantes } from '../config/dates.js';
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


/**
 * Función helper para verificar si un día es importante (chequeo anual)
 */
const getDatosFecha = (date) => {
    // .find() devuelve el primer elemento que coincide, o undefined
    return fechasImportantes.find(
        (fecha) => fecha.month === date.getMonth() && fecha.day === date.getDate()
    );
};

/**
 * Componente personalizado para renderizar cada día
 * Usará un Badge para marcar los días importantes
 */
// (La función getDatosFecha sigue igual que antes)
    const name = JSON.parse( localStorage.getItem("user")).username;
    
/**
 * Componente de Día actualizado con Tooltip y Colores
 */
function DiaConBadge(props) {
    const { day, outsideCurrentMonth, ...other } = props;

    // 1. Obtenemos los datos de la fecha
    const datosFecha = !outsideCurrentMonth ? getDatosFecha(day) : null;
    const esImportante = !!datosFecha;

    let colorDelBadge = 'primary';
    if (esImportante) {
        switch (datosFecha.type) {
            case 'festivo':
                colorDelBadge = 'error';
                break;
            case 'noLaborable':
                colorDelBadge = 'warning';
                break;
            case 'evento':
                colorDelBadge = 'secondary';
                break;
            default:
                colorDelBadge = 'primary';
        }
    }

    // 2. Creamos el componente base (Badge + PickersDay)
    //    PickersDay DEBE recibir las props {...other} para funcionar
    const diaRenderizado = (
        <Badge
            key={props.day.toString()}
            overlap="circular"
            color={colorDelBadge}
            variant={esImportante ? 'dot' : undefined}
        >
            <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
        </Badge>
    );

    // 3. Si es importante, lo envolvemos en un Tooltip
    //    Si no es importante, lo devolvemos tal cual.
    if (esImportante) {
        return (
            <Tooltip title={datosFecha.label} arrow>
                {/* El Tooltip envuelve al Badge. 
                  MUI está diseñado para que esto funcione sin perder los clics.
                */}
                {diaRenderizado}
            </Tooltip>
        );
    }

    // Si no es importante, se devuelve sin Tooltip
    return diaRenderizado;
}
function Dashboard() {
    // --- Añade el estado para la fecha seleccionada ---
    const [selectedDate, setSelectedDate] = useState(new Date());
    // --- CÓDIGO PARA LA FECHA ACTUAL ---
    // 1. Obtener la fecha de hoy
    const today = new Date();

    // 2. Formatear el día de la semana (ej: "Martes")
    // Usamos 'es-MX' para español (puedes usar 'es' si prefieres)
    const dayFormatter = new Intl.DateTimeFormat('es-MX', { weekday: 'long' });
    const dayOfWeek = toTitleCase(dayFormatter.format(today));

    // 3. Formatear el nombre del mes (ej: "Octubre")
    const monthFormatter = new Intl.DateTimeFormat('es-MX', { month: 'long' });
    const monthName = toTitleCase(monthFormatter.format(today));

    // 4. Obtener el número del día (ej: 28)
    const dayOfMonth = today.getDate();
    // --- FIN DEL CÓDIGO DE FECHA ---
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ flexGrow: 1, padding: 3, width: '100%' }}>
                <Grid container spacing={3} justifyContent="space-evenly" sx={{
                    alignItems: 'stretch'
                }}>

                    {/* ====== 1. Banner Superior ====== */}
                    <Grid item width={"100%"}>
                        <Paper
                            sx={{
                                padding: '3% 3%',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: 'primary.main', // Un azul claro
                                borderRadius: '1rem',
                                boxShadow: 'none',
                                //opacity: 0.9, // Control de transparencia general

                            }}
                        >
                            <Typography variant="h4" sx={{ color: 'white' }}>
                                Hola, {name}
                            </Typography>

                            {/* Placeholder para tu ilustración */}
                            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                                {/* Aquí pondrías tu componente de imagen.
                  Ej: <img src={MyIllustration} alt="Estudiando" style={{ height: '120px' }} /> 
                */}
                                <Box
                                    sx={{
                                        width: 150,
                                        height: 100,
                                        backgroundColor: 'primary.main',
                                        borderRadius: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white'
                                    }}
                                >
                                    
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* ====== 2. Contenido Principal (3 columnas) ====== */}

                    {/* --- Columna 1 (md={5}) --- */}
                    <Grid item xs={12} sm={4} md={4} >
                        <Paper sx={{ borderRadius: '1rem',   backgroundColor:'secondary.light', }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '4% 4.5%',
                                    borderBottom: '1.5px solid #eee'
                                }}
                            >
                                <Typography
                                    variant="h1"
                                    fontWeight="400"
                                    fontSize="1.5rem"
                                    color='primary.main'>
                                    Calendario
                                </Typography>
                                <Box sx={{ color: 'primary.main' }}>
                                    <CalendarDays />
                                </Box>
                            </Box>

                            <DateCalendar
                                // Conecta el estado
                                value={selectedDate}
                                onChange={(newDate) => setSelectedDate(newDate)}

                                // Usa el componente personalizado para renderizar los días
                                slots={{
                                    day: DiaConBadge,
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
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Paper
                            sx={{
                                padding: '2rem 1.5rem',
                                textAlign: 'center',
                                backgroundColor: 'primary.main',
                                // borderRadius: '16px', // Quita o comenta esta línea, clip-path lo sobrescribe en la parte inferior.
                                position: 'relative', // Mantén esto si el Paper se mueve o tiene otros elementos posicionados
                                overflow: 'hidden',   // Asegura que el clip-path se aplique correctamente y no haya desbordamientos
                                pb: '4rem',
                                clipPath: 'polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%)',

                            }}
                        >
                            <Typography variant="h6" fontWeight="bold" color='primary.contrastText'>{dayOfWeek}</Typography>
                            <Typography variant="h3" fontWeight="bold" my={1} color='primary.contrastText'>{dayOfMonth}</Typography>
                            <Typography variant="h6" fontWeight="bold" color='primary.contrastText'>{monthName}</Typography>
                        </Paper>
                    </Grid>

                    {/* --- Columna 3 (md={5}) --- */}
                    <Grid item xs={12} sm={4} md={4}>
                        <Grid container spacing={2} direction="column" xs={6}   // 1x1 en Teléfonos (ocupa 12 de 12 columnas)
                            sm={6}    // 2x2 en Tablets (ocupa 6 de 12 columnas)
                            md={12}   // 1x1 en Desktop (ocupa 12 de 12 columnas)
                            sx={{
                                height: '50vh',          // 1. Ocupa toda la altura
                                overflowY: 'auto',      // 2. Permite el scroll
                                flexWrap: 'nowrap',
                              
                                // --- 3. TRUCO PARA OCULTAR LA BARRA DE SCROLL ---
                                // Para Webkit (Chrome, Safari, Edge)
                                '&::-webkit-scrollbar': {
                                    display: 'none'
                                },
                                // Para Firefox
                                scrollbarWidth: 'none',
                                // Para IE
                                '-ms-overflow-style': 'none'
                            }}>

                            {appLinks.map((link) => (
                                <Grid item key={link.label}>
                                    <Card sx={{ borderRadius: '1rem',   backgroundColor:'secondary.light'}}>
                                        <CardActionArea
                                            component={Link}
                                            to={link.href}
                                            sx={{ padding: '0.8rem' }}
                                        >
                                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                                <Box sx={{ color: 'primary.main' }}>
                                                    {link.icon}
                                                </Box>
                                                <Typography variant="h1" fontSize="1.2rem" fontWeight="400" color='primary.main'>
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
        </LocalizationProvider >
    );
}

export default Dashboard;
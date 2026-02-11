import {
  Event,
  Flag,
  School,
  Work,
  Celebration,
  Block,
  MenuBook,
  WbSunny,
  People,
  EmojiEvents,
  AssignmentTurnedIn,
  Campaign,
  Cake,
} from "@mui/icons-material";

export const EVENT_TYPES = {
  // --- ACADÉMICOS ---
  academico: {
    color: "#1976d2",
    icon: School, 
    label: "Académico",
    descripcion: "Actividades escolares, exámenes o evaluaciones."
  },

  // --- ADMINISTRATIVOS ---
  administrativo: {
    color: "#6d4c41",
    icon: Work, 
    label: "Administrativo",
    descripcion: "Eventos internos del personal docente o administrativo."
  },

  // --- CÍVICOS / CONMEMORATIVOS ---
  civico: {
    color: "#2e7d32",
    icon: Flag, 
    label: "Cívico",
    descripcion: "Actos patrios o conmemoraciones institucionales."
  },

  conmemoracion: {
    color: "#0288d1",
    icon: Celebration, 
    label: "Conmemoración",
    descripcion: "Fechas simbólicas que se recuerdan o celebran."
  },

  // --- EVENTOS GENERALES ---
  evento: {
    color: "#9c27b0",
    icon: Campaign, 
    label: "Evento escolar",
    descripcion: "Ferias, concursos o exposiciones organizadas por la institución."
  },

  // --- FERIADOS Y DESCANSOS ---
  festivo: {
    color: "#f44336",
    icon: Event, 
    label: "Festivo",
    descripcion: "Día feriado oficial con suspensión de actividades."
  },

  noLaborable: {
    color: "#ff9800",
    icon: Block, 
    label: "No laborable",
    descripcion: "Día sin clases o labores, determinado por la institución."
  },

  receso: {
    color: "#00bcd4",
    icon: WbSunny, 
    label: "Receso escolar",
    descripcion: "Períodos prolongados de vacaciones o descanso."
  },

  // --- FORMATIVOS / DEPORTIVOS ---
  formativo: {
    color: "#4caf50",
    icon: MenuBook, 
    label: "Formativo / Capacitación",
    descripcion: "Capacitaciones o desarrollo profesional docente."
  },

  deportivo: {
    color: "#e91e63",
    icon: EmojiEvents, 
    label: "Deportivo / Recreativo",
    descripcion: "Actividades físicas, deportivas o de integración."
  },

  evaluacion: {
    color: "#673ab7",
    icon: AssignmentTurnedIn, 
    label: "Evaluación",
    descripcion: "Valoración de desempeño académico o administrativo."
  },

  birthday: {
    color: "#e82774",
    icon: Cake, 
    label: "Cumpleaños",
    descripcion: "Cumpleaños del personal de preparatoria"
  },

  // --- DEFAULT ---
  default: {
    color: "#607d8b",
    icon: People, // Users → People
    label: "Otro",
    descripcion: "Eventos generales o sin tipo definido."
  }
};
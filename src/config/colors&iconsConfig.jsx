//NuevaAsistencia.jsx - Modal=========================================================== 
import { ListChecks, Check, X, Clock, Clock8 } from 'lucide-react';
 // Asegúrate de tener estos iconos

// Colores semánticos para los botones
export const STATUS_COLORS = {
  asistio: { main: "#2e7d32", light: "#e8f5e9", label: "Asistencia" },
  falta: { main: "#d32f2f", light: "#ffebee", label: "Falta" },
  demorado: { main: "#ed6c02", light: "#fff3e0", label: "Retardo" },
  antes: { main: "#1976d2", light: "#e3f2fd", label: "Antes de tiempo" },
};

export const OPCIONES_ASISTENCIA = [
  { value: "asistio", label: "A", icon: Check, colorKey: "asistio" },
  { value: "falta", label: "F", icon: X, colorKey: "falta" },
  { value: "demorado", label: "R", icon: Clock, colorKey: "demorado" },
  { value: "antes", label: "A", icon: Clock8, colorKey: "antes" },
];

//FIN NuevaAsistencia.jsx - Modal===========================================================
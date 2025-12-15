import {
    KeyRound,
    Calendar1,
    BookA,
    CalendarDays,
    ClipboardList
} from 'lucide-react';
// Definición de los campos para el formulario de materias CREATE
export const camposNuevaMateria = [
    { name: "clave", label: "Clave", type: "text", required: true, maxLength: 8, minLength: 8, icon: KeyRound, pattern: "^[A-Za-z0-9]*$", errorMessage: "La clave debe contener solo letras y números.", unique: true },
    { name: "asignatura", label: "Nombre", type: "text", required: true, maxLength: 95, icon: BookA, pattern: "^(?!.*[-_]{2})(?!.*[-_]$)(?!^[-_])(?=(?:[^()]*\\([^()]*\\))*[^()]*$)[A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9][A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9\\s_\\-()]*$", errorMessage: "El nombre puede contener letras, números, espacios, guiones, guiones bajos y paréntesis. No puede empezar/terminar con -_ ni contener -_ consecutivos." },
    {
        name: "perfil_id", label: "Perfil", type: "select", required: true, icon: ClipboardList, options: [
            { id: "BC", label: "Sin Perfil" },
            { id: "FM", label: "Físico Matematico" },
            { id: "QB", label: "Químico Biologico" },
            { id: "EA", label: "Económico Administrativo" },
            { id: "SH", label: "Sociales y Humanidades" },
        ]
    },
    { name: "yearm", label: "Año cohorte", type: "text", required: true, maxLength: 4, minLength: 4, icon: CalendarDays, pattern: "^[0-9]*$", errorMessage: "El año debe contener solo números." },
    {
        name: "semestre", label: "Semestre", type: "select", required: true, icon: Calendar1,
        options: [
            { id: 1, label: "1" },
            { id: 2, label: "2" },
            { id: 3, label: "3" },
            { id: 4, label: "4" },
            { id: 5, label: "5" },
            { id: 6, label: "6" },
        ]
    }
];
// Definición de los campos para el formulario de materias EDIT
export const camposEditMateria = [
    { name: "clave", label: "Clave", type: "text", icon: KeyRound, disable: true, unique: true },
    { name: "asignatura", label: "Nombre", type: "text", required: true, icon: BookA, pattern: "^(?!.*[-_]{2})(?!.*[-_]$)(?!^[-_])(?=(?:[^()]*\\([^()]*\\))*[^()]*$)[A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9][A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9\\s_\\-()]*$", errorMessage: "El nombre puede contener letras, números, espacios, guiones, guiones bajos y paréntesis. No puede empezar/terminar con -_ ni contener -_ consecutivos." },
    {
        name: "perfil_id", label: "Perfil", type: "select", disable: true, icon: ClipboardList, options: [
            { id: "BC", label: "Sin Perfil" },
            { id: "FM", label: "Físico Matematico" },
            { id: "QB", label: "Químico Biologico" },
            { id: "EA", label: "Económico Administrativo" },
            { id: "SH", label: "Sociales y Humanidades" },
        ]
    },
    { name: "yearm", label: "Año cohorte", type: "text", disable: true, icon: CalendarDays, pattern: "^[0-9]*$" },
    {
        name: "semestre", label: "Semestre", type: "select", disable: true, icon: Calendar1,
        options: [

        ]
    }
];
//semestres
export const semestres = ["1", "2", "3", "4", "5", "6"];

//perfiles
export const perfiles = [
    { id: "BC", label: "Sin Perfil" },
    { id: "FM", label: "Físico Matematico" },
    { id: "QB", label: "Químico Biologico" },
    { id: "EA", label: "Económico Administrativo" },
    { id: "SH", label: "Sociales y Humanidades" }
];
// Definición de las columnas para la tabla de materias
export const headCells = [
    { id: "clave", label: "Clave", width: "15%" },
    { id: "asignatura", label: "Nombre", width: "45%" },
    { id: "semestre", label: "Semestre", width: "10%" },
    { id: "perfil", label: "Perfil", width: "10%" },
    { id: "year", label: "Año cohorte", width: "10%" },
];
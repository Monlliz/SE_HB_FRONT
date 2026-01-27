//------------DOCENTE----------------------------------------------
import { User, Mail, Calendar } from "lucide-react"; // O los iconos que uses
// Definición de los campos para el formulario de nuevo docente
export const camposNuevoDocente = [
    {
        name: "nombres",
        label: "Nombre",
        type: "text",
        required: true,
        icon: User, // Icono opcional
    },
    {
        name: "apellidop",
        label: "Apellido Paterno",
        type: "text",
        required: true,
        icon: User,
    },
    {
        name: "apellidom",
        label: "Apellido Materno",
        type: "text",
        required: true,
        icon: User,
    },
    {
        name: "correo",
        label: "Correo Institucional",
        type: "email", // O "email"
        required: true,
        icon: Mail,
        // AQUÍ TRADUCIMOS TU VALIDACIÓN DE @colegioherbart.edu.mx A REGEX
        pattern: "^[a-zA-Z0-9._%+-]+@colegioherbart\\.edu\\.mx$",
        errorMessage: "El correo debe terminar en @colegioherbart.edu.mx",
    },
    {
        name: "birthday",
        label: "Fecha Nacimiento",
        type: "date", // Aprovechamos para usar el selector de fecha nativo
        required: true,
        icon: Calendar,
        max: (() => {
            const d = new Date();
            d.setFullYear(d.getFullYear() - 18); // Resta 18 años a la fecha de hoy
            return d.toISOString().split("T")[0];
        })()
    },
];
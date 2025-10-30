
// Importa los iconos aquí mismo para tener todo en un solo lugar
import {
    Home,
    GraduationCap,
    Users,
    Book,
    Presentation
} from 'lucide-react';

// Define tu lista y exporta los iconos y los enlaces
const iconSize = 50;

export const appIcons = {
    INICIO: <Home size={iconSize} />,
    ESTUDIANTES: <GraduationCap size={iconSize} />,
    GRUPOS: <Users size={iconSize} />,
    MATERIAS: <Book size={iconSize} />,
    DOCENTES: <Presentation size={iconSize} />,
    DEFAULT: <GraduationCap size={iconSize} />
};

export const appLinks = [
    { label: "ESTUDIANTES", href: "/alumnos", icon: appIcons.ESTUDIANTES },
    { label: "GRUPOS", href: "/grupos", icon: appIcons.GRUPOS },
    { label: "MATERIAS", href: "/materias", icon: appIcons.MATERIAS },
    { label: "DOCENTES", href: "/docentes", icon: appIcons.DOCENTES },
];
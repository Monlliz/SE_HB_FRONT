# 🏫 HSA — Herbart Sistema Administrativo

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-Build%20Tool-646CFF?logo=vite&logoColor=white)
![MUI](https://img.shields.io/badge/UI-Material%20UI-007FFF?logo=mui&logoColor=white)

Sistema web de gestión académica y administrativa desarrollado para el **Colegio Herbart**, como proyecto de **residencia profesional** de Ingeniería en Sistemas Computacionales (Instituto Tecnológico de Tepic).

HSA centraliza el trabajo diario de docentes y personal administrativo: control de estudiantes, grupos, materias, asistencia, calificaciones e incidentes disciplinarios, reemplazando procesos manuales o dispersos por una plataforma única con permisos según el rol de cada usuario.

## 📌 ¿Qué resuelve?

- Un **dashboard** central con calendario de eventos institucionales (académicos, cívicos, festivos, evaluaciones, etc.)
- Gestión completa de **estudiantes**: alta, edición, baja, y registro de incidentes ("strikes") con generación de reportes en **PDF**
- Gestión de **grupos**: pase de lista (general y por materia), asignación de materias, cambio masivo de grupo, actividades cotidianas y calificaciones parciales con **rubros de evaluación configurables**
- Gestión de **docentes** y **catálogo de materias**, con permisos diferenciados por rol (docente, prefecto, directivo, administrador)
- **Exportación de calificaciones a Excel (XLSX)** y de reportes de incidentes a PDF

## 🛠️ Stack técnico

| Categoría | Tecnología |
|---|---|
| Librería UI | React 19 |
| Componentes | Material UI (MUI) |
| Build tool | Vite |
| Generación de PDF | jsPDF, jsPDF-AutoTable, @react-pdf/renderer |
| Exportación de datos | SheetJS (xlsx) |
| Editor de texto enriquecido | React Quill |
| Fechas | Day.js, date-fns, MUI X Date Pickers |
| Animaciones | Motion, Canvas Confetti |
| Analítica | Vercel Analytics |

## 🚀 Cómo correrlo localmente

### 1. Clonar el repositorio

```bash
git clone https://github.com/Monlliz/SE_HB_FRONT.git
cd SE_HB_FRONT
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Levantar en modo desarrollo

```bash
npm run dev
```

### Otros scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Corre la app en modo desarrollo (Vite) |
| `npm run build` | Genera el build de producción |
| `npm run preview` | Previsualiza el build de producción |
| `npm run lint` | Corre ESLint sobre el proyecto |

### Despliegue con Docker

El proyecto incluye `Dockerfile` y `nginx.conf` para desplegarse en un contenedor:

```bash
docker build -t hsa-front .
docker run -p 80:80 hsa-front
```

## 📖 Documentación

El proyecto cuenta con un **manual de usuario completo**, con guía detallada de cada módulo (login, dashboard, estudiantes, grupos, docentes, materias) y sus capturas de pantalla.

## 👥 Autoría

Proyecto de residencia profesional desarrollado en equipo por:

- [Monlliz](https://github.com/Monlliz) (Denisse Monzerrat Ruiz Murillo)
- [Vanqu3r](https://github.com/Vanqu3r) (Jovan Enrique High Mendoza)

Asesorado por MTI. María Elena Parra Urías (asesora interna) e Ing. Salvador Yunior Aguilar Ramírez (asesor externo). Instituto Tecnológico de Tepic, enero 2026.

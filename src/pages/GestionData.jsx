import React, { useState, useEffect, act } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNotification } from "../components/modals/NotificationModal.jsx";
// Imports de MUI
import {
  Button,
  Box,
  Card,
  Typography,
  FormGroup,
  FormControlLabel,
  Select,
  InputLabel,
  MenuItem,
  Checkbox,
  Grid,
  FormControl,
  Divider,
  Stack,
  Tooltip,
} from "@mui/material";
//iconos
import FilterAltIcon from "@mui/icons-material/FilterAlt"; // Asegúrate de importar el icono
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
//Import de servicios propios
import { useExport } from "../utils/useExport.js";
//import de fetchs
import {
  fetchAlumnoGet,
  fetchAlumnoImport,
} from "../services/alumnosService.js";
import {
  fetchDocenteGet,
  fetchDocenteImport,
} from "../services/docenteService.js";
import {
  fetchMateriasGet,
  fetchMateriasImport,
} from "../services/materiasService.js";

//================================
// --- CONFIGURACIÓN INICIAL PARA EXPORTACIONES---
//================================
// Esto ayuda a reiniciar los checkboxes cuando se cambia de entidad
const INITIAL_COLUMNS = {
  1: {
    // Alumnos
    matricula: true,
    nombre: true,
    apellidoP: true,
    apellidoM: true,
    grupo: true,
    semestre: true,
    perfil: true,
    ingles: true,
    correo: true,
    activo: false,
  },
  2: {
    // Docentes
    correo: true,
    nombre: true,
    apellidoP: true,
    apellidoM: true,
    cumpleanos: true,
    activo: false,
  },
  3: {
    // Materias
    clave: true,
    nombre: true,
    perfil: true,
    semestre: true,
    yearm: true,
    activo: false,
  },
};

const opcionesSelect = {
  ingles: [
    { value: 0, label: "AMBOS" },
    { value: 2, label: "ENGLISH" },
    { value: 3, label: "IHS" },
  ],
  perfil: [
    { value: 0, label: "TODOS" },
    { value: 2, label: "BC" },
    { value: 3, label: "FM" },
    { value: 4, label: "QB" },
    { value: 5, label: "EA" },
    { value: 6, label: "SH" },
  ],
  grupo: [
    { value: 0, label: "AMBOS" },
    { value: 2, label: "A" },
    { value: 3, label: "B" },
  ],
};
const entityColumnConfig = {
  1: [
    // Alumnos
    { originalKey: "matricula", label: "MATRICULA" },
    { originalKey: "correo", label: "CORREO ELECTRONICO" },
    { originalKey: "apellidoP", label: "PRIMER APELLIDO" },
    { originalKey: "apellidoM", label: "SEGUNDO APELLIDO" },
    { originalKey: "nombre", label: "NOMBRE(S)" },
    { originalKey: "semestre", label: "SEMESTRE" },
    { originalKey: "grupo", label: "GRUPO" },
    { originalKey: "perfil", label: "PERFIL" },
    { originalKey: "ingles", label: "INGLES" },
    { originalKey: "activo", label: "ESTADO" },
  ],
  2: [
    { originalKey: "correo", label: "CORREO ELECTRONICO" },
    { originalKey: "nombre", label: "NOMBRE(S)" },
    { originalKey: "apellidoP", label: "PRIMER APELLIDO" },
    { originalKey: "apellidoM", label: "SEGUNDO APELLIDO" },
    { originalKey: "cumpleanos", label: "CUMPLEAÑOS" },
    { originalKey: "activo", label: "ESTADO" },
  ],
  3: [
    // Materias (grupoExport === 3)
    { originalKey: "clave", label: "CLAVE" },
    { originalKey: "nombre", label: "NOMBRE ASIGNATURA" },
    { originalKey: "perfil", label: "PERFIL" },
    { originalKey: "semestre", label: "SEMESTRE" },
    { originalKey: "yearm", label: "AÑO COHORTE" },
    { originalKey: "activo", label: "ESTADO" },
  ],
};

// Definición de las columnas en el orden deseado, con sus etiquetas

//================================
//FIN DE CONFIGURACIÓN INICIAL de EXPORTACIONES
//================================

export default function GestionData() {
  //================================
  // --- INICIALIZACIÓN DE NOTIFICACIONES ---
  //================================
  const { showNotification, NotificationComponent } = useNotification();

  //==================================
  // -- LLAMAR FUNCION DE EXPORTACION
  //==================================
  const { exportar } = useExport();

  //================================
  // --- VALIDACIÓN DE ROLES ---
  //================================s
  const { token, user } = useAuth();
  const rolesPermitidos = ["Administrador", "Director"];
  const isAuthorized = rolesPermitidos.includes(user?.nombre_rol);
  //================================
  //IMPORTACIONES
  //================================
  const [grupoImport, setGrupoImport] = useState(""); // 1: Alumnos, 2: Docentes, 3: Materias
  const [archivoImport, setArchivoImport] = useState(null); // Nuevo estado para el archivo
  const [loading, setLoading] = useState(false);

  //========================================
  // -- Función para descargar plantilla CSV
  //========================================
  const handleDescargarPlantilla = () => {
    if (!grupoImport) {
      showNotification("Selecciona una entidad a importar", "warning");

      return;
    }
    // 1. Obtener la configuración de columnas de la entidad seleccionada
    const entityConfig = entityColumnConfig[grupoImport];

    if (!entityConfig) {
      showNotification(
        "Configuración de columnas no encontrada para esta entidad",
        "warning"
      );

      return;
    }
    const columnLabels = entityConfig.reduce((acc, col) => {
      if (col.originalKey !== "activo") {
        acc[col.label] = "";
      }

      return acc;
    }, {});
    // El array de datos solo contendrá este objeto de encabezados vacíos como ejemplo
    const plantillaData = [columnLabels];

    // 3. Determinar el nombre del archivo
    const entityMap = { 1: "Alumnos", 2: "Docentes", 3: "Materias" };
    const fileName = `Plantilla_Importacion_${entityMap[grupoImport]}`;

    // 4. Ejecutar exportación (solo queremos el formato CSV para la plantilla)
    // Usamos la función `exportar` con el array de plantilla y el formato 'csv'
    exportar(plantillaData, fileName, "csv");
  };

  //Cambio de archivo
  const handleFileChange = (event) => {
    // Almacena el primer archivo seleccionado
    setArchivoImport(event.target.files[0]);
  };

  //=================================================
  // -- Función para manejar la importación
  //=================================================
  const handleImportar = async () => {
    if (!grupoImport) {
      showNotification(
        "Selecciona la entidad a importar (Alumnos, Docentes o Materias).",
        "warning"
      );

      return;
    }
    if (!archivoImport) {
      showNotification("Selecciona un archivo CSV para importar.", "warning");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", archivoImport);
      let importResponse;
      switch (grupoImport) {
        case 1:
          importResponse = await fetchAlumnoImport(token, formData);
          break;
        case 2:
          importResponse = await fetchDocenteImport(token, formData);
          break;
        case 3:
          importResponse = await fetchMateriasImport(token, formData);

          break;
        default:
          throw new Error("Entidad de importación no válida.");
      }
      showNotification("¡Importación exitosa!", "success");
      setArchivoImport(null); // Limpiar el archivo seleccionado
      // Posiblemente recargar datos o notificar éxito
    } catch (error) {
      console.error("Error en la importación:", error);
      showNotification("Error al procesar el archivo", "error");
    } finally {
      setLoading(false);
    }
  };

  //================================
  // FIN DE IMPORTACIONES
  //================================

  //================================
  //EXPORTACIONES
  //================================
  // --- ESTADOS DEL FORMULARIO ---
  const [grupoExport, setGrupoExport] = useState(""); // 1: Alumnos, 2: Docentes, 3: Materias
  const [formato, setFormato] = useState("");

  // Estado compuesto para guardar filtros y selección de columnas
  const [exportConfig, setExportConfig] = useState({
    filtroSemestre: 7, // 7 = Todos (Valor por defecto)
    filtroHistorico: 1, // 0 = No historico (Valor por defecto)
    filtroGrupo: 0,
    filtroIngles: 0,
    filtroPerfil: 0,
    columnas: {}, // Se llenará según la entidad seleccionada
  });

  // Opciones para los selects

  // --- EFECTO: REINICIAR CONFIG AL CAMBIAR ENTIDAD ---
  useEffect(() => {
    if (grupoExport && INITIAL_COLUMNS[grupoExport]) {
      setExportConfig({
        filtroSemestre: 7, // Resetear semestre a 'Todos'
        filtroHistorico: 1, // 0 = No historico (Valor por defecto)
        filtroGrupo: 0,
        filtroIngles: 0,
        filtroPerfil: 0,
        columnas: { ...INITIAL_COLUMNS[grupoExport] }, // Cargar columnas específicas
      });
    }
  }, [grupoExport]);

  // --- MANEJADORES DE EVENTOS (HANDLERS) ---

  // Cambiar Semestre (Filtro)
  const handleFiltroChange = (event) => {
    const { name, value } = event.target; // Extraemos nombre y valor

    setExportConfig((prev) => ({
      ...prev,
      [name]: Number(value), // [name] se convierte en "filtroSemestre" o "filtroHistorico" automáticamente
    }));
  };
  // Cambiar Checkboxes (Columnas)
  const handleColumnToggle = (event) => {
    const { name, checked } = event.target;
    setExportConfig((prev) => ({
      ...prev,
      columnas: {
        ...prev.columnas,
        [name]: checked,
      },
    }));
  };

  //======================================
  // --  Botón Exportar
  // -- Funcion para exportar datos
  //======================================
  const handleExportar = async () => {
    setLoading(true);
    let rawData = [];
    try {
      // 1. Obtener datos crudos de la API
      // Nota: Pasamos el semestre por si tu backend ya filtra. Si no, filtramos abajo.

      switch (grupoExport) {
        case 1: // Alumnos
          const responseA = await fetchAlumnoGet(token);
          const listaAlumnos = responseA.alumnos || [];

          // 1. Normalizamos los datos (Igual que antes)
          rawData = listaAlumnos.map((alumno) => ({
            matricula: alumno.matricula,
            nombre: alumno.nombres,
            apellidoP: alumno.apellidop,
            apellidoM: alumno.apellidom,
            correo: alumno.correo,
            grupo: String(alumno.grupo || "")
              .slice(-1)
              .toUpperCase(),
            perfil: alumno.perfil,
            ingles: alumno.ingles,
            semestre: alumno.semestre, // Importante para ordenar
            activo: alumno.activo ? "ACTIVO" : "INNACTIVO",
          }));

          rawData.sort((a, b) => {
            if (a.semestre !== b.semestre) {
              return a.semestre - b.semestre;
            }
            if (a.grupo !== b.grupo) {
              return (a.grupo || "").localeCompare(b.grupo || "");
            }
            return (a.apellidoP || "").localeCompare(b.apellidoP || "");
          });

          break;
        //docentes
        case 2:
          const responseD = await fetchDocenteGet(token);
          const listaDocentes = responseD.docentes || [];
          rawData = listaDocentes.map((docente) => ({
            correo: docente.correo,
            nombre: docente.nombres,
            apellidoP: docente.apellidop,
            apellidoM: docente.apellidom,
            cumpleanos: docente.birthday,
            activo: docente.activo ? "ACTIVO" : "INNACTIVO",
          }));
          rawData.sort((a, b) => {
            return (a.apellidoP || "").localeCompare(b.apellidoP || "");
          });
          break;

        case 3: // Materias
          const responseM = await fetchMateriasGet(token);
          const listaMaterias = responseM.materias || [];
          rawData = listaMaterias.map((materia) => ({
            clave: materia.clave,
            nombre: materia.asignatura,
            perfil: materia.perfil_id,
            semestre: materia.semestre,
            yearm: materia.yearm,
            activo: materia.activo ? "ACTIVO" : "INNACTIVO",
          }));
          rawData.sort((a, b) => {
            if (a.semestre !== b.semestre) {
              return a.semestre - b.semestre;
            }

            return (a.nombre || "").localeCompare(b.nombre || "");
          });
          break;

        default:
          showNotification("Entidad no soportada para exportar", "error");
          setLoading(false);
          return;
      }

      // 2. Filtrar filas (Si el backend no filtró el semestre)
      // ==========================================
      // Lógica de filtrado robusta (Dentro de rawData.filter((item) => { ... }))
      // ==========================================

      let filteredData = rawData.filter((item) => {
        const itemSemestre = Number(item.semestre);
        const itemActivo = item.activo;
        const itemGrupo = (String(item.grupo).match(/[A-Z]$/i) || [
          "",
        ])[0].toUpperCase();
        const itemPerfil = String(item.perfil || "").trim();
        const itemIngles = String(item.ingles || "").trim();

        // --- 1. FILTRO SEMESTRE (Ya estaba bien) ---
        if (exportConfig.filtroSemestre !== 7) {
          if (itemSemestre !== Number(exportConfig.filtroSemestre)) {
            // Muestra el rechazo por Semestre

            return false;
          }
        }

        // 2. FILTRO HISTÓRICO
        if (Number(exportConfig.filtroHistorico) === 1) {
          if (itemActivo !== "ACTIVO") {
            // Muestra el rechazo por Histórico
            return false;
          }
        }

        if (grupoExport === 1) {
          // A) FILTRO GRUPO
          const valGrupo = exportConfig.filtroGrupo;
          if (valGrupo === 2) {
            // Grupo A
            if (!itemGrupo.includes("A")) {
              // Muestra el rechazo por Grupo

              return false;
            }
          } else if (valGrupo === 3) {
            // Grupo B
            if (!itemGrupo.includes("B")) {
              // Muestra el rechazo por Grupo

              return false;
            }
          }

          // B) FILTRO PERFIL

          const valPerfil = String(exportConfig.filtroPerfil);
          console.log(valPerfil);
          if (valPerfil != 0) {
            const mapPerfil = { 2: "BC", 3: "FM", 4: "QB", 5: "EA", 6: "SH" };
            const perfilBuscado = mapPerfil[valPerfil];
            if (itemPerfil !== perfilBuscado) {
              // Muestra el rechazo por Perfil

              return false;
            }
          }

          // C) FILTRO INGLÉS
          const valIngles = String(exportConfig.filtroIngles);
          if (valIngles != 0) {
            const mapIngles = { 2: "ENGLISH", 3: "IHS" };
            const inglesBuscado = mapIngles[valIngles];
            if (itemIngles !== inglesBuscado) {
              // Muestra el rechazo por Inglés

              return false;
            }
          }
        }

        return true;
      });
      // 3. Filtrar Columnas (Mapeo de datos)

      const baseColumns = entityColumnConfig[grupoExport] || [];

      // 2. Filtrar y ordenar las columnas a exportar
      // Solo incluimos la columna si el usuario la marcó en 'exportConfig.columnas'
      const finalColumnsConfig = baseColumns.filter((col) => {
        // `col.originalKey` es el nombre de la propiedad en `filteredData` (ej: 'apellidoP')
        return exportConfig.columnas[col.originalKey];
      });

      if (finalColumnsConfig.length === 0) {
        showNotification("Selecciona al menos una columna para exportar", "warning");
        setLoading(false);
        return;
      }

      // 3. Transformar los datos (Mapeo de datos y etiquetado)
      const finalData = filteredData.map((item) => {
        const newItem = {};

        // Iteramos SOBRE el array ordenado finalColumnsConfig
        finalColumnsConfig.forEach((col) => {
          const originalKey = col.originalKey; // Ej: 'apellidoP'
          const newKey = col.label; // Ej: 'Apellido Paterno'

          // Asignamos el valor del item[originalKey] a la nueva clave (newKey/etiqueta)
          // Esto asegura que la función `exportar` reciba un array de objetos con las
          // etiquetas de encabezado como claves, y ya en el orden deseado.
          newItem[newKey] =
            item[originalKey] !== undefined ? item[originalKey] : "";
        });
        return newItem;
      });

      if (finalData.length === 0) {
        showNotification("No se encontraron registros con los filtros seleccionados.", "warning");
        setLoading(false);
        return;
      }

      // 4. Determinar Formato (String para useExport)
      const formatMap = { 1: "csv", 2: "xlsx", 3: "pdf" };
      const formatString = formatMap[formato];

      // 5. Determinar Nombre del archivo
      const entityMap = { 1: "Alumnos", 2: "Docentes", 3: "Materias" };
      const fileName = `Reporte_${entityMap[grupoExport]}`;

      // 6. Ejecutar exportación
      exportar(finalData, fileName, formatString);
    } catch (error) {
      console.error("Error exportando:", error);
      showNotification("Hubo un error al obtener los datos.", "error");
    } finally {
      setLoading(false);
    }
  };

  //================================
  //FIN DE EXPORTACIONES
  //================================

  // --- RENDERIZADO CONDICIONAL ---

  if (!isAuthorized) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5" color="error">
          Acceso Denegado. No tienes permisos para ver esta sección.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "85vh",
        gap: 3,
        p: 3,
        bgcolor: "#f5f6fa",
      }}
    >
      {/* TARJETA IMPORTAR (Izquierda) */}
      <Card
        elevation={4}
        sx={{
          width: "50%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: 3,
          p: 4,
          transition: "0.3s",
          "&:hover": { transform: "scale(1.02)", boxShadow: 8 },
        }}
      >
        <CloudUploadIcon sx={{ fontSize: 60, mb: 2, color: "primary.main" }} />
        <Typography variant="h5" textAlign="center">
          Importación de datos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Solo formato CSV
        </Typography>
        <Tooltip title="Las Fechas deben de ir en formato de AAAA-MM-DD">
          <HelpOutlineIcon
            sx={{ fontSize: 20, mb: 2, color: "primary.main" }}
          />
        </Tooltip>
        <FormControl fullWidth margin="normal">
          <InputLabel id="select-entidad-label">Entidad a importar</InputLabel>
          <Select
            labelId="select-entidad-label"
            value={grupoImport}
            label="Entidad a exportar"
            onChange={(e) => setGrupoImport(e.target.value)}
          >
            <MenuItem value={1}>Alumnos</MenuItem>
            <MenuItem value={2}>Docentes</MenuItem>
            <MenuItem value={3}>Materias</MenuItem>
          </Select>
        </FormControl>
        <Stack direction="row" spacing={2} sx={{ mt: 2, mb: 2, width: "100%" }}>
          {/* BOTÓN PARA DESCARGAR PLANTILLA (NUEVO) */}
          <Button
            variant="outlined"
            color="primary"
            startIcon={<CloudDownloadIcon />}
            onClick={handleDescargarPlantilla}
            disabled={!grupoImport || loading}
            fullWidth
          >
            Descargar Plantilla CSV
          </Button>
        </Stack>
        <input
          accept=".csv"
          style={{ display: "none" }}
          id="raised-button-file"
          type="file"
          onChange={handleFileChange}
        />

        {/* 3. BOTÓN PARA SELECCIONAR ARCHIVO */}
        <label htmlFor="raised-button-file">
          <Button
            variant="outlined"
            component="span" // Importante: hace que el botón actúe como label para el input
            startIcon={<CloudUploadIcon />}
            sx={{ mt: 2, px: 4, mb: 2 }}
            disabled={loading || !grupoImport}
          >
            {archivoImport
              ? `Archivo: ${archivoImport.name}`
              : "Seleccionar archivo CSV"}
          </Button>
        </label>

        {/* 4. BOTÓN DE IMPORTAR */}
        <Button
          variant="contained"
          sx={{ mt: 1, px: 4 }}
          onClick={handleImportar} // Llamada a la nueva función de importación
          disabled={!grupoImport || !archivoImport || loading}
        >
          {loading ? "Importando..." : "Subir y procesar datos"}
        </Button>
      </Card>

      {/* TARJETA EXPORTAR (Derecha) */}
      <Card
        elevation={4}
        sx={{
          width: "50%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflowY: "auto",
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          borderRadius: 3,
          p: 4,
          transition: "0.3s",
          "&:hover": { transform: "scale(1.02)", boxShadow: 8 },
        }}
      >
        <CloudDownloadIcon
          sx={{ fontSize: 60, mb: 2, color: "secondary.main" }}
        />
        <Typography variant="h5" textAlign="center" gutterBottom>
          Exportación de datos
        </Typography>

        <FormGroup fullWidth sx={{ width: "100%" }}>
          {/* SELECTOR DE ENTIDAD */}
          <FormControl fullWidth margin="normal">
            <InputLabel id="select-entidad-label">
              Entidad a exportar
            </InputLabel>
            <Select
              labelId="select-entidad-label"
              value={grupoExport}
              label="Entidad a exportar"
              onChange={(e) => setGrupoExport(e.target.value)}
            >
              <MenuItem value={1}>Alumnos</MenuItem>
              <MenuItem value={2}>Docentes</MenuItem>
              <MenuItem value={3}>Materias</MenuItem>
            </Select>
          </FormControl>

          {/* COMPONENTES DE FILTROS DINÁMICOS */}
          {/* Pasamos 'config' (datos) y 'handlers' (funciones) a los hijos */}
          {grupoExport === 1 && (
            <RenderAlumnos
              config={exportConfig}
              onFilterChange={handleFiltroChange}
              onColumnChange={handleColumnToggle}
            />
          )}
          {grupoExport === 2 && (
            <RenderDocente
              config={exportConfig}
              onFilterChange={handleFiltroChange}
              onColumnChange={handleColumnToggle}
            />
          )}
          {grupoExport === 3 && (
            <RenderMaterias
              config={exportConfig}
              onFilterChange={handleFiltroChange}
              onColumnChange={handleColumnToggle}
            />
          )}

          {/* SELECTOR DE FORMATO */}
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel id="select-formato-label">
              Formato de exportación
            </InputLabel>
            <Select
              labelId="select-formato-label"
              value={formato}
              label="Formato de exportación"
              onChange={(e) => setFormato(e.target.value)}
            >
              <MenuItem value={1}>CSV</MenuItem>
              <MenuItem value={2}>XLSX </MenuItem>
              <MenuItem value={3}>PDF</MenuItem>
            </Select>
          </FormControl>
        </FormGroup>

        <Button
          variant="contained"
          color="secondary"
          sx={{ mt: 4, px: 4 }}
          onClick={handleExportar}
          disabled={!grupoExport || !formato} // Deshabilitar si faltan datos
        >
          Exportar datos
        </Button>
      </Card>
      {NotificationComponent}
    </Box>
  );
}

// ==========================================
// SUB-COMPONENTES
// ==========================================

//alumnos
const RenderAlumnos = ({ config, onFilterChange, onColumnChange }) => {
  // Helpers para no escribir tanto codigo repetido
  const getChecked = (key) => config.columnas[key] || false;

  return (
    <Box sx={{ p: 2, border: "1px solid #eee", borderRadius: 2, mb: 2 }}>
      {/* Filtro Semestre */}
      {/* ENCABEZADO DE LA SECCIÓN DE FILTROS */}
      <Stack direction="row" alignItems="center" gap={1} mb={2}>
        <FilterAltIcon color="action" />
        <Typography
          variant="subtitle2"
          color="text.secondary"
          fontWeight="bold"
        >
          OPCIONES DE FILTRADO
        </Typography>
      </Stack>

      {/* CONTENEDOR DE LOS INPUTS (Uno al lado del otro) */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        {/* 1. FILTRO SEMESTRE */}
        <FormControl fullWidth size="small">
          <InputLabel id="lbl-semestre">Semestre</InputLabel>
          <Select
            labelId="lbl-semestre"
            name="filtroSemestre" // <--- IMPORTANTE: El 'name' coincide con el estado
            value={config.filtroSemestre}
            label="Semestre"
            onChange={onFilterChange} // Usamos la nueva función corregida
          >
            <MenuItem value={7}>Todos los semestres</MenuItem>
            <MenuItem value={1}>1º Semestre</MenuItem>
            <MenuItem value={2}>2º Semestre</MenuItem>
            <MenuItem value={3}>3º Semestre</MenuItem>
            <MenuItem value={4}>4º Semestre</MenuItem>
            <MenuItem value={5}>5º Semestre</MenuItem>
            <MenuItem value={6}>6º Semestre</MenuItem>
          </Select>
        </FormControl>

        {/* 2. FILTRO HISTÓRICO */}
        <FormControl fullWidth size="small">
          <InputLabel id="lbl-historico">Historico</InputLabel>
          <Select
            labelId="lbl-historico"
            name="filtroHistorico"
            value={config.filtroHistorico || 1}
            label="Historico"
            onChange={onFilterChange}
          >
            <MenuItem value={1}>Solo Actual</MenuItem>
            <MenuItem value={2}>Incluir Histórico</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ mb: 2 }}>
        {/*Grupo */}
        <FormControl fullWidth size="small">
          <InputLabel id="lbl-Grupo">Grupo</InputLabel>
          <Select
            labelId="lbl-Grupo"
            name="filtroGrupo" // <--- IMPORTANTE
            value={config.filtroGrupo || 0} // Valor por defecto si no existe
            label="Grupo"
            onChange={onFilterChange}
          >
            {opcionesSelect.grupo.map((opcion) => (
              <MenuItem key={opcion.value} value={opcion.value}>
                {opcion.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/*Perfil */}
        <FormControl fullWidth size="small">
          <InputLabel id="lbl-Perfil">Perfil</InputLabel>
          <Select
            labelId="lbl-Perfil"
            name="filtroPerfil" // <--- IMPORTANTE
            value={config.filtroPerfil} // Valor por defecto si no existe
            label="Grupo"
            onChange={onFilterChange}
          >
            {opcionesSelect.perfil.map((opcion) => (
              <MenuItem key={opcion.value} value={opcion.value}>
                {opcion.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/*Ingles */}
        <FormControl fullWidth size="small">
          <InputLabel id="lbl-Ingles">Ingles</InputLabel>
          <Select
            labelId="lbl-Ingles"
            name="filtroIngles" // <--- IMPORTANTE
            value={config.filtroIngles || 0} // Valor por defecto si no existe
            label="Grupo"
            onChange={onFilterChange}
          >
            {opcionesSelect.ingles.map((opcion) => (
              <MenuItem key={opcion.value} value={opcion.value}>
                {opcion.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      <Divider sx={{ mb: 2 }} />

      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        DATOS A EXPORTAR:
      </Typography>
      <Grid container spacing={1}>
        <Grid item xs={6} md={3}>
          <FormControlLabel
            control={
              <Checkbox
                checked={getChecked("matricula")}
                onChange={onColumnChange}
                name="matricula"
              />
            }
            label="Matrícula"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={getChecked("nombre")}
                onChange={onColumnChange}
                name="nombre"
              />
            }
            label="Nombre"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <FormControlLabel
            control={
              <Checkbox
                checked={getChecked("apellidoP")}
                onChange={onColumnChange}
                name="apellidoP"
              />
            }
            label="Apellido P."
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={getChecked("apellidoM")}
                onChange={onColumnChange}
                name="apellidoM"
              />
            }
            label="Apellido M."
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <FormControlLabel
            control={
              <Checkbox
                checked={getChecked("grupo")}
                onChange={onColumnChange}
                name="grupo"
              />
            }
            label="Grupo"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={getChecked("semestre")}
                onChange={onColumnChange}
                name="semestre"
              />
            }
            label="semestre"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={getChecked("perfil")}
                onChange={onColumnChange}
                name="perfil"
              />
            }
            label="Perfil"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <FormControlLabel
            control={
              <Checkbox
                checked={getChecked("ingles")}
                onChange={onColumnChange}
                name="ingles"
              />
            }
            label="Inglés"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={getChecked("correo")}
                onChange={onColumnChange}
                name="correo"
              />
            }
            label="Correo"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={getChecked("activo")}
                onChange={onColumnChange}
                name="activo"
              />
            }
            label="Activo"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

//DOCENTES
const RenderDocente = ({ config, onFilterChange, onColumnChange }) => {
  const getChecked = (key) => config.columnas[key] || false;

  return (
    <Box sx={{ p: 2, border: "1px solid #eee", borderRadius: 2, mb: 2 }}>
      <Stack direction="row" alignItems="center" gap={1} mb={2}>
        <FilterAltIcon color="action" />
        <Typography
          variant="subtitle2"
          color="text.secondary"
          fontWeight="bold"
        >
          OPCIONES DE FILTRADO
        </Typography>
      </Stack>

      {/* CONTENEDOR DE LOS INPUTS (Uno al lado del otro) */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="lbl-historico">Historico</InputLabel>
          <Select
            labelId="lbl-historico"
            name="filtroHistorico" // <--- IMPORTANTE
            value={config.filtroHistorico || 1} // Valor por defecto si no existe
            label="Historico"
            onChange={onFilterChange}
          >
            <MenuItem value={1}>Solo Actual</MenuItem>
            <MenuItem value={2}>Incluir Histórico</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        DATOS A EXPORTAR:
      </Typography>
      <Grid container spacing={1}>
        <Grid item xs={6} md={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={getChecked("correo")}
                onChange={onColumnChange}
                name="correo"
              />
            }
            label="Correo"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={getChecked("nombre")}
                onChange={onColumnChange}
                name="nombre"
              />
            }
            label="Nombre"
          />
        </Grid>
        <Grid item xs={6} md={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={getChecked("apellidoP")}
                onChange={onColumnChange}
                name="apellidoP"
              />
            }
            label="Apellido P."
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={getChecked("apellidoM")}
                onChange={onColumnChange}
                name="apellidoM"
              />
            }
            label="Apellido M."
          />
        </Grid>
        <Grid item xs={6} md={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={getChecked("cumpleanos")}
                onChange={onColumnChange}
                name="cumpleanos"
              />
            }
            label="Cumpleaños"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={getChecked("activo")}
                onChange={onColumnChange}
                name="activo"
              />
            }
            label="Activo"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

//MATERIAS
const RenderMaterias = ({ config, onFilterChange, onColumnChange }) => {
  const getChecked = (key) => config.columnas[key] || false;

  return (
    <Box sx={{ p: 2, border: "1px solid #eee", borderRadius: 2, mb: 2 }}>
      {/* Filtro Semestre Materias */}
      <Box sx={{ mb: 2, maxWidth: 300 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Filtrar por Semestre</InputLabel>
          <Select
            value={config.filtroSemestre}
            label="Filtrar por Semestre"
            onChange={onFilterChange}
          >
            <MenuItem value={7}>Todos</MenuItem>
            <MenuItem value={1}>1º Semestre</MenuItem>
            <MenuItem value={2}>2º Semestre</MenuItem>
            <MenuItem value={3}>3º Semestre</MenuItem>
            <MenuItem value={4}>4º Semestre</MenuItem>
            <MenuItem value={5}>5º Semestre</MenuItem>
            <MenuItem value={6}>6º Semestre</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Divider sx={{ mb: 2 }} />

      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        DATOS A EXPORTAR:
      </Typography>
      <Grid container spacing={1}>
        <Grid item xs={6} md={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={getChecked("clave")}
                onChange={onColumnChange}
                name="clave"
              />
            }
            label="Clave"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={getChecked("nombre")}
                onChange={onColumnChange}
                name="nombre"
              />
            }
            label="Nombre"
          />
        </Grid>
        <Grid item xs={6} md={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={getChecked("perfil")}
                onChange={onColumnChange}
                name="perfil"
              />
            }
            label="Perfil"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={getChecked("semestre")}
                onChange={onColumnChange}
                name="semestre"
              />
            }
            label="Semestre"
          />
        </Grid>
        <Grid item xs={6} md={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={getChecked("yearm")}
                onChange={onColumnChange}
                name="yearm"
              />
            }
            label="Año Cohorte"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={getChecked("activo")}
                onChange={onColumnChange}
                name="activo"
              />
            }
            label="Activo"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

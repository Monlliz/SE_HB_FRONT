import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import {
  fetchSemanasPlaneadas,
  fetchPlaneacionPorSemana,
  fetchGuardarPlaneacion,
} from "../services/docenteService.js";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { useNotification } from "../components/modals/NotificationModal.jsx";

// --- UTILS (Fuera del componente para no re-crearse en cada render) ---
const obtenerLunesYViernesActual = () => {
  const hoy = new Date();
  const diaSemana = hoy.getDay();
  const diffLunes = hoy.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
  const lunes = new Date(hoy.setDate(diffLunes));
  const viernes = new Date(lunes);
  viernes.setDate(lunes.getDate() + 4);

  return {
    inicio: lunes.toISOString().split("T")[0],
    fin: viernes.toISOString().split("T")[0],
  };
};

const formatearFechaDma = (fechaISO) => {
  if (!fechaISO) return "";
  const [year, month, day] = fechaISO.split("-");
  return `${day}-${month}-${year}`;
};

const stripHtml = (html) => {
  if (!html) return "Sin contenido";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

const modulosQuill = {
  toolbar: [
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["clean"],
  ],
};

// Configuración de las columnas para renderizado dinámico (DRY)
const CAMPOS_SESION = [
  { key: "objetivo_sesion", titulo: "Objetivo de Sesión" },
  { key: "inicio", titulo: "Inicio" },
  { key: "desarrollo", titulo: "Desarrollo" },
  { key: "cierre", titulo: "Cierre" },
  { key: "materiales_recursos", titulo: "Materiales y Recursos" },
];

export default function FormularioPlaneacion({
  isDirector,
  materiaSeleccionada,
  docenteInfo,
  docenteSeleccionadoId,
  volver,
}) {
  const { token } = useAuth();
  const { showNotification, NotificationComponent } = useNotification();

  const [semanasPlaneadas, setSemanasPlaneadas] = useState([]);

  const [cabecera, setCabecera] = useState({
    numero_semana: "",
    num_sesiones: "1",
    unidad: "",
    fecha_inicio: obtenerLunesYViernesActual().inicio,
    fecha_fin: obtenerLunesYViernesActual().fin,
    observaciones: "",
  });

  const [sesiones, setSesiones] = useState([
    {
      numero_sesion: 1,
      objetivo_sesion: "",
      inicio: "",
      desarrollo: "",
      cierre: "",
      materiales_recursos: "",
    },
  ]);

  const [modalEditor, setModalEditor] = useState({
    open: false,
    indexSesion: null,
    campo: null,
    tituloCampo: "",
    contenidoTemporal: "",
  });

  // --- MÉTODOS OPTIMIZADOS CON useCallback ---

  const cargarDetalleSemana = useCallback(
    async (semana) => {
      try {
        const data = await fetchPlaneacionPorSemana(
          token,
          docenteSeleccionadoId,
          materiaSeleccionada.clave,
          materiaSeleccionada.grupo,
          semana,
        );
        if (data && data.cabecera) {
          setCabecera({
            numero_semana: data.cabecera.numero_semana,
            num_sesiones: data.cabecera.num_sesiones.toString(),
            unidad: data.cabecera.unidad,
            fecha_inicio: data.cabecera.fecha_inicio,
            fecha_fin: data.cabecera.fecha_fin,
            observaciones: data.cabecera.observaciones || "",
          });
          setSesiones(data.sesiones);
        }
      } catch (error) {
        console.error("Error cargando el detalle:", error);
      }
    },
    [token, docenteSeleccionadoId, materiaSeleccionada],
  );

  const prepararNuevaPlaneacion = useCallback((nuevaSemana) => {
    setCabecera((prev) => ({
      ...prev,
      numero_semana: "new",
      num_sesiones: "1",
      unidad: "",
      observaciones: "",
    }));
    setSesiones([
      {
        numero_sesion: 1,
        objetivo_sesion: "",
        inicio: "",
        desarrollo: "",
        cierre: "",
        materiales_recursos: "",
      },
    ]);
  }, []);

  useEffect(() => {
    const cargarSemanas = async () => {
      try {
        const semanasBD = await fetchSemanasPlaneadas(
          token,
          docenteSeleccionadoId,
          materiaSeleccionada.clave,
          materiaSeleccionada.grupo,
        );
        setSemanasPlaneadas(semanasBD);

        if (semanasBD.length > 0) {
          cargarDetalleSemana(Math.max(...semanasBD));
        } else if (!isDirector) {
          prepararNuevaPlaneacion(1);
        }
      } catch (error) {
        console.error("Error cargando semanas:", error);
      }
    };
    if (materiaSeleccionada) cargarSemanas();
  }, [
    materiaSeleccionada,
    isDirector,
    token,
    docenteSeleccionadoId,
    cargarDetalleSemana,
    prepararNuevaPlaneacion,
  ]);

  // --- HANDLERS OPTIMIZADOS ---

  const manejarCambioSemana = (e) => {
    const valor = e.target.value;
    if (valor === "new") {
      prepararNuevaPlaneacion(
        semanasPlaneadas.length > 0 ? Math.max(...semanasPlaneadas) + 1 : 1,
      );
    } else {
      cargarDetalleSemana(valor);
    }
  };

  const manejarCambioCabecera = (e) =>
    setCabecera((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Lógica de sesiones simplificada usando métodos inmutables (Array.from y slice)
  const manejarCambioNumSesiones = (e) => {
    if (isDirector) return;
    const valor = e.target.value;
    if (!/^\d*$/.test(valor)) return;

    setCabecera((prev) => ({ ...prev, num_sesiones: valor }));
    const nuevoNum = parseInt(valor, 10);

    if (!isNaN(nuevoNum) && nuevoNum > 0) {
      setSesiones((prev) => {
        if (nuevoNum > prev.length) {
          const nuevas = Array.from(
            { length: nuevoNum - prev.length },
            (_, i) => ({
              numero_sesion: prev.length + i + 1,
              objetivo_sesion: "",
              inicio: "",
              desarrollo: "",
              cierre: "",
              materiales_recursos: "",
            }),
          );
          return [...prev, ...nuevas];
        }
        return prev.slice(0, nuevoNum); // Recorta el arreglo si el número es menor
      });
    } else if (valor === "") {
      setSesiones((prev) => prev.slice(0, 1));
    }
  };

  const guardarPlaneacion = async () => {
    const sesionesFinales = parseInt(cabecera.num_sesiones, 10) || 1;
    const semanaFinal =
      cabecera.numero_semana === "new"
        ? semanasPlaneadas.length > 0
          ? Math.max(...semanasPlaneadas) + 1
          : 1
        : parseInt(cabecera.numero_semana, 10);

    try {
      await fetchGuardarPlaneacion(token, {
        docente_id: docenteSeleccionadoId,
        materia_clave: materiaSeleccionada.clave,
        id_grupo: materiaSeleccionada.grupo,
        ...cabecera,
        numero_semana: semanaFinal,
        num_sesiones: sesionesFinales,
        sesiones,
      });
      showNotification("¡Planeación guardada con éxito!", "success");
      if (!semanasPlaneadas.includes(semanaFinal))
        setSemanasPlaneadas((prev) => [...prev, semanaFinal]);
    } catch (error) {
      showNotification("Hubo un error al guardar la planeación.", "error");
    }
  };

  const copiarPlaneacion = () => {
    if (cabecera.numero_semana === "new" || !cabecera.numero_semana)
      return showNotification("No hay datos guardados para copiar.", "error");

    let texto = `=== PLANEACIÓN SEMANAL ===\nMateria: ${materiaSeleccionada.nombre}`;

    texto += `\n--- Parámetros de la Semana ---\nSemana: ${cabecera.numero_semana}\nTema/Unidad: ${cabecera.unidad || "N/A"}\nFecha: ${formatearFechaDma(cabecera.fecha_inicio)} al ${formatearFechaDma(cabecera.fecha_fin)}\n\n--- Desglose de Sesiones ---\n`;

    sesiones.forEach((s) => {
      texto += `\nSESIÓN ${s.numero_sesion}:\n`;
      CAMPOS_SESION.forEach(
        (c) => (texto += `${c.titulo}: ${stripHtml(s[c.key])}\n`),
      );
    });
    texto += `\n--- Observaciones Generales ---\n${stripHtml(cabecera.observaciones)}\n`;

    navigator.clipboard
      .writeText(texto)
      .then(() =>
        showNotification("¡Planeación copiada al portapapeles!", "success"),
      )
      .catch(() =>
        showNotification("Hubo un error al copiar el texto.", "error"),
      );
  };

  const abrirModalEditor = useCallback(
    (index, campo, titulo) => {
      if (isDirector && !sesiones[index]?.[campo] && index !== -1) return;
      if (isDirector && index === -1 && !cabecera.observaciones) return;
      setModalEditor({
        open: true,
        indexSesion: index,
        campo,
        tituloCampo: titulo,
        contenidoTemporal:
          index === -1 ? cabecera[campo] : sesiones[index][campo],
      });
    },
    [isDirector, sesiones, cabecera],
  );

  const guardarCambiosEditor = () => {
    if (isDirector) return cerrarModalEditor();
    if (modalEditor.indexSesion === -1) {
      setCabecera((prev) => ({
        ...prev,
        [modalEditor.campo]: modalEditor.contenidoTemporal,
      }));
    } else {
      setSesiones((prev) => {
        const nuevas = [...prev];
        nuevas[modalEditor.indexSesion][modalEditor.campo] =
          modalEditor.contenidoTemporal;
        return nuevas;
      });
    }
    setModalEditor((prev) => ({ ...prev, open: false }));
  };

  const cerrarModalEditor = () =>
    setModalEditor((prev) => ({ ...prev, open: false }));

  // --- RENDERIZADO VISUAL ---

  const proximaSemana =
    semanasPlaneadas.length > 0 ? Math.max(...semanasPlaneadas) + 1 : 1;
  const emptyPlaceholder = isDirector
    ? "<span style='color:#b0bec5; font-style:italic;'>Sin contenido</span>"
    : "<span style='color:#9e9e9e; font-style:italic;'>Haz clic para escribir...</span>";

  const estiloCeldaTexto = {
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "12px",
    minHeight: "100px",
    cursor: isDirector ? "default" : "pointer",
    backgroundColor: isDirector ? "#f9fafc" : "#ffffff",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      borderColor: isDirector ? "#e0e0e0" : "#1976d2",
      backgroundColor: isDirector ? "#f9fafc" : "#f0f7ff",
      boxShadow: isDirector ? "none" : "0 4px 12px rgba(25, 118, 210, 0.08)",
    },
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 4,
    WebkitBoxOrient: "vertical",
    "& ul, & ol": { margin: 0, paddingLeft: "24px", color: "text.primary" },
    "& p": { margin: 0, color: "text.primary", fontSize: "0.95rem" },
  };

  return (
    <Box p={3} sx={{ maxWidth: "1400px", margin: "0 auto" }}>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 4,
          gap: 3,
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Button
            variant="outlined"
            onClick={volver}
            sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
          >
            ← Mis materias
          </Button>
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, color: "text.primary" }}
            >
              Planeación:{" "}
              <Box component="span" color="primary.main">
                {materiaSeleccionada.nombre}
              </Box>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Grupo <strong>{materiaSeleccionada.grupo}</strong>{" "}
              {docenteInfo && ` • Docente: ${docenteInfo}`}
            </Typography>
          </Box>
        </Box>
        {isDirector && (
          <Button
            variant="contained"
            color="secondary"
            onClick={copiarPlaneacion}
            startIcon={<ContentCopyIcon />}
            sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
          >
            Copiar Planeación
          </Button>
        )}
      </Box>

      {/* SECCIÓN 1: CABECERA */}
      <Paper
        elevation={0}
        sx={{ p: 4, mb: 4, borderRadius: 2, border: "1px solid #e0e0e0" }}
      >
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Parámetros de la Semana
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel id="select-semana-label">Semana</InputLabel>
              <Select
                labelId="select-semana-label"
                value={cabecera.numero_semana}
                label="Semana"
                onChange={manejarCambioSemana}
                sx={{ borderRadius: 2, minWidth: 120 }}
              >
                {semanasPlaneadas.map((s) => (
                  <MenuItem key={s} value={s}>
                    Semana {s} 
                  </MenuItem>
                ))}
                {!isDirector && (
                  <MenuItem
                    value="new"
                    sx={{ fontWeight: "bold", color: "primary.main" }}
                  >
                    + Nueva Semana {proximaSemana}
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              label="Tema / Unidad"
              name="unidad"
              value={cabecera.unidad}
              onChange={manejarCambioCabecera}
              InputProps={{ readOnly: isDirector }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              label="Fecha Inicio"
              name="fecha_inicio"
              type={isDirector ? "text" : "date"}
              value={
                isDirector
                  ? formatearFechaDma(cabecera.fecha_inicio)
                  : cabecera.fecha_inicio
              }
              InputLabelProps={{ shrink: true }}
              onChange={manejarCambioCabecera}
              InputProps={{ readOnly: isDirector }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              label="Fecha Fin"
              name="fecha_fin"
              type={isDirector ? "text" : "date"}
              value={
                isDirector
                  ? formatearFechaDma(cabecera.fecha_fin)
                  : cabecera.fecha_fin
              }
              InputLabelProps={{ shrink: true }}
              onChange={manejarCambioCabecera}
              InputProps={{ readOnly: isDirector }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              label="Total de Sesiones"
              name="num_sesiones"
              value={cabecera.num_sesiones}
              onChange={manejarCambioNumSesiones}
              InputProps={{ readOnly: isDirector }}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
                minWidth: 100,
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((opcion) => (
                <MenuItem key={opcion} value={opcion}>
                  {opcion}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* SECCIÓN 2: TABLA DE SESIONES REFACTORIZADA (DRY) */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 2,
          border: "1px solid #e0e0e0",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{ p: 3, borderBottom: "1px solid #e0e0e0", bgcolor: "#fafafa" }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Desglose de Sesiones
          </Typography>
          {!isDirector && (
            <Typography variant="body2" color="text.secondary">
              Haz clic en cualquier recuadro para abrir el editor de texto
              enriquecido.
            </Typography>
          )}
        </Box>
        <Box sx={{ overflowX: "auto", p: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    bgcolor: "#f4f6f8",
                    borderBottom: "none",
                    borderRadius: "8px 0 0 8px",
                  }}
                  width="5%"
                >
                  #
                </TableCell>
                {CAMPOS_SESION.map((campo, i) => (
                  <TableCell
                    key={campo.key}
                    sx={{
                      fontWeight: 600,
                      color: "text.secondary",
                      bgcolor: "#f4f6f8",
                      borderBottom: "none",
                      borderRadius: i === 4 ? "0 8px 8px 0" : "0",
                    }}
                    width="19%"
                  >
                    {campo.titulo}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sesiones.map((sesion, index) => (
                <TableRow
                  key={index}
                  sx={{ "& td": { borderBottom: "1px dashed #e0e0e0", py: 2 } }}
                >
                  <TableCell>
                    <Box
                      sx={{
                        bgcolor: "primary.light",
                        color: "primary.contrastText",
                        width: 30,
                        height: 30,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        fontWeight: "bold",
                      }}
                    >
                      {sesion.numero_sesion}
                    </Box>
                  </TableCell>
                  {/* RENDERIZADO DINÁMICO DE LAS CELDAS */}
                  {CAMPOS_SESION.map((campo) => (
                    <TableCell key={campo.key}>
                      <Box
                        sx={estiloCeldaTexto}
                        onClick={() =>
                          abrirModalEditor(
                            index,
                            campo.key,
                            `${campo.titulo} - Sesión ${sesion.numero_sesion}`,
                          )
                        }
                        dangerouslySetInnerHTML={{
                          __html: sesion[campo.key] || emptyPlaceholder,
                        }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {/* SECCIÓN 3: OBSERVACIONES Y BOTÓN GUARDAR */}
      <Paper
        elevation={0}
        sx={{ p: 3, mb: 3, borderRadius: 2, border: "1px solid #e0e0e0" }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Observaciones Generales
        </Typography>
        <Box
          sx={{ ...estiloCeldaTexto, minHeight: "120px" }}
          onClick={() =>
            abrirModalEditor(-1, "observaciones", "Observaciones Generales")
          }
          dangerouslySetInnerHTML={{
            __html: cabecera.observaciones || emptyPlaceholder,
          }}
        />
      </Paper>

      {!isDirector && (
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={guardarPlaneacion}
            sx={{
              px: 6,
              py: 1.5,
              fontSize: "1.1rem",
              borderRadius: 2,
              boxShadow: "0 8px 16px rgba(25, 118, 210, 0.24)",
              "&:hover": { boxShadow: "0 10px 20px rgba(25, 118, 210, 0.32)" },
            }}
          >
            Guardar Planeación
          </Button>
        </Box>
      )}

      {/* MODAL EDITOR */}
      <Dialog
        open={modalEditor.open}
        onClose={cerrarModalEditor}
        maxWidth="md"
        fullWidth
        disableEscapeKeyDown={!isDirector}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ bgcolor: "#f4f6f8", pb: 2, fontWeight: 600 }}>
          {modalEditor.tituloCampo}
        </DialogTitle>
        <DialogContent dividers sx={{ height: "400px", p: 0 }}>
          {isDirector ? (
            <Box sx={{ p: 4, height: "100%", overflowY: "auto" }}>
              <Box
                dangerouslySetInnerHTML={{
                  __html: modalEditor.contenidoTemporal,
                }}
                sx={{
                  "& ul, & ol": { paddingLeft: "24px" },
                  "& p": { lineHeight: 1.7 },
                }}
              />
            </Box>
          ) : (
            <ReactQuill
              theme="snow"
              value={modalEditor.contenidoTemporal}
              onChange={(c) =>
                setModalEditor((prev) => ({ ...prev, contenidoTemporal: c }))
              }
              modules={modulosQuill}
              style={{ height: "100%", border: "none" }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: "#fafafa" }}>
          <Button
            onClick={cerrarModalEditor}
            color="inherit"
            sx={{ fontWeight: 600 }}
          >
            {isDirector ? "Cerrar" : "Cancelar"}
          </Button>
          {!isDirector && (
            <Button
              onClick={guardarCambiosEditor}
              variant="contained"
              color="primary"
              sx={{ px: 4, borderRadius: 2 }}
            >
              Aceptar
            </Button>
          )}
        </DialogActions>
      </Dialog>
      {NotificationComponent}
    </Box>
  );
}

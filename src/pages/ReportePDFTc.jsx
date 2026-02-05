import React from "react";
import { useLocation } from "react-router-dom";
import {
  PDFViewer,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

// Asegúrate de tener tu logo en esta ruta o ajustarla
import logo from "../assets/images/logo_h.jpg";

// --- ESTILOS DEL PDF ---
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  // Encabezado
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  logoContainer: {
    width: "15%",
  },
  logo: {
    width: 60,
    height: "auto",
  },
  institutionTextContainer: {
    width: "85%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  schoolName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  departmentName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  periodText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  // Cuerpo
  dateLine: {
    textAlign: "right",
    marginBottom: 20,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  salutation: {
    marginBottom: 15,
    fontFamily: "Helvetica-Bold",
  },
  paragraph: {
    textAlign: "justify",
    lineHeight: 1.5,
    marginBottom: 10,
  },
  bold: {
    fontFamily: "Helvetica-Bold",
  },
  // Lista de materias
  listContainer: {
    marginVertical: 10,
    marginLeft: 20,
  },
  listItem: {
    marginBottom: 5,
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  // Pie de página / Firma
  signatureContainer: {
    marginTop: 60,
    alignItems: "center",
  },
  atentamente: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  slogan: {
    fontSize: 10,
    fontFamily: "Helvetica-Oblique",
    marginBottom: 50, // Espacio para firma
    color: "#000",
  },
  directorName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    textAlign: "center",
  },
  directorTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    textAlign: "center",
  },
});

// --- LÓGICA DE FECHAS Y SEMESTRES ---
const getFechaActual = () => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  // Ejemplo: 06 de febrero de 2026
  return new Date().toLocaleDateString("es-MX", options).toUpperCase();
};

const getPeriodoEscolar = () => {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = fecha.getMonth() + 1; // 1-12

  // Si es Julio (7) o antes -> Enero - Julio
  // Si es Agosto (8) o después -> Agosto - Diciembre
  // Ajusta esta lógica según tu calendario escolar exacto
  return mes < 8 ? `ENERO - JULIO ${anio}` : `AGOSTO - DICIEMBRE ${anio}`;
};

const convertirNumeroOrdinal = (n) => {
  if (n === 1) return "PRIMER";
  if (n === 2) return "SEGUNDO";
  if (n === 3) return "TERCER";
  return `${n}°`;
};

// --- COMPONENTE DOCUMENTO INTERNO ---
const MiDocumentoPDF = ({ datos }) => {
  const { estudiante, parcial, materiasPendientes = [] } = datos;
  
  const nombreCompleto = `${estudiante.nombres} ${estudiante.apellidop} ${estudiante.apellidom}`.toUpperCase();
  const nombrePila = estudiante.nombres.toUpperCase(); // Solo nombres para el cuerpo del texto
  const fechaHoy = getFechaActual();
  const periodo = getPeriodoEscolar();
  const parcialTexto = convertirNumeroOrdinal(parseInt(parcial));

  const tienePendientes = materiasPendientes && materiasPendientes.length > 0;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        
        {/* ENCABEZADO */}
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
             {/* Asegúrate que la imagen cargue correctamente, si falla, comenta esta línea */}
            <Image style={styles.logo} src={logo} />
          </View>
          <View style={styles.institutionTextContainer}>
            <Text style={styles.schoolName}>COLEGIO JUAN FEDERICO HERBART PREPARATORIA</Text>
            <Text style={styles.departmentName}>DIRECCIÓN ACADÉMICA</Text>
            <Text style={styles.periodText}>{periodo}</Text>
          </View>
        </View>

        {/* FECHA */}
        <Text style={styles.dateLine}>{fechaHoy}</Text>

        {/* SALUDO */}
        <View style={styles.salutation}>
          <Text>A QUIEN CORRESPONDA</Text>
          <Text>P R E S E N T E</Text>
        </View>

        {/* --- CUERPO DEL REPORTE (CONDICIONAL) --- */}
        
        {tienePendientes ? (
          // CASO 1: TIENE MATERIAS PENDIENTES
          <>
            <Text style={styles.paragraph}>
              Por este medio le envío un cordial saludo, y aprovecho para compartir información relevante del avance académico de <Text style={styles.bold}>{nombreCompleto}</Text> en el <Text style={styles.bold}>{parcialTexto}</Text> parcial de este semestre <Text style={styles.bold}>{periodo}</Text>.
            </Text>
            
            <Text style={styles.paragraph}>
              Tras una revisión general, se ha identificado que <Text style={styles.bold}>{nombrePila}</Text> tiene <Text style={styles.bold}>ACTIVIDADES PENDIENTES</Text> en las siguientes asignaturas (el número corresponde a tales actividades no entregadas):
            </Text>

            <View style={styles.listContainer}>
              {materiasPendientes.map((materia, index) => (
                <Text key={index} style={styles.listItem}>
                  • {materia.nombre.toUpperCase()} ({materia.faltantes} Pendientes)
                </Text>
              ))}
            </View>

            <Text style={styles.paragraph}>
              Estas actividades forman parte de su evaluación continua a la fecha y no entregarlas puede tener un impacto negativo en su rendimiento académico. Por ello, solicitamos su apoyo para que el estudiante se acerque con cada docente y consulte la posibilidad de realizar o entregar dichas actividades.
            </Text>

            <Text style={styles.paragraph}>
              Es importante mencionar que algunas de estas actividades podrían haber sido prácticas en clase, presentaciones o trabajos en equipo, lo cual podría limitar la posibilidad de reponerlas en su totalidad. Por ello, es fundamental que <Text style={styles.bold}>{nombrePila}</Text> dialogue directamente con sus profesores para determinar las alternativas disponibles en cada caso.
            </Text>
          </>
        ) : (
          // CASO 2: NO TIENE PENDIENTES (MENSAJE PERSONALIZADO)
          <>
            <Text style={styles.paragraph}>
              Por este medio le envío un cordial saludo, y aprovecho para compartir información relevante del avance académico de <Text style={styles.bold}>{nombreCompleto}</Text> en el <Text style={styles.bold}>{parcialTexto}</Text> parcial de este semestre <Text style={styles.bold}>{periodo}</Text>.
            </Text>

            <Text style={styles.paragraph}>
              Tras una revisión general de su desempeño, nos complace informarle que <Text style={styles.bold}>{nombrePila}</Text> ha cumplido satisfactoriamente con <Text style={styles.bold}>TODAS LAS ACTIVIDADES</Text> registradas hasta la fecha en sus asignaturas.
            </Text>

            <Text style={styles.paragraph}>
              Reconocemos su esfuerzo, responsabilidad y compromiso académico. Le extendemos una felicitación y le invitamos a mantener este excelente ritmo de trabajo y dedicación durante el resto del semestre escolar.
            </Text>
          </>
        )}

        {/* CIERRE COMÚN */}
        <Text style={styles.paragraph}>
          Nos reiteramos a su disposición para cualquier duda o aclaración y agradecemos su atención, así como el seguimiento que pueda brindar a esta situación.
        </Text>

        {/* --- FIRMA --- */}
        <View style={styles.signatureContainer}>
          <Text style={styles.atentamente}>A T E N T A M E N T E</Text>
          <Text style={styles.slogan}>“Formando talentos con calidad y calidez”</Text>
          
          <Text style={styles.directorName}>SALVADOR YUNIOR AGUILAR RAMÍREZ</Text>
          <Text style={styles.directorTitle}>DIRECTOR ACADÉMICO PREPARATORIA</Text>
        </View>

      </Page>
    </Document>
  );
};

// --- COMPONENTE VISUALIZADOR PRINCIPAL ---
const ReportePDFTc = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const datosReporte = location.state;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Si entra directo sin datos, regresa o muestra error
  if (!datosReporte) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">No hay datos para generar el reporte.</Typography>
        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mt: 2 }}>Regresar</Button>
      </Box>
    );
  }

  const nombreArchivo = `Reporte_TC_${datosReporte.estudiante.matricula || "Alumno"}.pdf`;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "calc(100vh - 64px)", // Ajuste por navbar
        alignItems: "center",
        p: 2
      }}
    >
      {/* Botonera superior */}
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mb: 2, maxWidth: 1000 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Volver
        </Button>
        
        <PDFDownloadLink
          document={<MiDocumentoPDF datos={datosReporte} />}
          fileName={nombreArchivo}
          style={{ textDecoration: "none" }}
        >
          {({ loading }) => (
            <Button
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
              disabled={loading}
            >
              {loading ? "Generando..." : "Descargar PDF"}
            </Button>
          )}
        </PDFDownloadLink>
      </Box>

      {/* Visualizador */}
      {!isMobile ? (
        <Box sx={{ flexGrow: 1, width: '100%', maxWidth: 1000, border: '1px solid #ddd', boxShadow: 3 }}>
          <PDFViewer width="100%" height="100%" showToolbar={true}>
            <MiDocumentoPDF datos={datosReporte} />
          </PDFViewer>
        </Box>
      ) : (
        <Paper sx={{ p: 3, textAlign: "center", mt: 5 }}>
          <Typography variant="body1">
            La vista previa no está disponible en móviles.
            <br />
            Por favor, presiona el botón de descarga.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ReportePDFTc;
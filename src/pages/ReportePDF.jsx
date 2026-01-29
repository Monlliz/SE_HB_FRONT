import React from "react";
import { useLocation } from "react-router-dom";
import { obtenerFechaFormateada } from "../utils/fornatters.js";
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
import logo from "../assets/images/logo_h.jpg";

// Estilos actualizados para coincidir con la imagen
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 40, // Un poco más de margen general
  },
  // Contenedor principal del encabezado (Logo + Textos Institucionales)
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 0, // Sin línea por defecto
  },
  logoContainer: {
    width: "10%", // Espacio para el logo
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  logo: {
    width: 80, // Ajusta el tamaño según tu logo real para que no se deforme
    height: "auto",
  },
  institutionTextContainer: {
    width: "80%", // El resto del ancho para el texto
    flexDirection: "column",
    alignItems: "center", // Centrado horizontalmente respecto a su contenedor
    justifyContent: "center",
  },
  schoolName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  departmentName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  periodText: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  // Título del documento
  documentTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginTop: 5,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  // Línea de folio y fecha de generación (alineada a la derecha)
  folioDateLine: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold", // En la imagen parece negrita
    textAlign: "right",
    marginBottom: 20,
  },
  // ... resto de estilos (text, bold, infoSection, etc.) se mantienen ...
  text: {
    fontSize: 11,
    textAlign: "justify",
    fontFamily: "Helvetica",
    lineHeight: 1.5,
  },
  bold: {
    fontSize: 11,
    textAlign: "justify",
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.5,
  },
  infoSection: {
    marginTop: 10,
    //padding: 10,
    // border: "1px solid #cccccc", // En la imagen nueva no se ve borde en la info del alumno, lo quito o lo dejo opcional
  },
  incidentesContainer: {
    marginTop: 10,
  },
  incidenteItem: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  incidenteMotivo: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  incidenteDetalles: {
    fontSize: 9,
    fontFamily: "Helvetica-Oblique",
    color: "#555555",
    marginBottom: 6,
  },
  incidenteDescripcion: {
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#333333",
  },
  // --- NUEVOS ESTILOS PARA EL PIE DE PÁGINA ---
  footerTextContainer: {
    marginTop: 20,
    textAlign: "justify",
  },
  signatureContainer: {
    marginTop: 50, // Espacio grande entre el texto y el "Atentamente"
    alignItems: "center", // Centra todo el contenido de la firma
  },
  atentamente: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 2, // Separa las letras A T E N T A...
  },
  slogan: {
    fontSize: 10,
    fontFamily: "Helvetica-Oblique", // Itálica
    marginBottom: 60, // Espacio vertical para la firma física (papel)
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
    fontFamily: "Helvetica-Bold", // En la imagen parece Bold también
    textTransform: "uppercase",
    textAlign: "center",
  },
});
// Componente del Documento PDF

const MiDocumentoPDF = ({ datos }) => {
  // Fecha actual formateada para la línea de generación (DD/MM/AAAA HH:MM:SS)
  // Validamos si la fecha existe y es válida, si no, usamos la actual
  const fechaBase =
    datos.fecha_informe && !isNaN(new Date(datos.fecha_informe))
      ? new Date(datos.fecha_informe)
      : new Date();

  // Formato: 29 de enero de 2026 (o el formato que prefieras)
  const fechaGeneracion = fechaBase.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  //año
  const anioActual = new Date().getFullYear();
  //periodo escolar
  const periodoEscolar =
    new Date().getMonth() >= 7
      ? `AGOSTO - DICIEMBRE ${anioActual}`
      : `ENERO - JULIO ${anioActual}`;

  // Simulamos un número de informe (puedes pasarlo en 'datos' si lo tienes)
  const numeroInforme = datos.numero_informe || "1";

  return (
    <Document>
      <Page size="Letter" style={styles.page}>
        {/* --- NUEVO ENCABEZADO --- */}
        <View style={styles.headerContainer}>
          {/* Columna Izquierda: Logo */}
          <View style={styles.logoContainer}>
            <Image style={styles.logo} src={logo} />
          </View>

          {/* Columna Derecha: Textos Institucionales Centrados */}
          <View style={styles.institutionTextContainer}>
            <Text style={styles.schoolName}>
              COLEGIO JUAN FEDERICO HERBART PREPARATORIA
            </Text>
            <Text style={styles.departmentName}>DIRECCIÓN ACADÉMICA</Text>
            <Text style={styles.periodText}>{periodoEscolar}</Text>
          </View>
        </View>

        {/* Título del Documento */}
        <Text style={styles.documentTitle}>INFORME DE INCIDENCIA MENOR</Text>

        {/* Línea de Folio y Fecha (Alineada a la derecha) */}
        <Text style={styles.folioDateLine}>
          Informe No. {numeroInforme} generado el: {fechaGeneracion}
        </Text>

        {/* --- CUERPO DEL DOCUMENTO --- */}

        <View style={{ marginTop: 20, marginBottom: 10 }}>
          <Text style={styles.bold}>A QUIEN CORRESPONDA</Text>
          <Text style={styles.bold}>P R E S E N T E</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.text}>
            Por este medio le informo que{" "}
            <Text style={styles.bold}>
              {datos.R_NOMBRE} {datos.R_APELLIDOP} {datos.R_APELLIDM}
            </Text>{" "}
            ha sido acreedor a un{" "}
            <Text style={styles.bold}>INFORME DE INCIDENCIA MENOR</Text> según
            la siguiente información confirmada y validada por los miembros de
            la Dirección de Preparatoria:
          </Text>
        </View>

        {/* Lista de Incidentes */}
        <View style={styles.incidentesContainer}>
          {datos.R_INCIDENTES.map((incidente, index) => (
            <View key={incidente.id || index} style={styles.incidenteItem}>
              <Text style={styles.incidenteMotivo}>
                {incidente.motivo_incidencia}
              </Text>
              <Text style={styles.incidenteDetalles}>
                Fecha: {new Date(incidente.fecha).toLocaleDateString("es-MX")} |
                Hora: {incidente.creado_hora}
              </Text>
              <Text style={styles.incidenteDescripcion}>
                {`Solicitado por: ${incidente.solicitante}\nDescripción: ${incidente.descripcion}`}
              </Text>
            </View>
          ))}
        </View>

        {/* Pie de página / Advertencia */}
        {/* --- PIE DE PÁGINA / TEXTO FINAL --- */}
        <View style={styles.footerTextContainer}>
          <Text style={styles.text}>
            Le solicito que atienda a la brevedad esta información, pues es de
            nuestro interés trabajar en conjunto con su familia para el
            beneficio académico y bienestar integral de{" "}
            <Text style={styles.bold}>{datos.R_NOMBRE}</Text>. En caso de
            requerir alguna aclaración de este informe, puede hacerlo a través
            de los canales de comunicación establecidos por nuestra Institución.
          </Text>
        </View>

        {/* --- SECCIÓN DE FIRMA --- */}
        <View style={styles.signatureContainer}>
          {/* A T E N T A M E N T E */}
          <Text style={styles.atentamente}>A T E N T A M E N T E</Text>

          {/* Slogan en cursiva */}
          <Text style={styles.slogan}>
            “Formando talentos con calidad y calidez”
          </Text>

          {/* Nombre y Cargo del Director */}
          <Text style={styles.directorName}>
            SALVADOR YUNIOR AGUILAR RAMÍREZ
          </Text>
          <Text style={styles.directorTitle}>
            DIRECTOR ACADÉMICO PREPARATORIA
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// ... El resto del componente ReportePDF se mantiene igual ...
const ReportePDF = () => {
  // ... lógica del botón de descarga y visualizador ...
  const location = useLocation();
  const datosReporte = location.state;
  // ... (sin cambios aquí)
  if (!datosReporte) return null; // versión simplificada para el ejemplo

  // ... return del componente ReportePDF ...
  // (Copiar el return del componente ReportePDF original)
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "calc(100vh - 8vh)",
        marginTop: "8vh",
        alignItems: "center",
      }}
    >
      <Box sx={{ my: 2 }}>
        <PDFDownloadLink
          document={<MiDocumentoPDF datos={datosReporte} />}
          fileName={`Reporte_${datosReporte.R_MATRICULA}.pdf`}
          style={{ textDecoration: "none" }}
        >
          {({ blob, url, loading, error }) => (
            <Button
              variant="contained"
              color="primary"
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <DownloadIcon />
                )
              }
              disabled={loading}
            >
              {loading ? "Generando PDF..." : "Descargar Reporte PDF"}
            </Button>
          )}
        </PDFDownloadLink>
      </Box>

      {!isMobile ? (
        <PDFViewer width="100%" height="100%">
          <MiDocumentoPDF datos={datosReporte} />
        </PDFViewer>
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ px: 3, textAlign: "center" }}
        >
          La vista previa no está disponible en dispositivos móviles.
        </Typography>
      )}
    </Box>
  );
};

export default ReportePDF;

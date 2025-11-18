import React from "react";
// 1. Importamos el hook 'useLocation'
import { useLocation } from "react-router-dom";

// Corregí el typo en la ruta (formatters)
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
import { Box, Typography,Button,CircularProgress } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import logo from "../assets/images/herbart_logo.jpg";

// La definición de estilos no cambia
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
  },
  header: {
    position: "absolute",
    top: 30,
    left: 30,
    right: 30,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  image: {
    width: 120,
  },
  fecha: {
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 18,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    marginTop: 80, // Espacio para el encabezado
  },
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
    marginTop: 20,
    padding: 10,
    border: "1px solid #cccccc",
    borderRadius: 5,
  },

  incidentesContainer: {
    marginTop: 20,
  },
  incidenteItem: {
    marginBottom: 15, // Espacio entre cada incidente
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
});

// 2. MODIFICAMOS 'MiDocumentoPDF' para que reciba los datos como 'props'
const MiDocumentoPDF = ({ datos }) => {
  const fechaDeHoy = obtenerFechaFormateada();

  return (
    <Document>
      <Page size="Letter" style={styles.page}>
        {/* Encabezado con logo y fecha */}
        <View style={styles.header}>
          <Text style={styles.fecha}>Tepic, Nayarit a {fechaDeHoy}</Text>
          <Image style={styles.image} src={logo} />
        </View>

        <Text style={styles.title}>Reporte de Incidencias</Text>

        {/* Usamos los datos recibidos en las props */}
        <View style={styles.infoSection}>
          <Text style={styles.text}>Alumno:</Text>
          <Text
            style={{
              ...styles.text,
              fontFamily: "Helvetica-Bold",
              marginTop: 10,
            }}
          >
            {/* Corregí el typo R_APELLIDP -> datos.R_APELLIDOP */}
            {datos.R_NOMBRE} {datos.R_APELLIDOP} {datos.R_APELLIDM}
          </Text>
          <Text style={styles.text}>Matrícula: {datos.R_MATRICULA}</Text>
        </View>

        <View style={styles.incidentesContainer}>
          <Text
            style={{
              ...styles.text,
              fontFamily: "Helvetica-Bold",
              fontSize: 14,
              marginBottom: 10,
            }}
          >
            Incidentes:
          </Text>

          {datos.R_INCIDENTES.map((incidente, index) => (
            // 1. Contenedor principal para cada incidente con su 'key'
            <View key={incidente.id || index} style={styles.incidenteItem}>
              {/* 2. Motivo en negrita */}
              <Text style={styles.incidenteMotivo}>
                {incidente.motivo_incidencia}
              </Text>

              {/* 3. Detalles (fecha y hora) en una línea separada y con estilo diferente */}
              <Text style={styles.incidenteDetalles}>
                Fecha: {new Date(incidente.fecha).toLocaleDateString("es-MX")} |
                Hora: {incidente.creado_hora}
              </Text>

              {/* 4. Descripción en un párrafo separado */}
              <Text style={styles.incidenteDescripcion}>
                {`Solicitado por: ${incidente.solicitante}\nDescripción: ${incidente.descripcion}`}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 10 }}>
          <Text style={styles.text}>
            Se le solicita atentamente que atienda las incidencias presentadas
            con su hijo. Le recordamos que la acumulación de{" "}
            <Text style={styles.bold}>cinco (5) reportes</Text> será motivo para
            considerar su{" "}
            <Text style={styles.bold}>expulsión permanente del colegio. </Text>
            Asimismo, ponemos a su disposición{" "}
            <Text style={styles.bold}>
              el apoyo de la Oficina de Dirección de Preparatoria,
            </Text>{" "}
            a la cual puede acudir o comunicarse para obtener más información o
            recibir orientación sobre este asunto.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// 3. MODIFICAMOS 'ReportePDF' para que obtenga los datos y los pase
const ReportePDF = () => {
  const location = useLocation();
  const datosReporte = location.state;

  if (!datosReporte) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6">
          No hay datos para generar el reporte.
        </Typography>
      </Box>
    );
  }

  // Detectar si es móvil (una forma sencilla)
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "calc(100vh - 8vh)",
        marginTop: "8vh",
        alignItems: "center", // Centrar contenido
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

      {/* VISUALIZADOR: Solo lo mostramos si NO es móvil para evitar errores visuales */}
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
          La vista previa no está disponible en dispositivos móviles. Por favor,
          utiliza el botón de arriba para descargar el archivo.
        </Typography>
      )}
    </Box>
  );
};

export default ReportePDF;

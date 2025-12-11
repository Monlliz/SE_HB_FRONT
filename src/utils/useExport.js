import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const useExport = () => {
  // Generar nombre con fecha: reporte_2025-12-09
  const getFileName = (name) => {
    const time = new Date().toISOString().slice(0, 10);
    return `${name}_${time}`;
  };

  // Función principal
  const exportar = (data, fileNameBase, format) => {
    if (!data || data.length === 0) {
      alert("No hay datos para exportar");
      return;
    }

    const fileName = getFileName(fileNameBase);

    try {
      switch (format) {
        case "xlsx": // Excel
        case "csv": // CSV

          exportWithSheetJS(data, fileName, format);
          break;

        case "pdf": // PDF
          exportPDF(data, fileName);
          break;

        default:
          console.error("Formato no soportado");
          alert("Formato no soportado");
      }
    } catch (error) {
      console.error("Error exportando:", error);
      alert("Hubo un error generando el archivo.");
    }
  };

  // --- LÓGICA EXCEL (.xlsx) Y CSV (.csv) ---
  const exportWithSheetJS = (data, fileName, format) => {
    // 1. Convertir JSON a Hoja de cálculo
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 2. Crear Libro de trabajo
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

    // 3. Descargar archivo (detecta si es .xlsx o .csv por la extensión)
    XLSX.writeFile(workbook, `${fileName}.${format}`);
  };

  // --- LÓGICA PDF ---
  const exportPDF = (data, fileName) => {
    const doc = new jsPDF();
    const tableColumn = Object.keys(data[0]);
    const tableRows = data.map((item) => Object.values(item));

    doc.text( `${fileName}`, 14, 15);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save(`${fileName}.pdf`);
  };

  return { exportar };
};

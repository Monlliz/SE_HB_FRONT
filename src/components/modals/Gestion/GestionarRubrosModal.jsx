import React, { useState, useEffect, useMemo } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  InputAdornment,
} from "@mui/material";
import { fetchRubrosUpdate } from "../../../services/rubroService";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import SaveIcon from "@mui/icons-material/Save";

function GestionarRubrosModal({
  open,
  onClose,
  rubrosActuales,
  materiaClave,
  nombreMateria,
  idGrupo,
  yearAcademico,
  token,
  onGuardar,
}) {
  const [rubrosEdit, setRubrosEdit] = useState([]);
  const [errorSuma, setErrorSuma] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 1. CARGA DE DATOS (Con Auto-Generador de Rubros por Defecto)
  useEffect(() => {
    if (open) {
      if (rubrosActuales && rubrosActuales.length > 0) {
        // Si ya existen, los copiamos y pasamos a formato entero
        const rubrosCopiados = JSON.parse(JSON.stringify(rubrosActuales));
        const rubrosEnteros = rubrosCopiados.map((rubro) => ({
          ...rubro,
          ponderacion: String(Math.round(Number(rubro.ponderacion || 0) * 100)),
        }));
        setRubrosEdit(rubrosEnteros);
      } else {
        // SI ESTÁ VACÍO: Generamos la plantilla por defecto
        const timestamp = Date.now();
        const rubrosPorDefecto = [
          {
            id_rubro: `new_${timestamp}_1`,
            nombre_rubro: "Trabajo Cotidiano",
            ponderacion: "25",
            materia_clave: materiaClave,
            id_grupo: idGrupo,
            year_academico: yearAcademico,
          },
          {
            id_rubro: `new_${timestamp}_2`,
            nombre_rubro: "Formacion Actitudinal",
            ponderacion: "15",
            materia_clave: materiaClave,
            id_grupo: idGrupo,
            year_academico: yearAcademico,
          },
          {
            id_rubro: `new_${timestamp}_3`,
            nombre_rubro: "Trabajo Integrador",
            ponderacion: "30",
            materia_clave: materiaClave,
            id_grupo: idGrupo,
            year_academico: yearAcademico,
          },
          {
            id_rubro: `new_${timestamp}_4`,
            nombre_rubro: "Examen",
            ponderacion: "30",
            materia_clave: materiaClave,
            id_grupo: idGrupo,
            year_academico: yearAcademico,
          }
        ];
        setRubrosEdit(rubrosPorDefecto);
      }
    }
  }, [open, rubrosActuales, materiaClave, idGrupo, yearAcademico]);

  // 2. SUMATORIA
  const sumaPonderaciones = useMemo(() => {
    const total = rubrosEdit.reduce(
      (acc, rubro) => acc + Number(rubro.ponderacion || 0),
      0
    );
    return total; 
  }, [rubrosEdit]);

  useEffect(() => {
    setErrorSuma(sumaPonderaciones !== 100);
  }, [sumaPonderaciones]);

  // --- MANEJADORES DE CAMBIOS ---
  const handleRubroChange = (index, campo, valor) => {
    const nuevosRubros = [...rubrosEdit];

    if (campo === "ponderacion") {
      if (valor === "") {
        nuevosRubros[index][campo] = "0";
        setRubrosEdit(nuevosRubros);
        return;
      }

      if (!/^\d+$/.test(valor)) {
        return;
      }

      let valorLimpio = valor;
      if (valor.length > 1 && valor.startsWith("0")) {
        valorLimpio = valor.replace(/^0+/, "");
        if (valorLimpio === "") valorLimpio = "0";
      }

      if (Number(valorLimpio) > 100) {
        return;
      }

      nuevosRubros[index][campo] = valorLimpio;
    } else {
      nuevosRubros[index][campo] = valor;
    }

    setRubrosEdit(nuevosRubros);
  };

  const handleAddRubro = () => {
    setRubrosEdit([
      ...rubrosEdit,
      {
        id_rubro: `new_${Date.now()}`,
        nombre_rubro: "",
        ponderacion: "0", 
        materia_clave: materiaClave,
        id_grupo: idGrupo,
        year_academico: yearAcademico,
      },
    ]);
  };

  const handleDeleteRubro = (index) => {
    const nuevosRubros = rubrosEdit.filter((_, i) => i !== index);
    setRubrosEdit(nuevosRubros);
  };

  // --- MANEJADOR DE GUARDADO ---
  const handleGuardar = async () => {
    if (errorSuma) {
      alert("La suma de las ponderaciones debe ser 100%.");
      return;
    }

    try {
      setIsSaving(true);

      const rubrosParaEnviar = rubrosEdit.map(r => ({
        ...r,
        ponderacion: (Number(r.ponderacion) / 100).toFixed(2)
      }));

      const payload = {
        materiaClave: materiaClave,
        idGrupo: idGrupo,
        yearAcademico: yearAcademico,
        rubros: rubrosParaEnviar, 
      };

      await fetchRubrosUpdate(payload, token);
      onGuardar();
    } catch (err) {
      console.error("Error al guardar rúbros:", err);
      alert(err.message || "Hubo un error al guardar los rúbros.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Gestionar Rúbros de {nombreMateria}
        <span style={{ fontSize: "0.8rem", color: "gray", display: "block" }}>
          Grupo {idGrupo} - Ciclo {yearAcademico}
        </span>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {rubrosEdit.map((rubro, index) => (
            <Stack direction="row" spacing={2} key={rubro.id_rubro}>
              <TextField
                label="Nombre del Rúbro"
                value={rubro.nombre_rubro}
                onChange={(e) =>
                  handleRubroChange(index, "nombre_rubro", e.target.value)
                }
                fullWidth
                disabled={isSaving}
              />
              <TextField
                label="Ponderación"
                type="text"
                value={rubro.ponderacion}
                onChange={(e) =>
                  handleRubroChange(index, "ponderacion", e.target.value)
                }
                sx={{ width: 150 }}
                disabled={isSaving}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              />
              <IconButton
                onClick={() => handleDeleteRubro(index)}
                color="error"
                disabled={isSaving}
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
          ))}
        </Stack>

        <Button
          startIcon={<AddIcon />}
          onClick={handleAddRubro}
          sx={{ mt: 2 }}
          disabled={isSaving}
        >
          Añadir Rúbro
        </Button>

        <Alert
          severity={errorSuma ? "error" : "success"}
          icon={<InfoIcon />}
          sx={{ mt: 3 }}
        >
          Suma de ponderaciones: <strong>{sumaPonderaciones}%</strong>
          {!errorSuma ? " (¡Correcto!)" : " (Debe sumar 100%)"}
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={isSaving}>
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          variant="contained"
          disabled={errorSuma || isSaving || rubrosEdit.length === 0}
          startIcon={<SaveIcon />}
        >
          {isSaving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default GestionarRubrosModal;
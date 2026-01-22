import React, { useState, useEffect, useMemo, useCallback } from "react";
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
// Importa el NUEVO servicio que llama a /api/rubros/tc/sync
import { fetchRubrosTCUpdate } from "../../../services/rubroService.js";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import SaveIcon from "@mui/icons-material/Save";

// Renombramos el componente para mayor claridad
function GestionTrabajos({
  open,
  onClose,
  rubrosActuales,
  nombreMateria,
  token,
  onGuardar,
  materiaClave,
  idGrupo,
  parcial,
  yearC,
}) {
  // Estado local para los rúbros que se están editando
  const [rubrosEdit, setRubrosEdit] = useState([]);
  //obtener fecha
  const fechaHoy = new Date().toISOString().split("T")[0];
  // Cuando el modal se abre, copia los rúbros actuales al estado local
  // Cuando el modal se abre, copia los rúbros al estado local
  useEffect(() => {
    if (open && rubrosActuales) {
      const rubrosCopiados = JSON.parse(JSON.stringify(rubrosActuales));
      const rubrosConStrings = rubrosCopiados.map((rubro) => ({
        ...rubro,
        ponderacion: String(rubro.ponderacion || "0"),
        // Aseguramos que si viene null de la BD, sea "0"
        ponderacioninsuficiente: String(rubro.ponderacioninsuficiente ?? "0"),
      }));
      setRubrosEdit(rubrosConStrings);
    }
  }, [open, rubrosActuales]);



  // --- MANEJADORES DE CAMBIOS ---

  // Maneja el cambio en un TextField (nombre o ponderación)
  const handleRubroChange = (index, campo, valor) => {
    const nuevosRubros = [...rubrosEdit];

    // --- CAMBIO 1: Convertir % a decimal ---
    if (campo === "ponderacion" || campo === "ponderacioninsuficiente") {
      // Si el usuario escribe "50", lo convertimos a 0.5
      const valorDecimal = Number(valor) / 100;
      // Lo guardamos como string para ser consistentes (ej: "0.5")
      nuevosRubros[index][campo] = valorDecimal.toFixed(2);
    } else {
      nuevosRubros[index][campo] = valor;
    }

    setRubrosEdit(nuevosRubros);
  };

  // Añade un nuevo rúbro TC vacío
  // Añade un nuevo rúbro vacío a la lista
  const handleAddRubro = () => {
    let defaultPonderacion = "1";
    let defaultInsuficiente = "1";

    if (rubrosEdit.length > 0) {
      const ultimo = rubrosEdit[rubrosEdit.length - 1];
      defaultPonderacion = ultimo.ponderacion;
      // CORRECCIÓN AQUÍ:
      defaultInsuficiente = ultimo.ponderacioninsuficiente;
    }

    setRubrosEdit([
      ...rubrosEdit,
      {
        id_rubro: `new_${Date.now()}`,
        nombre_rubro: "",
        ponderacion: defaultPonderacion,
        ponderacioninsuficiente: defaultInsuficiente, // Usar minúsculas
        materia_clave: materiaClave,
        fecha_limite: fechaHoy,
      },
    ]);
  };

  // Elimina un rúbro de la lista
  const handleDeleteRubro = (index) => {
    const nuevosRubros = rubrosEdit.filter((_, i) => i !== index);
    setRubrosEdit(nuevosRubros);
  };

  // --- MANEJADOR DE GUARDADO ---
  const handleGuardar = async () => {
    try {
      for (let i = 0; i < rubrosEdit.length; i++) {
        const rubro = rubrosEdit[i];
        const numRubro = i + 1;

        // 1. Validar nombre vacío
        if (!rubro.nombre_rubro || rubro.nombre_rubro.trim() === "") {
          alert(
            `El nombre de la actividad en la fila ${numRubro} es obligatorio.`,
          );
          return; // Detiene la ejecución
        }

        // 2. Validar que las ponderaciones no sean 0
        const pRetardo = Number(rubro.ponderacion);
        const pInsuficiente = Number(rubro.ponderacioninsuficiente);

        if (pRetardo <= 0) {
          alert(
            `El % de Retardo en la actividad "${rubro.nombre_rubro}" debe ser mayor a 0.`,
          );
          return;
        }

        if (pInsuficiente <= 0) {
          alert(
            `El % Insuficiente en la actividad "${rubro.nombre_rubro}" debe ser mayor a 0.`,
          );
          return;
        }
      }

      const payload = {
        materiaClave: materiaClave,
        idGrupo: idGrupo,
        parcial: parcial,
        yearC: yearC,
        rubros: rubrosEdit, // El array ahora usa 'idrubrotc'
      };

      console.log("Enviando Rúbros TC para guardar:", payload);

      await fetchRubrosTCUpdate(payload, token);

      onGuardar(); // Cierra el modal y refresca los datos
    } catch (err) {
      console.error("Error al guardar rúbros TC:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Gestionar Trabajos Cotidianos de {nombreMateria}
      </DialogTitle>
      <DialogContent>
        {/* --- LISTA DE RÚBROS EDITABLES --- */}
        <Stack spacing={2} sx={{ mt: 2 }}>
          {rubrosEdit.map((rubro, index) => (
            // --- CORRECCIÓN 2 ---
            // Leemos 'idrubrotc' para el key
            <Stack direction="row" spacing={2} key={rubro.idrubrotc}>
              <TextField
                label="Nombre de la actividad"
                value={rubro.nombre_rubro}
                onChange={(e) =>
                  handleRubroChange(index, "nombre_rubro", e.target.value)
                }
                fullWidth
              />

              <TextField
                label="Fecha de entrega"
                type="date"
                value={
                  rubro.fecha_limite ? rubro.fecha_limite.split("T")[0] : ""
                }
                onChange={(e) =>
                  handleRubroChange(index, "fecha_limite", e.target.value)
                }
                sx={{ width: 250 }}
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <TextField
                // --- CAMBIO 1: Actualizar Label ---
                label="% Retardo"
                type="text"
                // --- CAMBIO 1: Convertir "0.5" a "50" para MOSTRAR ---
                value={Number(rubro.ponderacion) * 100}
                onChange={(e) => {
                  const value = e.target.value;

                  if (/^\d*$/.test(value)) {
                    const number = Number(value);
                    if (number <= 100) {
                      handleRubroChange(index, "ponderacion", value);
                    }
                  }
                }}
                sx={{ width: 200 }}
                // --- CAMBIO 1: Añadir el símbolo % ---
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
              />
              <TextField
                label="% Insuficiente"
                type="text"
                value={Number(rubro.ponderacioninsuficiente) * 100}
                onChange={(e) => {
                  const value = e.target.value;

                  if (/^\d*$/.test(value)) {
                    const number = Number(value);
                    if (number <= 100) {
                      handleRubroChange(
                        index,
                        "ponderacioninsuficiente",
                        value,
                      );
                    }
                  }
                }}
                sx={{ width: 200 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
              />

              <IconButton
                onClick={() => handleDeleteRubro(index)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
          ))}
        </Stack>

        <Button startIcon={<AddIcon />} onClick={handleAddRubro} sx={{ mt: 2 }}>
          Añadir Actividad
        </Button>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          variant="contained"
          startIcon={<SaveIcon />}
        >
          Guardar Cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default GestionTrabajos;

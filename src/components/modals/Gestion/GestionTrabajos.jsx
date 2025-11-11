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
import { fetchRubrosTCUpdate } from "../../services/rubroService.js";
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
  const [rubrosEdit, setRubrosEdit] = useState([]);

  // Cuando el modal se abre, copia los rúbros actuales al estado local
// Cuando el modal se abre, copia los rúbros al estado local
  useEffect(() => {
    // Hacemos una copia profunda
    const rubrosCopiados = JSON.parse(JSON.stringify(rubrosActuales));

    // --- CAMBIO 1: Asegurar que las ponderaciones sean strings ---
    // Esto asegura que 0.5 (número) se vuelva "0.5" (string)
    const rubrosConStrings = rubrosCopiados.map(rubro => ({
      ...rubro,
      ponderacion: String(rubro.ponderacion)
    }));
    
    setRubrosEdit(rubrosConStrings);
  }, [open, rubrosActuales]);

  // Sigue siendo útil para MOSTRAR la suma
  const sumaPonderaciones = useMemo(() => {
    const total = rubrosEdit.reduce(
      (acc, rubro) => acc + Number(rubro.ponderacion),
      0
    );
    return Math.round(total * 100) / 100;
  }, [rubrosEdit]);

  // --- MANEJADORES DE CAMBIOS ---

 // Maneja el cambio en un TextField (nombre o ponderación)
  const handleRubroChange = (index, campo, valor) => {
    const nuevosRubros = [...rubrosEdit];

    // --- CAMBIO 1: Convertir % a decimal ---
    if (campo === "ponderacion") {
      // Si el usuario escribe "50", lo convertimos a 0.5
      const valorDecimal = Number(valor) / 100;
      // Lo guardamos como string para ser consistentes (ej: "0.5")
      nuevosRubros[index][campo] = String(valorDecimal);
    } else {
      nuevosRubros[index][campo] = valor;
    }
    
    setRubrosEdit(nuevosRubros);
  };

  // Añade un nuevo rúbro TC vacío
  // Añade un nuevo rúbro vacío a la lista
  const handleAddRubro = () => {
    // --- CAMBIO 2: Obtener la ponderación del último rubro ---
    let defaultPonderacion = "0.00"; // Default si no hay rubros
    if (rubrosEdit.length > 0) {
      // Asigna la misma ponderación del último ítem
      defaultPonderacion = rubrosEdit[rubrosEdit.length - 1].ponderacion;
    }
    // ---------------------------------------------------

    setRubrosEdit([
      ...rubrosEdit,
      {
        id_rubro: `new_${Date.now()}`, // ID temporal
        nombre_rubro: "",
        ponderacion: defaultPonderacion, // <-- USA EL VALOR OBTENIDO
        materia_clave: materiaClave,
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
                label="Fecha Límite"
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
                type="number"
                // --- CAMBIO 1: Convertir "0.5" a "50" para MOSTRAR ---
                value={Number(rubro.ponderacion) * 100}
                onChange={(e) =>
                  // Pasa el valor del % ("50") directamente
                  handleRubroChange(index, "ponderacion", e.target.value)
                }
                sx={{ width: 200 }}
                // --- CAMBIO 1: Añadir el símbolo % ---
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

        {/* --- Alerta informativa --- */}
        <Alert severity="info" icon={<InfoIcon />} sx={{ mt: 3 }}>
          Suma de ponderaciones de TC:{" "}
          <strong>{Number(sumaPonderaciones * 100).toFixed(0)}%</strong>
        </Alert>
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

import React, { useState, useEffect } from "react";
import {
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
import { fetchRubrosTCUpdate } from "../../../services/rubroService.js";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";

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
  const fechaHoy = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (open && rubrosActuales) {
      const rubrosCopiados = JSON.parse(JSON.stringify(rubrosActuales));
      const rubrosConStrings = rubrosCopiados.map((rubro) => ({
        ...rubro,
        ponderacion: String(Math.round(Number(rubro.ponderacion || 0) * 100)),
        ponderacioninsuficiente: String(Math.round(Number(rubro.ponderacioninsuficiente || 0) * 100)),
      }));
      setRubrosEdit(rubrosConStrings);
    }
  }, [open, rubrosActuales]);

  // --- MANEJADORES DE CAMBIOS ---

  const handleRubroChange = (index, campo, valor) => {
    const nuevosRubros = [...rubrosEdit];

    if (campo === "ponderacion" || campo === "ponderacioninsuficiente") {
      // 1. REGLA: No permitir vacío. Si borra todo, ponemos "0".
      if (valor === "") {
        nuevosRubros[index][campo] = "0";
        setRubrosEdit(nuevosRubros);
        return;
      }

      // 2. Solo permitir números
      if (!/^\d+$/.test(valor)) {
        return; 
      }

      // 3. Limpiar ceros a la izquierda (ej: "05" -> "5")
      let valorLimpio = valor;
      if (valor.length > 1 && valor.startsWith("0")) {
        valorLimpio = valor.replace(/^0+/, "");
        // Si al quitar ceros queda vacío (ej: input era "00"), forzamos "0"
        if (valorLimpio === "") valorLimpio = "0";
      }

      // 4. (Opcional) Límite lógico de 100
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
    // --- CAMBIO: Por defecto inician en "100" ---
    let defaultPonderacion = "100";
    let defaultInsuficiente = "100";

    // (Opcional) Si prefieres copiar la del anterior, descomenta esto. 
    // Si quieres forzar 100 siempre, déjalo comentado o bórralo.
    /* if (rubrosEdit.length > 0) {
      const ultimo = rubrosEdit[rubrosEdit.length - 1];
      defaultPonderacion = ultimo.ponderacion;
      defaultInsuficiente = ultimo.ponderacioninsuficiente;
    } 
    */

    setRubrosEdit([
      ...rubrosEdit,
      {
        id_rubro: `new_${Date.now()}`,
        nombre_rubro: "",
        ponderacion: defaultPonderacion, // Inicia en 100
        ponderacioninsuficiente: defaultInsuficiente, // Inicia en 100
        materia_clave: materiaClave,
        fecha_limite: fechaHoy,
      },
    ]);
  };

  const handleDeleteRubro = (index) => {
    const nuevosRubros = rubrosEdit.filter((_, i) => i !== index);
    setRubrosEdit(nuevosRubros);
  };

  // --- MANEJADOR DE GUARDADO ---
  const handleGuardar = async () => {
    try {
      for (let i = 0; i < rubrosEdit.length; i++) {
        const rubro = rubrosEdit[i];
        if (!rubro.nombre_rubro || rubro.nombre_rubro.trim() === "") {
          alert(`El nombre de la actividad en la fila ${i + 1} es obligatorio.`);
          return;
        }
      }

      const rubrosParaEnviar = rubrosEdit.map(r => ({
        ...r,
        ponderacion: (Number(r.ponderacion) / 100).toFixed(2),
        ponderacioninsuficiente: (Number(r.ponderacioninsuficiente) / 100).toFixed(2)
      }));

      const payload = {
        materiaClave: materiaClave,
        idGrupo: idGrupo,
        parcial: parcial,
        yearC: yearC,
        rubros: rubrosParaEnviar, 
      };

      console.log("Enviando:", payload);
      await fetchRubrosTCUpdate(payload, token);
      onGuardar(); 
    } catch (err) {
      console.error("Error al guardar:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Gestionar Trabajos Cotidianos de {nombreMateria}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {rubrosEdit.map((rubro, index) => (
            <Stack direction="row" spacing={2} key={rubro.idrubrotc || rubro.id_rubro}>
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
                value={rubro.fecha_limite ? rubro.fecha_limite.split("T")[0] : ""}
                onChange={(e) =>
                  handleRubroChange(index, "fecha_limite", e.target.value)
                }
                sx={{ width: 250 }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="% Retardo"
                type="text"
                value={rubro.ponderacion}
                onChange={(e) => handleRubroChange(index, "ponderacion", e.target.value)}
                sx={{ width: 200 }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              />
              
              <TextField
                label="% Insuficiente"
                type="text"
                value={rubro.ponderacioninsuficiente}
                onChange={(e) => handleRubroChange(index, "ponderacioninsuficiente", e.target.value)}
                sx={{ width: 200 }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
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
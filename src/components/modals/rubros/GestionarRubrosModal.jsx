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
} from "@mui/material";
import { fetchRubrosUpdate } from "../../services/rubroService";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import SaveIcon from "@mui/icons-material/Save";

function GestionarRubrosModal({
  open,
  onClose,
  rubrosActuales,
  materiaClave,
  token,
  onGuardar,
}) {

  // Estado local para editar rúbros sin afectar el estado principal
  const [rubrosEdit, setRubrosEdit] = useState([]);
  const [errorSuma, setErrorSuma] = useState(false);

  // API Services (necesitarás crear estas funciones)
  // const { updateRubrosMateria } = useRubroApi(); // (Ejemplo de hook)

  // Cuando el modal se abre, copia los rúbros actuales al estado local
  useEffect(() => {
    // Hacemos una copia profunda para evitar mutaciones
    setRubrosEdit(JSON.parse(JSON.stringify(rubrosActuales)));
  }, [open, rubrosActuales]);

  // Calcula la suma total de ponderaciones CADA VEZ que cambian los rúbros
  const sumaPonderaciones = useMemo(() => {
    const total = rubrosEdit.reduce(
      (acc, rubro) => acc + Number(rubro.ponderacion),
      0
    );
    // Redondeamos para evitar problemas con decimales de JS
    return Math.round(total * 100) / 100;
  }, [rubrosEdit]);

  // Valida si la suma es 1 (100%)
  useEffect(() => {
    setErrorSuma(sumaPonderaciones !== 1.0);
  }, [sumaPonderaciones]);

  // --- MANEJADORES DE CAMBIOS ---

  // Maneja el cambio en un TextField (nombre o ponderación)
  const handleRubroChange = (index, campo, valor) => {
    const nuevosRubros = [...rubrosEdit];
    nuevosRubros[index][campo] = valor;
    setRubrosEdit(nuevosRubros);
  };

  // Añade un nuevo rúbro vacío a la lista
  const handleAddRubro = () => {
    setRubrosEdit([
      ...rubrosEdit,
      {
        id_rubro: `new_${Date.now()}`, // ID temporal
        nombre_rubro: "",
        ponderacion: "0.00",
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
    if (errorSuma) {
      alert("La suma de las ponderaciones debe ser 100%.");
      return;
    }

    try {
      // setLoading(true); // Puedes añadir un estado de carga

      const payload = {
        materiaClave: materiaClave, // Viene de las props
        rubros: rubrosEdit, // Tu array del estado
      };

      console.log("Enviando rúbros para guardar:", payload);
      await fetchRubrosUpdate(payload, token);
      onGuardar();
    } catch (err) {
      console.error("Error al guardar rúbros:", err);
      // setError("Hubo un error al guardar.");
    } finally {
      // setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Gestionar Rúbros de {materiaClave}</DialogTitle>
      <DialogContent>
        {/* --- LISTA DE RÚBROS EDITABLES --- */}
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
              />
              <TextField
                label="Ponderación (ej: 0.25)"
                type="number"
                value={rubro.ponderacion}
                onChange={(e) =>
                  handleRubroChange(index, "ponderacion", e.target.value)
                }
                sx={{ width: 200 }}
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
          Añadir Rúbro
        </Button>

        {/* --- VALIDACIÓN DE SUMA --- */}
        <Alert
          severity={errorSuma ? "error" : "success"}
          icon={<InfoIcon />}
          sx={{ mt: 3 }}
        >
          Suma de ponderaciones:{" "}
          <strong>{Number(sumaPonderaciones * 100).toFixed(0)}%</strong>
          {!errorSuma ? " (¡Correcto!)" : " (Debe sumar 100%)"}
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          variant="contained"
          disabled={errorSuma} // Deshabilita si la suma es incorrecta
          startIcon={<SaveIcon />}
        >
          Guardar Cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default GestionarRubrosModal;

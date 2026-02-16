import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Typography,
  Box,
  Slide,
  Divider
} from "@mui/material";
import { fetchRubrosTCUpdate } from "../../../services/rubroService.js";

// Iconos
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveIcon from "@mui/icons-material/Save";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

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
  const [isSaving, setIsSaving] = useState(false);
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
      if (valor === "") {
        nuevosRubros[index][campo] = "0";
        setRubrosEdit(nuevosRubros);
        return;
      }
      if (!/^\d+$/.test(valor)) return;
      let valorLimpio = valor;
      if (valor.length > 1 && valor.startsWith("0")) {
        valorLimpio = valor.replace(/^0+/, "");
        if (valorLimpio === "") valorLimpio = "0";
      }
      if (Number(valorLimpio) > 100) return;
      nuevosRubros[index][campo] = valorLimpio;
    } else {
      nuevosRubros[index][campo] = valor;
    }
    setRubrosEdit(nuevosRubros);
  };

  const handleAddRubro = () => {
    let defaultPonderacion = "100";
    let defaultInsuficiente = "100";
    if (rubrosEdit.length > 0) {
      const ultimo = rubrosEdit[rubrosEdit.length - 1];
      defaultPonderacion = ultimo.ponderacion;
      defaultInsuficiente = ultimo.ponderacioninsuficiente;
    }
    setRubrosEdit([
      ...rubrosEdit,
      {
        id_rubro: `new_${Date.now()}`,
        nombre_rubro: "",
        ponderacion: defaultPonderacion,
        ponderacioninsuficiente: defaultInsuficiente,
        materia_clave: materiaClave,
        fecha_limite: fechaHoy,
      },
    ]);
  };

  const handleDeleteRubro = (index) => {
    const nuevosRubros = rubrosEdit.filter((_, i) => i !== index);
    setRubrosEdit(nuevosRubros);
  };

  const handleGuardar = async () => {
    try {
      setIsSaving(true);
      for (let i = 0; i < rubrosEdit.length; i++) {
        const rubro = rubrosEdit[i];
        if (!rubro.nombre_rubro || rubro.nombre_rubro.trim() === "") {
          alert(`El nombre de la actividad en la fila ${i + 1} es obligatorio.`);
          setIsSaving(false);
          return;
        }
      }
      const rubrosParaEnviar = rubrosEdit.map(r => ({
        ...r,
        ponderacion: (Number(r.ponderacion) / 100).toFixed(2),
        ponderacioninsuficiente: (Number(r.ponderacioninsuficiente) / 100).toFixed(2)
      }));
      const payload = {
        materiaClave,
        idGrupo,
        parcial,
        yearC,
        rubros: rubrosParaEnviar,
      };
      await fetchRubrosTCUpdate(payload, token);
      onGuardar();
    } catch (err) {
      console.error("Error al guardar:", err);
      alert("Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      TransitionComponent={Transition}
      PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden' } }}
    >
      <DialogTitle sx={{ backgroundColor: "primary.main", color: "white", py: 2, px: 3 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <AssignmentIcon sx={{ color: 'white', opacity: 0.9 }} />
          <Box>
            <Typography variant="h6" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif', lineHeight: 1.2 }}>
              GESTIONAR TRABAJOS COTIDIANOS
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, fontFamily: '"Poppins", sans-serif' }}>
              {nombreMateria}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: "#f8f9fa", p: 3 }}>
        <TableContainer 
          component={Paper} 
          elevation={0} 
          sx={{ 
            maxHeight: '60vh', 
            border: '1px solid #e0e0e0',
            borderRadius: 2
          }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell width="5%" align="center" sx={{ bgcolor: '#fff', fontWeight: 'bold', color: 'text.secondary' }}>#</TableCell>
                <TableCell width="40%" sx={{ bgcolor: '#fff', fontWeight: 'bold', color: 'primary.main' }}>NOMBRE DE LA ACTIVIDAD</TableCell>
                <TableCell width="20%" sx={{ bgcolor: '#fff', fontWeight: 'bold', color: 'text.secondary' }}>FECHA LÍMITE</TableCell>
                <TableCell width="15%" align="center" sx={{ bgcolor: '#fff' }}>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary">VALOR (R)</Typography>
                    <Tooltip title="Porcentaje si se entrega con Retardo" arrow placement="top">
                      <HelpOutlineIcon sx={{ fontSize: 14, color: 'primary.light', cursor: 'help' }} />
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell width="15%" align="center" sx={{ bgcolor: '#fff' }}>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary">VALOR (I)</Typography>
                    <Tooltip title="Porcentaje si es Insuficiente" arrow placement="top">
                      <HelpOutlineIcon sx={{ fontSize: 14, color: 'primary.light', cursor: 'help' }} />
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell width="5%" align="center" sx={{ bgcolor: '#fff' }}></TableCell>
              </TableRow>
            </TableHead>
            
            <TableBody>
              {rubrosEdit.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary" variant="body1" sx={{ mb: 2 }}>
                      No hay actividades registradas aún.
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      Usa el botón "Agregar Actividad" en la parte inferior para comenzar.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rubrosEdit.map((rubro, index) => (
                  <TableRow key={rubro.idrubrotc || rubro.id_rubro} hover>
                    <TableCell align="center" sx={{ color: 'text.disabled', fontWeight: 'bold' }}>
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <TextField
                        placeholder="Ej. Mapa conceptual..."
                        value={rubro.nombre_rubro}
                        onChange={(e) => handleRubroChange(index, "nombre_rubro", e.target.value)}
                        fullWidth size="small" variant="outlined"
                        InputProps={{ sx: { bgcolor: 'white' } }} 
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="date"
                        value={rubro.fecha_limite ? rubro.fecha_limite.split("T")[0] : ""}
                        onChange={(e) => handleRubroChange(index, "fecha_limite", e.target.value)}
                        fullWidth size="small" variant="outlined"
                        InputProps={{ sx: { bgcolor: 'white' } }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        type="text"
                        value={rubro.ponderacion}
                        onChange={(e) => handleRubroChange(index, "ponderacion", e.target.value)}
                        size="small" sx={{ width: 90 }}
                        InputProps={{
                          endAdornment: <InputAdornment position="end"><Typography variant="caption" color="text.disabled">%</Typography></InputAdornment>,
                          sx: { bgcolor: 'white', textAlign: 'center', pr: 1 }
                        }}
                        inputProps={{ style: { textAlign: 'center' } }} 
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        type="text"
                        value={rubro.ponderacioninsuficiente}
                        onChange={(e) => handleRubroChange(index, "ponderacioninsuficiente", e.target.value)}
                        size="small" sx={{ width: 90 }}
                        InputProps={{
                          endAdornment: <InputAdornment position="end"><Typography variant="caption" color="text.disabled">%</Typography></InputAdornment>,
                          sx: { bgcolor: 'white', textAlign: 'center', pr: 1 }
                        }}
                        inputProps={{ style: { textAlign: 'center' } }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Eliminar actividad" arrow>
                        <IconButton
                          onClick={() => handleDeleteRubro(index)}
                          color="error" size="small"
                          sx={{ bgcolor: 'error.50', '&:hover': { bgcolor: 'error.100' } }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      {/* --- ZONA DE ACCIONES (FOOTER) --- */}
      <DialogActions sx={{ p: 2, bgcolor: '#fff', justifyContent: 'space-between', borderTop: '1px solid #eee' }}>
        
        {/* BOTÓN IZQUIERDA: AGREGAR */}
        <Button 
          startIcon={<AddCircleOutlineIcon />} 
          onClick={handleAddRubro} 
          variant="outlined" // Outlined para que destaque pero no compita con Guardar
          color="primary"
          disabled={isSaving}
          sx={{ fontWeight: 600, textTransform: 'none' }}
        >
          Agregar Actividad
        </Button>

        {/* GRUPO DERECHA: CANCELAR Y GUARDAR */}
        <Box display="flex" gap={1}>
          <Button 
            onClick={onClose} 
            color="inherit" 
            disabled={isSaving}
            sx={{ textTransform: 'none', fontWeight: 500 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            disabled={isSaving}
            sx={{ px: 3, textTransform: 'none', fontWeight: 600, boxShadow: 2 }}
          >
            {isSaving ? "Guardando..." : "Guardar Todo"}
          </Button>
        </Box>

      </DialogActions>
    </Dialog>
  );
}

export default GestionTrabajos;
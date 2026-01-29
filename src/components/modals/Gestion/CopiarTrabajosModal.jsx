import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';

// Servicios
import { fetchRubrosTCGet, copyRubrosTC_service } from "../../../services/rubroService";

// Helper para normalizar ID (por si viene como id_rubro o idrubrotc)
const getId = (item) => item.idrubrotc || item.id_rubro;

// Funciones de intersección para el checkbox
function not(a, b) {
  return a.filter((value) => b.findIndex(item => getId(item) === getId(value)) === -1);
}

function intersection(a, b) {
  return a.filter((value) => b.findIndex(item => getId(item) === getId(value)) !== -1);
}

export default function CopiarActividadesModal({ 
  open, 
  onClose, 
  materiaClave,
  grupoActualId, 
  parcial,
  yearC,
  token,
  onSuccess,
  listaGrupos = [] 
}) {
  const grupoOrigen = listaGrupos.length > 0 ? listaGrupos[0] : null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [left, setLeft] = useState([]);  
  const [right, setRight] = useState([]); 
  const [checked, setChecked] = useState([]);

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  // --- 1. CARGA DE DATOS CON ETIQUETADO ---
  useEffect(() => {
    const cargarDatos = async () => {
      if (!open || !grupoOrigen) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // A. Cargar DESTINO (Lo que YA existe)
        const dataDestino = await fetchRubrosTCGet({
          materiaClave, idGrupo: grupoActualId, parcial, yearC
        }, token);
        
        // ETIQUETAMOS: saved = true (Ya guardado en BD)
        const destino = (dataDestino || []).map(d => ({
            ...d,
            idrubrotc: getId(d),
            saved: true // <--- ESTO ES LA CLAVE
        }));
        
        setRight(destino);

        // B. Cargar ORIGEN (Lo nuevo posible)
        const dataOrigen = await fetchRubrosTCGet({
          materiaClave, idGrupo: grupoOrigen, parcial, yearC
        }, token);
        
        // ETIQUETAMOS: saved = false (Es nuevo si lo muevo)
        const origen = (dataOrigen || []).map(o => ({
            ...o,
            idrubrotc: getId(o),
            saved: false // <--- ESTO ES LA CLAVE
        }));

        // C. Filtro visual: No mostrar en izquierda lo que ya está en derecha (por Nombre)
        const rubrosFiltrados = origen.filter(origenItem => {
            return !destino.some(destinoItem => 
                destinoItem.nombre_rubro.trim().toLowerCase() === origenItem.nombre_rubro.trim().toLowerCase()
            );
        });

        if(rubrosFiltrados.length === 0 && origen.length > 0) {
           setError(`Todas las actividades ya existen en el grupo destino.`);
        } else if (origen.length === 0) {
           setError(`El grupo ${grupoOrigen} no tiene actividades.`);
        }

        setLeft(rubrosFiltrados);

      } catch (err) {
        console.error("Error al cargar:", err);
        setError("Error de conexión.");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [open, grupoOrigen, grupoActualId, materiaClave, parcial, yearC, token]);

  // --- LOGICA DE TRANSFERENCIA ---
  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];
    if (currentIndex === -1) newChecked.push(value);
    else newChecked.splice(currentIndex, 1);
    setChecked(newChecked);
  };

  const handleAllRight = () => {
    setRight(right.concat(left));
    setLeft([]);
  };

  const handleCheckedRight = () => {
    setRight(right.concat(leftChecked));
    setLeft(not(left, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    setLeft(left.concat(rightChecked));
    setRight(not(right, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const handleAllLeft = () => {
    setLeft(left.concat(right));
    setRight([]);
  };

  // --- RENDERIZADO VISUAL ---
  const customList = (title, items, isRightSide = false) => (
    <Paper sx={{ width: 300, height: 380, overflow: 'auto', border: '1px solid #ddd' }}>
       <Box sx={{ p: 1, borderBottom: '1px solid #ddd', bgcolor: isRightSide ? '#e3f2fd' : '#f5f5f5' }}>
        <Typography variant="subtitle2" align="center" fontWeight="bold">{title}</Typography>
        <Typography variant="caption" display="block" align="center">
            {items.length} actividades
        </Typography>
      </Box>
      <List dense component="div" role="list">
        {items.map((value) => {
          const id = value.idrubrotc; 
          const labelId = `list-item-${id}-label`;
          
          // Usamos la etiqueta saved para decidir el color/texto
          // Si saved es false, es NUEVO. Si es true, ya EXISTIA.
          const isNew = !value.saved; 

          return (
            <ListItem key={id} role="listitem" button onClick={handleToggle(value)}>
              <ListItemIcon>
                <Checkbox
                  checked={checked.indexOf(value) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': labelId }}
                />
              </ListItemIcon>
              <ListItemText 
                id={labelId} 
                primary={
                    <Box component="span" sx={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap: 0.5 }}>
                        {value.nombre_rubro}
                        {isRightSide && isNew && (
                            <Chip label="Nuevo" color="success" size="small" sx={{ height: 16, fontSize: '0.6rem' }} />
                        )}
                         {isRightSide && !isNew && (
                            <Chip label="Existe" variant="outlined" size="small" sx={{ height: 16, fontSize: '0.6rem' }} />
                        )}
                    </Box>
                }
                secondary={`Pond: ${(Number(value.ponderacion)*100).toFixed(0)}%`}
              />
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );

  // --- GUARDAR ---
  const handleCopiar = async () => {
    // FILTRAMOS USANDO LA ETIQUETA 'saved'
    // Solo queremos los que saved === false
    const rubrosNuevos = right.filter(r => r.saved === false);

    if (rubrosNuevos.length === 0) {
        onClose();
        return;
    }

    try {
        setLoading(true);

        // Limpiamos el objeto antes de enviar (quitamos 'saved' y IDs viejos)
        const rubrosLimpios = rubrosNuevos.map(r => ({
            nombre_rubro: r.nombre_rubro,
            fecha_limite: r.fecha_limite,
            ponderacion: r.ponderacion,
            ponderacioninsuficiente: r.ponderacioninsuficiente,
        }));

        const datosParaEnviar = {
            materiaClave,
            idGrupo: grupoActualId,
            parcial,
            yearC,
            rubros: rubrosLimpios
        };
        
        await copyRubrosTC_service(datosParaEnviar, token);
        
        onSuccess(); 
        onClose();
    } catch (e) {
        console.error(e);
        setError("Error al copiar: " + e.message);
    } finally {
        setLoading(false);
    }
  };

  // --- CALCULO DEL BOTÓN ---
  // Contamos cuántos elementos en la derecha tienen saved === false
  const countNuevos = right.filter(r => r.saved === false).length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        Copiar actividades
        <Typography variant="subtitle1" color="text.secondary">
            De <b>Grupo {grupoOrigen}</b> hacia <b>Grupo {grupoActualId}</b>
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {error && <Alert severity="info" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
        
        {loading && (
            <Box sx={{display:'flex', justifyContent:'center', my: 4}}>
                <CircularProgress />
            </Box>
        )}

        {!loading && (
             <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ mt: 1 }}>
             <Grid item>{customList(`Disponibles en ${grupoOrigen}`, left)}</Grid>
             
             <Grid item>
               <Grid container direction="column" alignItems="center">
                 <Button sx={{ my: 0.5 }} variant="outlined" size="small" onClick={handleAllRight} disabled={left.length === 0}>
                   <KeyboardDoubleArrowRightIcon />
                 </Button>
                 <Button sx={{ my: 0.5 }} variant="outlined" size="small" onClick={handleCheckedRight} disabled={leftChecked.length === 0}>
                   <KeyboardArrowRightIcon />
                 </Button>
                 <Button sx={{ my: 0.5 }} variant="outlined" size="small" onClick={handleCheckedLeft} disabled={rightChecked.length === 0}>
                   <KeyboardArrowLeftIcon />
                 </Button>
                 <Button sx={{ my: 0.5 }} variant="outlined" size="small" onClick={handleAllLeft} disabled={right.length === 0}>
                   <KeyboardDoubleArrowLeftIcon />
                 </Button>
               </Grid>
             </Grid>
             
             <Grid item>{customList(`Resultado en ${grupoActualId}`, right, true)}</Grid>
           </Grid>
        )}
       
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancelar</Button>
        <Button 
            onClick={handleCopiar} 
            variant="contained" 
            disabled={loading || countNuevos === 0}
        >
            Confirmar Copia ({countNuevos})
        </Button>
      </DialogActions>
    </Dialog>
  );
}
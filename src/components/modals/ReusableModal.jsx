import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Box,
    FormControlLabel,
    Checkbox,
    RadioGroup,
    Radio,
    FormLabel,
    FormControl,
    FormHelperText
} from "@mui/material";

export default function ReusableModal({
    open,
    onClose,
    title,
    initialValues = {},
    fields = [],
    onSubmit,
    iconEntity: IconE = null,
    existingData = []
}) {
    //manejador de estados para los datos del formulario
    const [formData, setFormData] = useState(initialValues);

    //Estado para guardar los errores de validación
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setFormData(initialValues);
        setErrors({});
    }, [initialValues, open]);

    // NUEVO: Función de validación robusta
    const validate = () => {
        let tempErrors = {};
        let isValid = true;

        fields.forEach((field) => {
            const value = formData[field.name];
            const label = field.label || field.name;

            // 1. Validación de REQUERIDO
            // Verificamos si es null, undefined o string vacío
            if (field.required && (value === "" || value === null || value === undefined)) {
                tempErrors[field.name] = `El campo ${label.toLowerCase()} es obligatorio.`;
                isValid = false;
            }

            // Solo validamos longitud si hay un valor (para no chocar con el requerido)
            if (value) {
                const strValue = String(value); // Convertimos a string por seguridad

                // 2. Validación de MIN LENGTH
                if (field.minLength && strValue.length < field.minLength) {
                    tempErrors[field.name] = `Mínimo ${field.minLength} caracteres.`;
                    isValid = false;
                }

                // 3. Validación de MAX LENGTH (Validación lógica por seguridad)
                if (field.maxLength && strValue.length > field.maxLength) {
                    tempErrors[field.name] = `Máximo ${field.maxLength} caracteres.`;
                    isValid = false;
                }

                // 4. Validación de PATRÓN (Regex) -> ¡AQUÍ ESTÁ TU CÓDIGO INTEGRADO!
                if (field.pattern) {
                    // Creamos la expresión regular desde el string de configuración
                    const regex = new RegExp(field.pattern);

                    // Si tiene valor y NO pasa el test del regex
                    if (!regex.test(strValue)) {
                        // Usamos el mensaje personalizado o uno genérico
                        tempErrors[field.name] = field.errorMessage || "Formato incorrecto.";
                        isValid = false;
                    }
                }
            }
            // 5. VALIDACIÓN DE UNICIDAD (NUEVO)
            // Si el campo tiene la propiedad unique: true
            if (field.unique && value) {
                // Buscamos si existe algún elemento en la lista que tenga el mismo valor
                const exists = existingData.some((item) => {
                    // Comparamos el valor (ignorando el elemento actual si estamos editando)
                    // Si el valor ya existe Y no es el mismo que tenía al principio (para permitir guardar sin cambios en edit)
                    return item[field.name] === value && value !== initialValues[field.name];
                });

                if (exists) {
                    tempErrors[field.name] = `El valor "${value}" ya existe en el sistema.`;
                    isValid = false;
                }
            }
        });


        setErrors(tempErrors);
        return isValid;
    };

    // Manejador inteligente: detecta si es checkbox, archivo o texto
    const handleChange = (e) => {
        const { name, type, checked, files } = e.target;
        let { value } = e.target;
        //CONVERTIR A MAYÚSCULAS AUTOMÁTICAMENTE
        // Si es texto o textarea, lo forzamos a mayúsculas
        if (type === "text" || type === "textarea" || !type) {
            // Aseguramos que sea string antes de convertir
            if (typeof value === "string") {
                value = value.toUpperCase();
            }
        }

        setFormData((prev) => ({
            ...prev,
            [name]:
                type === "checkbox" ? checked :
                    type === "file" ? files[0] :
                        value,
        }));

        // Si el usuario escribe y corrige el error, lo borramos en tiempo real
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = () => {
        if (validate()) {
            onSubmit(formData);
            onClose();
        }
    };

    // Función auxiliar para renderizar el campo correcto según el "switch"
    const renderField = (field) => {
        // Extraemos el error específico para este campo
        const errorMsg = errors[field.name];
        const hasError = !!errorMsg; // Convertimos a booleano

        switch (field.type) {

            // --- CASO 1: SELECT (Muy usado para relaciones) ---
            case "select":
                return (
                    <TextField
                        key={field.name}
                        select
                        label={field.label}
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        fullWidth
                        required={field.required}
                        disabled={field.disable}
                        //Props de error
                        error={hasError}
                        helperText={hasError ? errorMsg : field.helperText}
                    >
                        {field.options?.map((option) => (
                            <MenuItem key={option.id} value={option.id}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                );

            // --- CASO 2: TEXTAREA (Para descripciones largas) ---
            case "textarea":
                return (
                    <TextField
                        key={field.name}
                        label={field.label}
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        fullWidth
                        disabled={field.disable}
                        required={field.required}
                        variant="outlined"
                        multiline // Propiedad mágica de MUI
                        rows={4}  // Altura inicial
                        //Props de error y limitación física de caracteres
                        error={hasError}
                        helperText={hasError ? errorMsg : field.helperText}

                        inputProps={{ maxLength: field.maxLength }}
                    />
                );

            // --- CASO 3: CHECKBOX (Booleanos: Activo/Inactivo) ---
            case "checkbox":
                return (
                    <FormControl required={field.required} error={hasError} component="fieldset">
                        <FormControlLabel
                            key={field.name}
                            control={
                                <Checkbox
                                    checked={!!formData[field.name]}
                                    onChange={handleChange}
                                    name={field.name}
                                    color="primary"
                                    disabled={field.disable}
                                />
                            }
                            label={field.label}
                        />
                        {hasError && <FormHelperText>{errorMsg}</FormHelperText>}
                    </FormControl>
                );

            // --- CASO 4: RADIO BUTTONS (Opciones mutuamente excluyentes) ---
            case "radio":
                return (
                    <FormControl key={field.name} component="fieldset" error={hasError} required={field.required}>
                        <FormLabel component="legend">{field.label}</FormLabel>
                        <RadioGroup
                            name={field.name}
                            value={formData[field.name] || ""}
                            onChange={handleChange}
                            disabled={field.disable}
                            row
                        >
                            {field.options?.map((option) => (
                                <FormControlLabel
                                    key={option.value}
                                    value={option.value}
                                    control={<Radio />}
                                    label={option.label}
                                />
                            ))}
                        </RadioGroup>
                        {hasError && <FormHelperText>{errorMsg}</FormHelperText>}
                    </FormControl>
                );

            // --- CASO 5: ARCHIVOS (Subida de documentos/imágenes) ---
            case "file":
                return (
                    <Box key={field.name}>
                        {/* Etiqueta manual porque el input file es especial */}
                        <FormLabel sx={{ display: 'block', mb: 1, fontSize: '0.8rem', color: hasError ? 'error.main' : 'inherit' }}>
                            {field.label} {field.required && '*'}
                        </FormLabel>
                        <TextField
                            type="file"
                            name={field.name}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                            error={hasError}
                            disabled={field.disable}
                            helperText={hasError ? errorMsg : ""}
                            inputProps={{ accept: field.accept || "*/*" }}
                        />
                    </Box>
                );

            // --- DEFAULT: TODOS LOS INPUTS ESTÁNDAR (Text, Number, Email, Date, Password) ---
            // El 90% de tus campos caerán aquí.
            default:
                return (
                    <TextField
                        key={field.name}
                        type={field.type || "text"} // Si no pones tipo, es texto
                        label={field.label}
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        fullWidth
                        required={field.required}
                        variant="outlined"
                        disabled={field.disable}
                        //Props de error
                        error={hasError}
                        helperText={hasError ? errorMsg : field.helperText}
                        InputLabelProps={
                            ["date", "time", "datetime-local"].includes(field.type)
                                ? { shrink: true }
                                : {}
                        }
                        // Esto impide físicamente escribir más de la cuenta
                        inputProps={{
                            maxLength: field.maxLength
                        }}
                    />
                );
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">

            <DialogTitle sx={{
                backgroundColor: "primary.main",
                textAlign: "center",
                py: 1.5,
                fontFamily: '"Poppins", sans-serif',
                color: "white",
                fontWeight: 600
            }}>
                <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                    <IconE size={22} />
                    {title.toUpperCase()}
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                <Box
                    component="form"
                    sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1, p: 1 }}
                >
                    {fields.map((field) => {
                        // Obtenemos el componente del icono de la configuración del campo
                        const IconComponent = field.icon;

                        return (
                            // 1. Nuevo contenedor horizontal para cada fila (Icono + Input)
                            <Box
                                key={field.name}
                                sx={{
                                    display: "flex",
                                    alignItems: "flex-start", // Alineamos arriba por si el campo tiene etiqueta
                                    gap: 2, // Espacio entre el icono y el input
                                }}
                            >
                                {/* 2. Renderizado Condicional del Icono */}
                                {IconComponent && (
                                    // Usamos un Box con margen superior (mt) para alinear visualmente
                                    // el icono con la caja del input, saltándonos el label.
                                    // mt: 2.5 (20px) suele funcionar bien con los inputs estándar de MUI.
                                    <Box sx={{ mt: 2.5, color: "primary.main" }}>
                                        <IconComponent sx={{ fontSize: 24 }} />
                                    </Box>
                                )}

                                {/* 3. El Input renderizado ocupa el resto del espacio */}
                                <Box sx={{ flexGrow: 1 }}>
                                    {renderField(field)}
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit">
                    Cancelar
                </Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    Guardar
                </Button>
            </DialogActions>
        </Dialog>
    );
}
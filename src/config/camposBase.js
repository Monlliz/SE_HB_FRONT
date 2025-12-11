const camposEjemplo = [
  // MÁS USADOS
  { name: "nombre", label: "Nombre", type: "text", required: true },
  { name: "edad", label: "Edad", type: "number" },
  { name: "correo", label: "Email", type: "email" },
  { 
    name: "rol", 
    label: "Rol", 
    type: "select", 
    options: [{ value: 1, label: "Admin" }, { value: 2, label: "User" }] 
  },

  // TEXTO LARGO
  { name: "bio", label: "Biografía", type: "textarea" },

  // FECHAS
  { name: "nacimiento", label: "Fecha Nacimiento", type: "date" },

  // BOOLEANOS
  { name: "activo", label: "¿Está activo?", type: "checkbox" },
  
  // OPCIONES
  { 
    name: "genero", 
    label: "Género", 
    type: "radio", 
    options: [{ value: "M", label: "Masculino" }, { value: "F", label: "Femenino" }] 
  },

  // POCO USADOS
  { name: "foto", label: "Foto de perfil", type: "file", accept: "image/*" },
  { name: "color_favorito", label: "Color de la interfaz", type: "color" }
];
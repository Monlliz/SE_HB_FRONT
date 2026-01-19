const apiUrl = import.meta.env.VITE_API_URL;
//se usa en src\components\Alumno.jsx
export const fetchAlumnoGet = async (token) => {
  try {
    const resAlumnos = await fetch(`${apiUrl}/alumnos`, {
      headers: {
        "x-auth-token": token,
      },
    });

    if (!resAlumnos.ok) {
      if (resAlumnos.status === 401) {
        throw new Error(
          "Autorización rechazada. Por favor, inicia sesión de nuevo."
        );
      }

      throw new Error("Error al cargar los datos del servidor.");
    }

    const alumnos = await resAlumnos.json();
    return { alumnos: alumnos || [] };
  } catch (error) {
    console.error("Error en el servicio fetchAlumnoGet:", error.message);
    throw error;
  }
};

export const fetchAlumnoGetOne = async (token, matricula) => {
  try {
    const resAlumnos = await fetch(`${apiUrl}/alumnos/${matricula}`, {
      headers: {
        "x-auth-token": token,
      },
    });
    if (!resAlumnos.ok) {
      if (resAlumnos.status === 401) {
        throw new Error(
          "Autorización rechazada. Por favor, inicia sesión de nuevo."
        );
      }
      throw new Error("Error al cargar los datos del servidor.");
    }
    const alumnos = await resAlumnos.json();
    return { alumno: alumnos || [] };
  } catch (error) {
    console.error("Error en el servicio fetchAlumnoGet:", error.message);
    throw error;
  }
};

export const fetchAlumnosUpdateOne = async (
  token,
  matricula,
  datosParaEnviar
) => {
  try {
    const restAlumno = await fetch(`${apiUrl}/alumnos/${matricula}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
      body: JSON.stringify(datosParaEnviar),
    });
    if (!restAlumno.ok) {
      throw new Error("Error al actualizar el Alumno");
    }
  } catch (error) {
    console.error("Error en el servicio fetchAlumnosUpdateOne:", error.message);
    throw error;
  }
};

export const fetchAlumnoDeleteLogico = async (token, matricula) => {
  try {
    const restAlumno = await fetch(
      `${apiUrl}/alumnos/deletelogico/${matricula}`,
      {
        method: "PUT",
        headers: {
          "x-auth-token": token,
        },
      }
    );
    if (!restAlumno.ok) {
      throw new Error("Error al dar de baja a el Alumno");
    }
  } catch (error) {
    console.error("Error en el servicio fetchAlumnosUpdateOne:", error.message);
    throw error;
  }
};

export const fetchAlumnoPost = async (token, datosParaEnviar) => {
  try {
    const restAlumno = await fetch(`${apiUrl}/alumnos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
      body: JSON.stringify(datosParaEnviar),
    });
    if (!restAlumno.ok) {
      throw new Error("Error al dar de alta a Alumno");
    }
  } catch (error) {
    console.error("Error en el servicio fetchAlumnoPost:", error.message);
    throw error;
  }
};

export const fetchAlumnoGrupoGet = async (token, grupoId) => {
  try {
    const resAlumnos = await fetch(`${apiUrl}/alumnos/grupo/${grupoId}`, {
      headers: {
        "x-auth-token": token,
      },
    });

    if (!resAlumnos.ok) {
      if (resAlumnos.status === 401) {
        throw new Error(
          "Autorización rechazada. Por favor, inicia sesión de nuevo."
        );
      }

      throw new Error("Error al cargar los datos del servidor.");
    }

    const alumnos = await resAlumnos.json();
    return { alumnos: alumnos || [] };
  } catch (error) {
    console.error("Error en el servicio fetchAlumnoGrupoGet:", error.message);
    throw error;
  }
};

export const fetchAlumnoPerfilGet = async (token, idNormalizado, semestre) => {
  try {
    const resAlumnos = await fetch(
      `${apiUrl}/alumnos/perfil/${idNormalizado}/${semestre}`,
      {
        headers: {
          "x-auth-token": token,
        },
      }
    );

    if (!resAlumnos.ok) {
      if (resAlumnos.status === 401) {
        throw new Error(
          "Autorización rechazada. Por favor, inicia sesión de nuevo."
        );
      }

      throw new Error("Error al cargar los datos del servidor.");
    }

    const alumnos = await resAlumnos.json();
    return { alumnos: alumnos || [] };
  } catch (error) {
    console.error("Error en el servicio fetchAlumnoGrupoGet:", error.message);
    throw error;
  }
};

//Import con csv de alumnos
export const fetchAlumnoImport = async (token, formData) => {
  try {
    const resImport = await fetch(`${apiUrl}/alumnos/importar`, {
      method: "POST",
      headers: {
  
        "x-auth-token": token,
      },
      // El objeto FormData se envía directamente como cuerpo (body).
      body: formData,
    });

    const data = await resImport.json();

    if (!resImport.ok) {
      // Manejar la respuesta del servidor si no es 200/202.
      // Si el status es 401, el error es de autorización.
      if (resImport.status === 401) {
        throw new Error(
          "Autorización rechazada. Por favor, inicia sesión de nuevo."
        );
      }

      // Manejar el caso 400 (Archivo faltante o no CSV) y 500 (Error de servidor)
      const errorMessage =
        data.message || `Error del servidor: ${resImport.status}`;
      throw new Error(errorMessage);
    }

    // Si la respuesta es 200 (Éxito) o 202 (Éxito parcial con errores)
    // Devolvemos el reporte de la importación (data)
    return data;
  } catch (error) {
    console.error("Error en el servicio fetchAlumnoImport:", error.message);
    throw error;
  }
};

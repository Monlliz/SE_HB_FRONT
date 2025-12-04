import { id } from "date-fns/locale";

const apiUrl = import.meta.env.VITE_API_URL;
//se usa en src\components\Docente.jsx
export const fetchDocenteGet = async (token) => {
  try {
    const resDocentes = await fetch(`${apiUrl}/docente`, {
      headers: {
        "x-auth-token": token,
      },
    });

    if (!resDocentes.ok) {
      if (resDocentes.status === 401) {
        throw new Error(
          "Autorización rechazada. Por favor, inicia sesión de nuevo."
        );
      }

      throw new Error("Error al cargar los datos del servidor.");
    }

    const docentes = await resDocentes.json();
    return { docentes: docentes || [] };
  } catch (error) {
    console.error("Error en el servicio fetchDocenteGet:", error.message);
    throw error;
  }
};

//Se usa en src\components\modals\EditDocente.jsx y src\components\users\UserDocente.jsx
export const fetchDocenteGetOne = async (token, id) => {
  try {
    const resDocente = await fetch(`${apiUrl}/docente/${id}`, {
      headers: {
        "x-auth-token": token,
      },
    });
    if (!resDocente.ok) throw new Error("Error al cargar docente");
    const docente = await resDocente.json();
    return { docente: docente || [] };
  } catch (error) {
    console.error("Error en el servicio fetchDocenteGetOne:", error.message);
    throw error;
  }
};
//Se usa en src\components\users\UserDocente.jsx
export const fetchDocenteMaterias = async (token, id) => {
  try {
    const resMaterias = await fetch(`${apiUrl}/docente/materias/${id}`, {
      headers: {
        "x-auth-token": token,
      },
    });
    if (!resMaterias.ok) throw new Error("Error al cargar materias");
    const materias = await resMaterias.json();
    console.log(materias);
    return { materias: materias || [] };
  } catch (error) {
    console.error("Error en el servicio fetchDocenteMaterias:", error.message);
    throw error;
  }
};
//Se usa en src\components\modals\DesactivarDocente.jsx
export const fetchDocenteDesactivar = async (token, docenteId) => {
  try {
    const response = await fetch(`${apiUrl}/docente/delete/${docenteId}`, {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
    });

    if (!response.ok) {
      throw new Error("Error al Desactivar docente");
    }
  } catch (error) {
    console.error(
      "Error en el servicio fetchDocenteDesactivar:",
      error.message
    );
    throw error;
  }
};

//se usa en src\components\modals\EditDocente.jsx
export const fetchDocenteActualizar = async (
  token,
  docenteId,
  datosParaEnviar
) => {
  try {
    const response = await fetch(`${apiUrl}/docente/${docenteId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
      body: JSON.stringify(datosParaEnviar),
    });

    if (!response.ok) {
      throw new Error("Error al actualizar el docente");
    }
  } catch (error) {
    console.error(
      "Error en el servicio fetchDocenteActualizar:",
      error.message
    );
    throw error;
  }
};
//Se usa en src\components\modals\NewDocente.jsx
export const fetchDocentePost = async (token, datosParaEnviar) => {
  try {
    const response = await fetch(`${apiUrl}/docente`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
      body: JSON.stringify(datosParaEnviar),
    });

    if (!response.ok) {
      throw new Error("Error al ingresar un nuevo docente");
    }
  } catch (error) {
    console.error("Error en el servicio fetchDocentePost:", error.message);
    throw error;
  }
};

//Se usa en src\components\services\docenteService.js
export const fetchDocenteMateriasPost = async (
  token,
  docenteId,
  materiaSeleccionada,
  idGrupoOPerfil
) => {
  try {
    const response = await fetch(
      `${apiUrl}/docente/materia/${docenteId}/${materiaSeleccionada}/${idGrupoOPerfil}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error al guardar la asignación");
    }
  } catch (error) {
    console.error(
      "Error en el servicio fetchDocenteMateriasPost:",
      error.message
    );
    throw error;
  }
};

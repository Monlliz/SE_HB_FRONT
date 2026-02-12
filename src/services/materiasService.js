import { LogIn } from "lucide-react";

const apiUrl = import.meta.env.VITE_API_URL;

//-----------------------VISTA MATERIAS-------------------------//
//GET
export const fetchMateriasGet = async (token) => {
  try {
    const [resMaterias] = await Promise.all([
      fetch(`${apiUrl}/materias`, {
        headers: {
          "x-auth-token": token,
        },
      }),
    ]);
    if (!resMaterias.ok) {
      throw new Error("Error al obtener la lista de materias.");
    }
    const materias = await resMaterias.json();
    return { materias: materias || [] };
  } catch (error) {
    console.error("Error en el servicio fetchMateriasGet:", error.message);
    throw error;
  }
};

//POST
export const fetchMateriasPost = async (token, newmaterias) => {
  try {
    const [resMaterias] = await Promise.all([
      fetch(`${apiUrl}/materias`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(newmaterias),
      }),
    ]);
    if (!resMaterias.ok) {
      throw new Error("Error al obtener la lista de materias.");
    }
    const materias = await resMaterias.json();
    console.log(materias);

    return { materias: materias || [] };
  } catch (error) {
    console.error("Error en el servicio fetchMateriasPost:", error.message);
    throw error;
  }
};

export const fetchMateriasPut = async (token, clave, editmaterias) => {
  try {
    const response = await fetch(`${apiUrl}/materias/${clave}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
      body: JSON.stringify({ asignatura: editmaterias }),
    });
    if (!response.ok) throw new Error("Error al cargar materias");
    const materias = await response.json();
    return { materias: materias || [] };
  } catch (error) {
    console.error("Error en el servicio fetchMateriasPut:", error.message);
    throw error;
  }
};
export const fetchMateriasDeleteLogico = async (token, clave) => {
  try {
    const response = await fetch(`${apiUrl}/materias/deleteLogico/${clave}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
    });
    if (!response.ok) throw new Error("Error al cargar materias");
    const materias = await response.json();
    console.log(materias);

    return { materias: materias || [] };
  } catch (error) {
    console.error("Error en el servicio fetchMateriasPut:", error.message);
    throw error;
  }
};

//------------------------------------------------------------------------------------------//
//Obtener materias por grupo
export const fetchMateriasGrupo = async (token, id, anioActual) => {
  try {
    const resMaterias = await fetch(
      `${apiUrl}/materias/grupo/${id}/${anioActual}`,
      {
        headers: {
          "x-auth-token": token,
        },
      },
    );
    if (!resMaterias.ok) throw new Error("Error al cargar materias");
    const materias = await resMaterias.json();
    console.log(materias);
    return { materias: materias || [] };
  } catch (error) {
    console.error("Error en el servicio fetchMateriasGrupo:", error.message);
    throw error;
  }
};

//Se usa en BorrarMateria
export const fetchBorrarMateriaDocente = async (
  token,
  docenteId,
  idMateriaDocente,
) => {
  console.log(token, docenteId, idMateriaDocente);
  try {
    const response = await fetch(
      `${apiUrl}/docente/materia/delete/${docenteId}/${idMateriaDocente}`,
      {
        method: "put",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Error al eliminar la materia");
    }
  } catch (error) {
    console.error(
      "Error en el servicio fetchBorrarMateriaDocente:",
      error.message,
    );
    throw error;
  }
};

//se usa en BorrarMateriaGrupo
export const fetchBorrarMateriaGrupo = async (token, grupoId, clave) => {
  console.log(token);
  try {
    const response = await fetch(
      `${apiUrl}/materias/grupo/${grupoId}/${clave}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Error al eliminar la materia");
    }
  } catch (err) {
    throw new Error("La respuesta de la red no fue exitosa");
  }
};

//PERFIL
//Obtener materias por grupo
export const fetchMateriasPerfil = async (token, id, anioActual) => {
  try {
    const resMaterias = await fetch(
      `${apiUrl}/materias/perfil/${id}/${anioActual}`,
      {
        headers: {
          "x-auth-token": token,
        },
      },
    );
    if (!resMaterias.ok) throw new Error("Error al cargar materias");
    const materias = await resMaterias.json();

    return { materias: materias || [] };
  } catch (error) {
    console.error("Error en el servicio fetchMateriasPerfil:", error.message);
    throw error;
  }
};

//------------------------------------------------------------------------------------------//
// Importar materias csv
// ... (Tus servicios existentes de materias)

export const fetchMateriasImport = async (token, formData) => {
  // Asumiendo que tu base URL es /api/ y tu endpoint es /materias/importar
  try {
    const resImport = await fetch(`${apiUrl}/materias/importar`, {
      method: "POST",
      headers: {
        "x-auth-token": token,
      },
      body: formData,
    });

    const data = await resImport.json();

    if (!resImport.ok) {
      const errorMessage =
        data.message || `Error del servidor: ${resImport.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error("Error en el servicio fetchMateriasImport:", error.message);
    throw error;
  }
};

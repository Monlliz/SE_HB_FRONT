const apiUrl = import.meta.env.VITE_API_URL;

//Se usa en la vista de materias
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

//Obtener materias por grupo
export const fetchMateriasGrupo = async (token, id, anioActual) => {
  try {
    const resMaterias = await fetch(
      `${apiUrl}/materias/grupo/${id}/${anioActual}`,
      {
        headers: {
          "x-auth-token": token,
        },
      }
    );
    if (!resMaterias.ok) throw new Error("Error al cargar materias");
    const materias = await resMaterias.json();

    return { materias: materias || [] };
  } catch (error) {
    console.error("Error en el servicio fetchMateriasGrupo:", error.message);
    throw error;
  }
};

//Se usa en BorrarMateria
export const fetchBorrarMateriaDocente = async (token, docenteId, idMateriaDocente) => {
  try {
    const response = await fetch(
      `${apiUrl}/docente/materia/delete/${docenteId}/${idMateriaDocente}`,
      {
        method: "put",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error al eliminar la materia");
    }
  } catch (error) {
    console.error("Error en el servicio fetchBorrarMateriaDocente:", error.message);
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
      }
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
      }
    );
    if (!resMaterias.ok) throw new Error("Error al cargar materias");
    const materias = await resMaterias.json();

    return { materias: materias || [] };
  } catch (error) {
    console.error("Error en el servicio fetchMateriasPerfil:", error.message);
    throw error;
  }
};

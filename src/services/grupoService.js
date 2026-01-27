const apiUrl = import.meta.env.VITE_API_URL;
//Se usa en src\components\Grupo.jsx
export const fetchGrupoGet = async (token) => {
  try {
    const resGrupos = await fetch(`${apiUrl}/materias/api/grupos`, {
      headers: {
        "x-auth-token": token,
      },
    });
    if (!resGrupos.ok) {
      throw new Error("La respuesta de la red no fue exitosa");
    }
    const grupos = await resGrupos.json();
    return { grupos: grupos || [] };
  } catch (err) {
    throw new Error("La respuesta de la red no fue exitosa");
  }
};

export const fetchGrupoMateriaPost = async (
  token,
  grupoId,
  materiaSeleccionada
) => {
  try {
    const response = await fetch(
      `${apiUrl}/materias/grupo/${grupoId}/${materiaSeleccionada.clave}`,
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
  } catch (err) {
    throw new Error("Error en fetchGrupoMateriaPost", err.message);
  }
};

export const fetchGrupoCambio = async (token, grupoId1, grupoId2) => {
  try {
    console.log("fetchGrupoCambio", token, grupoId1, grupoId2);
    const response = await fetch(`${apiUrl}/grupo/${grupoId1}/${grupoId2}`, {
      method: "PUT",
      headers: {
        "x-auth-token": token,
      },
    });

    if (!response.ok) {
      throw new Error("Error al cambiar de grupo");
    }
  } catch (err) {
    throw new Error("Error en fetchGrupoCambio", err.message);
  }
};

//PERFIL SERVICE-----------------------------------
//No deben de estar aqui pero ni modo

export const fetchPerfilGet = async (token) => {
  try {
    const resPerfiles = await fetch(`${apiUrl}/materias/api/perfiles`, {
      headers: {
        "x-auth-token": token,
      },
    });
    if (!resPerfiles.ok) {
      throw new Error("La respuesta de la red no fue exitosa");
    }
    const perfiles = await resPerfiles.json();
    return { perfiles: perfiles || [] };
  } catch (err) {
    throw new Error("La respuesta de la red no fue exitosa");
  }
};

//Perfil materia post
export const fetcthPerfilMateriaPost = async (
  token,
  grupoId,
  materiaSeleccionada
) => {
  try {
    const response = await fetch(
      `${apiUrl}/materias/perfil/${grupoId}/${materiaSeleccionada.clave}`,
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
  } catch (err) {
    throw new Error("Error en fetchGrupoMateriaPost", err.message);
  }
};
//Borar materia perfil
export const fetchBorrarMateriaPerfil = async (token, grupoId, clave) => {

  try {
    const response = await fetch(
      `${apiUrl}/materias/perfil/${grupoId}/${clave}`,
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
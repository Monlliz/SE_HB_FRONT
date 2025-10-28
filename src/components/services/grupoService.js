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


export const fetchGrupoCambio = async (token,grupoId1,grupoId2) =>{
   try {
    const response = await fetch(
  
      `${apiUrl}/grupo/${grupoId1}/${grupoId2}`,
      {
        method: "PUT",
        headers: {
          "x-auth-token": token,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error al cambiar de grupo");
    }
  } catch (err) {
    throw new Error("Error en fetchGrupoCambio", err.message);
  }
};
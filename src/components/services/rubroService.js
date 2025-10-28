const apiUrl = import.meta.env.VITE_API_URL;

export const fetchRubrosMateriaGet = async (materia, token) => {
  try {
    const resRubros = await fetch(`${apiUrl}/rubro/${materia}`, {
      headers: {
        "x-auth-token": token,
      },
    });
    if (!resRubros.ok) throw new Error("Error al cargar los rubros");
    const rubros = await resRubros.json();
    return { rubros: rubros || [] };
  } catch (error) {
    console.error("Error en el servicio fetchRubrosMateriaGet:", error.message);
    throw error;
  }
};

export const fetchRubrosUpdate = async (datos, token) => {
  try {
    const resRubros = await fetch(`${apiUrl}/rubro/sync`, {
      method: "PUT",
      headers: {
        "x-auth-token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    });
    if (!resRubros.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error del servidor al guardar");
    }
  } catch (error) {
    console.error("Error en el servicio fetchRubrosUpdate:", error.message);
    throw error;
  }
};

export const fetchRubrosCalificacionesGet = async (
  materia,
  parcial,
  yearc,
  token
) => {
  const response = await fetch(
    `${apiUrl}/rubro/calificaciones/${materia}/${parcial}/${yearc}`,
    {
      method: "GET",
      headers: {
        "x-auth-token": token,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Error al sincronizar las calificaciones"
    );
  }

  return response.json();
};

export const syncCalificaciones_service = async (batchData, token) => {
  const response = await fetch(`${apiUrl}/rubro/calificaciones`, {
    method: "POST",
    headers: {
      "x-auth-token": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(batchData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Error al sincronizar las calificaciones"
    );
  }

  return response.json();
};

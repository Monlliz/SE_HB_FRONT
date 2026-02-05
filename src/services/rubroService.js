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
  token,
) => {
  const response = await fetch(
    `${apiUrl}/rubro/calificaciones/${materia}/${parcial}/${yearc}`,
    {
      method: "GET",
      headers: {
        "x-auth-token": token,
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Error al sincronizar las calificaciones",
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
      errorData.message || "Error al sincronizar las calificaciones",
    );
  }

  return response.json();
};

//rubros
export const fetchRubrosTCGet = async (context, token) => {
  console.log(context);
  const { materiaClave, idGrupo, parcial, yearC } = context;

  // Construimos los query parameters
  const queryParams = new URLSearchParams({
    materiaClave,
    idGrupo,
    parcial,
    yearC,
  });

  try {
    console.log(queryParams.toString());
    const response = await fetch(
      `${apiUrl}/rubro/tc?${queryParams.toString()}`,
      {
        headers: {
          "x-auth-token": token,
        },
      },
    );
    if (!response.ok) throw new Error("Error al cargar los rubros de TC");

    // El controlador devuelve directamente el array de rubros
    return await response.json();
  } catch (error) {
    console.error("Error en el servicio fetchRubrosTCGet:", error.message);
    throw error;
  }
};

/**
 * Sincroniza (Crea, Actualiza, Borra) los Rubros de TC.
 * Usa el endpoint POST /rubro/tc/sync
 */
export const fetchRubrosTCUpdate = async (datos, token) => {
  try {
    const response = await fetch(`${apiUrl}/rubro/tc/sync`, {
      method: "POST", // La ruta usa POST, no PUT
      headers: {
        "x-auth-token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos), // 'datos' ya contiene el contexto y los rubros
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Error del servidor al guardar Rubros TC",
      );
    }
    return response.json();
  } catch (error) {
    console.error("Error en el servicio fetchRubrosTCUpdate:", error.message);
    throw error;
  }
};

/**
 * Obtiene las Calificaciones de Trabajo Cotidiano (TC) usando query params.
 */
export const fetchCalificacionesTCGet = async (context, token) => {
  const { materiaClave, idGrupo, parcial, yearC } = context;

  const queryParams = new URLSearchParams({
    materiaClave,
    idGrupo,
    parcial,
    yearC,
  });

  const response = await fetch(
    `${apiUrl}/rubro/calificaciones-tc?${queryParams.toString()}`,
    {
      method: "GET",
      headers: {
        "x-auth-token": token,
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Error al obtener las calificaciones de TC",
    );
  }

  return response.json();
};

/**
 * Sincroniza (Upsert/Delete) las Calificaciones de TC.
 * El backend solo espera { grades: [...] }
 */
export const syncCalificacionesTC_service = async (batchData, token) => {
  const response = await fetch(`${apiUrl}/rubro/calificaciones-tc/sync`, {
    method: "POST",
    headers: {
      "x-auth-token": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(batchData), // ej: { grades: [...] }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Error al sincronizar las calificaciones de TC",
    );
  }

  return response.json();
};

//Copiar rubros
export const copyRubrosTC_service = async (datos, token) => {
  // datos debe ser: { materiaClave, idGrupo, parcial, yearC, rubros: [...] }

  const response = await fetch(`${apiUrl}/rubro/tc/copy`, {
    method: "POST",
    headers: {
      "x-auth-token": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Error al copiar las actividades de TC", // <--- Texto corregido
    );
  }
  return response.json();
};

//Conteo de datos
export const conteoEntregasTc_service = async (datos, token) => {

  const response = await fetch(`${apiUrl}/rubro/conteo-entregas-tc`, {
    method: "POST",
    headers: {
      "x-auth-token": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Error al contar las entregas de TC",
    );
  }
  return response.json();
};

export const conteoTrabajosTc_service = async (datos, token) => {

  const response = await fetch(`${apiUrl}/rubro/conteoTc`, {
    method: "POST",
    headers: {
      "x-auth-token": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Error al contar los trabajos de TC",
    );
  }
  return response.json();
};
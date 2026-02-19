const apiUrl = import.meta.env.VITE_API_URL;

//se usa en la vista asistencia
export const fetchDatosAsistencia = async (grupoId, year, mes, token) => {
  try {
    // Usamos Promise.all para ejecutar ambas peticiones al mismo tiempo
    const [resEstudiantes, resAsistencias] = await Promise.all([
      fetch(`${apiUrl}/alumnos/grupo/${grupoId}`, {
        headers: { "x-auth-token": token },
      }),
      fetch(`${apiUrl}/asistencia/${grupoId}/${year}/${mes}`, {
        headers: { "x-auth-token": token },
      }),
    ]);
    // Verificamos la respuesta de estudiantes
    if (!resEstudiantes.ok) {
      throw new Error("Error al obtener la lista de estudiantes.");
    }
    const estudiantes = await resEstudiantes.json();
    // Verificamos la respuesta de asistencias (puede no haber registros y eso está bien)
    let asistencias = [];
    if (resAsistencias.ok) {
      asistencias = await resAsistencias.json();
    } else {
      console.warn(
        "No se encontraron registros de asistencia para este grupo.",
      );
    }
    // Devolvemos un objeto con ambos resultados
    return { estudiantes: estudiantes || [], asistencias: asistencias || [] };
  } catch (error) {
    console.error("Error en el servicio de asistencia:", error);
    // Relanzamos el error para que el componente que llama lo pueda manejar
    throw new Error("Error al cargar los datos. Inténtalo de nuevo.");
  }
};

//se usa en la vita de asistencia
export const fetchPostAsistencia = async (
  token,
  grupoId,
  estatusAsistencia,
) => {
  try {
    const response = await fetch(`${apiUrl}/asistencia/${grupoId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-auth-token": token },
      body: JSON.stringify(estatusAsistencia),
    });
    if (!response.ok) throw new Error("Error al guardar la asistencia");
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
};

//Asistencia por Materia
export const fetchDatosAsistenciaMateria = async (
  grupoId,
  clave,
  year,
  mes,
  token,
) => {
  try {
    // Usamos Promise.all para ejecutar ambas peticiones al mismo tiempo
    const [resEstudiantes, resAsistencias] = await Promise.all([
      fetch(`${apiUrl}/alumnos/grupo/${grupoId}`, {
        headers: { "x-auth-token": token },
      }),
      fetch(`${apiUrl}/asistencia/materia/${grupoId}/${clave}/${year}/${mes}`, {
        headers: { "x-auth-token": token },
      }),
    ]);
    // Verificamos la respuesta de estudiantes
    if (!resEstudiantes.ok) {
      throw new Error("Error al obtener la lista de estudiantes.");
    }
    const estudiantes = await resEstudiantes.json();
    // Verificamos la respuesta de asistencias (puede no haber registros y eso está bien)
    let asistencias = [];
    if (resAsistencias.ok) {
      asistencias = await resAsistencias.json();
    } else {
      console.warn(
        "No se encontraron registros de asistencia para este grupo.",
      );
    }
    // Devolvemos un objeto con ambos resultados
    return { estudiantes: estudiantes || [], asistencias: asistencias || [] };
  } catch (error) {
    console.error("Error en el servicio de asistencia:", error);
    // Relanzamos el error para que el componente que llama lo pueda manejar
    throw new Error("Error al cargar los datos. Inténtalo de nuevo.");
  }
};

export const fetchPostAsistenciaMateria = async (
  token,
  grupoId,
  clave,
  estatusAsistencia,
) => {
  try {
    const response = await fetch(
      `${apiUrl}/asistencia/materia/${grupoId}/${clave}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-auth-token": token },
        body: JSON.stringify(estatusAsistencia),
      },
    );
    if (!response.ok) throw new Error("Error al guardar la asistencia");
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
};

//Para perfil
export const fetchDatosAsistenciaMateriaPerfil = async (
  grupoId,
  idNormalizado,
  semestre,
  clave,
  year,
  mes,
  token,
) => {
  try {
    // Usamos Promise.all para ejecutar ambas peticiones al mismo tiempo
    const [resEstudiantes, resAsistencias] = await Promise.all([
      //http://localhost:3000/alumnos/perfil/EA/5
      fetch(`${apiUrl}/alumnos/perfil/${idNormalizado}/${semestre}`, {
        headers: { "x-auth-token": token },
      }),
      fetch(`${apiUrl}/asistencia/materia/${grupoId}/${clave}/${year}/${mes}`, {
        headers: { "x-auth-token": token },
      }),
    ]);
    // Verificamos la respuesta de estudiantes
    if (!resEstudiantes.ok) {
      throw new Error("Error al obtener la lista de estudiantes.");
    }
    const estudiantes = await resEstudiantes.json();
    // Verificamos la respuesta de asistencias (puede no haber registros y eso está bien)
    let asistencias = [];
    if (resAsistencias.ok) {
      asistencias = await resAsistencias.json();
    } else {
      console.warn(
        "No se encontraron registros de asistencia para este grupo.",
      );
    }
    // Devolvemos un objeto con ambos resultados
    return { estudiantes: estudiantes || [], asistencias: asistencias || [] };
  } catch (error) {
    console.error("Error en el servicio de asistencia:", error);
    // Relanzamos el error para que el componente que llama lo pueda manejar
    throw new Error("Error al cargar los datos. Inténtalo de nuevo.");
  }
};

export const fetchPostAsistenciaMateriaPerfi = async (
  token,
  grupoId,
  clave,
  estatusAsistencia,
) => {
  try {
    const response = await fetch(
      `${apiUrl}/asistencia/materia/${grupoId}/${clave}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-auth-token": token },
        body: JSON.stringify(estatusAsistencia),
      },
    );
    if (!response.ok) throw new Error("Error al guardar la asistencia");
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
};

//Para Docentes
// 1. GET: Obtener docentes y asistencias
export const fetchDatosAsistenciaDocente = async (year, mes, token) => {
  try {
    const [resDocentes, resAsistencias] = await Promise.all([
      fetch(`${apiUrl}/docente`, {
        headers: { "x-auth-token": token },
      }),
      fetch(`${apiUrl}/asistencia/docente/${year}/${mes}`, {
        headers: { "x-auth-token": token },
      }),
    ]);

    if (!resDocentes.ok) {
      throw new Error("Error al obtener la lista de docentes.");
    }

    let docentes = await resDocentes.json();

    // 🔹 ORDENAR DOCENTES
    docentes = (docentes || []).sort((a, b) => {
      const apellidoPCompare = (a.apellidoP || "").localeCompare(b.apellidoP || "", "es", { sensitivity: "base" });
      if (apellidoPCompare !== 0) return apellidoPCompare;

      const apellidoMCompare = (a.apellidoM || "").localeCompare(b.apellidoM || "", "es", { sensitivity: "base" });
      if (apellidoMCompare !== 0) return apellidoMCompare;

      return (a.Nombres || "").localeCompare(b.Nombres || "", "es", { sensitivity: "base" });
    });

    let asistencias = [];

    if (resAsistencias.ok) {
      asistencias = await resAsistencias.json();
    } else if (resAsistencias.status !== 404) {
      console.warn("Error al obtener asistencias:", resAsistencias.status);
    }

    return { docentes, asistencias: asistencias || [] };

  } catch (error) {
    console.error("Error en el servicio de asistencia docente:", error);
    throw error;
  }
};


// 2. POST: Guardar asistencia
export const fetchPostAsistenciaDocente = async (token, asistenciaData) => {
  // asistenciaData debe ser: { fecha: "2024-02-20", registros: [...] }

  try {
    const response = await fetch(`${apiUrl}/asistencia/docente`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
      body: JSON.stringify(asistenciaData), // Asegúrate que esto coincida con el backend
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Error al guardar la asistencia docente",
      );
    }

    // Retornamos los datos por si el front necesita actualizar algo con la respuesta
    return await response.json();
  } catch (err) {
    console.error(err);
    throw err; // Lanzamos el error para que el COMPONENTE muestre el alert
  }
};

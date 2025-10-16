const apiUrl = import.meta.env.VITE_API_URL;

//se usa en la vista asistencia
export const fetchDatosAsistencia = async (grupoId, token) => {
  
  try {
    // Usamos Promise.all para ejecutar ambas peticiones al mismo tiempo
    const [resEstudiantes, resAsistencias] = await Promise.all([
      fetch(`${apiUrl}/alumnos/grupo/${grupoId}`, {
        headers: { "x-auth-token": token },
      }),
      fetch(`${apiUrl}/asistencia/${grupoId}`, {
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
        "No se encontraron registros de asistencia para este grupo."
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
  estatusAsistencia
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
export const fetchDatosAsistenciaMateria = async (grupoId,clave, token) => {
  
  try {
    // Usamos Promise.all para ejecutar ambas peticiones al mismo tiempo
    const [resEstudiantes, resAsistencias] = await Promise.all([
      fetch(`${apiUrl}/alumnos/grupo/${grupoId}`, {
        headers: { "x-auth-token": token },
      }),
      fetch(`${apiUrl}/asistencia/materia/${grupoId}/${clave}`, {
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
        "No se encontraron registros de asistencia para este grupo."
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
  estatusAsistencia
) => {
  try {
    const response = await fetch(`${apiUrl}/asistencia/materia/${grupoId}/${clave}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-auth-token": token },
      body: JSON.stringify(estatusAsistencia),
    });
    if (!response.ok) throw new Error("Error al guardar la asistencia");
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
};
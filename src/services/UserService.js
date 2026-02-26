const apiUrl = import.meta.env.VITE_API_URL;

export const fetchCrearUsuario = async (token, data) => {
  try {
    const resCrearCuenta = await fetch(`${apiUrl}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
      body: JSON.stringify(data),
    });

    if (!resCrearCuenta.ok) {
      const errorData = await resCrearCuenta.json();

      throw new Error(
        errorData.msg || errorData.message || "Error al crear la cuenta",
      );
    }

    return await resCrearCuenta.json();
  } catch (error) {
    console.error("Error en el servicio fetchCrearCuenta:", error.message);
    throw error;
  }
};

export const changeUsername = async (token, data) => {
  try {
    const response = await fetch(`${apiUrl}/user/changeUsername`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || errorData.message || "Error al cambiar usuario");
    }
    return await response.json();
  } catch (error) {
    console.error("Error en changeUsername:", error.message);
    throw error;
  }
};

export const changePassword = async (token, data) => {
  try {
    const response = await fetch(`${apiUrl}/user/changePassword`, {
      method: "PUT", 
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || errorData.message || "Error al cambiar contraseña");
    }
    return await response.json();
  } catch (error) {
    console.error("Error en changePassword:", error.message);
    throw error;
  }
};
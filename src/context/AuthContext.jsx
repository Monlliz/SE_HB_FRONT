import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
//Esto esta muy mal
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";
import TimerTokenIcon from "@mui/icons-material/Timer"; // O un icono similar

const AuthContext = createContext();
const authChannel = new BroadcastChannel("auth_channel");

export const AuthProvider = ({ children }) => {
  //identificar la ruta actual
  const location = useLocation();
  // const [user, setUser] = useState(null);

  //refresh del token
  const [showExtendModal, setShowExtendModal] = useState(false);

  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [user, setUser] = useState(() => {
    // Leemos ambos del almacenamiento
    //const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    // CONDICIÓN: Solo cargamos el usuario si existen AMBOS (token y usuario)
    if (token) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error("Error al parsear usuario:", error);
        return null;
      }
    }

    // Si no hay token, retornamos null (aunque exista el usuario en storage)
    return null;
  });
  // Cargar datos del usuario si hay un token al iniciar
  /*  useEffect(() => {
    if (token) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, [token]); */

  const login = async (email, password) => {
    const response = await fetch(`${apiUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correo: email, password: password }), // Asegúrate que los nombres coincidan con tu backend
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || "Error al iniciar sesión");
    }
    // Guardar token y usuario
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("user_rol", JSON.stringify(data.nombre_rol));
    setToken(data.token);
    //DATA USER TIENE NOMBRE, CORREO Y ROL
    setUser(data.user);
    navigate("/inicio"); // Redirige al dashboard o a la página principal
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_rol");

    authChannel.postMessage({ type: "LOGOUT" });

    setToken(null);
    setUser(null);
    setShowExtendModal(false);

    //Redirigir
    navigate("/login");
  };

  const refreshToken = async (emitEvent = true) => {
    try {
      const response = await fetch(`${apiUrl}/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        actualizarEstadoAuth(data.token);

        // AVISAR A LAS DEMÁS PESTAÑAS
        if (emitEvent) {
          authChannel.postMessage({
            type: "SESSION_EXTENDED",
            token: data.token,
          });
        }
      } else {
        logout();
      }
    } catch (error) {
      logout();
    }
  };

  // Función auxiliar para actualizar estados y storage
  const actualizarEstadoAuth = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setShowExtendModal(false);
  };

  // --- ESCUCHAR MENSAJES DE OTRAS PESTAÑAS ---
  useEffect(() => {
    // Función para cerrar todo
    const forceLogout = () => {
      setToken(null);
      setUser(null);
      setShowExtendModal(false);
      // No usamos navigate aquí para evitar bucles, mejor redirección directa
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    };

    // Escuchar BroadcastChannel
    const handleMessage = (event) => {
      if (event.data.type === "LOGOUT") forceLogout();
      if (event.data.type === "SESSION_EXTENDED") {
        setToken(event.data.token);
        setShowExtendModal(false);
      }
    };

    // Escuchar cambios en localStorage (Plan B)
    const handleStorageChange = (event) => {
      // Si el token fue eliminado en otra pestaña...
      if (event.key === "token" && !event.newValue) {
        forceLogout();
      }
    };

    authChannel.addEventListener("message", handleMessage);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      authChannel.removeEventListener("message", handleMessage);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // --- LÓGICA PARA ACTIVAR EL MODAL SEGÚN EL TIEMPO DEL JWT ---
  useEffect(() => {
    if (token && location.pathname !== "/login") {
      try {
        // 1. Decodificar el payload del token (la parte del medio)
        const payload = JSON.parse(atob(token.split(".")[1]));

        // exp está en segundos, JS usa milisegundos
        const expiryTime = payload.exp * 1000;
        const currentTime = Date.now();

        // Buffer: 5 minutos antes de expirar (300,000 ms)
        // Si tu token dura solo 2 min para pruebas, cambia esto a 30000 (30 seg)
        const warningBuffer = 5 * 60 * 1000;
        const timeUntilWarning = expiryTime - currentTime - warningBuffer;

        console.log(`Segundos para el modal: ${timeUntilWarning / 1000}`);

        if (timeUntilWarning <= 0) {
          // Si ya estamos en el tiempo límite, mostrar de inmediato
          setShowExtendModal(true);
        } else {
          // Programar la alarma
          const timer = setTimeout(() => {
            console.log("Activando modal de extensión...");
            setShowExtendModal(true);
          }, timeUntilWarning);

          // Limpiar el timer si el token cambia o el componente se desmonta
          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error("Error al calcular expiración:", error);
      }
    }
  }, [token]); // Esto hace que se reinicie cada vez que el token se actualiza

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        refreshToken,
        showExtendModal,
        setShowExtendModal,
      }}
    >
      {children}

      {/* --- MODAL DE CONFIRMACIÓN  --- */}
      <Dialog
        open={showExtendModal}
        onClose={(event, reason) => {
          // Evita que el usuario cierre el modal haciendo click afuera o con Escape
          if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
            setShowExtendModal(false);
          }
        }}
        aria-labelledby="session-timeout-title"
        aria-describedby="session-timeout-description"
        PaperProps={{
          style: { borderRadius: 15, padding: "10px" },
        }}
      >
        <DialogTitle
          id="session-timeout-title"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <TimerTokenIcon color="warning" sx={{ fontSize: 30 }} />
          <Typography variant="h6" component="span" fontWeight="bold">
            ¿Tu sesión está por expirar?
          </Typography>
        </DialogTitle>

        <DialogContent>
          <DialogContentText
            id="session-timeout-description"
            sx={{ color: "text.secondary" }}
          >
            Por motivos de seguridad, tu sesión se cerrará pronto. ¿Deseas
            mantenerte conectado y continuar con tu trabajo?
          </DialogContentText>
        </DialogContent>

        <DialogActions
          sx={{ padding: "20px", justifyContent: "space-between" }}
        >
          <Button
            onClick={logout}
            color="error"
            variant="outlined"
            sx={{ borderRadius: "8px", textTransform: "none" }}
          >
            Finalizar sesión
          </Button>
          <Button
            onClick={refreshToken}
            color="primary"
            variant="contained"
            autoFocus
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              boxShadow: 2,
              "&:hover": { boxShadow: 4 },
            }}
          >
            Sí, continuar conectado
          </Button>
        </DialogActions>
      </Dialog>
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto más fácilmente
export const useAuth = () => {
  return useContext(AuthContext);
};

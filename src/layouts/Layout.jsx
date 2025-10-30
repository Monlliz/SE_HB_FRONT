import Navbar from "../components/Navbar.jsx";
import { Outlet } from "react-router-dom"; // Para renderizar las páginas dentro
import { Box } from "@mui/material";
import { styled } from '@mui/material/styles';

// Crear un 'div' y aplicarle los estilos
// del "mixin" del toolbar del tema actual.
const ToolbarSpacer = styled('div')(({ theme }) => ({
  ...theme.mixins.toolbar,
 }));
export default function Layout() {
  return (
    <>
      <Navbar /> {/* Siempre visible */}
      {/* Este div invisible ocupa el mismo espacio que la Navbar, empujando el main hacia abajo */}
       <ToolbarSpacer /> 
      <Box 
      component="main" 
      sx={{ 
        paddingLeft: "1%",
        paddingRight: "1%",
        // Aquí defines los estilos para diferentes tamaños de pantalla
        paddingTop: { 
          xs: '8%', // Para pantallas extra pequeñas (móvil)
          sm: '6%',  // Para pantallas pequeñas (tabletas)
          md: '2.5%',  // desktop
        }
      }}
    >
      <Outlet /> {/* Aquí se renderizan las páginas */}
    </Box>
    </>
  );
}

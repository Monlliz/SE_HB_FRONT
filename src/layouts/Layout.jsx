import Navbar from "../components/Navbar.jsx";
import { Outlet } from "react-router-dom"; // Para renderizar las páginas dentro

export default function Layout() {
  return (
    <>
      <Navbar /> {/* Siempre visible */}
      <main style={{ padding: "20px" }}>
        <Outlet /> 
      </main>
    </>
  );
}

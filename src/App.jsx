import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Login from "./pages/Login.jsx";
import Docente from "./pages/Docente.jsx";

import Grupo from "./pages/Grupo.jsx";
import Materias from "./pages/Materias.jsx";
//Modifique este  
import ListaAsistencia from "./pages/listaAsistencia/ListaAsisntenciaU.jsx";
import NotFound from "./pages/NotFound.jsx";
import Alumno from "./pages/Alumno.jsx";
import ReportePDF from "./pages/ReportePDF.jsx";
import ListaAsistenciaMateria from "./pages/listaAsistencia/ListaAsistenciaMateria.jsx";
import ListaAsistenciaMateriaPerfil from "./pages/listaAsistencia/ListaAsistenciaMateriaPerfil.jsx";
import Rubros from "./pages/rubros/Rubros.jsx";
import RubrosPerfil from "./pages/rubros/RubrosPerfil.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ResumenTC from "./pages/ResumenTC.jsx";
import ReportePDFTC from "./pages/ReportePDFTc.jsx";
//Modifque este
import TrabajoCotidiano from "./pages/trabajoCotidiano/TrabajoCotidinanoU.jsx";
import TrabajoCotidianoP from "./pages/trabajoCotidiano/TrabajoCotidianoPerfil.jsx";
import GestionData from "./pages/GestionData.jsx";
import GeneracionDeCuentas from "./pages/GeneracionDeCuentas.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import User from "./pages/User.jsx"
function App() {
  return (
    <>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        {/* Todas las rutas aquí adentro usarán el Layout y requerirán login */}
        <Route path="/docentes" element={<Docente />} />
        <Route path="/grupos" element={<Grupo />} />
        <Route path="/materias" element={<Materias />} />
        <Route path="/alumnos" element={<Alumno />} />
        <Route path="/trabajo" element={<TrabajoCotidiano />} />
        <Route path="/trabajoperfil" element={<TrabajoCotidianoP />} />
        <Route path="/listaAsistencia" element={<ListaAsistencia />} />
        <Route path="/gestiondatos" element={<GestionData />} />
        <Route path="/resumenTC" element={<ResumenTC />} />
        <Route path="/reporte-tc" element={<ReportePDFTC />} />
        <Route path="/micuenta" element={<User />} />
        <Route
          path="/listaAsistenciamateria"
          element={<ListaAsistenciaMateria />}
          />

        <Route
          path="/listaAsistenciamateriaPerfil"
          element={<ListaAsistenciaMateriaPerfil />}
          />
        <Route path="/generaciondecuentas" element={<GeneracionDeCuentas />} />
        <Route path="/Reporte" element={<ReportePDF />} />
        <Route path="/Rubros" element={<Rubros />} />
        <Route path="/RubrosPerfil" element={<RubrosPerfil />} />
        <Route path="/Inicio" element={<Dashboard />} />
        {/*Mas rutas protegidas aquí */}
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
          <Analytics/>
    </>
  );
}

export default App;

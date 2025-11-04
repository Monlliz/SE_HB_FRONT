import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login.jsx";
import Docente from "./components/Docente.jsx";
import Grupo from "./components/Grupo.jsx";
import Materias from "./components/Materias.jsx";
import ListaAsistencia from "./components/ListaAsistencia.jsx";
import NotFound from "./components/NotFound.jsx";
import Alumno from "./components/Alumno.jsx";
import ReportePDF from "./components/ReportePDF.jsx";
import ListaAsistenciaMateria from "./components/ListaAsistenciaMateria.jsx";
import ListaAsistenciaMateriaPerfil from "./components/ListaAsistenciaMateriaPerfil.jsx";
import Rubros from "./components/Rubros.jsx"
import RubrosPerfil from "./components/RubrosPerfil.jsx"
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import Dashboard from "./components/Dashboard.jsx";

function App() {
  return (
    // El Router y el AuthProvider ya no son necesarios aquí
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        {/* Todas las rutas aquí adentro usarán el Layout y requerirán login */}
        <Route path="/docentes" element={<Docente />} />
        <Route path="/grupos" element={<Grupo />} />
        <Route path="/materias" element={<Materias />} />
        <Route path="/alumnos" element={<Alumno />} />
        <Route path="/listaAsistencia" element={<ListaAsistencia />} />
        <Route path="/listaAsistenciamateria" element={<ListaAsistenciaMateria />} />
       <Route path="/listaAsistenciamateriaPerfil" element={<ListaAsistenciaMateriaPerfil />} />
        <Route path="/Reporte" element={<ReportePDF />} />
        <Route path="/Rubros" element= {<Rubros/> } />
         <Route path="/RubrosPerfil" element= {<RubrosPerfil/> } />
        <Route path="/Inicio" element= {<Dashboard/> } />
        {/*Mas rutas protegidas aquí */}
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

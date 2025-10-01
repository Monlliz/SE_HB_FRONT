import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login.jsx";
import Docente from "./components/Docente.jsx";
import Layout from "./layouts/Layout.jsx";
import Grupo from "./components/Grupo.jsx";
import Materias from "./components/Materias.jsx";


import NotFound from "./components/NotFound.jsx";
function App() {
  return (
    <Router>
      <Routes>
        {/*Rutas sin navbar*/}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<Layout />}>
          {/*Rutas con navbar */}
          <Route path="/docentes" element={<Docente />} />
          <Route path="/grupos" element={<Grupo />} />
          <Route path="/materias" element={<Materias />} />
          {/*<Route path="/grupos" element={<Grupo />} />*/}
          {/* <Route path="/grupos/:idgrupo" element={<UserGrupo />} />*/}        
          {/*<Route path="/docente/:id" element={<UserDocente />} />*/}
          {/*<Route path="/alumno" element={<Alumno />}/>*/}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login.jsx";
import Docente from "./components/Docente.jsx";
import Layout from "./layouts/Layout.jsx";
import UserDocente from "./components/users/UserDocente.jsx";
import Grupo from "./components/Grupos.jsx";
import Grupos from "./components/users/Grupo.jsx";
import Alumno from "./components/Docente.jsx";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route path="/docentes" element={<Docente />} />
          <Route path="/docente/:id" element={<UserDocente />} />
          <Route path="/grupos" element={<Grupo />} />
          <Route path="/grupos/:idgrupo" element={<Grupos />} />
          <Route path="/alumno" element={<Alumno />}/>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

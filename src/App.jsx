import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/login.jsx';
import Docentes from './components/Docentes.jsx';
import Layout from './layouts/Layout.jsx';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route path="docentes" element={<Docentes />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../layouts/Layout';

export const ProtectedRoute = () => {
  const { token } = useAuth();

  if (!token) {
    // Si no hay token, redirige al usuario a la página de login
    return <Navigate to="/login" />;
  }

  // Si hay token, renderiza el Layout que a su vez renderizará la ruta hija
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};
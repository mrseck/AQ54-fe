import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet
} from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layouts/MainLayout";
import AuthForms from "@/components/AuthForms";
import UserDashboard from "@/pages/UserDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import CreateUser from "./pages/CreateUser";

// Composant de redirection basé sur le rôle
const RoleBasedRedirect = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (isAuthenticated) {
    if (user?.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  
  return <AuthForms />;
};

// Composant de protection des routes avec vérification des rôles
const ProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    // Rediriger vers la page appropriée en fonction du rôle
    if (user.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

// Configuration des routes de l'application
const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Route publique */}
          <Route index element={<RoleBasedRedirect />} />

          {/* Routes protégées pour les utilisateurs */}
          <Route element={<ProtectedRoute allowedRoles={["USER"]} />}>
            <Route path="dashboard" element={<UserDashboard />} />
          </Route>

          {/* Routes protégées pour les admins */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="/create-user" element={<CreateUser />} />
          </Route>

          {/* Redirection des routes inconnues */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

// Composant principal de l'application
const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
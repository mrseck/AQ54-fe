import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="font-bold text-xl">
            AQ54 Manager
          </Link>

          <div className="flex gap-4 items-center">
            {isAuthenticated ? (
              <>
                <span className="text-gray-600">
                  Bienvenue, {user?.username}
                </span>
                {user?.role === "ADMIN" && (
                  <Button variant="ghost" asChild>
                    <Link to="/admin">Dashboard Admin</Link>
                  </Button>
                )}
                {user?.role === "USER" && (
                  <Button variant="ghost" asChild>
                    <Link to="/dashboard">Mon Dashboard</Link>
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => {
                    logout();
                    window.location.href = "/";
                  }}
                >
                  Déconnexion
                </Button>
              </>
            ) : (
              <Button variant="ghost" asChild>
                <Link to="/">Connexion</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

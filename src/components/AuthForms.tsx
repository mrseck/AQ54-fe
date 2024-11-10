import { ChangeEvent, FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";
import { AuthResponse, UserRole } from '../types/auth';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface PasswordErrors {
  length?: string;
  number?: string;
  symbol?: string;
}

const initialFormData: FormData = {
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
};

// Expression régulière mise à jour pour exclure le +
const symbolRegex = /[!@#$%^&*()_\-=[\]{};':"\\|,.<>/?]+/;

const AuthForms = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password: string): PasswordErrors => {
    const errors: PasswordErrors = {};

    if (password.length < 12) {
      errors.length = 'Le mot de passe doit contenir au moins 12 caractères';
    }

    if (!/\d/.test(password)) {
      errors.number = 'Le mot de passe doit contenir au moins un chiffre';
    }

    if (!symbolRegex.test(password)) {
      errors.symbol = 'Le mot de passe doit contenir au moins un symbole (!@#$%^&*()_-=[]{};\'"\\|,.<>/?)'
    }

    return errors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPasswordErrors({});

    try {
      let response: AuthResponse;

      if (isLoginMode) {
        // Connexion
        response = await authService.login(formData.email, formData.password);
      } else {
        // Validation du mot de passe
        const passwordValidationErrors = validatePassword(formData.password);
        
        if (Object.keys(passwordValidationErrors).length > 0) {
          setPasswordErrors(passwordValidationErrors);
          return;
        }

        // Vérification des mots de passe
        if (formData.password !== formData.confirmPassword) {
          setError('Les mots de passe ne correspondent pas');
          return;
        }

        // Inscription
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { confirmPassword, ...registrationData } = formData;
        response = await authService.register(registrationData);
        
        // Message de succès pour l'inscription
        setSuccess('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        
        // Réinitialisation du formulaire après 3 secondes
        setTimeout(() => {
          setIsLoginMode(true);
          setFormData(initialFormData);
          setSuccess('');
        }, 3000);
        
        return;
      }

      // Vérification et conversion du rôle
      const role = validateRole(response.role);

      // Login immédiat avec les données reçues
      login(response.token, {
        username: response.username,
        role,
        email: response.email
      });

      // Notification de succès
      toast({
        title: "Connexion réussie !",
        description: `Bienvenue ${response.username}`,
        duration: 3000,
      });

      // Redirection selon le rôle
      navigate(role === 'ADMIN' ? '/admin' : '/dashboard');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
        duration: 5000,
      });
    }
  };

  // Fonction utilitaire pour valider et convertir le rôle
  const validateRole = (role: string): UserRole => {
    if (role !== 'USER' && role !== 'ADMIN') {
      throw new Error('Rôle invalide reçu du serveur');
    }
    return role;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validation du mot de passe pendant la saisie si on est en mode inscription
    if (!isLoginMode && name === 'password') {
      setPasswordErrors(validatePassword(value));
    }
    
    setError('');
    setSuccess('');
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setSuccess('');
    setPasswordErrors({});
    setFormData(initialFormData);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Créer un composant pour afficher les critères du mot de passe
  const PasswordCriteria = () => (
    <div className="text-sm text-gray-600 mt-2 space-y-1">
      <p className={formData.password.length >= 12 ? "text-green-600" : ""}>
        ✓ Au moins 12 caractères
      </p>
      <p className={/\d/.test(formData.password) ? "text-green-600" : ""}>
        ✓ Au moins un chiffre
      </p>
      <p className={symbolRegex.test(formData.password) ? "text-green-600" : ""}>
        ✓ Au moins un symbole
      </p>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLoginMode ? 'Connexion' : 'Inscription'}</CardTitle>
          <CardDescription>
            {isLoginMode 
              ? 'Connectez-vous à votre compte'
              : 'Créez un nouveau compte'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginMode && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">Nom d'utilisateur</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
              {!isLoginMode && <PasswordCriteria />}
              {!isLoginMode && Object.values(passwordErrors).map((error, index) => (
                <Alert key={index} variant="destructive" className="mt-2">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ))}
            </div>
            {!isLoginMode && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="bg-green-50 border-green-500 text-green-700">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <Button 
              type="submit" 
              className="w-full"
              disabled={!isLoginMode && Object.keys(passwordErrors).length > 0}
            >
              {isLoginMode ? 'Se connecter' : "S'inscrire"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            variant="link" 
            onClick={toggleMode}
            className="text-sm"
          >
            {isLoginMode 
              ? "Pas encore de compte ? S'inscrire"
              : 'Déjà un compte ? Se connecter'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthForms;
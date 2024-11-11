import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from 'lucide-react';
import { AuthResponse } from '@/types/auth';
import { authService } from '@/services/authService';

interface FormData {
  username: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
}

interface PasswordValidation {
  minLength: boolean;
  hasSymbol: boolean;
  hasUpperCase: boolean;
  hasNumber: boolean;
}

const CreateUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    role: 'USER'
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [validations, setValidations] = useState<PasswordValidation>({
    minLength: false,
    hasSymbol: false,
    hasUpperCase: false,
    hasNumber: false
  });

  const validatePassword = (password: string) => {
    setValidations({
      minLength: password.length >= 12,
      hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      validatePassword(value);
    }
  };

  const handleRoleChange = (value: 'USER' | 'ADMIN') => {
    setFormData(prev => ({
      ...prev,
      role: value
    }));
  };

  const isPasswordValid = () => {
    return Object.values(validations).every(v => v === true);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid()) {
      setError('Le mot de passe ne respecte pas les critères de sécurité');
      return;
    }

    setLoading(true);

    try {
        const response: AuthResponse = await authService.createUser({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            role: formData.role
          });

      navigate('/admin');

      if (!response.token) {
        throw new Error('Erreur lors de la création de l\'utilisateur');
      }

      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Créer un nouvel utilisateur</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="Entrez le nom d'utilisateur"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Entrez l'email"
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
                  placeholder="Entrez le mot de passe"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="mt-2 text-sm space-y-1">
                <p className={validations.minLength ? "text-green-600" : "text-red-600"}>
                  ✓ Au moins 12 caractères
                </p>
                <p className={validations.hasSymbol ? "text-green-600" : "text-red-600"}>
                  ✓ Au moins un symbole spécial
                </p>
                <p className={validations.hasUpperCase ? "text-green-600" : "text-red-600"}>
                  ✓ Au moins une lettre majuscule
                </p>
                <p className={validations.hasNumber ? "text-green-600" : "text-red-600"}>
                  ✓ Au moins un chiffre
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rôle</Label>
              <Select
                value={formData.role}
                onValueChange={handleRoleChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Utilisateur</SelectItem>
                  <SelectItem value="ADMIN">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/admin')}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading || !isPasswordValid()}
              >
                {loading ? 'Création...' : 'Créer l\'utilisateur'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateUser;
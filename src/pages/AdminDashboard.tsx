import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useState, ChangeEvent, useEffect } from 'react';

interface FileState {
  name: string;
  type: string;
  size: number;
}

const AdminDashboard = () => {
  const auth = useAuth(); // Stockez le résultat dans une variable
  const [selectedFile, setSelectedFile] = useState<FileState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Si vous avez besoin d'effectuer des actions basées sur l'auth
  useEffect(() => {
    // Placez ici la logique qui dépend de l'auth
    // Par exemple, charger les données initiales
  }, [auth]); // Utilisez auth comme dépendance

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile({
        name: file.name,
        type: file.type,
        size: file.size
      });
    } else {
      alert('Veuillez sélectionner un fichier PDF');
      event.target.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert('Veuillez sélectionner un fichier PDF');
      return;
    }

    setIsLoading(true);
    try {
      // Simuler un envoi de fichier
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Fichier envoyé:', selectedFile);
      // Réinitialiser le formulaire après succès
      setSelectedFile(null);
      if (document.querySelector('input[type="file"]')) {
        (document.querySelector('input[type="file"]') as HTMLInputElement).value = '';
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      alert('Une erreur est survenue lors de l\'envoi du fichier');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Administration</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Statistiques Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">0</p>
              <p className="text-gray-600">Utilisateurs inscrits</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activité du site</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">0</p>
              <p className="text-gray-600">Connexions aujourd'hui</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>État du système</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-green-500 font-semibold">Opérationnel</p>
              <p className="text-gray-600">Tous les services sont actifs</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload de Document</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  disabled={isLoading}
                />
              </div>
              <Button 
                onClick={handleSubmit}
                className="w-full flex items-center justify-center"
                disabled={!selectedFile || isLoading}
              >
                <Upload className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Envoi en cours...' : 'Envoyer le fichier'}
              </Button>
              {selectedFile && (
                <p className="text-sm text-gray-600">
                  Fichier sélectionné : {selectedFile.name}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
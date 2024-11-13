import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import SensorDashboard from './SensorDashboard';
import { BarChart, Activity, Users, AlertCircle, LucideIcon } from 'lucide-react';

// Définition des interfaces
interface Trend {
  value: string;
  positive: boolean;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: Trend;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{value}</h3>
          {trend && (
            <p className={`text-sm mt-2 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value}
            </p>
          )}
        </div>
        <div className="p-4 bg-gray-100 rounded-full">
          <Icon className="w-6 h-6 text-gray-600" />
        </div>
      </div>
    </CardContent>
  </Card>
);

interface MetricData {
  name: string;
  percentage: number;
}

const AdminDashboard: React.FC = () => {
  const auth = useAuth();
  const [userCount, setUserCount] = useState<number | null>(null);
  const [dataCount, setDataCount] = useState<number | null>(null);


  // Fonction pour récupérer le nombre d’utilisateurs depuis l'API
  const fetchUserCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3000/api/v1/auth/users', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          
        },
      });
      const data = await response.json();
      if (data && typeof data.count === 'number') {
        setUserCount(data.count);
      } else {
        console.error("Format de données inattendu : ", data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du nombre d'utilisateurs :", error);
    }
  }, [auth.token]);

  useEffect(() => {
    fetchUserCount();
  }, [fetchUserCount]);

  const fetchSensorDataCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3000/api/v1/sensor/data-collected',{
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          
        },
      });
      const data = await response.json();
      setDataCount(data.count);
    } catch (error) {
      console.error("Erreur lors de la récupération des données du capteur :", error);
    }
  }, []);
  
  useEffect(() => {
    fetchSensorDataCount();
  }, [fetchSensorDataCount]);

  const metrics: MetricData[] = [
    { name: 'CPU', percentage: 85 },
    { name: 'Mémoire', percentage: 85 },
    { name: 'Stockage', percentage: 85 },
    { name: 'Réseau', percentage: 85 }
  ];

  const quickActions: string[] = ['Vérifier Système', 'Mise à jour', 'Sauvegarder', 'Configuration'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tableau de Bord Administration</h1>
        <div className="flex items-center space-x-4"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Capteurs Actifs" 
          value="2" 
          icon={Activity}
        />
        <StatCard 
          title="Utilisateurs" 
          value={userCount !== null ? userCount.toString() : "Chargement..."} 
          icon={Users}
        />
        <StatCard 
          title="Données Collectées" 
          value={dataCount !== null ? dataCount.toString() : "Chargement..."} 
          icon={BarChart}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Données des Capteurs</CardTitle>
          </CardHeader>
          <CardContent>
            <SensorDashboard />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertes Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-500 mt-1" />
                  <div>
                    <p className="font-medium">Alerte Capteur #{i + 1}</p>
                    <p className="text-sm text-gray-600">Il y a {i + 1}h</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>État du Système</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.map((metric) => (
                <div key={metric.name} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{metric.name}</span>
                    <span className="text-sm text-gray-500">{metric.percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${metric.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <button
                  key={action}
                  className="p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <p className="font-medium">{action}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

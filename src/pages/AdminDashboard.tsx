import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
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

  useEffect(() => {
    // Logique d'initialisation
  }, [auth]);

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
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            Système actif
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Capteurs Actifs" 
          value="24" 
          icon={Activity}
          trend={{ value: "+2 depuis hier", positive: true }}
        />
        <StatCard 
          title="Utilisateurs" 
          value="156" 
          icon={Users}
          trend={{ value: "+12 ce mois", positive: true }}
        />
        <StatCard 
          title="Alertes" 
          value="3" 
          icon={AlertCircle}
          trend={{ value: "-2 depuis hier", positive: true }}
        />
        <StatCard 
          title="Données Collectées" 
          value="1.2M" 
          icon={BarChart}
          trend={{ value: "+12.3% ce mois", positive: true }}
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
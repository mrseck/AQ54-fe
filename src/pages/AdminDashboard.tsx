import React, { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "../contexts/AuthContext";
import SensorDashboard from "./SensorDashboard";
import { BarChart, Activity, Users, LucideIcon } from "lucide-react";

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

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
}) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{value}</h3>
          {trend && (
            <p
              className={`text-sm mt-2 ${
                trend.positive ? "text-green-600" : "text-red-600"
              }`}
            >
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

const AdminDashboard: React.FC = () => {
  const auth = useAuth();
  const [userCount, setUserCount] = useState<number | null>(null);
  const [dataCount, setDataCount] = useState<number | null>(null);

  // Fonction pour récupérer le nombre d’utilisateurs depuis l'API
  const fetchUserCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/v1/auth/users", {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const data = await response.json();
      if (data && typeof data.count === "number") {
        setUserCount(data.count);
      } else {
        console.error("Format de données inattendu : ", data);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du nombre d'utilisateurs :",
        error
      );
    }
  }, [auth.token]);

  useEffect(() => {
    fetchUserCount();
  }, [fetchUserCount]);

  const fetchSensorDataCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3000/api/v1/sensor/data-collected",
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );
      const data = await response.json();
      setDataCount(data.count);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données du capteur :",
        error
      );
    }
  }, []);

  useEffect(() => {
    fetchSensorDataCount();
  }, [fetchSensorDataCount]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tableau de Bord Administration</h1>
        <div className="flex items-center space-x-4"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Capteurs Actifs" value="2" icon={Activity} />
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
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle></CardTitle>
          </CardHeader>
          <CardContent>
            <SensorDashboard />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface RawSensorData {
  timestamp: string;
  temperature: number | null;
  humidity: number | null;
  pressure: number | null;
  o3: number | null;
  no2: number | null;
  pm25: number | null;
  pm10: number | null;
}

interface FormattedSensorData {
  timestamp: string;
  temperature: number;
  humidity: number;
  pressure: number;
  o3: number;
  no2: number;
  pm25: number;
  pm10: number;
}

const SENSORS = ["SMART188", "SMART189"] as const;
type SensorType = (typeof SENSORS)[number];

const AGGREGATION_PERIODS = [
  { value: "hour", label: "Par heure" },
  { value: "day", label: "Par jour" },
] as const;
type AggregationType = (typeof AGGREGATION_PERIODS)[number]["value"];

const API_URL = 'http://localhost:3000/api/v1';

// Service API avec gestion du token
const createAuthenticatedRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = localStorage.getItem('token'); // Récupère le token stocké
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Rediriger vers la page de login ou déclencher un événement d'authentification
      throw new Error('Session expirée');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Formate une date avec l'heure pour l'API
 * @param date - Date au format YYYY-MM-DD
 * @param time - Heure au format HH:mm
 * @returns Date formatée au format ISO avec temps et timezone
 */
const formatDateTimeForAPI = (date: string, time: string): string => {
  if (!date) return '';
  
  // Combine la date et l'heure
  const dateTimeString = `${date}T${time || '00:00'}:00`;
  const dateObj = new Date(dateTimeString);
  
  return dateObj.toISOString();
};

const formatData = (rawData: RawSensorData[]): FormattedSensorData[] => {
  return rawData.map((item) => ({
    timestamp: new Date(item.timestamp).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    temperature: Number(item.temperature?.toFixed(1)) || 0,
    humidity: Number(item.humidity?.toFixed(1)) || 0,
    pressure: Number(item.pressure?.toFixed(1)) || 0,
    o3: Number(item.o3?.toFixed(1)) || 0,
    no2: Number(item.no2?.toFixed(1)) || 0,
    pm25: Number(item.pm25?.toFixed(1)) || 0,
    pm10: Number(item.pm10?.toFixed(1)) || 0,
  }));
};

const SensorDashboard: React.FC = () => {
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState<string>("00:00");
  const [endTime, setEndTime] = useState<string>("23:59");
  const [aggregation, setAggregation] = useState<AggregationType>("day");
  const [selectedSensor, setSelectedSensor] = useState<SensorType>(SENSORS[0]);
  const [data, setData] = useState<FormattedSensorData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSensorData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const formattedStartDate = formatDateTimeForAPI(startDate, startTime);
    const formattedEndDate = formatDateTimeForAPI(endDate, endTime);

    try {
      const queryParams = new URLSearchParams({
        stationNames: selectedSensor,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        granularity: aggregation
      }).toString();

      const result = await createAuthenticatedRequest(`/sensor?${queryParams}`);

      if (!Array.isArray(result)) {
        throw new Error("Format de données invalide");
      }

      if (result.length === 0) {
        setData([]);
        setError("Aucune donnée disponible pour la période sélectionnée");
        return;
      }

      const formattedData = formatData(result);
      setData(formattedData);
    } catch (error) {
      console.error("Erreur détaillée:", error);
      
      if (error instanceof Error && error.message.includes('Session expirée')) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
        // Ici vous pouvez déclencher une redirection vers la page de login
      } else {
        setError(
          error instanceof Error
            ? error.message
            : "Erreur lors de la récupération des données"
        );
      }
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, startTime, endTime, aggregation, selectedSensor]);

  useEffect(() => {
    fetchSensorData();
  }, [fetchSensorData]);

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader>
          <div className="mb-4">
            <h2 className="text-2xl font-bold ">Données des Capteurs</h2>
          </div>
          <div className="flex flex-wrap gap-4">
            <select
              value={selectedSensor}
              onChange={(e) => setSelectedSensor(e.target.value as SensorType)}
              className="border rounded-md p-2"
            >
              {SENSORS.map((sensor) => (
                <option key={sensor} value={sensor}>
                  {sensor}
                </option>
              ))}
            </select>

            <select
              value={aggregation}
              onChange={(e) => setAggregation(e.target.value as AggregationType)}
              className="border rounded-md p-2"
            >
              {AGGREGATION_PERIODS.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>

            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded-md p-2"
                max={endDate}
              />
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="border rounded-md p-2"
              />
            </div>

            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded-md p-2"
                min={startDate}
              />
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="border rounded-md p-2"
              />
            </div>

            <Button
              onClick={fetchSensorData}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isLoading ? "Chargement..." : "Actualiser"}
            </Button>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
              {error}
            </div>
          )}
        </CardHeader>
      </Card>

      <Card className="w-ful">
        <CardContent>
          {isLoading ? (
            <div className="text-center p-4">Chargement des données...</div>
          ) : data.length > 0 ? (
            <div className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="left"
                    label={{
                      value: "Température (°C) / Polluants (µg/m³)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    label={{
                      value: "Humidité (%)",
                      angle: 90,
                      position: "insideRight",
                    }}
                  />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="temperature"
                    stroke="#8884d8"
                    name="Température (°C)"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="humidity"
                    stroke="#82ca9d"
                    name="Humidité (%)"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="o3"
                    stroke="#ffc658"
                    name="O3 (µg/m³)"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="no2"
                    stroke="#ff7300"
                    name="NO2 (µg/m³)"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="pm25"
                    stroke="#00c49f"
                    name="PM2.5 (µg/m³)"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="pm10"
                    stroke="#ff8042"
                    name="PM10 (µg/m³)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center p-4">Aucune donnée à afficher</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SensorDashboard;
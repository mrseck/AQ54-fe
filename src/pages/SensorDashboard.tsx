import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface SensorData {
  timestamp: string;
  temperature: number;
  humidity: number;
}

interface ApiResponse {
  timestamp: string;
  temperature: number;
  humidity: number;
  co2?: number;
  no2?: number;
  o3?: number;
  pm10?: number;
  pm25?: number;
  pressure?: number;
  noise?: number;
  deviceEui: string;
  projectId: string; 
}

const SENSORS = ['SMART188', 'SMART189'] as const;
type SensorType = typeof SENSORS[number];

const AGGREGATION_PERIODS = [
  { value: 'hour', label: 'Par heure' },
  { value: 'day', label: 'Par jour' }
] as const;
type AggregationType = typeof AGGREGATION_PERIODS[number]['value'];

const SensorDashboard: React.FC = () => {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [aggregation, setAggregation] = useState<AggregationType>('day');
  const [selectedSensor, setSelectedSensor] = useState<SensorType>(SENSORS[0]);
  const [data, setData] = useState<SensorData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSensorData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://airgino-api.magentalab.it/data/${selectedSensor}?` +
        `project=AQ54&start=${startDate}&end=${endDate}&aggregation=${aggregation}`
      );
      const result: ApiResponse[] = await response.json();
      
      const formattedData: SensorData[] = result.map((item: ApiResponse) => ({
        timestamp: new Date(item.timestamp).toLocaleString(),
        temperature: item.temperature,
        humidity: item.humidity,
      }));
      
      setData(formattedData);
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSensor, startDate, endDate, aggregation]);
  

  useEffect(() => {
    fetchSensorData();
  }, [selectedSensor, startDate, endDate, aggregation, fetchSensorData]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-wrap gap-4 mt-4">
          <select
            value={selectedSensor}
            onChange={(e) => setSelectedSensor(e.target.value as SensorType)}
            className="border rounded-md p-2"
          >
            {SENSORS.map(sensor => (
              <option key={sensor} value={sensor}>{sensor}</option>
            ))}
          </select>

          <select
            value={aggregation}
            onChange={(e) => setAggregation(e.target.value as AggregationType)}
            className="border rounded-md p-2"
          >
            {AGGREGATION_PERIODS.map(period => (
              <option key={period.value} value={period.value}>{period.label}</option>
            ))}
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded-md p-2"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded-md p-2"
          />

          <Button 
            onClick={fetchSensorData}
            disabled={isLoading}
          >
            {isLoading ? 'Chargement...' : 'Actualiser'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp"
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="temperature"
                stroke="#8884d8"
                name="Température (°C)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="humidity"
                stroke="#82ca9d"
                name="Humidité (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SensorDashboard;
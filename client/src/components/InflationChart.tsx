import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useState, useMemo } from "react";

interface InflationDataPoint {
  Country: string;
  Category: string;
  DateTime: string;
  Value: number;
}

interface InflationData {
  country: string;
  data: InflationDataPoint[];
}

interface Props {
  data: InflationData[];
}

const COLORS = [
  '#3b82f6',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
];

export function InflationChart({ data }: Props) {
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    data.forEach((country) => {
      country.data.forEach((point) => {
        years.add(new Date(point.DateTime).getFullYear());
      });
    });
    return Array.from(years).sort((a, b) => a - b);
  }, [data]);

  const [selectedYearIndex, setSelectedYearIndex] = useState(0);
  const selectedYear = availableYears[selectedYearIndex] || availableYears[0];

  const getFilteredData = useMemo(() => {
    return data.map((country) => {
      const filteredData = country.data.filter((point) => {
        const year = new Date(point.DateTime).getFullYear();
        return year >= selectedYear;
      }).sort((a, b) => new Date(a.DateTime).getTime() - new Date(b.DateTime).getTime());
      
      return {
        ...country,
        data: filteredData,
      };
    });
  }, [data, selectedYear]);

  const calculateAvgInflation = (countryData: InflationDataPoint[]): number | null => {
    if (countryData.length === 0) return null;
    
    const yearValues: number[] = [];
    let currentYear = new Date(countryData[0].DateTime).getFullYear();
    let yearSum = 0;
    let yearCount = 0;
    
    countryData.forEach((point, index) => {
      const year = new Date(point.DateTime).getFullYear();
      
      if (year !== currentYear) {
        if (yearCount > 0) {
          yearValues.push(yearSum / yearCount);
        }
        currentYear = year;
        yearSum = point.Value;
        yearCount = 1;
      } else {
        yearSum += point.Value;
        yearCount++;
      }
      
      if (index === countryData.length - 1 && yearCount > 0) {
        yearValues.push(yearSum / yearCount);
      }
    });
    
    if (yearValues.length === 0) return null;
    
    const totalAverage = yearValues.reduce((sum, val) => sum + val, 0) / yearValues.length;
    
    return totalAverage;
  };

  const countryAvgs = useMemo(() => {
    const avgMap = new Map<string, number | null>();
    getFilteredData.forEach((country) => {
      avgMap.set(country.country, calculateAvgInflation(country.data));
    });
    return avgMap;
  }, [getFilteredData]);

  const prepareChartData = () => {
    const dateMap = new Map<string, any>();

    getFilteredData.forEach((country) => {
      country.data.forEach((point) => {
        if (!dateMap.has(point.DateTime)) {
          dateMap.set(point.DateTime, { date: point.DateTime });
        }
        const entry = dateMap.get(point.DateTime);
        entry[country.country] = point.Value;
      });
    });

    const chartData = Array.from(dateMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return chartData;
  };

  const chartData = prepareChartData();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const formatCAGR = (cagr: number | null) => {
    if (cagr === null) return 'N/A';
    return `${cagr.toFixed(2)}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inflation Rate Comparison</CardTitle>
        <CardDescription>
          {availableYears.length > 1 
            ? `Showing data from ${selectedYear} onwards (${availableYears[0]} - ${availableYears[availableYears.length - 1]} available)`
            : `Historical inflation rates by country`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {availableYears.length > 1 && (
          <div className="space-y-3 pb-4 border-b">
            <div className="flex items-center justify-between">
              <Label htmlFor="year-slider" className="text-sm font-medium">
                Start Year: {selectedYear}
              </Label>
              <span className="text-xs text-muted-foreground">
                {availableYears[0]} - {availableYears[availableYears.length - 1]}
              </span>
            </div>
            <Slider
              id="year-slider"
              data-testid="slider-year"
              min={0}
              max={availableYears.length - 1}
              step={1}
              value={[selectedYearIndex]}
              onValueChange={(value) => setSelectedYearIndex(value[0])}
              className="w-full"
            />
          </div>
        )}

        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                className="text-xs"
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <YAxis
                label={{ 
                  value: 'Inflation Rate (%)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: 'hsl(var(--foreground))' }
                }}
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              {getFilteredData.map((country, index) => {
                const avg = countryAvgs.get(country.country) ?? null;
                return (
                  <Line
                    key={country.country}
                    type="monotone"
                    dataKey={country.country}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    name={`${country.country} - ${formatCAGR(avg)} avg`}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

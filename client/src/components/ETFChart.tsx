import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState, useMemo } from "react";

interface MonthlyDataPoint {
  date: string;
  close: number;
}

interface ETFData {
  symbol: string;
  name: string;
  monthlyData: MonthlyDataPoint[];
}

interface Props {
  data: ETFData[];
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

export function ETFChart({ data }: Props) {
  const [showPercentage, setShowPercentage] = useState(false);
  
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    data.forEach((etf) => {
      etf.monthlyData.forEach((point) => {
        years.add(new Date(point.date).getFullYear());
      });
    });
    return Array.from(years).sort((a, b) => a - b);
  }, [data]);

  const [selectedYearIndex, setSelectedYearIndex] = useState(0);
  const selectedYear = availableYears[selectedYearIndex] || availableYears[0];

  const getFilteredData = useMemo(() => {
    return data.map((etf) => {
      const filteredData = etf.monthlyData.filter((point) => {
        const year = new Date(point.date).getFullYear();
        return year >= selectedYear;
      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      return {
        ...etf,
        monthlyData: filteredData,
      };
    });
  }, [data, selectedYear]);

  const calculateCAGR = (etfData: MonthlyDataPoint[]): number | null => {
    if (etfData.length < 2) return null;
    
    const firstPoint = etfData[0];
    const lastPoint = etfData[etfData.length - 1];
    
    const firstDate = new Date(firstPoint.date);
    const lastDate = new Date(lastPoint.date);
    
    const yearsDiff = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    if (yearsDiff <= 0 || firstPoint.close <= 0) return null;
    
    const cagr = (Math.pow(lastPoint.close / firstPoint.close, 1 / yearsDiff) - 1) * 100;
    
    return cagr;
  };

  const etfCAGRs = useMemo(() => {
    const cagrMap = new Map<string, number | null>();
    getFilteredData.forEach((etf) => {
      cagrMap.set(etf.symbol, calculateCAGR(etf.monthlyData));
    });
    return cagrMap;
  }, [getFilteredData]);

  const getBaseValues = () => {
    const baseValues = new Map<string, number>();
    
    getFilteredData.forEach((etf) => {
      if (etf.monthlyData.length > 0) {
        baseValues.set(etf.symbol, etf.monthlyData[0].close);
      }
    });
    
    return baseValues;
  };

  const prepareChartData = () => {
    const dateMap = new Map<string, any>();
    const baseValues = getBaseValues();

    getFilteredData.forEach((etf) => {
      etf.monthlyData.forEach((point) => {
        if (!dateMap.has(point.date)) {
          dateMap.set(point.date, { date: point.date });
        }
        const entry = dateMap.get(point.date);
        
        if (showPercentage) {
          const baseValue = baseValues.get(etf.symbol);
          if (baseValue && baseValue > 0) {
            entry[etf.symbol] = ((point.close - baseValue) / baseValue) * 100;
          }
        } else {
          entry[etf.symbol] = point.close;
        }
      });
    });

    const chartData = Array.from(dateMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return chartData;
  };

  const chartData = prepareChartData();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const formatTooltipValue = (value: number) => {
    if (showPercentage) {
      const sign = value >= 0 ? '+' : '';
      return `${sign}${value.toFixed(2)}%`;
    }
    return value.toFixed(2);
  };

  const formatYAxis = (value: number) => {
    if (showPercentage) {
      return `${value.toFixed(0)}%`;
    }
    return value.toFixed(0);
  };

  const formatCAGR = (cagr: number | null) => {
    if (cagr === null) return 'N/A';
    const sign = cagr >= 0 ? '+' : '';
    return `${sign}${cagr.toFixed(2)}%`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>ETF Performance Chart</CardTitle>
            <CardDescription>
              {showPercentage 
                ? `Percentage increase from ${selectedYear} baseline`
                : `Historical closing prices from ${selectedYear}`
              }
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="percentage-mode"
              checked={showPercentage}
              onCheckedChange={(checked) => setShowPercentage(checked as boolean)}
              data-testid="checkbox-percentage-mode"
            />
            <Label
              htmlFor="percentage-mode"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Show % Change
            </Label>
          </div>
        </div>
        {availableYears.length > 1 && (
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Starting Year: {selectedYear}</Label>
              <span className="text-xs text-muted-foreground">
                {availableYears[0]} - {availableYears[availableYears.length - 1]}
              </span>
            </div>
            <Slider
              value={[selectedYearIndex]}
              onValueChange={(value) => setSelectedYearIndex(value[0])}
              min={0}
              max={availableYears.length - 1}
              step={1}
              className="w-full"
              data-testid="slider-start-year"
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                className="text-xs"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis className="text-xs" tickFormatter={formatYAxis} />
              <Tooltip
                formatter={formatTooltipValue}
                labelFormatter={formatDate}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              {getFilteredData.map((etf, index) => {
                const cagr = etfCAGRs.get(etf.symbol) ?? null;
                return (
                  <Line
                    key={etf.symbol}
                    type="monotone"
                    dataKey={etf.symbol}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    name={`${etf.symbol} - ${formatCAGR(cagr)} avg/yr`}
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

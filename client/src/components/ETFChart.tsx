import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";

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

  const getInitialValues = () => {
    const initialValues = new Map<string, number>();
    
    data.forEach((etf) => {
      if (etf.monthlyData.length > 0) {
        const sortedData = [...etf.monthlyData].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        initialValues.set(etf.symbol, sortedData[0].close);
      }
    });
    
    return initialValues;
  };

  const prepareChartData = () => {
    const dateMap = new Map<string, any>();
    const initialValues = getInitialValues();

    data.forEach((etf) => {
      etf.monthlyData.forEach((point) => {
        if (!dateMap.has(point.date)) {
          dateMap.set(point.date, { date: point.date });
        }
        const entry = dateMap.get(point.date);
        
        if (showPercentage) {
          const initialValue = initialValues.get(etf.symbol);
          if (initialValue && initialValue > 0) {
            entry[etf.symbol] = ((point.close - initialValue) / initialValue) * 100;
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

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>ETF Performance Chart</CardTitle>
            <CardDescription>
              {showPercentage 
                ? 'Percentage increase compared to initial value'
                : 'Historical closing prices over the selected date range'
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
              {data.map((etf, index) => (
                <Line
                  key={etf.symbol}
                  type="monotone"
                  dataKey={etf.symbol}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  name={`${etf.symbol} - ${etf.name}`}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

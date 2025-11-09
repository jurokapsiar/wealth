import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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
  const prepareChartData = () => {
    const dateMap = new Map<string, any>();

    data.forEach((etf) => {
      etf.monthlyData.forEach((point) => {
        if (!dateMap.has(point.date)) {
          dateMap.set(point.date, { date: point.date });
        }
        const entry = dateMap.get(point.date);
        entry[etf.symbol] = point.close;
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
    return value.toFixed(2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ETF Performance Chart</CardTitle>
        <CardDescription>
          Historical closing prices over the selected date range
        </CardDescription>
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
              <YAxis className="text-xs" />
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

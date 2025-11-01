import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
import type { YearProjection } from "./ProjectionTable";
import type { Cost } from "./CostEntry";
import type { Investment } from "./InvestmentEntry";

interface ChartViewProps {
  projections: YearProjection[];
  costs: Cost[];
  investments: Investment[];
  startingAge: number;
  inflation: number;
}

const COLORS = {
  wealth: "hsl(var(--primary))",
  wealthYear0: "hsl(280, 70%, 50%)",
  investmentBase: "hsl(142, 76%, 36%)",
  costBase: "hsl(0, 84%, 60%)",
};

const generateColor = (baseHue: number, index: number, total: number) => {
  const saturation = 70 - (index * 10) % 30;
  const lightness = 45 + (index * 15) % 20;
  return `hsl(${baseHue + (index * 30) % 60}, ${saturation}%, ${lightness}%)`;
};

export function ChartView({ projections, costs, investments, startingAge, inflation }: ChartViewProps) {
  const [showWealth, setShowWealth] = useState(true);
  const [showWealthYear0, setShowWealthYear0] = useState(false);
  const [useYear0Prices, setUseYear0Prices] = useState(false);
  const [visibleInvestments, setVisibleInvestments] = useState<Set<string>>(
    new Set(investments.map((inv) => inv.id))
  );
  const [visibleCosts, setVisibleCosts] = useState<Set<string>>(
    new Set(costs.map((cost) => cost.id))
  );

  const toggleInvestment = (id: string) => {
    const newSet = new Set(visibleInvestments);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setVisibleInvestments(newSet);
  };

  const toggleCost = (id: string) => {
    const newSet = new Set(visibleCosts);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setVisibleCosts(newSet);
  };

  const chartData = useMemo(() => {
    return projections.map((proj) => {
      const age = startingAge + proj.yearNumber;
      const dataPoint: Record<string, number | string> = {
        year: `Y${proj.yearNumber} (${age})`,
        calendarYear: proj.calendarYear,
        age: age,
      };

      if (showWealth) {
        dataPoint.wealth = Math.round(proj.endingWealth / 10);
        dataPoint.wealthActual = Math.round(proj.endingWealth);
      }

      if (showWealthYear0) {
        const inflationMultiplier = Math.pow(1 + inflation / 100, proj.yearNumber);
        const wealthYear0 = proj.endingWealth / inflationMultiplier;
        dataPoint.wealthYear0 = Math.round(wealthYear0 / 10);
        dataPoint.wealthYear0Actual = Math.round(wealthYear0);
      }

      proj.investments.forEach((inv) => {
        const investment = investments.find((i) => i.name === inv.name);
        if (investment && visibleInvestments.has(investment.id)) {
          const value = useYear0Prices ? inv.todaysValue : inv.amount;
          dataPoint[`inv_${investment.id}`] = Math.round(value);
        }
      });

      proj.costs.forEach((cost) => {
        const costItem = costs.find((c) => c.name === cost.name);
        if (costItem && visibleCosts.has(costItem.id)) {
          const value = useYear0Prices ? cost.todaysValue : cost.amount;
          dataPoint[`cost_${costItem.id}`] = Math.round(value);
        }
      });

      return dataPoint;
    });
  }, [projections, showWealth, showWealthYear0, useYear0Prices, visibleInvestments, visibleCosts, investments, costs, startingAge, inflation]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const year = payload[0]?.payload?.calendarYear;
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-2">
            {label} ({year})
          </p>
          {payload.map((entry: any, index: number) => {
            let displayValue = entry.value;
            if (entry.dataKey === 'wealth' && entry.payload.wealthActual) {
              displayValue = entry.payload.wealthActual;
            } else if (entry.dataKey === 'wealthYear0' && entry.payload.wealthYear0Actual) {
              displayValue = entry.payload.wealthYear0Actual;
            }
            return (
              <p key={index} style={{ color: entry.color }} className="text-sm">
                {entry.name}: {formatCurrency(displayValue)}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  if (projections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chart View</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No projection data to display. Add some investments or costs to see the chart.
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartWidth = Math.max(800, projections.length * 40);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chart View</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
          <Checkbox
            id="year0-prices"
            checked={useYear0Prices}
            onCheckedChange={(checked) => setUseYear0Prices(checked as boolean)}
            data-testid="checkbox-year0-prices"
          />
          <Label htmlFor="year0-prices" className="cursor-pointer font-medium">
            Show values in Year 0 prices (inflation-adjusted)
          </Label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Wealth</h3>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="wealth-toggle"
                checked={showWealth}
                onCheckedChange={(checked) => setShowWealth(checked as boolean)}
                data-testid="checkbox-wealth"
              />
              <Label htmlFor="wealth-toggle" className="cursor-pointer">
                Net Wealth (Nominal)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="wealth-year0-toggle"
                checked={showWealthYear0}
                onCheckedChange={(checked) => setShowWealthYear0(checked as boolean)}
                data-testid="checkbox-wealth-year0"
              />
              <Label htmlFor="wealth-year0-toggle" className="cursor-pointer">
                Net Wealth (Year 0 Prices)
              </Label>
            </div>
          </div>

          {investments.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-green-600 dark:text-green-400">
                Investments
              </h3>
              {investments.map((investment, index) => (
                <div key={investment.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`inv-${investment.id}`}
                    checked={visibleInvestments.has(investment.id)}
                    onCheckedChange={() => toggleInvestment(investment.id)}
                    data-testid={`checkbox-investment-${investment.id}`}
                  />
                  <Label
                    htmlFor={`inv-${investment.id}`}
                    className="cursor-pointer text-sm"
                  >
                    <span
                      className="inline-block w-3 h-3 rounded-full mr-2"
                      style={{
                        backgroundColor: generateColor(142, index, investments.length),
                      }}
                    />
                    {investment.name || "Unnamed Investment"}
                  </Label>
                </div>
              ))}
            </div>
          )}

          {costs.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-red-600 dark:text-red-400">
                Costs
              </h3>
              {costs.map((cost, index) => (
                <div key={cost.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cost-${cost.id}`}
                    checked={visibleCosts.has(cost.id)}
                    onCheckedChange={() => toggleCost(cost.id)}
                    data-testid={`checkbox-cost-${cost.id}`}
                  />
                  <Label htmlFor={`cost-${cost.id}`} className="cursor-pointer text-sm">
                    <span
                      className="inline-block w-3 h-3 rounded-full mr-2"
                      style={{
                        backgroundColor: generateColor(0, index, costs.length),
                      }}
                    />
                    {cost.name || "Unnamed Cost"}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        <ScrollArea className="w-full">
          <div style={{ width: chartWidth, minWidth: "100%" }}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="year"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--foreground))" }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--foreground))" }}
                  tickFormatter={(value) => formatCurrency(value).replace("$", "$")}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />

                {showWealth && (
                  <Line
                    type="monotone"
                    dataKey="wealth"
                    stroke={COLORS.wealth}
                    strokeWidth={3}
                    name="Net Wealth (Nominal)"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                )}

                {showWealthYear0 && (
                  <Line
                    type="monotone"
                    dataKey="wealthYear0"
                    stroke={COLORS.wealthYear0}
                    strokeWidth={3}
                    strokeDasharray="8 4"
                    name="Net Wealth (Year 0 Prices)"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                )}

                {investments.map((investment, index) => {
                  if (!visibleInvestments.has(investment.id)) return null;
                  return (
                    <Line
                      key={investment.id}
                      type="monotone"
                      dataKey={`inv_${investment.id}`}
                      stroke={generateColor(142, index, investments.length)}
                      strokeWidth={2}
                      name={investment.name || "Unnamed Investment"}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  );
                })}

                {costs.map((cost, index) => {
                  if (!visibleCosts.has(cost.id)) return null;
                  return (
                    <Line
                      key={cost.id}
                      type="monotone"
                      dataKey={`cost_${cost.id}`}
                      stroke={generateColor(0, index, costs.length)}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name={cost.name || "Unnamed Cost"}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>Tip:</strong> Hover over the chart to see detailed values. Use the scroll bar to navigate through years.
          </p>
          {useYear0Prices && (
            <p className="text-primary">
              <strong>Year 0 Prices:</strong> All investment and cost values are shown in today's purchasing power, adjusted for inflation.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

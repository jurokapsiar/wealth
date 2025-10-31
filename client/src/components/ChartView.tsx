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
}

const COLORS = {
  wealth: "hsl(var(--primary))",
  investmentBase: "hsl(142, 76%, 36%)",
  costBase: "hsl(0, 84%, 60%)",
};

const generateColor = (baseHue: number, index: number, total: number) => {
  const saturation = 70 - (index * 10) % 30;
  const lightness = 45 + (index * 15) % 20;
  return `hsl(${baseHue + (index * 30) % 60}, ${saturation}%, ${lightness}%)`;
};

export function ChartView({ projections, costs, investments }: ChartViewProps) {
  const [showWealth, setShowWealth] = useState(true);
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
      const dataPoint: Record<string, number | string> = {
        year: `Y${proj.yearNumber}`,
        calendarYear: proj.calendarYear,
      };

      if (showWealth) {
        dataPoint.wealth = Math.round(proj.endingWealth);
      }

      proj.investments.forEach((inv) => {
        const investment = investments.find((i) => i.name === inv.name);
        if (investment && visibleInvestments.has(investment.id)) {
          dataPoint[`inv_${investment.id}`] = Math.round(inv.amount);
        }
      });

      proj.costs.forEach((cost) => {
        const costItem = costs.find((c) => c.name === cost.name);
        if (costItem && visibleCosts.has(costItem.id)) {
          dataPoint[`cost_${costItem.id}`] = Math.round(cost.amount);
        }
      });

      return dataPoint;
    });
  }, [projections, showWealth, visibleInvestments, visibleCosts, investments, costs]);

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
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
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
                Net Wealth
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
                    name="Net Wealth"
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

        <div className="text-xs text-muted-foreground">
          <p>
            Tip: Hover over the chart to see detailed values. Use the scroll bar to navigate
            through years.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

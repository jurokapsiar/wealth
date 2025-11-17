import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ChartSettings } from "./ChartSettings";
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
  showWealth: boolean;
  showWealthYear0: boolean;
  useYear0Prices: boolean;
  visibleInvestments: Set<string>;
  visibleCosts: Set<string>;
  onShowWealthChange: (value: boolean) => void;
  onShowWealthYear0Change: (value: boolean) => void;
  onUseYear0PricesChange: (value: boolean) => void;
  onToggleInvestment: (id: string) => void;
  onToggleCost: (id: string) => void;
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

export function ChartView({ 
  projections, 
  costs, 
  investments, 
  startingAge, 
  inflation,
  showWealth,
  showWealthYear0,
  useYear0Prices,
  visibleInvestments,
  visibleCosts,
  onShowWealthChange,
  onShowWealthYear0Change,
  onUseYear0PricesChange,
  onToggleInvestment,
  onToggleCost,
}: ChartViewProps) {
  const chartData = useMemo(() => {
    return projections.map((proj) => {
      const age = startingAge + proj.yearNumber;
      const dataPoint: Record<string, number | string> = {
        year: `Y${proj.yearNumber} (${age})`,
        calendarYear: proj.calendarYear,
        age: age,
      };

      if (showWealth) {
        const wealthValue = Math.round(proj.endingWealth);
        // Only show non-negative values in the chart
        if (wealthValue >= 0) {
          dataPoint.wealth = Math.round(proj.endingWealth / 10);
          dataPoint.wealthActual = wealthValue;
        }
      }

      if (showWealthYear0) {
        const inflationMultiplier = Math.pow(1 + inflation / 100, proj.yearNumber);
        const wealthYear0 = proj.endingWealth / inflationMultiplier;
        const wealthYear0Value = Math.round(wealthYear0);
        // Only show non-negative values in the chart
        if (wealthYear0Value >= 0) {
          dataPoint.wealthYear0 = Math.round(wealthYear0 / 10);
          dataPoint.wealthYear0Actual = wealthYear0Value;
        }
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
        <div className="bg-card border rounded p-2 shadow-lg">
          <p className="font-semibold mb-1 text-sm">
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
              <p key={index} style={{ color: entry.color }} className="text-xs">
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
        <CardContent className="py-12">
          <p className="text-muted-foreground text-center text-sm">
            No projection data to display. Add some investments or costs to see the chart.
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartWidth = Math.max(800, projections.length * 40);

  return (
    <Card className="relative">
      {/* Chart Settings Overlay */}
      <div className="absolute top-3 left-3 z-10">
        <ChartSettings
          showWealth={showWealth}
          showWealthYear0={showWealthYear0}
          useYear0Prices={useYear0Prices}
          visibleInvestments={visibleInvestments}
          visibleCosts={visibleCosts}
          investments={investments}
          costs={costs}
          onShowWealthChange={onShowWealthChange}
          onShowWealthYear0Change={onShowWealthYear0Change}
          onUseYear0PricesChange={onUseYear0PricesChange}
          onToggleInvestment={onToggleInvestment}
          onToggleCost={onToggleCost}
        />
      </div>

      <CardContent className="p-3 pt-12">
        <ScrollArea className="w-full">
          <div style={{ width: chartWidth, minWidth: "100%" }}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="year"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
                  tickFormatter={(value) => formatCurrency(value).replace("$", "$")}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />

                {showWealth && (
                  <Line
                    type="monotone"
                    dataKey="wealth"
                    stroke={COLORS.wealth}
                    strokeWidth={2.5}
                    name="Net Wealth (Nominal)"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                )}

                {showWealthYear0 && (
                  <Line
                    type="monotone"
                    dataKey="wealthYear0"
                    stroke={COLORS.wealthYear0}
                    strokeWidth={2.5}
                    strokeDasharray="6 3"
                    name="Net Wealth (Year 0)"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
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
                      strokeWidth={1.5}
                      name={investment.name || "Unnamed"}
                      dot={{ r: 2 }}
                      activeDot={{ r: 4 }}
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
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      name={cost.name || "Unnamed"}
                      dot={{ r: 2 }}
                      activeDot={{ r: 4 }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {useYear0Prices && (
          <p className="text-xs text-muted-foreground mt-2">
            <strong>Year 0 Prices:</strong> Values shown in today's purchasing power
          </p>
        )}
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export interface YearProjection {
  yearNumber: number;
  calendarYear: number;
  startingWealth: number;
  interestGained: number;
  costs: Array<{ name: string; amount: number }>;
  totalCosts: number;
  endingWealth: number;
}

interface ProjectionTableProps {
  projections: YearProjection[];
}

export function ProjectionTable({ projections }: ProjectionTableProps) {
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

  const toggleYear = (yearNumber: number) => {
    const newExpanded = new Set(expandedYears);
    if (newExpanded.has(yearNumber)) {
      newExpanded.delete(yearNumber);
    } else {
      newExpanded.add(yearNumber);
    }
    setExpandedYears(newExpanded);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (projections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Wealth Projection</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Configure your settings and add costs to see projections
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Wealth Projection</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                  Year
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide hidden sm:table-cell">
                  Starting
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide hidden md:table-cell">
                  Interest
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide hidden sm:table-cell">
                  Costs
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">
                  Ending
                </th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {projections.map((projection) => {
                const isExpanded = expandedYears.has(projection.yearNumber);
                const hasCosts = projection.costs.length > 0;

                return (
                  <>
                    <tr
                      key={projection.yearNumber}
                      className="border-b hover-elevate cursor-pointer"
                      onClick={() => hasCosts && toggleYear(projection.yearNumber)}
                      data-testid={`row-year-${projection.yearNumber}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium tabular-nums">
                            Year {projection.yearNumber}
                          </span>
                          <span className="text-sm text-muted-foreground tabular-nums">
                            {projection.calendarYear}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-sm hidden sm:table-cell">
                        {formatCurrency(projection.startingWealth)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-sm text-chart-2 hidden md:table-cell">
                        +{formatCurrency(projection.interestGained)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-sm text-destructive hidden sm:table-cell">
                        -{formatCurrency(projection.totalCosts)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold">
                        <span data-testid={`text-ending-wealth-${projection.yearNumber}`}>
                          {formatCurrency(projection.endingWealth)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {hasCosts && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            data-testid={`button-expand-${projection.yearNumber}`}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                    {isExpanded && hasCosts && (
                      <tr>
                        <td colSpan={6} className="px-4 py-3 bg-muted/30">
                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Cost Breakdown
                            </p>
                            {projection.costs.map((cost, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center pl-4 py-1"
                                data-testid={`cost-item-${projection.yearNumber}-${index}`}
                              >
                                <span className="text-sm">{cost.name}</span>
                                <span className="text-sm tabular-nums text-destructive">
                                  -{formatCurrency(cost.amount)}
                                </span>
                              </div>
                            ))}
                            <div className="flex justify-between items-center pl-4 py-1 border-t pt-2 font-semibold">
                              <span className="text-sm">Total Deducted</span>
                              <span className="text-sm tabular-nums text-destructive">
                                -{formatCurrency(projection.totalCosts)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center pl-4 py-1 font-semibold">
                              <span className="text-sm">Remaining Wealth</span>
                              <span className="text-sm tabular-nums">
                                {formatCurrency(projection.endingWealth)}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState, Fragment } from "react";
import { Button } from "@/components/ui/button";

export interface YearProjection {
  yearNumber: number;
  calendarYear: number;
  startingWealth: number;
  interestGained: number;
  investments: Array<{ name: string; amount: number; todaysValue: number }>;
  totalInvestments: number;
  costs: Array<{ name: string; amount: number; todaysValue: number }>;
  totalCosts: number;
  tax: number;
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
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide hidden lg:table-cell">
                  Tax
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">
                  Ending
                </th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {projections.filter(projection => projection.endingWealth >= 0).map((projection) => {
                const isExpanded = expandedYears.has(projection.yearNumber);
                const hasDetails = projection.costs.length > 0 || projection.investments.length > 0;

                return (
                  <Fragment key={projection.yearNumber}>
                    <tr
                      className="border-b hover-elevate cursor-pointer"
                      onClick={() => hasDetails && toggleYear(projection.yearNumber)}
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
                      <td className="px-4 py-3 text-right tabular-nums text-sm text-destructive hidden lg:table-cell">
                        {projection.tax > 0 ? `-${formatCurrency(projection.tax)}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold">
                        <span data-testid={`text-ending-wealth-${projection.yearNumber}`}>
                          {formatCurrency(projection.endingWealth)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {hasDetails && (
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
                    {isExpanded && hasDetails && (
                      <tr>
                        <td colSpan={7} className="px-4 py-3 bg-muted/30">
                          <div className="space-y-4">
                            {projection.investments.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  Investment Income
                                </p>
                                {projection.investments.map((investment, index) => (
                                  <div
                                    key={index}
                                    className="pl-4 py-1 space-y-1"
                                    data-testid={`investment-item-${projection.yearNumber}-${index}`}
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm font-medium">{investment.name}</span>
                                      <span className="text-sm tabular-nums text-chart-2">
                                        +{formatCurrency(investment.amount)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs text-muted-foreground">Year 0 Value</span>
                                      <span className="text-xs tabular-nums text-muted-foreground">
                                        +{formatCurrency(investment.todaysValue)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                                <div className="flex justify-between items-center pl-4 py-1 border-t pt-2 font-semibold">
                                  <span className="text-sm">Total Income</span>
                                  <span className="text-sm tabular-nums text-chart-2">
                                    +{formatCurrency(projection.totalInvestments)}
                                  </span>
                                </div>
                              </div>
                            )}
                            {projection.costs.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  Cost Breakdown
                                </p>
                                {projection.costs.map((cost, index) => (
                              <div
                                key={index}
                                className="pl-4 py-1 space-y-1"
                                data-testid={`cost-item-${projection.yearNumber}-${index}`}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium">{cost.name}</span>
                                  <span className="text-sm tabular-nums text-destructive">
                                    -{formatCurrency(cost.amount)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-muted-foreground">Year 0 Value</span>
                                  <span className="text-xs tabular-nums text-muted-foreground">
                                    -{formatCurrency(cost.todaysValue)}
                                  </span>
                                </div>
                              </div>
                                ))}
                                <div className="flex justify-between items-center pl-4 py-1 border-t pt-2 font-semibold">
                                  <span className="text-sm">Total Deducted</span>
                                  <span className="text-sm tabular-nums text-destructive">
                                    -{formatCurrency(projection.totalCosts)}
                                  </span>
                                </div>
                              </div>
                            )}
                            {projection.tax > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  Tax on Interest Growth
                                </p>
                                <div className="flex justify-between items-center pl-4 py-1 font-semibold">
                                  <span className="text-sm">Tax Deducted</span>
                                  <span className="text-sm tabular-nums text-destructive">
                                    -{formatCurrency(projection.tax)}
                                  </span>
                                </div>
                              </div>
                            )}
                            <div className="flex justify-between items-center pl-4 py-1 font-semibold border-t pt-2">
                              <span className="text-sm">Net Wealth</span>
                              <span className="text-sm tabular-nums">
                                {formatCurrency(projection.endingWealth)}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

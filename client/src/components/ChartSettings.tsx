import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Settings2 } from "lucide-react";
import type { Cost } from "./CostEntry";
import type { Investment } from "./InvestmentEntry";

interface ChartSettingsProps {
  showWealth: boolean;
  showWealthYear0: boolean;
  useYear0Prices: boolean;
  visibleInvestments: Set<string>;
  visibleCosts: Set<string>;
  investments: Investment[];
  costs: Cost[];
  onShowWealthChange: (value: boolean) => void;
  onShowWealthYear0Change: (value: boolean) => void;
  onUseYear0PricesChange: (value: boolean) => void;
  onToggleInvestment: (id: string) => void;
  onToggleCost: (id: string) => void;
}

export function ChartSettings({
  showWealth,
  showWealthYear0,
  useYear0Prices,
  visibleInvestments,
  visibleCosts,
  investments,
  costs,
  onShowWealthChange,
  onShowWealthYear0Change,
  onUseYear0PricesChange,
  onToggleInvestment,
  onToggleCost,
}: ChartSettingsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          data-testid="button-chart-settings"
          className="gap-1.5 h-8"
        >
          <Settings2 className="h-3.5 w-3.5" />
          Chart Settings
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="p-2 space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="year0-prices"
              checked={useYear0Prices}
              onCheckedChange={(checked) => onUseYear0PricesChange(checked as boolean)}
              data-testid="checkbox-year0-prices"
            />
            <Label htmlFor="year0-prices" className="cursor-pointer text-sm font-medium">
              Show Year 0 Prices
            </Label>
          </div>
          
          <DropdownMenuSeparator />
          
          <div className="space-y-2">
            <DropdownMenuLabel className="text-xs font-semibold px-0">Wealth</DropdownMenuLabel>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="wealth-toggle"
                checked={showWealth}
                onCheckedChange={(checked) => onShowWealthChange(checked as boolean)}
                data-testid="checkbox-wealth"
              />
              <Label htmlFor="wealth-toggle" className="cursor-pointer text-sm">
                Net Wealth (Nominal)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="wealth-year0-toggle"
                checked={showWealthYear0}
                onCheckedChange={(checked) => onShowWealthYear0Change(checked as boolean)}
                data-testid="checkbox-wealth-year0"
              />
              <Label htmlFor="wealth-year0-toggle" className="cursor-pointer text-sm">
                Net Wealth (Year 0)
              </Label>
            </div>
          </div>

          {investments.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="space-y-2">
                <DropdownMenuLabel className="text-xs font-semibold px-0 text-green-600 dark:text-green-400">
                  Investments
                </DropdownMenuLabel>
                {investments.map((investment) => (
                  <div key={investment.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`inv-${investment.id}`}
                      checked={visibleInvestments.has(investment.id)}
                      onCheckedChange={() => onToggleInvestment(investment.id)}
                      data-testid={`checkbox-investment-${investment.id}`}
                    />
                    <Label
                      htmlFor={`inv-${investment.id}`}
                      className="cursor-pointer text-sm truncate flex-1"
                    >
                      {investment.name || 'Unnamed'}
                    </Label>
                  </div>
                ))}
              </div>
            </>
          )}

          {costs.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="space-y-2">
                <DropdownMenuLabel className="text-xs font-semibold px-0 text-red-600 dark:text-red-400">
                  Costs
                </DropdownMenuLabel>
                {costs.map((cost) => (
                  <div key={cost.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cost-${cost.id}`}
                      checked={visibleCosts.has(cost.id)}
                      onCheckedChange={() => onToggleCost(cost.id)}
                      data-testid={`checkbox-cost-${cost.id}`}
                    />
                    <Label
                      htmlFor={`cost-${cost.id}`}
                      className="cursor-pointer text-sm truncate flex-1"
                    >
                      {cost.name || 'Unnamed'}
                    </Label>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { forwardRef } from "react";

export interface Cost {
  id: string;
  name: string;
  type: 'fixed' | 'percentage';
  amount: number;
  startYear: number;
  years: number;
  enabled: boolean;
  taxEnabled: boolean;
  taxPercentage: number;
}

interface CostEntryProps {
  cost: Cost;
  onUpdate: (cost: Cost) => void;
  onRemove: () => void;
  birthYear: number;
  startYear: number;
}

export const CostEntry = forwardRef<HTMLDivElement, CostEntryProps>(
  ({ cost, onUpdate, onRemove, birthYear, startYear }, ref) => {
    const startAge = (startYear + cost.startYear) - birthYear;
    const endAge = startAge + cost.years - 1;
    
    return (
      <Card ref={ref} className={!cost.enabled ? "opacity-60" : ""}>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`cost-enabled-${cost.id}`}
              checked={cost.enabled}
              onCheckedChange={(checked) => onUpdate({ ...cost, enabled: checked as boolean })}
              data-testid={`checkbox-cost-enabled-${cost.id}`}
            />
            <CardTitle className="text-sm font-medium">Cost Entry</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            data-testid={`button-remove-cost-${cost.id}`}
            className="h-7 w-7"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-[100px_1fr] items-center gap-x-3 gap-y-2">
            <Label htmlFor={`cost-name-${cost.id}`} className="text-sm">
              Name
            </Label>
            <Input
              id={`cost-name-${cost.id}`}
              data-testid={`input-cost-name-${cost.id}`}
              type="text"
              value={cost.name}
              onChange={(e) => onUpdate({ ...cost, name: e.target.value })}
              placeholder="e.g., Annual Expenses"
              disabled={!cost.enabled}
              className="h-8"
            />

            <Label className="text-sm">
              Type
            </Label>
            <RadioGroup
              value={cost.type}
              onValueChange={(value: 'fixed' | 'percentage') =>
                onUpdate({ ...cost, type: value })
              }
              disabled={!cost.enabled}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem
                  value="fixed"
                  id={`fixed-${cost.id}`}
                  data-testid={`radio-fixed-${cost.id}`}
                  disabled={!cost.enabled}
                />
                <Label
                  htmlFor={`fixed-${cost.id}`}
                  className="font-normal cursor-pointer text-sm"
                >
                  Fixed
                </Label>
              </div>
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem
                  value="percentage"
                  id={`percentage-${cost.id}`}
                  data-testid={`radio-percentage-${cost.id}`}
                  disabled={!cost.enabled}
                />
                <Label
                  htmlFor={`percentage-${cost.id}`}
                  className="font-normal cursor-pointer text-sm"
                >
                  % of Wealth
                </Label>
              </div>
            </RadioGroup>

            <Label htmlFor={`cost-amount-${cost.id}`} className="text-sm">
              {cost.type === 'fixed' ? 'Amount' : 'Percentage'}
            </Label>
            <div className="relative">
              {cost.type === 'fixed' && (
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  $
                </span>
              )}
              <Input
                id={`cost-amount-${cost.id}`}
                data-testid={`input-cost-amount-${cost.id}`}
                type="number"
                min="0"
                step={cost.type === 'fixed' ? '100' : '0.1'}
                value={cost.amount}
                onChange={(e) => onUpdate({ ...cost, amount: Number(e.target.value) })}
                className={cost.type === 'fixed' ? 'pl-6 tabular-nums h-8' : 'pr-6 tabular-nums h-8'}
                disabled={!cost.enabled}
              />
              {cost.type === 'percentage' && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  %
                </span>
              )}
            </div>

            <Label htmlFor={`cost-start-${cost.id}`} className="text-sm">
              Start Year
            </Label>
            <div>
              <Input
                id={`cost-start-${cost.id}`}
                data-testid={`input-cost-start-${cost.id}`}
                type="number"
                min="0"
                value={cost.startYear}
                onChange={(e) => onUpdate({ ...cost, startYear: Number(e.target.value) })}
                className="tabular-nums h-8"
                disabled={!cost.enabled}
              />
              <p className="text-xs text-muted-foreground mt-0.5">Age {startAge}</p>
            </div>

            <Label htmlFor={`cost-years-${cost.id}`} className="text-sm">
              Duration
            </Label>
            <div>
              <Input
                id={`cost-years-${cost.id}`}
                data-testid={`input-cost-years-${cost.id}`}
                type="number"
                min="1"
                value={cost.years}
                onChange={(e) => onUpdate({ ...cost, years: Number(e.target.value) })}
                className="tabular-nums h-8"
                disabled={!cost.enabled}
              />
              <p className="text-xs text-muted-foreground mt-0.5">
                {cost.years} {cost.years === 1 ? 'year' : 'years'} (ages {startAge}–{endAge})
              </p>
            </div>
          </div>

          <div className="col-span-2 border-t pt-2 mt-2">
            <div className="flex items-center gap-2 mb-2">
              <Checkbox
                id={`cost-tax-enabled-${cost.id}`}
                checked={cost.taxEnabled}
                onCheckedChange={(checked) => onUpdate({ ...cost, taxEnabled: checked as boolean })}
                data-testid={`checkbox-cost-tax-enabled-${cost.id}`}
                disabled={!cost.enabled}
              />
              <Label htmlFor={`cost-tax-enabled-${cost.id}`} className="text-sm font-normal cursor-pointer">
                Tax on yearly interest growth
              </Label>
            </div>
            {cost.taxEnabled && (
              <div className="grid grid-cols-[100px_1fr] items-center gap-x-3 gap-y-2 ml-6">
                <Label htmlFor={`cost-tax-percentage-${cost.id}`} className="text-sm">
                  Tax Rate
                </Label>
                <div className="relative">
                  <Input
                    id={`cost-tax-percentage-${cost.id}`}
                    data-testid={`input-cost-tax-percentage-${cost.id}`}
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={cost.taxPercentage}
                    onChange={(e) => onUpdate({ ...cost, taxPercentage: Number(e.target.value) })}
                    className="pr-6 tabular-nums h-8"
                    disabled={!cost.enabled}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    %
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

CostEntry.displayName = "CostEntry";

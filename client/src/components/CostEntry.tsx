import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";

export interface Cost {
  id: string;
  name: string;
  type: 'fixed' | 'percentage';
  amount: number;
  startYear: number;
  years: number;
  enabled: boolean;
}

interface CostEntryProps {
  cost: Cost;
  onUpdate: (cost: Cost) => void;
  onRemove: () => void;
}

export function CostEntry({ cost, onUpdate, onRemove }: CostEntryProps) {
  return (
    <Card className={!cost.enabled ? "opacity-60" : ""}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <Checkbox
            id={`cost-enabled-${cost.id}`}
            checked={cost.enabled}
            onCheckedChange={(checked) => onUpdate({ ...cost, enabled: checked as boolean })}
            data-testid={`checkbox-cost-enabled-${cost.id}`}
          />
          <CardTitle className="text-base font-medium">Cost Entry</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          data-testid={`button-remove-cost-${cost.id}`}
          className="h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`cost-name-${cost.id}`} className="text-sm font-medium">
            Cost Name
          </Label>
          <Input
            id={`cost-name-${cost.id}`}
            data-testid={`input-cost-name-${cost.id}`}
            type="text"
            value={cost.name}
            onChange={(e) => onUpdate({ ...cost, name: e.target.value })}
            placeholder="e.g., Annual Expenses"
            disabled={!cost.enabled}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Cost Type</Label>
          <RadioGroup
            value={cost.type}
            onValueChange={(value: 'fixed' | 'percentage') =>
              onUpdate({ ...cost, type: value })
            }
            disabled={!cost.enabled}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="fixed"
                id={`fixed-${cost.id}`}
                data-testid={`radio-fixed-${cost.id}`}
                disabled={!cost.enabled}
              />
              <Label
                htmlFor={`fixed-${cost.id}`}
                className="font-normal cursor-pointer"
              >
                Fixed Amount
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="percentage"
                id={`percentage-${cost.id}`}
                data-testid={`radio-percentage-${cost.id}`}
                disabled={!cost.enabled}
              />
              <Label
                htmlFor={`percentage-${cost.id}`}
                className="font-normal cursor-pointer"
              >
                Percentage of Wealth
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`cost-amount-${cost.id}`} className="text-sm font-medium">
            {cost.type === 'fixed' ? 'Amount' : 'Percentage'}
          </Label>
          <div className="relative">
            {cost.type === 'fixed' && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
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
              className={cost.type === 'fixed' ? 'pl-7 tabular-nums' : 'pr-7 tabular-nums'}
              disabled={!cost.enabled}
            />
            {cost.type === 'percentage' && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                %
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`cost-start-${cost.id}`} className="text-sm font-medium">
              Start Year
            </Label>
            <Input
              id={`cost-start-${cost.id}`}
              data-testid={`input-cost-start-${cost.id}`}
              type="number"
              min="0"
              value={cost.startYear}
              onChange={(e) => onUpdate({ ...cost, startYear: Number(e.target.value) })}
              className="tabular-nums"
              disabled={!cost.enabled}
            />
            <p className="text-xs text-muted-foreground">Year from start (0 = first year)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`cost-years-${cost.id}`} className="text-sm font-medium">
              Duration
            </Label>
            <Input
              id={`cost-years-${cost.id}`}
              data-testid={`input-cost-years-${cost.id}`}
              type="number"
              min="1"
              value={cost.years}
              onChange={(e) => onUpdate({ ...cost, years: Number(e.target.value) })}
              className="tabular-nums"
              disabled={!cost.enabled}
            />
            <p className="text-xs text-muted-foreground">Number of years</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

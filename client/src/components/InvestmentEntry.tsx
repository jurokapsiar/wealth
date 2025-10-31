import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export interface Investment {
  id: string;
  name: string;
  amount: number;
  startYear: number;
  years: number;
}

interface InvestmentEntryProps {
  investment: Investment;
  onUpdate: (investment: Investment) => void;
  onRemove: () => void;
}

export function InvestmentEntry({ investment, onUpdate, onRemove }: InvestmentEntryProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
        <CardTitle className="text-base font-medium">Investment Entry</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          data-testid={`button-remove-investment-${investment.id}`}
          className="h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`investment-name-${investment.id}`} className="text-sm font-medium">
            Investment Name
          </Label>
          <Input
            id={`investment-name-${investment.id}`}
            data-testid={`input-investment-name-${investment.id}`}
            type="text"
            value={investment.name}
            onChange={(e) => onUpdate({ ...investment, name: e.target.value })}
            placeholder="e.g., Dividend Income"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`investment-amount-${investment.id}`} className="text-sm font-medium">
            Annual Amount
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              id={`investment-amount-${investment.id}`}
              data-testid={`input-investment-amount-${investment.id}`}
              type="number"
              min="0"
              step="100"
              value={investment.amount}
              onChange={(e) =>
                onUpdate({ ...investment, amount: parseFloat(e.target.value) || 0 })
              }
              className="pl-7"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Fixed amount adjusted for inflation each year
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`investment-start-${investment.id}`} className="text-sm font-medium">
              Start Year
            </Label>
            <Input
              id={`investment-start-${investment.id}`}
              data-testid={`input-investment-start-${investment.id}`}
              type="number"
              min="0"
              value={investment.startYear}
              onChange={(e) =>
                onUpdate({ ...investment, startYear: parseInt(e.target.value) || 0 })
              }
            />
            <p className="text-xs text-muted-foreground">Year 0 = first year</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`investment-years-${investment.id}`} className="text-sm font-medium">
              Duration
            </Label>
            <Input
              id={`investment-years-${investment.id}`}
              data-testid={`input-investment-years-${investment.id}`}
              type="number"
              min="1"
              value={investment.years}
              onChange={(e) =>
                onUpdate({ ...investment, years: parseInt(e.target.value) || 1 })
              }
            />
            <p className="text-xs text-muted-foreground">Number of years</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

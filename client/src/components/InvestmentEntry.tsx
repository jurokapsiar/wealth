import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { forwardRef } from "react";

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
  birthYear: number;
  startYear: number;
}

export const InvestmentEntry = forwardRef<HTMLDivElement, InvestmentEntryProps>(
  ({ investment, onUpdate, onRemove, birthYear, startYear }, ref) => {
    const startAge = (startYear + investment.startYear) - birthYear;
    const endAge = startAge + investment.years - 1;
    
    return (
      <Card ref={ref}>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Investment Entry</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            data-testid={`button-remove-investment-${investment.id}`}
            className="h-7 w-7"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-[100px_1fr] items-center gap-x-3 gap-y-2">
            <Label htmlFor={`investment-name-${investment.id}`} className="text-sm">
              Name
            </Label>
            <Input
              id={`investment-name-${investment.id}`}
              data-testid={`input-investment-name-${investment.id}`}
              type="text"
              value={investment.name}
              onChange={(e) => onUpdate({ ...investment, name: e.target.value })}
              placeholder="e.g., Dividend Income"
              className="h-8"
            />

            <Label htmlFor={`investment-amount-${investment.id}`} className="text-sm">
              Amount
            </Label>
            <div>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
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
                  className="pl-6 h-8"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Annual, inflation-adjusted
              </p>
            </div>

            <Label htmlFor={`investment-start-${investment.id}`} className="text-sm">
              Start Year
            </Label>
            <div>
              <Input
                id={`investment-start-${investment.id}`}
                data-testid={`input-investment-start-${investment.id}`}
                type="number"
                min="0"
                value={investment.startYear}
                onChange={(e) =>
                  onUpdate({ ...investment, startYear: parseInt(e.target.value) || 0 })
                }
                className="h-8"
              />
              <p className="text-xs text-muted-foreground mt-0.5">Age {startAge}</p>
            </div>

            <Label htmlFor={`investment-years-${investment.id}`} className="text-sm">
              Duration
            </Label>
            <div>
              <Input
                id={`investment-years-${investment.id}`}
                data-testid={`input-investment-years-${investment.id}`}
                type="number"
                min="1"
                value={investment.years}
                onChange={(e) =>
                  onUpdate({ ...investment, years: parseInt(e.target.value) || 1 })
                }
                className="h-8"
              />
              <p className="text-xs text-muted-foreground mt-0.5">
                {investment.years} {investment.years === 1 ? 'year' : 'years'} (ages {startAge}–{endAge})
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

InvestmentEntry.displayName = "InvestmentEntry";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SettingsCardProps {
  initialWealth: number;
  yearlyInterest: number;
  inflation: number;
  startYear: number;
  birthYear: number;
  onInitialWealthChange: (value: number) => void;
  onYearlyInterestChange: (value: number) => void;
  onInflationChange: (value: number) => void;
  onStartYearChange: (value: number) => void;
  onBirthYearChange: (value: number) => void;
}

export function SettingsCard({
  initialWealth,
  yearlyInterest,
  inflation,
  startYear,
  birthYear,
  onInitialWealthChange,
  onYearlyInterestChange,
  onInflationChange,
  onStartYearChange,
  onBirthYearChange,
}: SettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Initial Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="initial-wealth" className="text-sm font-medium">
            Initial Wealth
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              id="initial-wealth"
              data-testid="input-initial-wealth"
              type="number"
              min="0"
              step="1000"
              value={initialWealth}
              onChange={(e) => onInitialWealthChange(Number(e.target.value))}
              className="pl-7 tabular-nums"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="yearly-interest" className="text-sm font-medium">
              Yearly Interest
            </Label>
            <div className="relative">
              <Input
                id="yearly-interest"
                data-testid="input-yearly-interest"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={yearlyInterest}
                onChange={(e) => onYearlyInterestChange(Number(e.target.value))}
                className="pr-7 tabular-nums"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                %
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inflation" className="text-sm font-medium">
              Inflation Rate
            </Label>
            <div className="relative">
              <Input
                id="inflation"
                data-testid="input-inflation"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={inflation}
                onChange={(e) => onInflationChange(Number(e.target.value))}
                className="pr-7 tabular-nums"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                %
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-year" className="text-sm font-medium">
              Start Year
            </Label>
            <Input
              id="start-year"
              data-testid="input-start-year"
              type="number"
              min="2000"
              max="2100"
              value={startYear}
              onChange={(e) => onStartYearChange(Number(e.target.value))}
              className="tabular-nums"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth-year" className="text-sm font-medium">
              Birth Year
            </Label>
            <Input
              id="birth-year"
              data-testid="input-birth-year"
              type="number"
              min="1900"
              max="2100"
              value={birthYear}
              onChange={(e) => onBirthYearChange(Number(e.target.value))}
              className="tabular-nums"
            />
            <p className="text-xs text-muted-foreground">Used to calculate age on chart</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

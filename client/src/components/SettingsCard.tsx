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
  const currentAge = startYear - birthYear;
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Initial Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-[140px_1fr] items-center gap-x-3 gap-y-2">
          <Label htmlFor="initial-wealth" className="text-sm">
            Initial Wealth
          </Label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
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
              className="pl-6 tabular-nums h-8"
            />
          </div>

          <Label htmlFor="yearly-interest" className="text-sm">
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
              className="pr-6 tabular-nums h-8"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              %
            </span>
          </div>

          <Label htmlFor="inflation" className="text-sm">
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
              className="pr-6 tabular-nums h-8"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              %
            </span>
          </div>

          <Label htmlFor="start-year" className="text-sm">
            Start Year
          </Label>
          <div>
            <Input
              id="start-year"
              data-testid="input-start-year"
              type="number"
              min="2000"
              max="2100"
              value={startYear}
              onChange={(e) => onStartYearChange(Number(e.target.value))}
              className="tabular-nums h-8"
            />
            <p className="text-xs text-muted-foreground mt-0.5">Age {currentAge} at start</p>
          </div>

          <Label htmlFor="birth-year" className="text-sm">
            Birth Year
          </Label>
          <div>
            <Input
              id="birth-year"
              data-testid="input-birth-year"
              type="number"
              min="1900"
              max="2100"
              value={birthYear}
              onChange={(e) => onBirthYearChange(Number(e.target.value))}
              className="tabular-nums h-8"
            />
            <p className="text-xs text-muted-foreground mt-0.5">For age calculations</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

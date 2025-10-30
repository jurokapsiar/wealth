import { useState, useEffect } from "react";
import { SettingsCard } from "@/components/SettingsCard";
import { CostEntry, type Cost } from "@/components/CostEntry";
import { ProjectionTable, type YearProjection } from "@/components/ProjectionTable";
import { Button } from "@/components/ui/button";
import { Plus, Calculator } from "lucide-react";

export default function Home() {
  const [initialWealth, setInitialWealth] = useState(100000);
  const [yearlyInterest, setYearlyInterest] = useState(7.5);
  const [inflation, setInflation] = useState(3.0);
  const [startYear, setStartYear] = useState(2026);
  const [costs, setCosts] = useState<Cost[]>([]);
  const [projections, setProjections] = useState<YearProjection[]>([]);

  const addCost = () => {
    const newCost: Cost = {
      id: Date.now().toString(),
      name: '',
      type: 'fixed',
      amount: 0,
      startYear: 0,
      years: 1,
    };
    setCosts([...costs, newCost]);
  };

  const updateCost = (id: string, updatedCost: Cost) => {
    setCosts(costs.map((c) => (c.id === id ? updatedCost : c)));
  };

  const removeCost = (id: string) => {
    setCosts(costs.filter((c) => c.id !== id));
  };

  const calculateProjections = () => {
    if (initialWealth <= 0 || yearlyInterest < 0 || inflation < 0) {
      return;
    }

    const maxYear = costs.reduce(
      (max, cost) => Math.max(max, cost.startYear + cost.years),
      10
    );

    const yearlyProjections: YearProjection[] = [];
    let currentWealth = initialWealth;

    for (let year = 0; year < maxYear; year++) {
      const startingWealth = currentWealth;
      const interestGained = currentWealth > 0 ? (currentWealth * yearlyInterest) / 100 : 0;
      const wealthAfterInterest = currentWealth + interestGained;

      const yearCosts: Array<{ name: string; amount: number }> = [];
      let totalCosts = 0;

      costs.forEach((cost) => {
        if (year >= cost.startYear && year < cost.startYear + cost.years) {
          const inflationMultiplier = Math.pow(1 + inflation / 100, year);
          let costAmount = 0;

          if (cost.type === 'fixed') {
            costAmount = cost.amount * inflationMultiplier;
          } else {
            costAmount = (wealthAfterInterest * cost.amount) / 100;
          }

          if (costAmount > 0) {
            yearCosts.push({
              name: cost.name || 'Unnamed Cost',
              amount: costAmount,
            });
            totalCosts += costAmount;
          }
        }
      });

      const endingWealth = wealthAfterInterest - totalCosts;

      yearlyProjections.push({
        yearNumber: year,
        calendarYear: startYear + year,
        startingWealth,
        interestGained,
        costs: yearCosts,
        totalCosts,
        endingWealth,
      });

      currentWealth = endingWealth;
    }

    setProjections(yearlyProjections);
  };

  useEffect(() => {
    calculateProjections();
  }, [initialWealth, yearlyInterest, inflation, startYear, costs]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Calculator className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold sm:text-2xl">Wealth Projection Calculator</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        <SettingsCard
          initialWealth={initialWealth}
          yearlyInterest={yearlyInterest}
          inflation={inflation}
          startYear={startYear}
          onInitialWealthChange={setInitialWealth}
          onYearlyInterestChange={setYearlyInterest}
          onInflationChange={setInflation}
          onStartYearChange={setStartYear}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Projected Costs</h2>
            <Button
              onClick={addCost}
              data-testid="button-add-cost"
              size="default"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Cost
            </Button>
          </div>

          {costs.length === 0 ? (
            <div className="text-center py-8 px-4 border border-dashed rounded-lg">
              <p className="text-muted-foreground">
                No costs added yet. Click "Add Cost" to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {costs.map((cost) => (
                <CostEntry
                  key={cost.id}
                  cost={cost}
                  onUpdate={(updatedCost) => updateCost(cost.id, updatedCost)}
                  onRemove={() => removeCost(cost.id)}
                />
              ))}
            </div>
          )}
        </div>

        <ProjectionTable projections={projections} />
      </main>
    </div>
  );
}

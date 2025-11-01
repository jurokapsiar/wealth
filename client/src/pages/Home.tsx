import { useState, useEffect } from "react";
import { SettingsCard } from "@/components/SettingsCard";
import { CostEntry, type Cost } from "@/components/CostEntry";
import { InvestmentEntry, type Investment } from "@/components/InvestmentEntry";
import { ProjectionTable, type YearProjection } from "@/components/ProjectionTable";
import { ChartView } from "@/components/ChartView";
import { Button } from "@/components/ui/button";
import { Plus, Calculator, PlusCircle, TrendingUp } from "lucide-react";

const STORAGE_KEY = 'wealth-projection-data';

interface StoredData {
  initialWealth: number;
  yearlyInterest: number;
  inflation: number;
  startYear: number;
  birthYear: number;
  costs: Cost[];
  investments: Investment[];
  maxYears: number;
}

export default function Home() {
  const [initialWealth, setInitialWealth] = useState(100000);
  const [yearlyInterest, setYearlyInterest] = useState(7.5);
  const [inflation, setInflation] = useState(3.0);
  const [startYear, setStartYear] = useState(2026);
  const [birthYear, setBirthYear] = useState(1984);
  const [costs, setCosts] = useState<Cost[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [projections, setProjections] = useState<YearProjection[]>([]);
  const [maxYears, setMaxYears] = useState(30);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: StoredData = JSON.parse(stored);
        setInitialWealth(data.initialWealth ?? 100000);
        setYearlyInterest(data.yearlyInterest ?? 7.5);
        setInflation(data.inflation ?? 3.0);
        setStartYear(data.startYear ?? 2026);
        setBirthYear(data.birthYear ?? 1984);
        // Migrate old costs to add enabled field if missing
        const migratedCosts = (data.costs ?? []).map(cost => ({
          ...cost,
          enabled: cost.enabled ?? true,
        }));
        setCosts(migratedCosts);
        setInvestments(data.investments ?? []);
        setMaxYears(data.maxYears ?? 30);
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!isLoaded) return;

    try {
      const data: StoredData = {
        initialWealth,
        yearlyInterest,
        inflation,
        startYear,
        birthYear,
        costs,
        investments,
        maxYears,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [initialWealth, yearlyInterest, inflation, startYear, birthYear, costs, investments, maxYears, isLoaded]);

  const addCost = () => {
    const newCost: Cost = {
      id: Date.now().toString(),
      name: '',
      type: 'fixed',
      amount: 0,
      startYear: 0,
      years: 1,
      enabled: true,
    };
    setCosts([...costs, newCost]);
  };

  const updateCost = (id: string, updatedCost: Cost) => {
    setCosts(costs.map((c) => (c.id === id ? updatedCost : c)));
  };

  const removeCost = (id: string) => {
    setCosts(costs.filter((c) => c.id !== id));
  };

  const addInvestment = () => {
    const newInvestment: Investment = {
      id: Date.now().toString(),
      name: '',
      amount: 0,
      startYear: 0,
      years: 1,
    };
    setInvestments([...investments, newInvestment]);
  };

  const updateInvestment = (id: string, updatedInvestment: Investment) => {
    setInvestments(investments.map((i) => (i.id === id ? updatedInvestment : i)));
  };

  const removeInvestment = (id: string) => {
    setInvestments(investments.filter((i) => i.id !== id));
  };

  const extendYears = () => {
    setMaxYears(maxYears + 10);
  };

  const calculateProjections = () => {
    if (initialWealth <= 0 || yearlyInterest < 0 || inflation < 0) {
      return;
    }

    const maxCostYear = costs.reduce(
      (max, cost) => Math.max(max, cost.startYear + cost.years),
      0
    );
    const maxInvestmentYear = investments.reduce(
      (max, investment) => Math.max(max, investment.startYear + investment.years),
      0
    );
    const projectionYears = Math.max(maxYears, maxCostYear, maxInvestmentYear);

    const yearlyProjections: YearProjection[] = [];
    let currentWealth = initialWealth;

    for (let year = 0; year < projectionYears; year++) {
      const startingWealth = currentWealth;
      const interestGained = currentWealth > 0 ? (currentWealth * yearlyInterest) / 100 : 0;
      const wealthAfterInterest = currentWealth + interestGained;

      const yearInvestments: Array<{ name: string; amount: number; todaysValue: number }> = [];
      let totalInvestments = 0;

      investments.forEach((investment) => {
        if (year >= investment.startYear && year < investment.startYear + investment.years) {
          const inflationMultiplier = Math.pow(1 + inflation / 100, year);
          const investmentAmount = investment.amount * inflationMultiplier;

          if (investmentAmount > 0) {
            const todaysValue = investmentAmount / inflationMultiplier;
            yearInvestments.push({
              name: investment.name || 'Unnamed Investment',
              amount: investmentAmount,
              todaysValue,
            });
            totalInvestments += investmentAmount;
          }
        }
      });

      const yearCosts: Array<{ name: string; amount: number; todaysValue: number }> = [];
      let totalCosts = 0;

      costs.forEach((cost) => {
        if (cost.enabled && year >= cost.startYear && year < cost.startYear + cost.years) {
          const inflationMultiplier = Math.pow(1 + inflation / 100, year);
          let costAmount = 0;

          if (cost.type === 'fixed') {
            costAmount = cost.amount * inflationMultiplier;
          } else {
            costAmount = (wealthAfterInterest * cost.amount) / 100;
          }

          if (costAmount > 0) {
            const todaysValue = costAmount / inflationMultiplier;
            yearCosts.push({
              name: cost.name || 'Unnamed Cost',
              amount: costAmount,
              todaysValue,
            });
            totalCosts += costAmount;
          }
        }
      });

      const endingWealth = wealthAfterInterest + totalInvestments - totalCosts;

      yearlyProjections.push({
        yearNumber: year,
        calendarYear: startYear + year,
        startingWealth,
        interestGained,
        investments: yearInvestments,
        totalInvestments,
        costs: yearCosts,
        totalCosts,
        endingWealth,
      });

      currentWealth = endingWealth;
    }

    setProjections(yearlyProjections);
  };

  useEffect(() => {
    if (isLoaded) {
      calculateProjections();
    }
  }, [initialWealth, yearlyInterest, inflation, startYear, costs, investments, maxYears, isLoaded]);

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
          birthYear={birthYear}
          onInitialWealthChange={setInitialWealth}
          onYearlyInterestChange={setYearlyInterest}
          onInflationChange={setInflation}
          onStartYearChange={setStartYear}
          onBirthYearChange={setBirthYear}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Investment Income</h2>
            <Button
              onClick={addInvestment}
              data-testid="button-add-investment"
              size="default"
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Add Investment
            </Button>
          </div>

          {investments.length === 0 ? (
            <div className="text-center py-8 px-4 border border-dashed rounded-lg">
              <p className="text-muted-foreground">
                No investments added yet. Click "Add Investment" to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {investments.map((investment) => (
                <InvestmentEntry
                  key={investment.id}
                  investment={investment}
                  onUpdate={(updatedInvestment) => updateInvestment(investment.id, updatedInvestment)}
                  onRemove={() => removeInvestment(investment.id)}
                />
              ))}
            </div>
          )}
        </div>

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

        <ChartView 
          projections={projections} 
          costs={costs} 
          investments={investments}
          startingAge={startYear - birthYear}
          inflation={inflation}
        />

        <ProjectionTable projections={projections} />

        {projections.length > 0 && (
          <div className="flex justify-center pb-6">
            <Button
              onClick={extendYears}
              data-testid="button-extend-years"
              variant="outline"
              className="gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Show 10 More Years
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { SettingsCard } from "@/components/SettingsCard";
import { CostEntry, type Cost } from "@/components/CostEntry";
import { InvestmentEntry, type Investment } from "@/components/InvestmentEntry";
import { ProjectionTable, type YearProjection } from "@/components/ProjectionTable";
import { ChartView } from "@/components/ChartView";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calculator, PlusCircle, TrendingUp, DollarSign, Save, FolderOpen, ChevronDown, Trash2 } from "lucide-react";

const STORAGE_KEY = 'wealth-projection-data';
const SCENARIOS_KEY = 'wealth-projection-scenarios';

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

interface Scenario {
  id: string;
  name: string;
  data: StoredData;
  savedAt: number;
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
  
  // Scenario management
  const [currentScenarioName, setCurrentScenarioName] = useState<string>("Default");
  const [savedScenarios, setSavedScenarios] = useState<Scenario[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveAsDialogOpen, setSaveAsDialogOpen] = useState(false);
  const [openDialogOpen, setOpenDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scenarioToDelete, setScenarioToDelete] = useState<string | null>(null);
  const [newScenarioName, setNewScenarioName] = useState("");
  
  const { toast } = useToast();
  
  // Refs for scrolling to costs
  const costRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Load from localStorage on mount
  useEffect(() => {
    try {
      // Load current scenario
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: StoredData = JSON.parse(stored);
        loadScenarioData(data);
      }
      
      // Load saved scenarios list
      const scenariosStored = localStorage.getItem(SCENARIOS_KEY);
      if (scenariosStored) {
        setSavedScenarios(JSON.parse(scenariosStored));
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
    setIsLoaded(true);
  }, []);
  
  const loadScenarioData = (data: StoredData) => {
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
  };

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

  const scrollToCost = (costId: string) => {
    const element = costRefs.current[costId];
    if (element) {
      const yOffset = -80; // Offset for sticky headers
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };
  
  const getCurrentData = (): StoredData => ({
    initialWealth,
    yearlyInterest,
    inflation,
    startYear,
    birthYear,
    costs,
    investments,
    maxYears,
  });
  
  const saveScenario = (name: string, showToast = true) => {
    const data = getCurrentData();
    const existingIndex = savedScenarios.findIndex(s => s.name === name);
    
    let updatedScenarios: Scenario[];
    if (existingIndex >= 0) {
      // Update existing
      updatedScenarios = [...savedScenarios];
      updatedScenarios[existingIndex] = {
        ...updatedScenarios[existingIndex],
        data,
        savedAt: Date.now(),
      };
    } else {
      // Create new
      const newScenario: Scenario = {
        id: Date.now().toString(),
        name,
        data,
        savedAt: Date.now(),
      };
      updatedScenarios = [...savedScenarios, newScenario];
    }
    
    setSavedScenarios(updatedScenarios);
    localStorage.setItem(SCENARIOS_KEY, JSON.stringify(updatedScenarios));
    setCurrentScenarioName(name);
    
    if (showToast) {
      toast({
        title: "Scenario saved",
        description: `"${name}" has been saved successfully.`,
      });
    }
  };
  
  const handleSave = () => {
    if (currentScenarioName) {
      saveScenario(currentScenarioName);
      setSaveDialogOpen(false);
    } else {
      setSaveAsDialogOpen(true);
    }
  };
  
  const handleSaveAs = () => {
    if (newScenarioName.trim()) {
      saveScenario(newScenarioName.trim());
      setSaveAsDialogOpen(false);
      setNewScenarioName("");
    }
  };
  
  const loadScenario = (scenario: Scenario) => {
    loadScenarioData(scenario.data);
    setCurrentScenarioName(scenario.name);
    setOpenDialogOpen(false);
    toast({
      title: "Scenario loaded",
      description: `"${scenario.name}" has been loaded.`,
    });
  };
  
  const confirmDeleteScenario = (scenarioId: string) => {
    setScenarioToDelete(scenarioId);
    setDeleteDialogOpen(true);
  };
  
  const deleteScenario = () => {
    if (scenarioToDelete) {
      const updatedScenarios = savedScenarios.filter(s => s.id !== scenarioToDelete);
      setSavedScenarios(updatedScenarios);
      localStorage.setItem(SCENARIOS_KEY, JSON.stringify(updatedScenarios));
      
      const deletedScenario = savedScenarios.find(s => s.id === scenarioToDelete);
      if (deletedScenario && deletedScenario.name === currentScenarioName) {
        setCurrentScenarioName("Default");
      }
      
      toast({
        title: "Scenario deleted",
        description: `Scenario has been deleted.`,
      });
      
      setDeleteDialogOpen(false);
      setScenarioToDelete(null);
    }
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
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Calculator className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold sm:text-2xl">Wealth Projection Calculator</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {currentScenarioName ? `Scenario: ${currentScenarioName}` : 'Unsaved scenario'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Save button */}
              <Button
                variant="outline"
                size="default"
                onClick={handleSave}
                data-testid="button-save"
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">Save</span>
              </Button>
              
              {/* Scenarios menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="default"
                    data-testid="button-scenarios-menu"
                    className="gap-2"
                  >
                    <FolderOpen className="h-4 w-4" />
                    <span className="hidden sm:inline">Scenarios</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setSaveAsDialogOpen(true)} data-testid="menu-save-as">
                    <Save className="h-4 w-4 mr-2" />
                    Save As...
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setOpenDialogOpen(true)} data-testid="menu-open">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Open Scenario...
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Save As Dialog */}
      <Dialog open={saveAsDialogOpen} onOpenChange={setSaveAsDialogOpen}>
        <DialogContent data-testid="dialog-save-as">
          <DialogHeader>
            <DialogTitle>Save Scenario As</DialogTitle>
            <DialogDescription>
              Enter a name for this scenario to save your current settings, costs, and investments.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="scenario-name">Scenario Name</Label>
              <Input
                id="scenario-name"
                data-testid="input-scenario-name"
                placeholder="e.g., Retirement Plan A"
                value={newScenarioName}
                onChange={(e) => setNewScenarioName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveAs();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSaveAsDialogOpen(false);
                setNewScenarioName("");
              }}
              data-testid="button-cancel-save"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAs}
              disabled={!newScenarioName.trim()}
              data-testid="button-confirm-save"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Open Scenario Dialog */}
      <Dialog open={openDialogOpen} onOpenChange={setOpenDialogOpen}>
        <DialogContent data-testid="dialog-open-scenario" className="max-w-md">
          <DialogHeader>
            <DialogTitle>Open Scenario</DialogTitle>
            <DialogDescription>
              Load a previously saved scenario.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {savedScenarios.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No saved scenarios yet. Save your current scenario to get started.
              </p>
            ) : (
              <div className="space-y-2">
                {savedScenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover-elevate"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" data-testid={`text-scenario-${scenario.id}`}>
                        {scenario.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Saved {new Date(scenario.savedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadScenario(scenario)}
                        data-testid={`button-load-${scenario.id}`}
                      >
                        Open
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => confirmDeleteScenario(scenario.id)}
                        data-testid={`button-delete-${scenario.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-delete-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scenario?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the saved scenario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteScenario}
              data-testid="button-confirm-delete"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mobile sticky cost navigator - only show when costs exist */}
      {costs.length > 0 && (
        <div className="sticky top-16 z-20 bg-background/95 backdrop-blur border-b shadow-sm md:hidden">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <DollarSign className="h-3 w-3" />
              <span className="font-medium">Quick Jump to Costs:</span>
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-2 pb-2">
                {costs.map((cost, index) => (
                  <Badge
                    key={cost.id}
                    variant={cost.enabled ? "default" : "secondary"}
                    className="cursor-pointer hover-elevate active-elevate-2 shrink-0"
                    onClick={() => scrollToCost(cost.id)}
                    data-testid={`badge-jump-cost-${cost.id}`}
                  >
                    {cost.name || `Cost ${index + 1}`}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

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
                <div
                  key={cost.id}
                  ref={(el) => (costRefs.current[cost.id] = el)}
                >
                  <CostEntry
                    cost={cost}
                    onUpdate={(updatedCost) => updateCost(cost.id, updatedCost)}
                    onRemove={() => removeCost(cost.id)}
                  />
                </div>
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

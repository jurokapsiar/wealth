import { useState, useEffect, useRef } from "react";
import { SettingsCard } from "@/components/SettingsCard";
import { CostEntry, type Cost } from "@/components/CostEntry";
import { InvestmentEntry, type Investment } from "@/components/InvestmentEntry";
import { ProjectionTable, type YearProjection } from "@/components/ProjectionTable";
import { ChartView } from "@/components/ChartView";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Calculator, PlusCircle, Save, FolderOpen, ChevronDown, Trash2, Plus, Navigation2, TrendingUp, DollarSign, BarChart3 } from "lucide-react";

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
  
  // Chart visibility state
  const [showWealth, setShowWealth] = useState(true);
  const [showWealthYear0, setShowWealthYear0] = useState(false);
  const [useYear0Prices, setUseYear0Prices] = useState(false);
  const [visibleInvestments, setVisibleInvestments] = useState<Set<string>>(new Set());
  const [visibleCosts, setVisibleCosts] = useState<Set<string>>(new Set());
  
  // Scenario management
  const [currentScenarioName, setCurrentScenarioName] = useState<string>("Default");
  const [savedScenarios, setSavedScenarios] = useState<Scenario[]>([]);
  const [saveAsDialogOpen, setSaveAsDialogOpen] = useState(false);
  const [openDialogOpen, setOpenDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scenarioToDelete, setScenarioToDelete] = useState<string | null>(null);
  const [newScenarioName, setNewScenarioName] = useState("");
  
  const { toast } = useToast();
  
  // Refs for scrolling
  const settingsRef = useRef<HTMLDivElement>(null);
  const investmentsRef = useRef<HTMLDivElement>(null);
  const costsRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const investmentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const costRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const leftPanelRef = useRef<HTMLDivElement>(null);

  // Auto-sync chart visibility when investments/costs change
  useEffect(() => {
    setVisibleInvestments(new Set(investments.map(inv => inv.id)));
  }, [investments]);

  useEffect(() => {
    setVisibleCosts(new Set(costs.filter(c => c.enabled).map(c => c.id)));
  }, [costs]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: StoredData = JSON.parse(stored);
        loadScenarioData(data);
      }
      
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

  const scrollToElement = (element: HTMLElement | null) => {
    if (element && leftPanelRef.current) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToChart = () => {
    if (chartRef.current) {
      chartRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
    
    requestAnimationFrame(() => {
      const element = costRefs.current[newCost.id];
      if (element) {
        scrollToElement(element);
        const firstInput = element.querySelector('input');
        firstInput?.focus();
      }
    });
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
    
    requestAnimationFrame(() => {
      const element = investmentRefs.current[newInvestment.id];
      if (element) {
        scrollToElement(element);
        const firstInput = element.querySelector('input');
        firstInput?.focus();
      }
    });
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

  const toggleInvestment = (id: string) => {
    const newSet = new Set(visibleInvestments);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setVisibleInvestments(newSet);
  };

  const toggleCost = (id: string) => {
    const newSet = new Set(visibleCosts);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setVisibleCosts(newSet);
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
      updatedScenarios = [...savedScenarios];
      updatedScenarios[existingIndex] = {
        ...updatedScenarios[existingIndex],
        data,
        savedAt: Date.now(),
      };
    } else {
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
      <header className="sticky top-0 z-40 bg-background border-b shadow-sm">
        <div className="container mx-auto px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold">Wealth</h1>
            </div>
            
            <div className="flex items-center gap-1">
              {/* Add Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    data-testid="button-add-menu"
                    className="h-8 w-8"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={addInvestment} data-testid="menu-add-investment">
                    <TrendingUp className="h-3.5 w-3.5 mr-2" />
                    Add Investment
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={addCost} data-testid="menu-add-cost">
                    <DollarSign className="h-3.5 w-3.5 mr-2" />
                    Add Cost
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Navigation Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    data-testid="button-navigate-menu"
                    className="h-8 w-8"
                  >
                    <Navigation2 className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => scrollToElement(settingsRef.current)} data-testid="menu-nav-settings">
                    Initial Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  
                  {investments.length > 0 && (
                    <>
                      <DropdownMenuLabel className="text-xs font-semibold text-green-600 dark:text-green-400">
                        Investments
                      </DropdownMenuLabel>
                      {investments.map((investment) => (
                        <DropdownMenuItem
                          key={investment.id}
                          onClick={() => scrollToElement(investmentRefs.current[investment.id])}
                          data-testid={`menu-nav-investment-${investment.id}`}
                          className="pl-6"
                        >
                          {investment.name || 'Unnamed Investment'}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  {costs.length > 0 && (
                    <>
                      <DropdownMenuLabel className="text-xs font-semibold text-red-600 dark:text-red-400">
                        Costs
                      </DropdownMenuLabel>
                      {costs.map((cost) => (
                        <DropdownMenuItem
                          key={cost.id}
                          onClick={() => scrollToElement(costRefs.current[cost.id])}
                          data-testid={`menu-nav-cost-${cost.id}`}
                          className="pl-6"
                        >
                          {cost.name || 'Unnamed Cost'}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  <DropdownMenuItem onClick={scrollToChart} data-testid="menu-nav-chart">
                    <BarChart3 className="h-3.5 w-3.5 mr-2" />
                    Chart
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                data-testid="button-save"
                className="gap-1.5 h-8"
              >
                <Save className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Save</span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid="button-scenarios-menu"
                    className="gap-1.5 h-8"
                  >
                    <FolderOpen className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Open</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setSaveAsDialogOpen(true)} data-testid="menu-save-as">
                    <Save className="h-3.5 w-3.5 mr-2" />
                    Save As...
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setOpenDialogOpen(true)} data-testid="menu-open">
                    <FolderOpen className="h-3.5 w-3.5 mr-2" />
                    Open Scenario...
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <ScrollArea className="h-[calc(100vh-120px)]" ref={leftPanelRef}>
            <div className="space-y-3 pr-3">
              <div ref={settingsRef}>
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
              </div>

              <div ref={investmentsRef}>
                <h2 className="text-sm font-semibold mb-2">Investment Income</h2>
                {investments.length === 0 ? (
                  <div className="text-center py-6 px-3 border border-dashed rounded text-sm">
                    <p className="text-muted-foreground">
                      No investments yet. Use + menu to add.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {investments.map((investment) => (
                      <InvestmentEntry
                        key={investment.id}
                        ref={(el) => (investmentRefs.current[investment.id] = el)}
                        investment={investment}
                        onUpdate={(updated) => updateInvestment(investment.id, updated)}
                        onRemove={() => removeInvestment(investment.id)}
                        birthYear={birthYear}
                        startYear={startYear}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div ref={costsRef}>
                <h2 className="text-sm font-semibold mb-2">Projected Costs</h2>
                {costs.length === 0 ? (
                  <div className="text-center py-6 px-3 border border-dashed rounded text-sm">
                    <p className="text-muted-foreground">
                      No costs yet. Use + menu to add.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {costs.map((cost) => (
                      <CostEntry
                        key={cost.id}
                        ref={(el) => (costRefs.current[cost.id] = el)}
                        cost={cost}
                        onUpdate={(updated) => updateCost(cost.id, updated)}
                        onRemove={() => removeCost(cost.id)}
                        birthYear={birthYear}
                        startYear={startYear}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          <div ref={chartRef}>
            <ChartView
              projections={projections}
              costs={costs}
              investments={investments}
              startingAge={startYear - birthYear}
              inflation={inflation}
              showWealth={showWealth}
              showWealthYear0={showWealthYear0}
              useYear0Prices={useYear0Prices}
              visibleInvestments={visibleInvestments}
              visibleCosts={visibleCosts}
              onShowWealthChange={setShowWealth}
              onShowWealthYear0Change={setShowWealthYear0}
              onUseYear0PricesChange={setUseYear0Prices}
              onToggleInvestment={toggleInvestment}
              onToggleCost={toggleCost}
            />
          </div>
        </div>

        <div className="space-y-3">
          <ProjectionTable projections={projections} />

          {projections.length > 0 && (
            <div className="flex justify-center">
              <Button
                onClick={extendYears}
                data-testid="button-extend-years"
                variant="outline"
                size="sm"
                className="gap-1.5 h-8"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Show 10 More Years
              </Button>
            </div>
          )}
        </div>
      </div>

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
                    className="flex items-center justify-between p-2 border rounded hover-elevate"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm" data-testid={`text-scenario-${scenario.id}`}>
                        {scenario.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Saved {new Date(scenario.savedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadScenario(scenario)}
                        data-testid={`button-load-${scenario.id}`}
                        className="h-7"
                      >
                        Open
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => confirmDeleteScenario(scenario.id)}
                        data-testid={`button-delete-${scenario.id}`}
                        className="h-7 w-7"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
    </div>
  );
}

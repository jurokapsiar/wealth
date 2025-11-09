import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Search, X, ArrowUp, TrendingUp } from "lucide-react";
import { ETFTable } from "@/components/ETFTable";
import { ETFChart } from "@/components/ETFChart";

const STORAGE_KEY = 'etf-viewer-settings';

interface ETFSymbol {
  symbol: string;
  name: string;
  currency: string;
  exchange: string;
}

interface ETFData {
  symbol: string;
  name: string;
  monthlyData: MonthlyDataPoint[];
}

interface MonthlyDataPoint {
  date: string;
  close: number;
}

interface Settings {
  apiKey: string;
  startDay: number;
  startMonth: number;
  startYear: number;
  endDay: number;
  endMonth: number;
  endYear: number;
  selectedETFs: ETFSymbol[];
  etfData: ETFData[];
}

export default function ETFViewer() {
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;

  const [apiKey, setApiKey] = useState("");
  const [startDay, setStartDay] = useState(1);
  const [startMonth, setStartMonth] = useState(1);
  const [startYear, setStartYear] = useState(lastYear);
  const [endDay, setEndDay] = useState(31);
  const [endMonth, setEndMonth] = useState(12);
  const [endYear, setEndYear] = useState(lastYear);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ETFSymbol[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedETFs, setSelectedETFs] = useState<ETFSymbol[]>([]);
  const [etfData, setEtfData] = useState<ETFData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [open, setOpen] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const settings: Settings = JSON.parse(stored);
        setApiKey(settings.apiKey || "");
        setStartDay(settings.startDay || 1);
        setStartMonth(settings.startMonth || 1);
        setStartYear(settings.startYear || lastYear);
        setEndDay(settings.endDay || 31);
        setEndMonth(settings.endMonth || 12);
        setEndYear(settings.endYear || lastYear);
        setSelectedETFs(settings.selectedETFs || []);
        setEtfData(settings.etfData || []);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  useEffect(() => {
    const settings: Settings = {
      apiKey,
      startDay,
      startMonth,
      startYear,
      endDay,
      endMonth,
      endYear,
      selectedETFs,
      etfData,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [apiKey, startDay, startMonth, startYear, endDay, endMonth, endYear, selectedETFs, etfData]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length >= 3 && apiKey) {
        searchETFs();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, apiKey]);

  const searchETFs = async () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Twelve Data API key first.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.twelvedata.com/symbol_search?symbol=${encodeURIComponent(searchQuery)}&type=etf&apikey=${apiKey}`
      );
      const data = await response.json();
      
      if (data.status === "error") {
        toast({
          title: "Search Error",
          description: data.message || "Failed to search for ETFs",
          variant: "destructive",
        });
        setSearchResults([]);
      } else if (data.data && Array.isArray(data.data)) {
        setSearchResults(data.data.slice(0, 10));
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to connect to Twelve Data API",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addETF = (etf: ETFSymbol) => {
    if (!selectedETFs.find(e => e.symbol === etf.symbol)) {
      setSelectedETFs([...selectedETFs, etf]);
      setSearchQuery("");
      setOpen(false);
    }
  };

  const removeETF = (symbol: string) => {
    setSelectedETFs(selectedETFs.filter(e => e.symbol !== symbol));
    setEtfData(etfData.filter(e => e.symbol !== symbol));
  };

  const fetchETFData = async () => {
    if (selectedETFs.length === 0) {
      toast({
        title: "No ETFs Selected",
        description: "Please select at least one ETF to fetch data.",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Twelve Data API key.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingData(true);
    const newEtfData: ETFData[] = [];

    try {
      for (const etf of selectedETFs) {
        const startDate = `${startYear}-${String(startMonth).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
        const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;
        
        const response = await fetch(
          `https://api.twelvedata.com/time_series?symbol=${etf.symbol}&interval=1month&start_date=${startDate}&end_date=${endDate}&apikey=${apiKey}&outputsize=5000`
        );
        const data = await response.json();

        if (data.status === "error") {
          toast({
            title: `Error fetching ${etf.symbol}`,
            description: data.message || "Failed to fetch data",
            variant: "destructive",
          });
          continue;
        }

        if (data.values && Array.isArray(data.values)) {
          const monthlyData = data.values.reverse().map((v: any) => ({
            date: v.datetime,
            close: parseFloat(v.close),
          }));

          newEtfData.push({
            symbol: etf.symbol,
            name: etf.name,
            monthlyData,
          });
        }
      }

      setEtfData(newEtfData);
      
      if (newEtfData.length > 0) {
        toast({
          title: "Data Loaded",
          description: `Successfully loaded data for ${newEtfData.length} ETF${newEtfData.length > 1 ? 's' : ''}`,
        });
      }
    } catch (error) {
      toast({
        title: "Fetch Error",
        description: "Failed to fetch ETF data",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              ETF Historical Data Viewer
            </CardTitle>
            <CardDescription>
              View past ETF values and analyze performance over time using Twelve Data API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="api-key">Twelve Data API Key</Label>
              <Input
                id="api-key"
                data-testid="input-api-key"
                type="password"
                placeholder="Enter your API key from twelvedata.com"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Get a free API key at{" "}
                <a
                  href="https://twelvedata.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  twelvedata.com
                </a>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>Start Date</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="start-day" className="text-xs text-muted-foreground">Day</Label>
                    <Input
                      id="start-day"
                      data-testid="input-start-day"
                      type="number"
                      min={1}
                      max={31}
                      value={startDay}
                      onChange={(e) => setStartDay(Math.max(1, Math.min(31, parseInt(e.target.value) || 1)))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="start-month" className="text-xs text-muted-foreground">Month</Label>
                    <Input
                      id="start-month"
                      data-testid="input-start-month"
                      type="number"
                      min={1}
                      max={12}
                      value={startMonth}
                      onChange={(e) => setStartMonth(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="start-year" className="text-xs text-muted-foreground">Year</Label>
                    <Input
                      id="start-year"
                      data-testid="input-start-year"
                      type="number"
                      min={1900}
                      max={currentYear}
                      value={startYear}
                      onChange={(e) => setStartYear(Math.max(1900, Math.min(currentYear, parseInt(e.target.value) || lastYear)))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>End Date</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="end-day" className="text-xs text-muted-foreground">Day</Label>
                    <Input
                      id="end-day"
                      data-testid="input-end-day"
                      type="number"
                      min={1}
                      max={31}
                      value={endDay}
                      onChange={(e) => setEndDay(Math.max(1, Math.min(31, parseInt(e.target.value) || 31)))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="end-month" className="text-xs text-muted-foreground">Month</Label>
                    <Input
                      id="end-month"
                      data-testid="input-end-month"
                      type="number"
                      min={1}
                      max={12}
                      value={endMonth}
                      onChange={(e) => setEndMonth(Math.max(1, Math.min(12, parseInt(e.target.value) || 12)))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="end-year" className="text-xs text-muted-foreground">Year</Label>
                    <Input
                      id="end-year"
                      data-testid="input-end-year"
                      type="number"
                      min={1900}
                      max={currentYear}
                      value={endYear}
                      onChange={(e) => setEndYear(Math.max(1900, Math.min(currentYear, parseInt(e.target.value) || lastYear)))}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Select ETFs</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                    data-testid="button-search-etf"
                  >
                    <span className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Search for ETFs...
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Type at least 3 characters..."
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                      data-testid="input-search-etf"
                    />
                    <CommandList>
                      {isSearching && (
                        <div className="p-4 text-sm text-muted-foreground text-center">
                          Searching...
                        </div>
                      )}
                      {!isSearching && searchQuery.length > 0 && searchQuery.length < 3 && (
                        <div className="p-4 text-sm text-muted-foreground text-center">
                          Type at least 3 characters to search
                        </div>
                      )}
                      {!isSearching && searchQuery.length >= 3 && searchResults.length === 0 && (
                        <CommandEmpty>No ETFs found.</CommandEmpty>
                      )}
                      {!isSearching && searchResults.length > 0 && (
                        <CommandGroup>
                          {searchResults.map((etf) => (
                            <CommandItem
                              key={etf.symbol}
                              value={etf.symbol}
                              onSelect={() => addETF(etf)}
                              data-testid={`item-etf-${etf.symbol}`}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{etf.symbol}</span>
                                <span className="text-xs text-muted-foreground">{etf.name}</span>
                                <span className="text-xs text-muted-foreground">{etf.exchange}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {selectedETFs.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedETFs.map((etf) => (
                    <Badge
                      key={etf.symbol}
                      variant="secondary"
                      className="gap-2"
                      data-testid={`badge-selected-${etf.symbol}`}
                    >
                      {etf.symbol}
                      <button
                        onClick={() => removeETF(etf.symbol)}
                        className="hover:text-destructive"
                        data-testid={`button-remove-${etf.symbol}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={fetchETFData}
              disabled={isLoadingData || selectedETFs.length === 0 || !apiKey}
              className="w-full"
              data-testid="button-fetch-data"
            >
              {isLoadingData ? "Loading..." : "Fetch ETF Data"}
            </Button>
          </CardContent>
        </Card>

        {etfData.length > 0 && (
          <>
            <ETFChart data={etfData} />
            
            {etfData.map((etf) => (
              <ETFTable key={etf.symbol} etfData={etf} />
            ))}
          </>
        )}
      </div>

      {etfData.length > 0 && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-6 right-6 rounded-full shadow-lg z-50"
          data-testid="button-scroll-top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}

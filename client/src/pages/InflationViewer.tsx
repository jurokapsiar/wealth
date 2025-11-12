import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowUp, TrendingUp } from "lucide-react";
import { InflationTable } from "@/components/InflationTable";
import { InflationChart } from "@/components/InflationChart";
import { getCachedInflationData, setCachedInflationData, getCachedCountries, setCachedCountries } from "@/lib/indexedDB";

const STORAGE_KEY = 'inflation-viewer-settings';

interface CountryInfo {
  Country: string;
  Category: string;
  LatestValue: number;
  LatestValueDate: string;
}

interface InflationDataPoint {
  Country: string;
  Category: string;
  DateTime: string;
  Value: number;
}

interface InflationData {
  country: string;
  data: InflationDataPoint[];
}

interface Settings {
  startDay: number;
  startMonth: number;
  startYear: number;
  endDay: number;
  endMonth: number;
  endYear: number;
  selectedCountries: string[];
}

interface DateValidation {
  startDate: boolean;
  endDate: boolean;
}

export default function InflationViewer() {
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;

  const [startDay, setStartDay] = useState(1);
  const [startMonth, setStartMonth] = useState(1);
  const [startYear, setStartYear] = useState(2015);
  const [endDay, setEndDay] = useState(31);
  const [endMonth, setEndMonth] = useState(12);
  const [endYear, setEndYear] = useState(lastYear);
  
  const [countries, setCountries] = useState<CountryInfo[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [inflationData, setInflationData] = useState<InflationData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dateErrors, setDateErrors] = useState<DateValidation>({
    startDate: false,
    endDate: false,
  });
  
  const { toast } = useToast();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const settings: Settings = JSON.parse(stored);
        setStartDay(settings.startDay || 1);
        setStartMonth(settings.startMonth || 1);
        setStartYear(settings.startYear || 2015);
        setEndDay(settings.endDay || 31);
        setEndMonth(settings.endMonth || 12);
        setEndYear(settings.endYear || lastYear);
        setSelectedCountries(settings.selectedCountries || []);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    
    fetchCountries();
  }, []);

  useEffect(() => {
    const settings: Settings = {
      startDay,
      startMonth,
      startYear,
      endDay,
      endMonth,
      endYear,
      selectedCountries,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [startDay, startMonth, startYear, endDay, endMonth, endYear, selectedCountries]);

  const isValidDate = (day: number, month: number, year: number): boolean => {
    if (month < 1 || month > 12) return false;
    if (day < 1) return false;
    
    const daysInMonth = new Date(year, month, 0).getDate();
    return day <= daysInMonth;
  };

  const validateStartDate = () => {
    const valid = isValidDate(startDay, startMonth, startYear);
    setDateErrors(prev => ({ ...prev, startDate: !valid }));
    return valid;
  };

  const validateEndDate = () => {
    const valid = isValidDate(endDay, endMonth, endYear);
    setDateErrors(prev => ({ ...prev, endDate: !valid }));
    return valid;
  };

  const fetchCountries = async () => {
    setIsLoadingCountries(true);
    try {
      const cachedCountries = await getCachedCountries();
      
      if (cachedCountries && cachedCountries.length > 0) {
        setCountries(cachedCountries);
        setIsLoadingCountries(false);
        return;
      }

      const response = await fetch(
        'https://api.tradingeconomics.com/country/all/indicator/inflation%20rate?c=guest:guest'
      );
      const data: CountryInfo[] = await response.json();
      
      if (Array.isArray(data)) {
        const sortedData = data.sort((a, b) => a.Country.localeCompare(b.Country));
        setCountries(sortedData);
        await setCachedCountries(sortedData);
      } else {
        toast({
          title: "Error",
          description: "Failed to load countries list",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Fetch Error",
        description: "Failed to fetch countries from Trading Economics API",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCountries(false);
    }
  };

  const addCountry = (country: string) => {
    if (!selectedCountries.includes(country)) {
      setSelectedCountries([...selectedCountries, country]);
    }
  };

  const removeCountry = (country: string) => {
    setSelectedCountries(selectedCountries.filter(c => c !== country));
    setInflationData(inflationData.filter(d => d.country !== country));
  };

  const fetchInflationData = async () => {
    if (selectedCountries.length === 0) {
      toast({
        title: "No Countries Selected",
        description: "Please select at least one country to fetch data.",
        variant: "destructive",
      });
      return;
    }

    if (!validateStartDate() || !validateEndDate()) {
      toast({
        title: "Invalid Date",
        description: "Please check your date inputs and fix any errors.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingData(true);
    const newInflationData: InflationData[] = [];
    let cachedCount = 0;
    let fetchedCount = 0;

    try {
      for (const country of selectedCountries) {
        const startDate = `${startYear}-${String(startMonth).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
        const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;
        
        const cachedData = await getCachedInflationData(country, startDate, endDate);
        
        if (cachedData && Array.isArray(cachedData)) {
          newInflationData.push({
            country,
            data: cachedData,
          });
          cachedCount++;
        } else {
          const response = await fetch(
            `https://api.tradingeconomics.com/historical/country/${encodeURIComponent(country)}/indicator/inflation%20rate?c=guest:guest&from=${startDate}&to=${endDate}`
          );
          const data: InflationDataPoint[] = await response.json();

          if (Array.isArray(data) && data.length > 0) {
            const sortedData = data.sort((a, b) => 
              new Date(a.DateTime).getTime() - new Date(b.DateTime).getTime()
            );
            await setCachedInflationData(country, startDate, endDate, sortedData);
            
            newInflationData.push({
              country,
              data: sortedData,
            });
            fetchedCount++;
          } else {
            toast({
              title: `No data for ${country}`,
              description: "No inflation data found for the selected date range",
              variant: "destructive",
            });
          }
        }
      }

      setInflationData(newInflationData);
      
      if (newInflationData.length > 0) {
        const cacheMsg = cachedCount > 0 ? ` (${cachedCount} from cache)` : '';
        toast({
          title: "Data Loaded",
          description: `Successfully loaded data for ${newInflationData.length} ${newInflationData.length > 1 ? 'countries' : 'country'}${cacheMsg}`,
        });
      }
    } catch (error) {
      toast({
        title: "Fetch Error",
        description: "Failed to fetch inflation data",
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
              Inflation Historical Data Viewer
            </CardTitle>
            <CardDescription>
              View historical inflation rates by country using Trading Economics API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className={dateErrors.startDate ? "text-destructive" : ""}>Start Date</Label>
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
                      onBlur={validateStartDate}
                      className={dateErrors.startDate ? "border-destructive" : ""}
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
                      onBlur={validateStartDate}
                      className={dateErrors.startDate ? "border-destructive" : ""}
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
                      onChange={(e) => setStartYear(Math.max(1900, Math.min(currentYear, parseInt(e.target.value) || 2015)))}
                      onBlur={validateStartDate}
                      className={dateErrors.startDate ? "border-destructive" : ""}
                    />
                  </div>
                </div>
                {dateErrors.startDate && (
                  <p className="text-xs text-destructive" data-testid="error-start-date">
                    Invalid date (e.g., Feb 30 doesn't exist)
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label className={dateErrors.endDate ? "text-destructive" : ""}>End Date</Label>
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
                      onBlur={validateEndDate}
                      className={dateErrors.endDate ? "border-destructive" : ""}
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
                      onBlur={validateEndDate}
                      className={dateErrors.endDate ? "border-destructive" : ""}
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
                      onBlur={validateEndDate}
                      className={dateErrors.endDate ? "border-destructive" : ""}
                    />
                  </div>
                </div>
                {dateErrors.endDate && (
                  <p className="text-xs text-destructive" data-testid="error-end-date">
                    Invalid date (e.g., Feb 30 doesn't exist)
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Select Countries</Label>
              <Select
                onValueChange={addCountry}
                disabled={isLoadingCountries}
                data-testid="select-country"
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingCountries ? "Loading countries..." : "Select a country..."} />
                </SelectTrigger>
                <SelectContent>
                  {countries
                    .filter(c => !selectedCountries.includes(c.Country))
                    .map((country) => (
                      <SelectItem 
                        key={country.Country} 
                        value={country.Country}
                        data-testid={`item-country-${country.Country}`}
                      >
                        {country.Country}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {selectedCountries.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedCountries.map((country) => (
                    <div
                      key={country}
                      className="flex items-center gap-2 px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                      data-testid={`badge-selected-${country}`}
                    >
                      {country}
                      <button
                        onClick={() => removeCountry(country)}
                        className="hover:text-destructive"
                        data-testid={`button-remove-${country}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={fetchInflationData}
              disabled={isLoadingData || selectedCountries.length === 0}
              className="w-full"
              data-testid="button-fetch-data"
            >
              {isLoadingData ? "Loading..." : "Fetch Inflation Data"}
            </Button>
          </CardContent>
        </Card>

        {inflationData.length > 0 && (
          <>
            <InflationChart data={inflationData} />
            
            {inflationData.map((data) => (
              <InflationTable key={data.country} inflationData={data} />
            ))}
          </>
        )}
      </div>

      {inflationData.length > 0 && (
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

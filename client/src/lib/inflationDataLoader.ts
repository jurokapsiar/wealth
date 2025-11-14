import { getCachedInflationData, setCachedInflationData } from '@/lib/indexedDB';

export interface CountryMetadata {
  name: string;
  iso3: string;
  iso2: string;
  continent: string;
  group: string;
  startYear: number;
  endYear: number;
}

export interface InflationDataPoint {
  year: number;
  month: number;
  value: number;
  dateString: string;
}

export interface CountryInflationData {
  country: string;
  iso3: string;
  data: InflationDataPoint[];
}

const inMemoryCache = new Map<string, InflationDataPoint[]>();

function parseCsvData(csvText: string, iso3: string): InflationDataPoint[] {
  const lines = csvText.trim().split('\n');
  const dataPoints: InflationDataPoint[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const [year, month, value] = line.split(',');
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);
    const valueNum = parseFloat(value);
    
    if (!isNaN(yearNum) && !isNaN(monthNum) && !isNaN(valueNum)) {
      dataPoints.push({
        year: yearNum,
        month: monthNum,
        value: valueNum,
        dateString: `${yearNum}-${monthNum.toString().padStart(2, '0')}-01`
      });
    }
  }
  
  return dataPoints;
}

async function loadCountryCsv(iso3: string): Promise<string> {
  try {
    const response = await fetch(`/data/inflation/${iso3}.csv`);
    if (!response.ok) {
      throw new Error(`Failed to load ${iso3}.csv: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Error loading CSV for ${iso3}:`, error);
    throw error;
  }
}

export async function loadCountryInflationData(
  iso3: string,
  startDate?: Date,
  endDate?: Date
): Promise<CountryInflationData> {
  const country = getCountryByIso3(iso3);
  if (!country) {
    throw new Error(`Country ${iso3} not found in manifest`);
  }
  
  const cacheKey = `inflation-${iso3}`;
  
  if (inMemoryCache.has(cacheKey)) {
    const cachedData = inMemoryCache.get(cacheKey)!;
    return {
      country: country.name,
      iso3,
      data: filterByDateRange(cachedData, startDate, endDate)
    };
  }
  
  const indexedDbData = await getCachedInflationData(iso3, '2000-01-01', '2023-12-31');
  if (indexedDbData && indexedDbData.data && indexedDbData.data.length > 0) {
    const parsedData = indexedDbData.data.map((d: any) => ({
      year: d.year || parseInt(d.DateTime?.split('-')[0] || '0', 10),
      month: d.month || parseInt(d.DateTime?.split('-')[1] || '1', 10),
      value: d.value || d.Value || 0,
      dateString: d.dateString || d.DateTime || `${d.year || 2000}-${(d.month || 1).toString().padStart(2, '0')}-01`
    }));
    
    inMemoryCache.set(cacheKey, parsedData);
    
    return {
      country: country.name,
      iso3,
      data: filterByDateRange(parsedData, startDate, endDate)
    };
  }
  
  const csvText = await loadCountryCsv(iso3);
  const dataPoints = parseCsvData(csvText, iso3);
  
  inMemoryCache.set(cacheKey, dataPoints);
  
  const cacheData = {
    country: country.name,
    data: dataPoints.map(dp => ({
      Country: country.name,
      Category: 'Inflation',
      DateTime: dp.dateString,
      Value: dp.value,
      year: dp.year,
      month: dp.month,
      value: dp.value,
      dateString: dp.dateString
    }))
  };
  await setCachedInflationData(iso3, '2000-01-01', '2023-12-31', cacheData);
  
  return {
    country: country.name,
    iso3,
    data: filterByDateRange(dataPoints, startDate, endDate)
  };
}

function filterByDateRange(
  data: InflationDataPoint[],
  startDate?: Date,
  endDate?: Date
): InflationDataPoint[] {
  if (!startDate && !endDate) {
    return data;
  }
  
  return data.filter(point => {
    const pointDate = new Date(point.year, point.month - 1, 1);
    
    if (startDate && pointDate < startDate) {
      return false;
    }
    
    if (endDate && pointDate > endDate) {
      return false;
    }
    
    return true;
  });
}

let manifestData: { countries: CountryMetadata[] } | null = null;

async function loadManifest(): Promise<{ countries: CountryMetadata[] }> {
  if (manifestData) {
    return manifestData;
  }
  
  const response = await fetch('/data/inflation/manifest.json');
  if (!response.ok) {
    throw new Error('Failed to load country manifest');
  }
  
  manifestData = await response.json();
  return manifestData;
}

export function getCountries(): CountryMetadata[] {
  return [
    { name: "Australia", iso3: "AUS", iso2: "AU", continent: "Oceania", group: "G20, OECD", startYear: 2000, endYear: 2023 },
    { name: "Austria", iso3: "AUT", iso2: "AT", continent: "Europe", group: "European Union, OECD", startYear: 2000, endYear: 2023 },
    { name: "Belgium", iso3: "BEL", iso2: "BE", continent: "Europe", group: "European Union, OECD", startYear: 2000, endYear: 2023 },
    { name: "Brazil", iso3: "BRA", iso2: "BR", continent: "South America", group: "G20", startYear: 2000, endYear: 2023 },
    { name: "Canada", iso3: "CAN", iso2: "CA", continent: "North America", group: "G7, G20, OECD", startYear: 2000, endYear: 2023 },
    { name: "China", iso3: "CHN", iso2: "CN", continent: "Asia", group: "G20", startYear: 2000, endYear: 2023 },
    { name: "Denmark", iso3: "DNK", iso2: "DK", continent: "Europe", group: "European Union, OECD", startYear: 2000, endYear: 2023 },
    { name: "Finland", iso3: "FIN", iso2: "FI", continent: "Europe", group: "European Union, OECD", startYear: 2000, endYear: 2023 },
    { name: "France", iso3: "FRA", iso2: "FR", continent: "Europe", group: "European Union, G7, G20, OECD", startYear: 2000, endYear: 2023 },
    { name: "Germany", iso3: "DEU", iso2: "DE", continent: "Europe", group: "European Union, G7, G20, OECD", startYear: 2000, endYear: 2023 },
    { name: "Greece", iso3: "GRC", iso2: "GR", continent: "Europe", group: "European Union, OECD", startYear: 2000, endYear: 2023 },
    { name: "India", iso3: "IND", iso2: "IN", continent: "Asia", group: "G20", startYear: 2000, endYear: 2023 },
    { name: "Ireland", iso3: "IRL", iso2: "IE", continent: "Europe", group: "European Union, OECD", startYear: 2000, endYear: 2023 },
    { name: "Italy", iso3: "ITA", iso2: "IT", continent: "Europe", group: "European Union, G7, G20, OECD", startYear: 2000, endYear: 2023 },
    { name: "Japan", iso3: "JPN", iso2: "JP", continent: "Asia", group: "G7, G20, OECD", startYear: 2000, endYear: 2023 },
    { name: "Mexico", iso3: "MEX", iso2: "MX", continent: "North America", group: "G20, OECD", startYear: 2000, endYear: 2023 },
    { name: "Netherlands", iso3: "NLD", iso2: "NL", continent: "Europe", group: "European Union, OECD", startYear: 2000, endYear: 2023 },
    { name: "New Zealand", iso3: "NZL", iso2: "NZ", continent: "Oceania", group: "OECD", startYear: 2000, endYear: 2023 },
    { name: "Norway", iso3: "NOR", iso2: "NO", continent: "Europe", group: "OECD", startYear: 2000, endYear: 2023 },
    { name: "Poland", iso3: "POL", iso2: "PL", continent: "Europe", group: "European Union, OECD", startYear: 2000, endYear: 2023 },
    { name: "Portugal", iso3: "PRT", iso2: "PT", continent: "Europe", group: "European Union, OECD", startYear: 2000, endYear: 2023 },
    { name: "Russia", iso3: "RUS", iso2: "RU", continent: "Europe/Asia", group: "G20", startYear: 2000, endYear: 2023 },
    { name: "South Africa", iso3: "ZAF", iso2: "ZA", continent: "Africa", group: "G20", startYear: 2000, endYear: 2023 },
    { name: "South Korea", iso3: "KOR", iso2: "KR", continent: "Asia", group: "G20, OECD", startYear: 2000, endYear: 2023 },
    { name: "Spain", iso3: "ESP", iso2: "ES", continent: "Europe", group: "European Union, G20, OECD", startYear: 2000, endYear: 2023 },
    { name: "Sweden", iso3: "SWE", iso2: "SE", continent: "Europe", group: "European Union, OECD", startYear: 2000, endYear: 2023 },
    { name: "Switzerland", iso3: "CHE", iso2: "CH", continent: "Europe", group: "OECD", startYear: 2000, endYear: 2023 },
    { name: "Turkey", iso3: "TUR", iso2: "TR", continent: "Europe/Asia", group: "G20, OECD", startYear: 2000, endYear: 2023 },
    { name: "United Kingdom", iso3: "GBR", iso2: "GB", continent: "Europe", group: "G7, G20, OECD", startYear: 2000, endYear: 2023 },
    { name: "United States", iso3: "USA", iso2: "US", continent: "North America", group: "G7, G20, OECD", startYear: 2000, endYear: 2023 }
  ];
}

export function getCountryByIso3(iso3: string): CountryMetadata | undefined {
  return getCountries().find(c => c.iso3 === iso3);
}

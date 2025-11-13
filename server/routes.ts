import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

const TE_API_TOKEN = process.env.TE_API_TOKEN || "guest:guest";
const TE_BASE_URL = "https://api.tradingeconomics.com";
const REQUEST_TIMEOUT = 10000;

const dateParamSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

async function fetchTradingEconomics(path: string, searchParams?: Record<string, string>) {
  const url = new URL(path, TE_BASE_URL);
  url.searchParams.set('c', TE_API_TOKEN);
  
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Trading Economics API error: ${response.status} ${response.statusText}`);
      return {
        ok: false,
        status: 502,
        data: { error: `Upstream API error: ${response.statusText}` },
      };
    }

    const data = await response.json();
    return {
      ok: true,
      status: 200,
      data,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Trading Economics fetch error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        ok: false,
        status: 504,
        data: { error: 'Request timeout' },
      };
    }
    
    return {
      ok: false,
      status: 502,
      data: { error: 'Failed to fetch from Trading Economics API' },
    };
  }
}

const CURATED_COUNTRIES = [
  { Country: "United States", Continent: "North America", Group: "G7, G20, OECD", ISO3: "USA", ISO2: "US" },
  { Country: "United Kingdom", Continent: "Europe", Group: "G7, G20, OECD", ISO3: "GBR", ISO2: "GB" },
  { Country: "Germany", Continent: "Europe", Group: "European Union, G7, G20, OECD", ISO3: "DEU", ISO2: "DE" },
  { Country: "France", Continent: "Europe", Group: "European Union, G7, G20, OECD", ISO3: "FRA", ISO2: "FR" },
  { Country: "Italy", Continent: "Europe", Group: "European Union, G7, G20, OECD", ISO3: "ITA", ISO2: "IT" },
  { Country: "Spain", Continent: "Europe", Group: "European Union, G20, OECD", ISO3: "ESP", ISO2: "ES" },
  { Country: "Netherlands", Continent: "Europe", Group: "European Union, OECD", ISO3: "NLD", ISO2: "NL" },
  { Country: "Belgium", Continent: "Europe", Group: "European Union, OECD", ISO3: "BEL", ISO2: "BE" },
  { Country: "Austria", Continent: "Europe", Group: "European Union, OECD", ISO3: "AUT", ISO2: "AT" },
  { Country: "Sweden", Continent: "Europe", Group: "European Union, OECD", ISO3: "SWE", ISO2: "SE" },
  { Country: "Denmark", Continent: "Europe", Group: "European Union, OECD", ISO3: "DNK", ISO2: "DK" },
  { Country: "Finland", Continent: "Europe", Group: "European Union, OECD", ISO3: "FIN", ISO2: "FI" },
  { Country: "Poland", Continent: "Europe", Group: "European Union, OECD", ISO3: "POL", ISO2: "PL" },
  { Country: "Portugal", Continent: "Europe", Group: "European Union, OECD", ISO3: "PRT", ISO2: "PT" },
  { Country: "Greece", Continent: "Europe", Group: "European Union, OECD", ISO3: "GRC", ISO2: "GR" },
  { Country: "Ireland", Continent: "Europe", Group: "European Union, OECD", ISO3: "IRL", ISO2: "IE" },
  { Country: "Canada", Continent: "North America", Group: "G7, G20, OECD", ISO3: "CAN", ISO2: "CA" },
  { Country: "Japan", Continent: "Asia", Group: "G7, G20, OECD", ISO3: "JPN", ISO2: "JP" },
  { Country: "Australia", Continent: "Oceania", Group: "G20, OECD", ISO3: "AUS", ISO2: "AU" },
  { Country: "South Korea", Continent: "Asia", Group: "G20, OECD", ISO3: "KOR", ISO2: "KR" },
  { Country: "China", Continent: "Asia", Group: "G20", ISO3: "CHN", ISO2: "CN" },
  { Country: "India", Continent: "Asia", Group: "G20", ISO3: "IND", ISO2: "IN" },
  { Country: "Brazil", Continent: "South America", Group: "G20", ISO3: "BRA", ISO2: "BR" },
  { Country: "Mexico", Continent: "North America", Group: "G20, OECD", ISO3: "MEX", ISO2: "MX" },
  { Country: "Switzerland", Continent: "Europe", Group: "OECD", ISO3: "CHE", ISO2: "CH" },
  { Country: "Norway", Continent: "Europe", Group: "OECD", ISO3: "NOR", ISO2: "NO" },
  { Country: "New Zealand", Continent: "Oceania", Group: "OECD", ISO3: "NZL", ISO2: "NZ" },
  { Country: "South Africa", Continent: "Africa", Group: "G20", ISO3: "ZAF", ISO2: "ZA" },
  { Country: "Turkey", Continent: "Asia", Group: "G20, OECD", ISO3: "TUR", ISO2: "TR" },
  { Country: "Russia", Continent: "Europe", Group: "G20", ISO3: "RUS", ISO2: "RU" },
].sort((a, b) => a.Country.localeCompare(b.Country));

export async function registerRoutes(app: Express): Promise<Server> {
  app.get('/api/inflation/countries', async (_req, res) => {
    return res.status(200).json(CURATED_COUNTRIES);
  });

  app.get('/api/inflation/data/:country', async (req, res) => {
    const { country } = req.params;
    const { from, to } = req.query;

    if (!country) {
      return res.status(400).json({ error: 'Country parameter is required' });
    }

    const fromValidation = dateParamSchema.safeParse(from);
    const toValidation = dateParamSchema.safeParse(to);

    if (!fromValidation.success) {
      return res.status(400).json({ error: 'Invalid "from" date parameter. Expected YYYY-MM-DD format' });
    }

    if (!toValidation.success) {
      return res.status(400).json({ error: 'Invalid "to" date parameter. Expected YYYY-MM-DD format' });
    }

    if (fromValidation.data > toValidation.data) {
      return res.status(400).json({ error: 'Invalid date range: "from" date must be before or equal to "to" date' });
    }

    const result = await fetchTradingEconomics(
      `/historical/country/${encodeURIComponent(country)}/indicator/inflation%20rate`,
      {
        from: fromValidation.data,
        to: toValidation.data,
      }
    );

    return res.status(result.status).json(result.data);
  });

  const httpServer = createServer(app);

  return httpServer;
}

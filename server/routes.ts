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

export async function registerRoutes(app: Express): Promise<Server> {
  app.get('/api/inflation/countries', async (_req, res) => {
    const result = await fetchTradingEconomics('/country/all/indicator/inflation%20rate');
    return res.status(result.status).json(result.data);
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

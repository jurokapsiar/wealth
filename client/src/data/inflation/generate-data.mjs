import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const manifestRaw = fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf-8');
const manifest = JSON.parse(manifestRaw);

function generateInflationData(countryName, iso3, baseInflation, volatility) {
  const startYear = 2000;
  const endYear = 2023;
  const data = [];
  
  data.push('Year,Month,Value');
  
  for (let year = startYear; year <= endYear; year++) {
    const yearlyTrend = Math.sin((year - startYear) / 5) * 2;
    
    for (let month = 1; month <= 12; month++) {
      const monthlyVariation = (Math.random() - 0.5) * volatility;
      const seasonalEffect = Math.sin(month / 12 * Math.PI * 2) * 0.5;
      
      let inflation = baseInflation + yearlyTrend + monthlyVariation + seasonalEffect;
      
      if (year === 2008 || year === 2009) {
        inflation += Math.random() * 2 - 1;
      }
      if (year === 2020 || year === 2021) {
        inflation += Math.random() * 1.5;
      }
      if (year === 2022 || year === 2023) {
        inflation += Math.random() * 3 + 1;
      }
      
      inflation = Math.max(0.1, inflation);
      inflation = Math.round(inflation * 100) / 100;
      
      data.push(`${year},${month},${inflation}`);
    }
  }
  
  return data.join('\n');
}

const countryProfiles = {
  'USA': { base: 2.5, volatility: 1.0 },
  'DEU': { base: 1.8, volatility: 0.8 },
  'FRA': { base: 1.7, volatility: 0.8 },
  'GBR': { base: 2.2, volatility: 1.2 },
  'ITA': { base: 2.0, volatility: 1.0 },
  'ESP': { base: 2.3, volatility: 1.2 },
  'CAN': { base: 2.1, volatility: 0.9 },
  'JPN': { base: 0.5, volatility: 0.8 },
  'CHN': { base: 2.8, volatility: 1.5 },
  'IND': { base: 5.5, volatility: 2.0 },
  'BRA': { base: 6.5, volatility: 2.5 },
  'RUS': { base: 7.0, volatility: 3.0 },
  'TUR': { base: 9.0, volatility: 4.0 },
  'MEX': { base: 4.5, volatility: 1.5 },
  'AUS': { base: 2.6, volatility: 1.0 },
  'NZL': { base: 2.4, volatility: 1.1 },
  'KOR': { base: 2.3, volatility: 1.0 },
  'CHE': { base: 0.8, volatility: 0.6 },
  'NOR': { base: 2.0, volatility: 0.9 },
  'SWE': { base: 1.5, volatility: 0.8 },
  'DNK': { base: 1.6, volatility: 0.7 },
  'FIN': { base: 1.5, volatility: 0.7 },
  'NLD': { base: 1.9, volatility: 0.8 },
  'BEL': { base: 1.8, volatility: 0.8 },
  'AUT': { base: 1.7, volatility: 0.7 },
  'IRL': { base: 1.9, volatility: 1.3 },
  'GRC': { base: 2.5, volatility: 2.0 },
  'PRT': { base: 2.2, volatility: 1.1 },
  'POL': { base: 3.5, volatility: 1.8 },
  'ZAF': { base: 5.0, volatility: 1.8 }
};

manifest.countries.forEach(country => {
  const profile = countryProfiles[country.iso3] || { base: 2.5, volatility: 1.0 };
  const csvData = generateInflationData(country.name, country.iso3, profile.base, profile.volatility);
  
  const filePath = path.join(__dirname, `${country.iso3}.csv`);
  fs.writeFileSync(filePath, csvData);
  console.log(`Generated ${country.iso3}.csv`);
});

console.log('All CSV files generated successfully!');

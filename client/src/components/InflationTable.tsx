import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

interface Props {
  inflationData: InflationData;
}

interface YearData {
  year: number;
  values: (number | null)[];
  yearlyAverage: number | null;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function InflationTable({ inflationData }: Props) {
  const calculateCAGR = (): number | null => {
    if (inflationData.data.length === 0) return null;
    
    const sortedData = [...inflationData.data].sort((a, b) => 
      new Date(a.DateTime).getTime() - new Date(b.DateTime).getTime()
    );
    
    const yearValues: number[] = [];
    let currentYear = new Date(sortedData[0].DateTime).getFullYear();
    let yearSum = 0;
    let yearCount = 0;
    
    sortedData.forEach((point, index) => {
      const year = new Date(point.DateTime).getFullYear();
      
      if (year !== currentYear) {
        if (yearCount > 0) {
          yearValues.push(yearSum / yearCount);
        }
        currentYear = year;
        yearSum = point.Value;
        yearCount = 1;
      } else {
        yearSum += point.Value;
        yearCount++;
      }
      
      if (index === sortedData.length - 1 && yearCount > 0) {
        yearValues.push(yearSum / yearCount);
      }
    });
    
    if (yearValues.length === 0) return null;
    
    const totalAverage = yearValues.reduce((sum, val) => sum + val, 0) / yearValues.length;
    
    return totalAverage;
  };

  const organizeDataByYear = (): YearData[] => {
    const yearMap = new Map<number, (number | null)[]>();
    
    inflationData.data.forEach(point => {
      const date = new Date(point.DateTime);
      const year = date.getFullYear();
      const month = date.getMonth();
      
      if (!yearMap.has(year)) {
        yearMap.set(year, Array(12).fill(null));
      }
      
      const values = yearMap.get(year)!;
      values[month] = point.Value;
    });

    const years = Array.from(yearMap.keys()).sort();
    
    return years.map(year => {
      const values = yearMap.get(year)!;
      
      const validValues = values.filter(v => v !== null) as number[];
      const yearlyAverage = validValues.length > 0
        ? validValues.reduce((sum, v) => sum + v, 0) / validValues.length
        : null;
      
      return {
        year,
        values,
        yearlyAverage,
      };
    });
  };

  const yearData = organizeDataByYear();
  const avgInflation = calculateCAGR();

  const formatValue = (value: number | null) => {
    if (value === null) return '-';
    return value.toFixed(2);
  };

  const formatPercentage = (value: number | null) => {
    if (value === null) return '-';
    return `${value.toFixed(2)}%`;
  };

  const getChangeColor = (value: number | null) => {
    if (value === null) return '';
    return value >= 3 ? 'text-red-600 dark:text-red-400' : value >= 2 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400';
  };

  return (
    <Card id={`table-${inflationData.country}`}>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-lg">
            {inflationData.country}
          </CardTitle>
          {avgInflation !== null && (
            <Badge 
              variant="secondary" 
              className={`text-sm font-semibold ${getChangeColor(avgInflation)}`}
              data-testid={`badge-avg-${inflationData.country}`}
            >
              Avg. Inflation: {formatPercentage(avgInflation)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold sticky left-0 bg-background z-10 w-20">Year</TableHead>
                <TableHead className="text-center font-bold sticky left-20 bg-background z-10 w-24">
                  Avg YoY
                </TableHead>
                {MONTH_NAMES.map((month) => (
                  <TableHead key={month} className="text-center min-w-[70px]">
                    {month}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {yearData.map((yearRow) => (
                <TableRow key={yearRow.year} data-testid={`row-year-${yearRow.year}`}>
                  <TableCell className="font-medium sticky left-0 bg-background z-10 w-20">
                    {yearRow.year}
                  </TableCell>
                  <TableCell
                    className={`text-center font-semibold sticky left-20 bg-background z-10 w-24 ${getChangeColor(yearRow.yearlyAverage)}`}
                    data-testid={`cell-yearly-avg-${yearRow.year}`}
                  >
                    {formatPercentage(yearRow.yearlyAverage)}
                  </TableCell>
                  {yearRow.values.map((value, monthIndex) => (
                    <TableCell
                      key={monthIndex}
                      className="text-center text-sm"
                      data-testid={`cell-${yearRow.year}-${monthIndex}`}
                    >
                      {formatValue(value)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

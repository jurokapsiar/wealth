import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface MonthlyDataPoint {
  date: string;
  close: number;
}

interface ETFData {
  symbol: string;
  name: string;
  monthlyData: MonthlyDataPoint[];
}

interface Props {
  etfData: ETFData;
}

interface YearData {
  year: number;
  months: (number | null)[];
  yearlyChange: number | null;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function ETFTable({ etfData }: Props) {
  const organizeDataByYear = (): YearData[] => {
    const yearMap = new Map<number, (number | null)[]>();
    
    etfData.monthlyData.forEach(point => {
      const date = new Date(point.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      
      if (!yearMap.has(year)) {
        yearMap.set(year, Array(12).fill(null));
      }
      
      const months = yearMap.get(year)!;
      months[month] = point.close;
    });

    const years = Array.from(yearMap.keys()).sort();
    
    return years.map(year => {
      const months = yearMap.get(year)!;
      
      const firstValue = months.find(v => v !== null);
      const lastValue = [...months].reverse().find(v => v !== null);
      
      const yearlyChange = firstValue && lastValue
        ? ((lastValue - firstValue) / firstValue) * 100
        : null;
      
      return {
        year,
        months,
        yearlyChange,
      };
    });
  };

  const yearData = organizeDataByYear();

  const formatValue = (value: number | null) => {
    if (value === null) return '-';
    return value.toFixed(2);
  };

  const formatPercentage = (value: number | null) => {
    if (value === null) return '-';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getChangeColor = (value: number | null) => {
    if (value === null) return '';
    return value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  return (
    <Card id={`table-${etfData.symbol}`}>
      <CardHeader>
        <CardTitle className="text-lg">
          {etfData.symbol} - {etfData.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold sticky left-0 bg-background z-10 w-20">Year</TableHead>
                <TableHead className="text-center font-bold sticky left-20 bg-background z-10 w-24">
                  YoY Change
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
                    className={`text-center font-semibold sticky left-20 bg-background z-10 w-24 ${getChangeColor(yearRow.yearlyChange)}`}
                    data-testid={`cell-yearly-change-${yearRow.year}`}
                  >
                    {formatPercentage(yearRow.yearlyChange)}
                  </TableCell>
                  {yearRow.months.map((value, monthIndex) => (
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

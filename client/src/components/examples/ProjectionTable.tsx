import { ProjectionTable } from '../ProjectionTable';

export default function ProjectionTableExample() {
  const mockProjections = [
    {
      yearNumber: 0,
      calendarYear: 2026,
      startingWealth: 100000,
      interestGained: 7500,
      costs: [
        { name: 'Living Expenses', amount: 50000 },
        { name: 'Travel', amount: 5000 },
      ],
      totalCosts: 55000,
      endingWealth: 52500,
    },
    {
      yearNumber: 1,
      calendarYear: 2027,
      startingWealth: 52500,
      interestGained: 3938,
      costs: [
        { name: 'Living Expenses', amount: 51500 },
        { name: 'Travel', amount: 5150 },
      ],
      totalCosts: 56650,
      endingWealth: -212,
    },
    {
      yearNumber: 2,
      calendarYear: 2028,
      startingWealth: -212,
      interestGained: 0,
      costs: [
        { name: 'Living Expenses', amount: 53045 },
      ],
      totalCosts: 53045,
      endingWealth: -53257,
    },
  ];

  return <ProjectionTable projections={mockProjections} />;
}

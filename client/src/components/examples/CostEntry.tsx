import { CostEntry } from '../CostEntry';

export default function CostEntryExample() {
  return (
    <CostEntry
      cost={{
        id: '1',
        name: 'Living Expenses',
        type: 'fixed',
        amount: 50000,
        startYear: 0,
        years: 10,
        enabled: true,
        taxEnabled: false,
        taxPercentage: 0,
      }}
      onUpdate={(cost) => console.log('Cost updated:', cost)}
      onRemove={() => console.log('Cost removed')}
      birthYear={1984}
      startYear={2026}
    />
  );
}

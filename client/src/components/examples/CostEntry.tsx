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
      }}
      onUpdate={(cost) => console.log('Cost updated:', cost)}
      onRemove={() => console.log('Cost removed')}
    />
  );
}

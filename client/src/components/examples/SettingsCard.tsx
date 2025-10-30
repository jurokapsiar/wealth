import { SettingsCard } from '../SettingsCard';

export default function SettingsCardExample() {
  return (
    <SettingsCard
      initialWealth={100000}
      yearlyInterest={7.5}
      inflation={3.0}
      startYear={2026}
      onInitialWealthChange={(value) => console.log('Initial wealth changed:', value)}
      onYearlyInterestChange={(value) => console.log('Yearly interest changed:', value)}
      onInflationChange={(value) => console.log('Inflation changed:', value)}
      onStartYearChange={(value) => console.log('Start year changed:', value)}
    />
  );
}

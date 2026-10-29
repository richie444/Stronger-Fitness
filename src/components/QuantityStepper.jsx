export default function QuantityStepper({ value, onChange, label, max = 8 }) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-ink/10 bg-white p-1" aria-label={`${label} booking quantity`}>
      <button
        className="grid size-8 place-items-center rounded-full text-lg font-bold text-ink transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-35"
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={value === 0}
        aria-label={`Remove one ${label} booking`}
      >−</button>
      <output className="w-5 text-center text-sm font-bold tabular-nums" aria-label={`${value} spots selected`}>{value}</output>
      <button
        className="grid size-8 place-items-center rounded-full bg-forest text-lg font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40"
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value === max}
        aria-label={`Add one ${label} booking`}
      >+</button>
    </div>
  );
}

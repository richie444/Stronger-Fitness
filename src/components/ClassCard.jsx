import QuantityStepper from "./QuantityStepper.jsx";

export default function ClassCard({ session, quantity, onQuantityChange }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-ink/[0.07] bg-white/80 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-card">
      <div className="relative h-48 overflow-hidden sm:h-52">
        <img className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={session.image} alt={session.alt} loading="lazy" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[0.65rem] font-extrabold uppercase tracking-[0.12em] text-forest backdrop-blur-sm">{session.category}</span>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-xs font-bold text-clay">{session.day} <span className="px-1 text-ink/30">/</span> {session.time}</p><h3 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">{session.name}</h3></div>
          <span className="shrink-0 rounded-full bg-cream px-2.5 py-1 text-[0.65rem] font-bold text-muted">{session.duration}</span>
        </div>
        <p className="mt-3 text-sm text-muted">with <span className="font-semibold text-ink">{session.coach}</span></p>
        <div className="mt-5 flex items-center justify-between border-t border-ink/[0.08] pt-4">
          <span className="text-xs font-semibold text-muted">Reserve spots</span>
          <QuantityStepper value={quantity} onChange={onQuantityChange} label={session.name} />
        </div>
      </div>
    </article>
  );
}

const highlights = [
  { value: "12+", label: "weekly classes" },
  { value: "4.9/5", label: "member rating" },
  { value: "1:1", label: "coach support" },
];

export default function Hero() {
  return (
    <section className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-10 lg:pb-24 lg:pt-20">
      <div className="animate-[fade-up_.7s_ease_both]">
        <p className="mb-5 text-xs font-extrabold uppercase tracking-[0.2em] text-clay sm:text-sm">Strength <span className="px-1 text-forest">•</span> Mobility <span className="px-1 text-forest">•</span> Community</p>
        <h1 className="max-w-3xl text-[clamp(3.1rem,9vw,6.6rem)] font-black leading-[0.92] tracking-[-0.075em]">Train harder.<br /><span className="font-serif font-medium italic text-forest">Feel stronger.</span></h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-muted sm:mt-7 sm:text-lg sm:leading-8">Expert-led classes, focused coaching, and a studio routine built for real progress. Come as you are. Leave a little stronger.</p>
        <div className="mt-8 flex flex-wrap gap-3 sm:mt-9">
          <a className="rounded-full bg-clay px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-clay/20 transition hover:-translate-y-0.5 hover:bg-[#a95732]" href="#pricing">Start your membership <span aria-hidden="true">↗</span></a>
          <a className="rounded-full border border-ink/15 bg-white/40 px-6 py-3.5 text-sm font-bold transition hover:border-forest hover:text-forest" href="#schedule">Explore classes</a>
        </div>
        <ul className="mt-10 grid max-w-lg grid-cols-3 gap-3 sm:mt-12 sm:gap-5" aria-label="Studio highlights">
          {highlights.map((item) => (
            <li key={item.label} className="border-l-2 border-clay/60 pl-3 sm:pl-4">
              <strong className="block text-xl font-black tracking-tight sm:text-2xl">{item.value}</strong>
              <span className="mt-1 block text-[0.7rem] leading-4 text-muted sm:text-xs">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="relative mx-auto w-full max-w-xl animate-[fade-up_.8s_.12s_ease_both] lg:max-w-none">
        <div className="absolute -right-3 -top-5 z-10 rounded-full bg-[#f7b158] px-4 py-2 text-[0.65rem] font-black uppercase tracking-[0.15em] text-ink shadow-lg sm:-right-5 sm:top-5 sm:px-5 sm:py-3 sm:text-xs">Move with purpose</div>
        <div className="aspect-[4/4.15] overflow-hidden rounded-[2rem] bg-forest shadow-card sm:aspect-[4/3.6] sm:rounded-[2.5rem]">
          <img className="h-full w-full object-cover object-center" src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=90" alt="A welcoming, sunlit training space at Stronger Fitness" fetchPriority="high" />
        </div>
        <div className="absolute -bottom-5 left-3 right-3 flex items-center justify-between gap-3 rounded-2xl border border-white/50 bg-white/90 p-3 shadow-card backdrop-blur-md sm:-bottom-6 sm:left-7 sm:right-7 sm:rounded-3xl sm:p-5">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <img className="size-11 shrink-0 rounded-full object-cover sm:size-14" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=85" alt="Leah Martin, performance coach" />
            <div className="min-w-0"><p className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-clay sm:text-xs">Meet your coach</p><p className="truncate text-sm font-extrabold sm:text-base">Leah Martin</p></div>
          </div>
          <div className="max-w-[7rem] text-right sm:max-w-none"><p className="text-lg font-black sm:text-2xl">92%</p><p className="text-[0.6rem] text-muted sm:text-xs">goal completion</p></div>
        </div>
      </div>
    </section>
  );
}

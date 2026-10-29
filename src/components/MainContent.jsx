import { useEffect, useMemo, useState } from "react";
import ClassCard from "./ClassCard.jsx";
import { apiRequest } from "../lib/api.js";

const benefits = [
  { icon: "↗", title: "Coaching that clicks", copy: "Real guidance from people who care about your progress, not just your reps." },
  { icon: "◌", title: "Room to reset", copy: "Build strength, find your rhythm, and make space for recovery in one welcoming studio." },
  { icon: "✳", title: "Your people, your pace", copy: "A friendly crew, all levels welcome, and a routine that fits your real life." },
];

function SectionHeading({ eyebrow, title, copy, centered = false }) {
  return (
    <div className={`mb-8 max-w-2xl sm:mb-10 ${centered ? "mx-auto text-center" : ""}`}>
      <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-clay">{eyebrow}</p>
      <h2 className="text-3xl font-black leading-tight tracking-[-0.055em] sm:text-4xl lg:text-5xl">{title}</h2>
      {copy && <p className="mt-3 max-w-xl text-sm leading-6 text-muted sm:mt-4 sm:text-base sm:leading-7">{copy}</p>}
    </div>
  );
}

export default function MainContent() {
  const [activeCategory, setActiveCategory] = useState("All classes");
  const [bookings, setBookings] = useState({});
  const [classes, setClasses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest("/api/classes"),
      apiRequest("/api/trainers"),
      apiRequest("/api/memberships"),
    ])
      .then(([classData, trainerData, membershipData]) => {
        if (!active) return;
        setClasses(classData);
        setTrainers(trainerData);
        setMemberships(membershipData);
      })
      .catch((error) => {
        if (active) setLoadError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const classCategories = useMemo(
    () => ["All classes", ...new Set(classes.map((session) => session.category))],
    [classes],
  );
  const visibleClasses = useMemo(
    () => activeCategory === "All classes" ? classes : classes.filter((session) => session.category === activeCategory),
    [activeCategory],
  );
  const selectedCount = Object.values(bookings).reduce((total, count) => total + count, 0);

  function updateBooking(classId, quantity) {
    setBookings((current) => ({ ...current, [classId]: quantity }));
  }

  return (
    <>
      <section className="mx-auto w-full max-w-7xl px-5 pb-12 pt-6 sm:px-8 sm:pb-16 lg:px-10">
        <div className="grid gap-3 md:grid-cols-3">
          {benefits.map((benefit) => (
            <article key={benefit.title} className="rounded-3xl border border-white/80 bg-white/55 p-6 sm:p-7">
              <span className="grid size-11 place-items-center rounded-2xl bg-[#f0e4d5] text-xl font-black text-forest">{benefit.icon}</span>
              <h2 className="mt-5 text-lg font-extrabold">{benefit.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{benefit.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="schedule" className="scroll-mt-24 bg-white/45 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading eyebrow="Class schedule" title="Find your kind of strong." copy="Choose a class, find your time, and save a spot. There’s a good place to start at every level." />
            {selectedCount > 0 && <p className="mb-8 shrink-0 rounded-full bg-forest px-4 py-2 text-sm font-bold text-white sm:mb-10" role="status">{selectedCount} {selectedCount === 1 ? "spot" : "spots"} selected</p>}
          </div>
          <div className="mb-7 flex flex-wrap gap-2 pb-2 sm:mb-9" aria-label="Filter classes by category">
            {classCategories.map((category) => (
              <button
                key={category}
                className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-bold transition sm:px-5 sm:text-sm ${activeCategory === category ? "bg-forest text-white shadow-md" : "border border-ink/10 bg-white/70 text-muted hover:border-forest hover:text-forest"}`}
                type="button"
                aria-pressed={activeCategory === category}
                onClick={() => setActiveCategory(category)}
              >{category}</button>
            ))}
          </div>
          <div className="grid min-w-0 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visibleClasses.map((session) => (
              <ClassCard key={session.id} session={session} quantity={bookings[session.id] ?? 0} onQuantityChange={(quantity) => updateBooking(session.id, quantity)} />
            ))}
          </div>
          {loading && <p className="rounded-2xl bg-white p-8 text-center text-muted" role="status">Loading classes from the studio…</p>}
          {!loading && loadError && <p className="rounded-2xl bg-red-50 p-8 text-center text-red-800" role="alert">Couldn’t load the studio schedule: {loadError}. Check the API and database connection, then refresh.</p>}
          {!loading && !loadError && visibleClasses.length === 0 && <p className="rounded-2xl bg-white p-8 text-center text-muted">No classes in this category just yet.</p>}
        </div>
      </section>

      <section id="trainers" className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <SectionHeading eyebrow="Meet the coaches" title="Good people. Great energy." copy="Our coaches bring expert eyes and genuinely good vibes to every session." />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {trainers.map((trainer) => (
            <article key={trainer.name} className="group overflow-hidden rounded-3xl border border-ink/[0.07] bg-white/75 p-2.5 shadow-sm transition hover:-translate-y-1 hover:shadow-card sm:p-3">
              <div className="aspect-[4/4.5] overflow-hidden rounded-[1.25rem] bg-[#e5ded4] sm:rounded-[1.5rem]">
                <img className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={trainer.image} alt={trainer.alt} loading="lazy" />
              </div>
              <div className="px-2 pb-2 pt-4 sm:px-3 sm:pb-3"><h3 className="text-sm font-extrabold sm:text-lg">{trainer.name}</h3><p className="mt-1 text-[0.68rem] font-bold text-clay sm:text-sm">{trainer.role}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section id="pricing" className="scroll-mt-24 bg-forest py-16 text-white sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
          <SectionHeading eyebrow="Memberships" title="Your next chapter starts here." copy="Simple plans for every stage of your journey." />
          <div className="grid gap-4 md:grid-cols-3 md:gap-5">
            {memberships.map((plan) => (
              <article key={plan.tier} className={`flex flex-col rounded-3xl p-6 sm:p-8 ${plan.featured ? "bg-[#f6f1e9] text-ink shadow-2xl md:-translate-y-2" : "border border-white/15 bg-white/[0.07]"}`}>
                <p className={`text-xs font-extrabold uppercase tracking-[0.16em] ${plan.featured ? "text-clay" : "text-white/65"}`}>{plan.tier}</p>
                <p className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">${plan.price}<span className={`ml-1 text-sm font-semibold tracking-normal ${plan.featured ? "text-muted" : "text-white/55"}`}>/month</span></p>
                <ul className="mb-8 mt-6 space-y-3 text-sm">
                  {plan.features.map((feature) => <li key={feature} className={`flex gap-2 ${plan.featured ? "text-muted" : "text-white/75"}`}><span className="font-black text-[#f7b158]">✓</span>{feature}</li>)}
                </ul>
                <a className={`mt-auto rounded-full px-5 py-3 text-center text-sm font-bold transition ${plan.featured ? "bg-clay text-white hover:bg-[#a95732]" : "border border-white/25 text-white hover:bg-white hover:text-forest"}`} href="#contact">{plan.featured ? "Most popular — join us" : "Choose plan"}</a>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

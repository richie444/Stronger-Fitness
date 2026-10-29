export default function Footer() {
  return (
    <footer id="contact" className="bg-[#191d1f] py-10 text-white/85 sm:py-12">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.4fr_0.7fr_0.9fr] lg:px-10">
        <div>
          <a className="inline-flex items-center gap-3" href="#top" aria-label="Stronger Fitness home">
            <span className="grid size-10 place-items-center rounded-full bg-clay text-lg font-black text-white">S</span>
            <span className="text-lg font-extrabold tracking-tight text-white">Stronger Fitness</span>
          </a>
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/60">Built for stronger habits, better results, and the people cheering you on.</p>
        </div>
        <div><h2 className="text-sm font-bold text-white">Visit us</h2><p className="mt-3 text-sm leading-6 text-white/60">18 River Street<br />Manchester, UK</p></div>
        <div><h2 className="text-sm font-bold text-white">Get in touch</h2><p className="mt-3 text-sm leading-6 text-white/60"><a className="hover:text-white" href="mailto:hello@strongerfitness.com">hello@strongerfitness.com</a><br /><a className="hover:text-white" href="tel:+442079460123">+44 20 7946 0123</a></p></div>
      </div>
      <div className="mx-auto mt-8 w-full max-w-7xl border-t border-white/10 px-5 pt-5 text-xs text-white/40 sm:px-8 lg:px-10">© {new Date().getFullYear()} Stronger Fitness. Built for stronger habits.</div>
    </footer>
  );
}

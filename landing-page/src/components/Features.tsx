const FEATURES = [
  {
    icon: '📊',
    title: 'Daily BIRTU score',
    description:
      'One number that blends activity, sleep, recovery, and consistency  updated every sync.',
  },
  {
    icon: '🥗',
    title: 'Ethiopian nutrition',
    description:
      'Meal plans with local foods, Amharic support, and calorie targets based on your goals.',
  },
  {
    icon: '✦',
    title: 'AI health coach',
    description:
      'Personalized daily nudges and voice coaching powered by your real health data.',
  },
  {
    icon: '🏆',
    title: 'Challenges & leaderboards',
    description:
      'Compete nationally or by city, university, or neighborhood. Earn badges and streaks.',
  },
  {
    icon: '🆘',
    title: 'Emergency SOS',
    description:
      'One tap to alert your emergency contact with optional GPS location.',
  },
  {
    icon: '🌐',
    title: 'Works offline',
    description:
      'Log and track locally  data syncs automatically when you are back online.',
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 bg-card px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Features</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need for daily health with BIRTU
          </h2>
          <p className="mt-4 text-lg text-muted">
            Built for Ethiopian users  bilingual, offline-friendly, and designed for real devices.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <article
              key={f.title}
              className="rounded-2xl border border-border bg-background p-6 transition hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-2xl">
                {f.icon}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

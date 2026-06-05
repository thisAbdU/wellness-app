import { siteConfig } from '@/lib/config';

export function Hero() {
  const hasApk = Boolean(siteConfig.apkUrl);

  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary-light/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-accent-mint/30 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <span className="h-2 w-2 rounded-full bg-accent-mint" />
            Now available on Android
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
            BIRTU fits your life in{' '}
            <span className="text-primary">Addis Ababa</span> and beyond
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            {siteConfig.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#install"
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-dark"
            >
              Download APK
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-8 py-3.5 text-sm font-semibold text-foreground transition hover:border-primary/40"
            >
              See features
            </a>
          </div>
          {!hasApk ? (
            <p className="mt-4 text-sm text-muted">
              APK link coming soon — add <code className="rounded bg-primary-light px-1.5 py-0.5 text-xs">NEXT_PUBLIC_APK_DOWNLOAD_URL</code> to your .env
            </p>
          ) : null}
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[280px] sm:w-[300px]">
      <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-accent-mint/20 to-transparent blur-2xl" />
      <div className="relative rounded-[2rem] border-8 border-foreground/90 bg-foreground p-2 shadow-2xl">
        <div className="overflow-hidden rounded-[1.4rem] bg-background">
          <div className="bg-primary px-4 py-6 text-white">
            <p className="text-xs uppercase tracking-wider opacity-70">BIRTU score</p>
            <p className="mt-1 text-5xl font-medium">82</p>
            <p className="mt-2 text-sm opacity-80">You are doing well. Keep the momentum.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 p-3">
            {[
              { icon: '👟', label: 'Steps', value: '8.4k' },
              { icon: '🌙', label: 'Sleep', value: '7h 12m' },
              { icon: '🔥', label: 'Calories', value: '420' },
            ].map((m) => (
              <div key={m.label} className="rounded-xl border border-border bg-card p-2 text-center">
                <span className="text-lg">{m.icon}</span>
                <p className="mt-1 text-xs font-semibold">{m.value}</p>
                <p className="text-[10px] uppercase text-muted">{m.label}</p>
              </div>
            ))}
          </div>
          <div className="mx-3 mb-3 rounded-xl border-l-2 border-l-primary bg-card p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">✦ AI Coach</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Take a 10-minute walk after lunch — your sleep scores improve on active days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

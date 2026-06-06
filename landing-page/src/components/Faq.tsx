const FAQ = [
  {
    q: 'Is the app free?',
    a: 'Yes. Download and use BIRTU core features at no cost during the beta period.',
  },
  {
    q: 'Does it work without internet?',
    a: 'Yes. You can view cached data offline. Sign-in and sync require a connection.',
  },
  {
    q: 'Is my health data private?',
    a: 'Your data is tied to your account and protected by row-level security. We do not sell personal health data.',
  },
  {
    q: 'Why APK instead of Play Store?',
    a: 'Direct APK lets us ship updates quickly during beta. A Play Store release may follow.',
  },
  {
    q: 'Which languages are supported?',
    a: 'English and Amharic (አማርኛ) throughout onboarding, nutrition, and coaching.',
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 bg-card px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <p className="text-center text-sm font-semibold uppercase tracking-wider text-primary">FAQ</p>
        <h2 className="mt-2 text-center text-3xl font-semibold tracking-tight">Common questions</h2>

        <div className="mt-10 space-y-4">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-border bg-background px-6 py-4 open:border-primary/30"
            >
              <summary className="cursor-pointer list-none font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <span className="text-primary transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

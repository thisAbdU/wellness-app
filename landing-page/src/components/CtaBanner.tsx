import { siteConfig } from '@/lib/config';

export function CtaBanner() {
  const hasApk = Boolean(siteConfig.apkUrl);

  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-4xl rounded-3xl bg-primary px-8 py-12 text-center text-white sm:px-12">
        <h2 className="text-2xl font-semibold sm:text-3xl">Ready to feel better every day?</h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/80">
          Join beta users tracking wellness, nutrition, and streaks — with a calm AI coach in your
          pocket.
        </p>
        {hasApk ? (
          <a
            href={siteConfig.apkUrl}
            download
            className="mt-8 inline-flex rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-primary transition hover:bg-primary-light"
          >
            Download APK now
          </a>
        ) : (
          <a
            href="#install"
            className="mt-8 inline-flex rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-primary transition hover:bg-primary-light"
          >
            View install guide
          </a>
        )}
      </div>
    </section>
  );
}

import { siteConfig } from '@/lib/config';

const STEPS = [
  {
    step: 1,
    title: 'Download the APK',
    body: 'Tap the download button below to get the latest Android build. The file is named birtu.apk.',
  },
  {
    step: 2,
    title: 'Allow installation from unknown sources',
    body: 'On your phone, go to Settings → Security (or Apps) and enable "Install unknown apps" for your browser or file manager.',
  },
  {
    step: 3,
    title: 'Open the APK file',
    body: 'Open your Downloads folder, tap the APK, and confirm when Android asks to install.',
  },
  {
    step: 4,
    title: 'Sign up & complete profile',
    body: 'Create an account, finish the 6-step profile setup, and connect Health Connect in the Activity tab for live data.',
  },
];

const REQUIREMENTS = [
  'Android 8.0 (Oreo) or newer',
  '~80 MB free storage',
  'Internet for sign-in and sync (offline mode supported)',
  'Health Connect (optional, for steps & sleep)',
];

export function InstallGuide() {
  const hasApk = Boolean(siteConfig.apkUrl);

  return (
    <section id="install" className="scroll-mt-20 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Install</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Installation guide
            </h2>
            <p className="mt-4 text-lg text-muted">
              Follow these steps to install BIRTU on your Android phone. No Play Store
              required.
            </p>

            <ol className="mt-10 space-y-6">
              {STEPS.map((s) => (
                <li key={s.step} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {s.step}
                  </span>
                  <div>
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-lg shadow-primary/5">
              <h3 className="text-xl font-semibold">Download for Android</h3>
              <p className="mt-2 text-sm text-muted">Version 1.0.0 · APK direct download</p>

              {hasApk ? (
                <a
                  href={siteConfig.apkUrl}
                  download
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-base font-semibold text-white transition hover:bg-primary-dark"
                >
                  <span>⬇</span>
                  Download APK
                </a>
              ) : (
                <div className="mt-6 rounded-xl border border-dashed border-border bg-background p-6 text-center">
                  <p className="text-sm font-medium text-foreground">APK link not configured yet</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted">
                    Set{' '}
                    <code className="rounded bg-primary-light px-1.5 py-0.5">
                      NEXT_PUBLIC_APK_DOWNLOAD_URL
                    </code>{' '}
                    in <code className="rounded bg-primary-light px-1.5 py-0.5">.env.local</code>{' '}
                    to your hosted APK URL.
                  </p>
                </div>
              )}

              <p className="mt-4 text-center text-xs text-muted">
                By installing, you agree to our privacy practices. Only install from trusted sources.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-primary-light/50 p-6">
              <h3 className="font-semibold text-primary-dark">System requirements</h3>
              <ul className="mt-3 space-y-2">
                {REQUIREMENTS.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="mt-0.5 text-primary">✓</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-semibold">Troubleshooting</h3>
              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="font-medium">Install blocked?</dt>
                  <dd className="mt-1 text-muted">
                    Enable unknown sources for the app you used to download (Chrome, Files, etc.).
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">App won&apos;t open?</dt>
                  <dd className="mt-1 text-muted">
                    Uninstall any older test build, then reinstall the latest APK.
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">Need help?</dt>
                  <dd className="mt-1 text-muted">
                    Email{' '}
                    <a href={`mailto:${siteConfig.supportEmail}`} className="text-primary underline">
                      {siteConfig.supportEmail}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

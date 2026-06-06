import { siteConfig } from '@/lib/config';

export function Footer() {
  return (
    <footer className="border-t border-border px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-2 font-semibold text-primary">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-sm">
            ✦
          </span>
          {siteConfig.name}
        </div>
        <p className="text-center text-sm text-muted">{siteConfig.tagline}</p>
        <a
          href="#install"
          className="text-sm font-semibold text-primary transition hover:underline"
        >
          Download app →
        </a>
      </div>
      <p className="mx-auto mt-8 max-w-6xl text-center text-xs text-muted">
        © {new Date().getFullYear()} BIRTU. All rights reserved.
      </p>
    </footer>
  );
}

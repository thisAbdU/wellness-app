# BIRTU Landing Page

Promotional landing page for the BIRTU mobile app. Built with **Next.js 15**, **Tailwind CSS 4**, and **pnpm**.

## Quick start

```bash
cd landing-page
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## APK download link

1. Copy the example env file:

```bash
cp .env.example .env.local
```

2. Set your hosted APK URL:

```env
NEXT_PUBLIC_APK_DOWNLOAD_URL=https://your-cdn.com/birtu.apk
```

3. Restart the dev server (or rebuild for production).

The **Download APK** buttons and install section will activate automatically when this variable is set.

## Production build

```bash
pnpm build
pnpm start
```

Deploy to Vercel, Netlify, or any Node host. Set `NEXT_PUBLIC_APK_DOWNLOAD_URL` in your hosting provider's environment variables.

## Project structure

```
landing-page/
├── src/
│   ├── app/           # Next.js App Router (layout, page, globals)
│   ├── components/    # Header, Hero, Features, InstallGuide, FAQ, etc.
│   └── lib/config.ts  # Site copy + APK URL from env
├── .env.example
└── package.json
```

## Customization

- **Branding & copy** — edit `src/lib/config.ts`
- **Features list** — edit `src/components/Features.tsx`
- **Install steps** — edit `src/components/InstallGuide.tsx`
- **Colors** — edit CSS variables in `src/app/globals.css` (matches the mobile app palette)

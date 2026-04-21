# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to bottom-top chronological order (newest at the top).

## [2026-04-21T09:50:00-07:00]
### Fixed
- Replaced the default Next.js boilerplate landing page at `apps/web/app/page.tsx` with a custom placeholder featuring branding and links to `/login` and `/register`.

## [2026-04-21T09:35:00-07:00]
### Added
- Scaffolded Next.js 14 frontend dashboard app in `apps/web` (App Router, TailwindCSS, TypeScript).
- Initialized Node.js backend bot service in `apps/bot` (TypeScript, ES Modules).
- Configured `.env.local` with Cocobase and Stripe keys (placeholder), and generated a secure `ENCRYPTION_KEY` for the bot in `.env`.
- Installed all required functional and UI dependencies (`shadcn`).
- Set up DB integration files for web (`apps/web/lib/cocobase.ts`) and bot (`apps/bot/src/db/cocobase.ts`).
- Built Auth flows (`apps/web/app/(auth)/login/page.tsx` and `register/page.tsx`).
- Created dashboard layout shell with Sidebar (`apps/web/components/Sidebar.tsx` and `layout.tsx`).
- Set up dashboard overview placeholder page (`dashboard/page.tsx`).

## [2026-04-21T08:50:00-07:00]
### Added
- Created `changelog.md` file at `c:/Users/SIR KOJO/Desktop/ProjectCopy/changelog.md` to record everything done on the project, including files created, edited, changed, and deleted. Logged based on user instructions to maintain a bottom-top chronological history separated by timestamps.

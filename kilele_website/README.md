# Kilele Electricals — Company Website

Marketing website for **Kilele Electricals** (kileleelectricals.co.tz) — an electrical
installations and engineering company in Tanzania.
Slogan: *Tunafika Kileleni Kwa Usalama* (“We reach the top safely”).

## Stack

- Vite + React 19 + TypeScript
- `react-router-dom` v7 for routing
- `react-icons` for iconography
- Bilingual (English / Kiswahili) via a lightweight language context — toggle in the navbar
- No backend required — the contact form sends enquiries via WhatsApp or email

## Getting started

```bash
npm install
npm run dev        # start dev server
npm run build      # type-check + production build
npm run preview    # preview the production build
```

## Editing content

- `src/config.ts` — phone, email, location, WhatsApp (edit once, updates everywhere).
- `src/i18n/translations.ts` — every piece of site text in both English and Kiswahili.
- `src/features/about/pages/AboutPage.tsx` — the `TEAM` array: member names and roles
  (roles via translations). Member photos are `src/assets/team_1.jpeg` … `team_6.jpeg`,
  numbered in the same order as the members — replace a file to change a photo.

## Structure

```
src/
  config.ts                 # company contact details (edit here)
  i18n/translations.ts      # all site text — English + Kiswahili
  context/                  # language context + provider (EN/SW toggle)
  layouts/                  # navbar, footer, floating WhatsApp button
  features/
    home/                   # landing page (hero slideshow, services, gallery strip)
    about/                  # story, values, our team, team culture
    services/               # detailed service sections + work process
    projects/               # filterable photo gallery with lightbox
    contact/                # contact info + quotation form (WhatsApp / email)
  assets/                   # site photos (real project photos)
public/
  kilele_logo.jpg           # favicon / social sharing logo
pics/                       # original unprocessed photos (not used by the app)
```

# TIAL Admin Studio

A responsive TIAL store operations dashboard inspired by the supplied lavender analytics-dashboard reference.

## Development
- Next.js 15 / React 19
- Recharts for analytics visualizations
- Lucide icons

Run `npm install` then `npm run dev`.

## Data integrity
The current dashboard deliberately uses empty states and em-dashes. It does not fabricate revenue, orders, visitors, customer demographics, or product performance. Connect the approved TIAL Shopify/store analytics source before displaying live KPIs.

## Safety
This rebuild is isolated on `rebuild/tial-insights-dashboard`. Do not publish to the production TIAL storefront or overwrite the live admin until verified.

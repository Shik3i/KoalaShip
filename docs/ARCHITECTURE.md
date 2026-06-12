# KoalaShip Architecture

## Overview

KoalaShip is a client-side Svelte single-page application. It has no application
backend and no database. Production uses a web server only for static files and
same-origin proxy routes.

```text
Browser
  |
  +-- Svelte application
  |     +-- reactive store
  |     +-- localStorage persistence
  |     +-- hash-based routing
  |     +-- service worker
  |
  +-- /api/route/* --------> Caddy --------> public OSRM
  +-- /api/tiles/* --------> Caddy --------> CARTO tiles
```

## Main Modules

- `src/lib/store.svelte.ts`: products, profile, cart, orders, progression,
  inventory, pricing and delivery simulation
- `src/lib/types.ts`: persisted and runtime TypeScript contracts
- `src/lib/router.svelte.ts`: small hash-based router
- `src/lib/i18n.svelte.ts`: German, English and Spanish UI dictionaries
- `src/views/`: full application screens
- `src/components/`: reusable UI and global components
- `src/data/`: editorial content designed for easy extension

## Persistence

The profile and orders are stored under:

- `koala_user`
- `koala_orders`

The order history is capped and route polylines are excluded from persisted
orders to protect the browser storage quota. Routes are fetched again when
needed.

Save export serializes the profile, compact order history and selected
preferences as JSON. Import validates the backup version and required top-level
fields before applying it.

When extending persisted interfaces:

1. Add optional fields in `src/lib/types.ts`.
2. Initialize defaults after loading the profile.
3. Preserve compatibility with older orders and profiles.
4. Avoid storing large derived values.

## Pricing

Product base prices are static. The displayed daily market price is calculated
deterministically from the product ID and current day. This creates stable
day-to-day variation without a server or random changes during a session.

Shop events apply a transparent category discount. Discount codes have explicit
minimum-order conditions and bounded discounts.

The simulation never permits a negative balance.

## Delivery Simulation

Orders progress through:

```text
TRANSIT -> LOCAL_SORTING -> OUT_FOR_DELIVERY -> DELIVERED -> OPENED
```

Progress is derived from timestamps instead of relying solely on interval
ticks. This lets orders catch up after browser background throttling or a closed
tab.

The final phase adds an estimated delivery window, remaining stops, map
movement and periodic tracking updates. Accelerated controls are available only
when the page is loaded with `?dev=true`.

## External Services

The browser calls only same-origin paths:

- `/api/route/*`
- `/api/tiles/light/*`
- `/api/tiles/dark/*`

Production Caddy forwards those requests to OSRM and CARTO. Selected simulated
coordinates are included in OSRM route requests. No real address is required.

## PWA

`public/sw.js` provides network-first application-shell caching and excludes
`/api/` requests. Each release changes the cache key so outdated assets are
removed during service-worker activation.

## Content Extension

Content that should grow without changing component logic belongs in
`src/data/`. The satirical ticker is the first example. Future candidates
include products, delivery messages, reviews and onboarding randomizer profiles.

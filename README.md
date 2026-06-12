# KoalaShip

KoalaShip is an open-source shopping and parcel-delivery simulation built with
Svelte 5, TypeScript, Vite, Tailwind CSS and Leaflet.

Everything in the simulation is fictional: KoalaCoins are not real currency,
orders are not submitted to merchants and users cannot enter debt.

## Features

- Local profiles with careers, salaries and delivery preferences
- Fictional marketplace, wishlist and savings goals
- Parcel tracking, delivery events and map visualization
- Mystery boxes, unboxing, inventory and a customizable room
- Achievements, levels, statistics and returns mini-game
- German, English and Spanish onboarding
- Local JSON export and import
- Installable PWA with offline app-shell support
- German and English privacy/legal pages

## Privacy

Game state is stored in the browser using `localStorage`. KoalaShip has no user
database and processes no real payment data.

Map tiles and route calculations use same-origin Caddy reverse proxies. Selected
start and destination coordinates are forwarded to OSRM for route calculation.
Users can choose any fictional map point and do not need to provide a real
address.

## Development

```bash
npm install
npm run dev
```

The Vite development server proxies:

- `/api/route/*` to the public OSRM service
- `/api/tiles/light/*` and `/api/tiles/dark/*` to CARTO

## Verification

```bash
npm run check
npm run build
```

## Deployment

Build the static application and copy `dist/` to `/var/www/ship`:

```bash
npm ci
npm run build
```

The production Caddy configuration is documented in [CADDYFILE.md](CADDYFILE.md).
The shared server Caddyfile must contain the corresponding
`ship.koalastuff.net` proxy handlers.

## Data backup

Open the profile page and use **Daten exportieren** to download a JSON backup.
The same page can import that file on another browser or device.

## License

KoalaShip is licensed under the [MIT License](LICENSE).

Copyright (c) 2026 Timo (KoalaDev)

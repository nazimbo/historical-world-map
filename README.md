# Historical Interactive World Map

A modern, interactive web application that allows users to explore the changing political borders of nations and empires throughout history using a comprehensive time-selection slider spanning over 125,000 years (123,000 BC to 2010 AD).

Built with SvelteKit, TypeScript, MapLibre GL, and Tailwind CSS.

## Features

- **Interactive World Map**: Pan and zoom through historical territories with MapLibre GL (WebGL-based rendering)
- **Comprehensive Timeline**: Navigate through 52 historical periods (123,000 BC to 2010 AD)
- **Territory Selection**: Click on any territory to view detailed information with persistent highlighting
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices with touch-friendly controls
- **Accessibility**: Keyboard navigation, screen reader support, ARIA labels, and focus management
- **Performance**: LRU caching, Web Worker data loading, idle-time preloading, debounced interactions
- **Error Handling**: Graceful handling of missing data files with retry options

## Quick Start

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Open http://localhost:5173 in your browser
```

## Prerequisites

- **Node.js** 18+ and npm
- A modern browser with ES6 and WebGL support

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Production build (output: `build/`) |
| `npm run preview` | Preview the production build locally |
| `npm run check` | Run `svelte-check` for type checking |
| `npm run check:watch` | Type checking in watch mode |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:watch` | Unit tests in watch mode |
| `npm run test:e2e` | Run end-to-end tests (Playwright) |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format with Prettier |
| `npm run convert-topojson` | Convert GeoJSON source data to TopoJSON |

## Project Structure

```
historical-world-map/
├── src/
│   ├── app.html                    # HTML entry point
│   ├── app.css                     # Global CSS (Tailwind + custom properties)
│   ├── app.d.ts                    # SvelteKit type declarations
│   ├── lib/
│   │   ├── index.ts                # Library barrel exports
│   │   ├── dataService.ts          # Data loading, LRU cache, Web Worker coordination
│   │   ├── periodsConfig.ts        # 52 historical period definitions (year, file, label)
│   │   ├── worker.ts               # Web Worker: fetches TopoJSON + converts to GeoJSON
│   │   └── components/
│   │       ├── Map.svelte           # MapLibre GL map with territory layers
│   │       ├── TimeSlider.svelte    # Range slider for period selection
│   │       ├── InfoPanel.svelte     # Territory detail panel (slide-in)
│   │       ├── LoadingOverlay.svelte # Loading spinner overlay
│   │       └── ErrorNotification.svelte # Error banner with retry/dismiss
│   └── routes/
│       ├── +layout.svelte          # Root layout (imports global CSS)
│       ├── +layout.ts              # Layout config (prerender, SSR off)
│       └── +page.svelte            # Main page: composes all components
├── data/                           # Source GeoJSON files (52 periods)
├── static/data/                    # Processed TopoJSON files served at runtime
├── scripts/
│   └── convert-topojson.js         # GeoJSON -> TopoJSON conversion script
├── tests/
│   ├── dataService.test.ts         # Unit tests (Vitest)
│   └── e2e/
│       └── map.spec.ts             # End-to-end tests (Playwright)
├── svelte.config.js                # SvelteKit config (static adapter)
├── vite.config.ts                  # Vite config (Tailwind + Vitest)
├── tsconfig.json                   # TypeScript strict config
├── eslint.config.js                # ESLint config
├── .prettierrc                     # Prettier config (tabs, single quotes)
├── playwright.config.ts            # Playwright E2E config
├── nginx.conf.example              # Production Nginx config with caching/security headers
├── .htaccess                       # Apache config with compression + caching
└── vercel.json                     # Vercel deployment config
```

### Legacy Files

The `app.js`, `index.html`, `css/`, and `js/` directories contain the previous vanilla JavaScript implementation. They are not used by the current SvelteKit application and are retained for reference only.

## Architecture

### Data Flow

```
TimeSlider (user input)
    → +page.svelte (handlePeriodChange)
        → DataService.loadPeriod(index)
            → Web Worker fetches /data/*.topojson
            → Converts TopoJSON → GeoJSON
            → Caches result in LRU cache
        → geojsonData state updates
            → Map.svelte $effect applies data to MapLibre GL source
```

### Key Modules

- **`DataService`** (`src/lib/dataService.ts`): Manages all data loading. Uses a Web Worker for off-main-thread fetching with automatic fallback to main thread. Implements an LRU cache (size adapts to device memory: 10-25 entries) and preloads adjacent periods during idle time via `requestIdleCallback`.

- **`worker.ts`** (`src/lib/worker.ts`): Runs in a Web Worker context. Receives `{id, file}` messages, fetches the TopoJSON file, converts it to GeoJSON using `topojson-client`, and posts back `{id, geojson}` or `{id, error}`.

- **`periodsConfig.ts`** (`src/lib/periodsConfig.ts`): Defines the 52 historical periods as an array of `{year, file, label}` objects. Years use negative numbers for BC (e.g., `-3000` = 3000 BC) and positive for AD.

- **`Map.svelte`** (`src/lib/components/Map.svelte`): Initializes MapLibre GL with CartoDB Light basemap tiles. Adds a `territories` GeoJSON source with fill and line layers. Supports hover highlighting and click selection via MapLibre feature state. Reactively updates when `geojsonData` prop changes.

- **`TimeSlider.svelte`** (`src/lib/components/TimeSlider.svelte`): Range input bound to the period index. Debounces `onperiodchange` callbacks by 300ms during drag to avoid excessive data loads. Supports arrow-key navigation for accessibility.

- **`InfoPanel.svelte`** (`src/lib/components/InfoPanel.svelte`): Slide-in panel showing properties of a clicked territory. Filters out redundant name keys and formats property names for display. Dismissible via close button or Escape key.

- **`+page.svelte`** (`src/routes/+page.svelte`): Top-level page that composes all components, manages application state (current period, selected territory, loading/error), and coordinates data loading.

## Data

### Source

Historical boundary data comes from [Historical Basemaps](https://github.com/aourednik/historical-basemaps) by Euratlas-Nüssli.

### Format

- **Source files** (`data/*.geojson`): Original GeoJSON from the upstream repository
- **Runtime files** (`static/data/*.topojson`): Compressed TopoJSON served to the browser

To regenerate TopoJSON from updated GeoJSON sources:

```bash
npm run convert-topojson
```

This applies quantization (1e6 precision) and logs file-size reduction for each period.

### Periods Covered

52 time periods across three eras:

| Era | Range | Count |
|---|---|---|
| Prehistoric | 123,000 BC - 1 BC | 17 |
| Ancient & Medieval | 100 AD - 1400 AD | 15 |
| Modern | 1492 AD - 2010 AD | 20 |

### GeoJSON Feature Properties

Territory features use these property keys (varies by period):

| Property | Description |
|---|---|
| `NAME` | Primary territory name (most common) |
| `name` | Alternate name key (some periods) |
| `NAME_EN` | English name (some periods) |

Additional properties may exist depending on the source data for each period.

### Important Notes

- Historical boundaries are approximations for educational purposes
- Pre-1648 borders represent cultural/political influence rather than modern territorial boundaries
- Data represents de facto control rather than all competing claims

## Controls

| Input | Action |
|---|---|
| Slider drag | Navigate through time periods |
| Arrow Left/Right | Step to previous/next period |
| Click territory | Show territory details in info panel |
| Escape | Close info panel |
| Mouse wheel / pinch | Zoom in/out |
| Click + drag | Pan the map |

## Technology Stack

| Category | Technology |
|---|---|
| Framework | SvelteKit 2 + Svelte 5 |
| Language | TypeScript (strict mode) |
| Map rendering | MapLibre GL 5 (WebGL) |
| Styling | Tailwind CSS 4 |
| Build tool | Vite 7 |
| Unit tests | Vitest 3 |
| E2E tests | Playwright |
| Linting | ESLint 9 + eslint-plugin-svelte |
| Formatting | Prettier + prettier-plugin-svelte |
| Geo data | TopoJSON (converted from GeoJSON) |

## Deployment

The app builds to static files via `@sveltejs/adapter-static`. Deploy the `build/` directory to any static hosting provider.

### Vercel

Already configured via `vercel.json`. Push to your repository and connect it in Vercel.

### Nginx

An example production configuration is provided in `nginx.conf.example`, including:
- Gzip/Brotli compression
- Long-lived cache headers for static assets
- Security headers (CSP, X-Content-Type-Options, X-Frame-Options)
- CORS headers for TopoJSON data files
- SPA fallback routing

### Apache

`.htaccess` is included with equivalent compression, caching, and security settings.

## Browser Support

- **Desktop**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile**: iOS Safari, Chrome Mobile with touch optimization
- **Requirements**: ES6, Fetch API, WebGL, CSS Grid/Flexbox

## Performance

- **LRU Cache**: Device-memory-aware sizing (10 entries on low-memory devices, 25 otherwise)
- **Web Workers**: Data fetching and TopoJSON conversion run off the main thread
- **Idle Preloading**: Adjacent periods are preloaded via `requestIdleCallback` (setTimeout fallback for Safari)
- **Debounced Slider**: 300ms debounce prevents redundant data loads during drag
- **Request Coalescing**: Rapid period changes collapse into a single load of the latest requested period
- **TopoJSON Compression**: Quantized coordinates reduce file sizes vs. raw GeoJSON

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, coding standards, and pull request guidelines.

## License

This project is open source. See individual data source licenses:
- **Historical Basemaps**: Check the [upstream repository](https://github.com/aourednik/historical-basemaps) for licensing
- **Application code**: MIT License

## Acknowledgments

- [Euratlas-Nüssli](https://github.com/aourednik/historical-basemaps) for historical basemap data
- [MapLibre GL JS](https://maplibre.org/) for the open-source map rendering library
- [OpenStreetMap](https://www.openstreetmap.org/) contributors for base map data via CartoDB tiles

---

**Educational Use Disclaimer**: This application is designed for educational and exploratory purposes. Historical boundaries are approximations and should not be considered authoritative for academic research without additional verification.

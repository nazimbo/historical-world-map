# Contributing

Thank you for your interest in contributing to the Historical Interactive World Map.

## Development Setup

```bash
# Clone the repository
git clone <repo-url>
cd historical-world-map

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

## Project Overview

This is a SvelteKit application written in TypeScript. See the [Architecture section in README.md](README.md#architecture) for how the modules fit together.

Key directories:

| Path | Purpose |
|---|---|
| `src/lib/` | Core logic: DataService, Web Worker, period config |
| `src/lib/components/` | Svelte UI components |
| `src/routes/` | SvelteKit pages and layouts |
| `data/` | Source GeoJSON files (not served directly) |
| `static/data/` | Processed TopoJSON files (served at runtime) |
| `tests/` | Unit tests (Vitest) and E2E tests (Playwright) |

## Development Workflow

1. Create a feature branch from `main`.
2. Make your changes.
3. Ensure all checks pass (see below).
4. Submit a pull request.

## Running Checks

Before submitting a PR, verify that your changes pass all checks:

```bash
# Type checking
npm run check

# Linting
npm run lint

# Unit tests
npm test

# End-to-end tests (requires a built app)
npm run test:e2e

# Code formatting (auto-fixes)
npm run format
```

## Code Style

- **Formatting**: Prettier is configured via `.prettierrc` (tabs, single quotes, 100-char line width). Run `npm run format` to auto-format.
- **Linting**: ESLint with the Svelte plugin. Run `npm run lint` to check.
- **TypeScript**: Strict mode is enabled. All new code should be fully typed.

## Adding a New Historical Period

1. Place the GeoJSON file in `data/` following the naming convention `world_<year>.geojson` (use `bc` prefix for BC years, e.g. `world_bc500.geojson`).
2. Run the conversion script to generate the TopoJSON file:
   ```bash
   npm run convert-topojson
   ```
3. Add an entry to the `PERIODS` array in `src/lib/periodsConfig.ts`, maintaining chronological sort order:
   ```typescript
   { year: -500, file: 'world_bc500.topojson', label: '500 BC' }
   ```
4. Verify the new period loads correctly by running the dev server and navigating to it.
5. Update the unit test expected count in `tests/dataService.test.ts` if the total number of periods changed.

## Modifying Map Styling

Map territory colors and visual states are defined in `src/lib/components/Map.svelte`:

- `MAP_COLORS` constant defines the palette (selected, named, unnamed).
- Fill and line layers use MapLibre style expressions referencing `feature-state` for hover/selection.
- Changes to these expressions affect all territories globally.

## Writing Tests

- **Unit tests** go in `tests/` and use Vitest. Run with `npm test`.
- **E2E tests** go in `tests/e2e/` and use Playwright. Run with `npm run test:e2e`.
- Test names should describe the expected behavior (e.g. "should have periods sorted by year").

## Commit Messages

Write concise commit messages that describe what changed and why. Use the imperative mood (e.g. "Add support for 1850 AD period" not "Added support").

## Pull Request Guidelines

- Keep PRs focused on a single concern.
- Include a description of what changed and why.
- Ensure all CI checks pass.
- Maintain accessibility standards (ARIA labels, keyboard navigation, focus management).
- Test on both desktop and mobile viewports when modifying UI components.

/**
 * A historical time period displayed on the map.
 */
export interface Period {
	/** Numeric year. Negative values represent BC (e.g. -3000 = 3000 BC), positive values represent AD. */
	year: number;
	/** TopoJSON filename in static/data/ (e.g. "world_bc3000.topojson"). */
	file: string;
	/** Human-readable label shown in the UI (e.g. "3000 BC"). */
	label: string;
}

/**
 * All 52 historical periods, sorted chronologically from 123,000 BC to 2010 AD.
 * Sourced from the Historical Basemaps dataset by Euratlas-Nüssli.
 */
export const PERIODS: Period[] = [
	{ year: -123000, file: 'world_bc123000.topojson', label: '123000 BC' },
	{ year: -10000, file: 'world_bc10000.topojson', label: '10000 BC' },
	{ year: -8000, file: 'world_bc8000.topojson', label: '8000 BC' },
	{ year: -5000, file: 'world_bc5000.topojson', label: '5000 BC' },
	{ year: -4000, file: 'world_bc4000.topojson', label: '4000 BC' },
	{ year: -3000, file: 'world_bc3000.topojson', label: '3000 BC' },
	{ year: -2000, file: 'world_bc2000.topojson', label: '2000 BC' },
	{ year: -1500, file: 'world_bc1500.topojson', label: '1500 BC' },
	{ year: -1000, file: 'world_bc1000.topojson', label: '1000 BC' },
	{ year: -700, file: 'world_bc700.topojson', label: '700 BC' },
	{ year: -500, file: 'world_bc500.topojson', label: '500 BC' },
	{ year: -400, file: 'world_bc400.topojson', label: '400 BC' },
	{ year: -323, file: 'world_bc323.topojson', label: '323 BC' },
	{ year: -300, file: 'world_bc300.topojson', label: '300 BC' },
	{ year: -200, file: 'world_bc200.topojson', label: '200 BC' },
	{ year: -100, file: 'world_bc100.topojson', label: '100 BC' },
	{ year: -1, file: 'world_bc1.topojson', label: '1 BC' },
	{ year: 100, file: 'world_100.topojson', label: '100 AD' },
	{ year: 200, file: 'world_200.topojson', label: '200 AD' },
	{ year: 300, file: 'world_300.topojson', label: '300 AD' },
	{ year: 400, file: 'world_400.topojson', label: '400 AD' },
	{ year: 500, file: 'world_500.topojson', label: '500 AD' },
	{ year: 600, file: 'world_600.topojson', label: '600 AD' },
	{ year: 700, file: 'world_700.topojson', label: '700 AD' },
	{ year: 800, file: 'world_800.topojson', label: '800 AD' },
	{ year: 900, file: 'world_900.topojson', label: '900 AD' },
	{ year: 1000, file: 'world_1000.topojson', label: '1000 AD' },
	{ year: 1100, file: 'world_1100.topojson', label: '1100 AD' },
	{ year: 1200, file: 'world_1200.topojson', label: '1200 AD' },
	{ year: 1279, file: 'world_1279.topojson', label: '1279 AD' },
	{ year: 1300, file: 'world_1300.topojson', label: '1300 AD' },
	{ year: 1400, file: 'world_1400.topojson', label: '1400 AD' },
	{ year: 1492, file: 'world_1492.topojson', label: '1492 AD' },
	{ year: 1500, file: 'world_1500.topojson', label: '1500 AD' },
	{ year: 1530, file: 'world_1530.topojson', label: '1530 AD' },
	{ year: 1600, file: 'world_1600.topojson', label: '1600 AD' },
	{ year: 1650, file: 'world_1650.topojson', label: '1650 AD' },
	{ year: 1700, file: 'world_1700.topojson', label: '1700 AD' },
	{ year: 1715, file: 'world_1715.topojson', label: '1715 AD' },
	{ year: 1783, file: 'world_1783.topojson', label: '1783 AD' },
	{ year: 1800, file: 'world_1800.topojson', label: '1800 AD' },
	{ year: 1815, file: 'world_1815.topojson', label: '1815 AD' },
	{ year: 1880, file: 'world_1880.topojson', label: '1880 AD' },
	{ year: 1900, file: 'world_1900.topojson', label: '1900 AD' },
	{ year: 1914, file: 'world_1914.topojson', label: '1914 AD' },
	{ year: 1920, file: 'world_1920.topojson', label: '1920 AD' },
	{ year: 1930, file: 'world_1930.topojson', label: '1930 AD' },
	{ year: 1938, file: 'world_1938.topojson', label: '1938 AD' },
	{ year: 1945, file: 'world_1945.topojson', label: '1945 AD' },
	{ year: 1960, file: 'world_1960.topojson', label: '1960 AD' },
	{ year: 1994, file: 'world_1994.topojson', label: '1994 AD' },
	{ year: 2000, file: 'world_2000.topojson', label: '2000 AD' },
	{ year: 2010, file: 'world_2010.topojson', label: '2010 AD' }
];

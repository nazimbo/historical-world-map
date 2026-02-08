import { describe, it, expect } from 'vitest';
import { PERIODS, type Period } from '../src/lib/periodsConfig.js';

describe('periodsConfig', () => {
	it('should have 53 periods', () => {
		expect(PERIODS).toHaveLength(53);
	});

	it('should have periods sorted by year', () => {
		for (let i = 1; i < PERIODS.length; i++) {
			expect(PERIODS[i].year).toBeGreaterThan(PERIODS[i - 1].year);
		}
	});

	it('should have valid file references for each period', () => {
		for (const period of PERIODS) {
			expect(period.file).toMatch(/^world_.+\.topojson$/);
		}
	});

	it('should have non-empty labels', () => {
		for (const period of PERIODS) {
			expect(period.label).toBeTruthy();
			expect(period.label.length).toBeGreaterThan(0);
		}
	});

	it('first period should be 123000 BC', () => {
		expect(PERIODS[0].label).toBe('123000 BC');
		expect(PERIODS[0].year).toBe(-123000);
	});

	it('last period should be 2010 AD', () => {
		expect(PERIODS[PERIODS.length - 1].label).toBe('2010 AD');
		expect(PERIODS[PERIODS.length - 1].year).toBe(2010);
	});

	it('each period should have year, file, and label properties', () => {
		for (const period of PERIODS) {
			expect(period).toHaveProperty('year');
			expect(period).toHaveProperty('file');
			expect(period).toHaveProperty('label');
			expect(typeof period.year).toBe('number');
			expect(typeof period.file).toBe('string');
			expect(typeof period.label).toBe('string');
		}
	});

	it('BC labels should include BC suffix', () => {
		const bcPeriods = PERIODS.filter((p) => p.year < 0);
		for (const period of bcPeriods) {
			expect(period.label).toContain('BC');
		}
	});

	it('AD labels should include AD suffix', () => {
		const adPeriods = PERIODS.filter((p) => p.year > 0);
		for (const period of adPeriods) {
			expect(period.label).toContain('AD');
		}
	});
});

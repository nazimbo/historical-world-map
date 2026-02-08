#!/usr/bin/env node

/**
 * Batch convert GeoJSON files to TopoJSON using the JS API directly.
 *
 * Usage: node scripts/convert-topojson.js
 */

import { readdir, readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { join, basename } from 'node:path';
import * as topojsonServer from 'topojson-server';
import * as topojsonClient from 'topojson-client';
import * as topojsonSimplify from 'topojson-simplify';

const INPUT_DIR = join(import.meta.dirname, '..', 'data');
const OUTPUT_DIR = join(import.meta.dirname, '..', 'static', 'data');
const QUANTIZATION = 1e6;

async function ensureDir(dir) {
	await mkdir(dir, { recursive: true });
}

async function convertFile(inputPath, outputPath) {
	const inputName = basename(inputPath);

	try {
		const raw = await readFile(inputPath, 'utf-8');
		const geojson = JSON.parse(raw);

		// Step 1: Convert GeoJSON to TopoJSON
		const topology = topojsonServer.topology({ territories: geojson });

		// Step 2: Quantize coordinates
		const quantized = topojsonClient.quantize(topology, QUANTIZATION);

		// Step 3: Serialize with reduced precision
		const output = JSON.stringify(quantized);

		await writeFile(outputPath, output, 'utf-8');

		const inputStats = await stat(inputPath);
		const outputStats = await stat(outputPath);
		const ratio = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);

		console.log(
			`  ${inputName}: ${(inputStats.size / 1024).toFixed(0)} KB → ${(outputStats.size / 1024).toFixed(0)} KB (${ratio}% smaller)`
		);

		return { input: inputStats.size, output: outputStats.size };
	} catch (err) {
		console.error(`  ERROR converting ${inputName}: ${err.message}`);
		return null;
	}
}

async function main() {
	console.log('Converting GeoJSON → TopoJSON...\n');

	await ensureDir(OUTPUT_DIR);

	const files = (await readdir(INPUT_DIR)).filter((f) => f.endsWith('.geojson'));
	files.sort();

	console.log(`Found ${files.length} GeoJSON files.\n`);

	let totalInput = 0;
	let totalOutput = 0;
	let converted = 0;
	let failed = 0;

	for (const file of files) {
		const inputPath = join(INPUT_DIR, file);
		const outputName = file.replace('.geojson', '.topojson');
		const outputPath = join(OUTPUT_DIR, outputName);

		const result = await convertFile(inputPath, outputPath);
		if (result) {
			totalInput += result.input;
			totalOutput += result.output;
			converted++;
		} else {
			failed++;
		}
	}

	console.log('\n--- Summary ---');
	console.log(`Converted: ${converted}/${files.length}`);
	if (failed > 0) console.log(`Failed: ${failed}`);
	console.log(
		`Total: ${(totalInput / 1024 / 1024).toFixed(1)} MB → ${(totalOutput / 1024 / 1024).toFixed(1)} MB (${((1 - totalOutput / totalInput) * 100).toFixed(1)}% smaller)`
	);
}

main().catch((err) => {
	console.error('Fatal error:', err);
	process.exit(1);
});

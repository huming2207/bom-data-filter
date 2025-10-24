import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect, vi } from 'vitest';
import worker from '../src/index';

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

const mockBomJson = {
	observations: {
		data: [
			{
				aifstime_utc: '20251024063000',
				rel_hum: 50,
				rain_trace: '0.2',
				air_temp: 25.0,
				apparent_t: 26.0,
			},
			{
				aifstime_utc: '20251024070000',
				rel_hum: 52,
				rain_trace: '0.3',
				air_temp: 25.5,
				apparent_t: 26.5,
			},
		],
	},
};

describe('BOM Data Filter Worker', () => {
	it('should filter BOM data correctly', async () => {
		const jsonPath = '/IDV60901/IDV60901.95936.json';
		const request = new IncomingRequest(`http://example.com?json=${jsonPath}`);

		// Mock the fetch call to the BOM website
		global.fetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify(mockBomJson), {
				headers: { 'Content-Type': 'application/json' },
			})
		);

		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(global.fetch).toHaveBeenCalledWith(`https://reg.bom.gov.au/fwo${jsonPath}`);

		const expectedDate1 = new Date(Date.UTC(2025, 9, 24, 6, 30, 0));
		const expectedTimestamp1 = Math.floor(expectedDate1.getTime() / 1000);

		const expectedDate2 = new Date(Date.UTC(2025, 9, 24, 7, 0, 0));
		const expectedTimestamp2 = Math.floor(expectedDate2.getTime() / 1000);

		const expectedJson = [
			{
				time: expectedTimestamp1,
				humidity: 50,
				rain_trace: '0.2',
				temperature: 25.0,
				apparent_temperature: 26.0,
			},
			{
				time: expectedTimestamp2,
				humidity: 52,
				rain_trace: '0.3',
				temperature: 25.5,
				apparent_temperature: 26.5,
			},
		];

		expect(await response.json()).toEqual(expectedJson);
	});
});
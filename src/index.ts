export default {
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);
		const jsonPath = url.searchParams.get('json');

		if (!jsonPath) {
			return new Response('Missing json query parameter', { status: 400 });
		}

		const bomUrl = `https://reg.bom.gov.au/fwo${jsonPath}`;

		try {
			const bomResponse = await fetch(bomUrl);
			if (!bomResponse.ok) {
				return new Response('Error fetching data from BOM', { status: bomResponse.status });
			}

			const body: any = await bomResponse.json();
			const data = body?.observations?.data;

			if (!Array.isArray(data)) {
				return new Response('Invalid BOM JSON structure, data is not an array', { status: 400 });
			}

			const filteredData = data.map((item: any) => {
				const { rel_hum, rain_trace, air_temp, apparent_t, aifstime_utc } = item;

				if (aifstime_utc === undefined) {
					return null; // Or handle the error as you see fit
				}

				const year = parseInt(aifstime_utc.substring(0, 4), 10);
				const month = parseInt(aifstime_utc.substring(4, 6), 10) - 1;
				const day = parseInt(aifstime_utc.substring(6, 8), 10);
				const hour = parseInt(aifstime_utc.substring(8, 10), 10);
				const minute = parseInt(aifstime_utc.substring(10, 12), 10);
				const second = parseInt(aifstime_utc.substring(12, 14), 10);

				const date = new Date(Date.UTC(year, month, day, hour, minute, second));
				const time = Math.floor(date.getTime() / 1000);

				return {
					time,
					humidity: rel_hum,
					rain_trace: parseFloat(rain_trace),
					temp: air_temp,
					apparent_temp: apparent_t,
				};
			}).filter(Boolean); // Remove any null entries

			return new Response(JSON.stringify({ data: filteredData, time: Date.now() }), {
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (error) {
			return new Response('Error processing request', { status: 500 });
		}
	},
} satisfies ExportedHandler<Env>;
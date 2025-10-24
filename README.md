# BOM data filter 

This is a Cloudflare Worker project that simply removing excessive info from Australian Bureau of Meteorology JSON data feed, so that some IoT devices with small RAM can parse it easily. 

## Usage

Supply a `json` path to the query parameter in the URL. 

For example, the original feed is [https://reg.bom.gov.au/fwo/IDV60901/IDV60901.95936.json](https://reg.bom.gov.au/fwo/IDV60901/IDV60901.95936.json), you need to provide a `?json=/IDV60901/IDV60901.95936.json`

Then it will return a summarised JSON like this:

```JSON
{
  "data": [
    {
      "time": 1761278400,
      "humidity": 48,
      "rain_trace": 0,
      "temp": 16.6,
      "apparent_temp": 14.3
    },
    {
      "time": 1761276600,
      "humidity": 51,
      "rain_trace": 0,
      "temp": 16,
      "apparent_temp": 13.7
    },
    // ... omit for the rest 100 records
    {
      "time": 1761021000,
      "humidity": 51,
      "rain_trace": 0,
      "temp": 19.1,
      "apparent_temp": 17.5
    }
  ],
  "time": 1761279226564
}
```
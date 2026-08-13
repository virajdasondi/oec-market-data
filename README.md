# OEC Market Data

Daily-refreshed FRED economic series powering the [Market Insights](https://www.oldelmcommercial.com/market-insights) page on oldelmcommercial.com.

- `scripts/fetch.mjs` pulls six series from FRED's public CSV endpoint (no API key) and writes `data/*.json` (last 10 years; daily series downsampled to weekly).
- `.github/workflows/update-data.yml` runs the fetch daily at 6:15am Arizona time and commits only when data changed.
- `site/charts.js` + `site/charts.css` render the charts (Chart.js) inside a Webflow HTML embed.
- Everything is served via GitHub Pages, which sends `Access-Control-Allow-Origin: *`.

Series: DGS10, DFF, PNRESCONS, WPUSI012011, SUBLPDRCSC, CPIMEDSL.

Data courtesy of FRED®, Federal Reserve Bank of St. Louis. Not financial advice.

// Fetch FRED series via the public CSV endpoint (no API key) and write JSON files.
const SERIES = [
  { id: 'DGS10',       slug: 'dgs10',            title: '10-Year U.S. Treasury Yield',                          daily: true  },
  { id: 'DFF',         slug: 'dff',              title: 'Federal Funds Effective Rate',                         daily: true  },
  { id: 'PNRESCONS',   slug: 'pnrescons',        title: 'Private Nonresidential Construction Spending',         daily: false },
  { id: 'WPUSI012011', slug: 'ppi-construction', title: 'PPI: Construction Materials',                          daily: false },
  { id: 'SUBLPDRCSC',  slug: 'sloos-cld',        title: 'Banks Tightening Construction & Land-Dev Lending',     daily: false },
  { id: 'CPIMEDSL',    slug: 'cpi-medical',      title: 'CPI: Medical Care',                                    daily: false },
];

const start = new Date();
start.setFullYear(start.getFullYear() - 10);
const cosd = start.toISOString().slice(0, 10);

for (const s of SERIES) {
  const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${s.id}&cosd=${cosd}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${s.id}: HTTP ${res.status}`);
  const rows = (await res.text()).trim().split('\n').slice(1);
  let obs = [];
  for (const row of rows) {
    const [date, raw] = row.split(',');
    const value = parseFloat(raw);
    if (!Number.isNaN(value)) obs.push([date, value]);
  }
  if (s.daily) {
    // keep the last observation of each ISO week to shrink daily series
    const byWeek = new Map();
    for (const [date, value] of obs) {
      const d = new Date(date + 'T00:00:00Z');
      const day = (d.getUTCDay() + 6) % 7;
      d.setUTCDate(d.getUTCDate() - day + 3); // ISO week anchor (Thursday)
      byWeek.set(`${d.getUTCFullYear()}-${Math.ceil(((d - new Date(Date.UTC(d.getUTCFullYear(),0,4))) / 864e5 + 1) / 7)}`, [date, value]);
    }
    obs = [...byWeek.values()];
  }
  if (!obs.length) throw new Error(`${s.id}: no observations parsed`);
  const latest = obs[obs.length - 1];
  const out = {
    id: s.id, title: s.title,
    updated: new Date().toISOString(),
    latest: { date: latest[0], value: latest[1] },
    observations: obs,
  };
  const { writeFileSync } = await import('node:fs');
  writeFileSync(`data/${s.slug}.json`, JSON.stringify(out));
  console.log(`${s.slug}.json: ${obs.length} obs, latest ${latest[0]} = ${latest[1]}`);
}

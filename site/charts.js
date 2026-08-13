/* Renders FRED series onto <canvas data-series data-fmt> elements. Light-card theme. */
(function () {
  var BASE = 'https://virajdasondi.github.io/oec-market-data';
  var LINE = '#3f6b4f'; /* elm green, readable on white cards */
  var FMT = {
    pct:  function (v) { return v.toFixed(2) + '%'; },
    pct1: function (v) { return v.toFixed(1) + '%'; },
    usdM: function (v) { return '$' + Math.round(v / 1000) + 'B'; },
    idx:  function (v) { return v.toFixed(1); }
  };
  function monthYear(d) {
    var p = d.split('-');
    return new Date(p[0], p[1] - 1, 1).toLocaleString('en-US', { month: 'short', year: 'numeric' });
  }
  function render(cv) {
    var slug = cv.getAttribute('data-series');
    var fmt = FMT[cv.getAttribute('data-fmt')] || FMT.idx;
    return fetch(BASE + '/data/' + slug + '.json').then(function (r) {
      if (!r.ok) throw new Error(slug + ': HTTP ' + r.status);
      return r.json();
    }).then(function (s) {
      var labels = s.observations.map(function (o) { return o[0]; });
      var values = s.observations.map(function (o) { return o[1]; });
      var el = document.getElementById('v-' + slug);
      if (el) el.textContent = fmt(s.latest.value) + ' · ' + monthYear(s.latest.date);
      var ctx = cv.getContext('2d');
      var g = ctx.createLinearGradient(0, 0, 0, cv.parentNode.clientHeight || 220);
      g.addColorStop(0, 'rgba(63,107,79,.16)');
      g.addColorStop(1, 'rgba(63,107,79,0)');
      new Chart(cv, {
        type: 'line',
        data: { labels: labels, datasets: [{ data: values, borderColor: LINE, borderWidth: 2, pointRadius: 0, fill: true, backgroundColor: g, tension: .25 }] },
        options: {
          responsive: true, maintainAspectRatio: false, animation: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#1a1b1f', titleColor: '#fff', bodyColor: '#d7d7d7', displayColors: false,
              callbacks: {
                title: function (items) { return monthYear(labels[items[0].dataIndex]); },
                label: function (item) { return fmt(item.parsed.y); }
              }
            }
          },
          scales: {
            x: { ticks: { color: '#9a9a9a', maxTicksLimit: 6, maxRotation: 0, callback: function (v) { return labels[v].slice(0, 4); } }, grid: { display: false } },
            y: { ticks: { color: '#9a9a9a', maxTicksLimit: 5, callback: function (v) { return fmt(v); } }, grid: { color: 'rgba(0,0,0,.07)' }, border: { display: false } }
          }
        }
      });
    });
  }
  function init() {
    document.querySelectorAll('canvas[data-series]').forEach(function (cv) {
      render(cv).catch(function (e) {
        console.error(e);
        cv.parentNode.innerHTML = '<p style="color:#999;font-size:12px">Chart temporarily unavailable.</p>';
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

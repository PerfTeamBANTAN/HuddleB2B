/* =====================================================
   DASHBOARD B2B – FINAL STABLE VERSION
===================================================== */

let dashboardRawData = [];
let achChart = null;
let statusChart = null;

/* =====================================================
   INIT
===================================================== */
function initDashboardB2B(API_URL) {
  fetch(`${API_URL}?type=b2b_dashboard`)
    .then(r => r.json())
    .then(res => {
      console.log('B2B DASHBOARD RESPONSE', res);

      dashboardRawData = res.data || [];
      initDashboardFilter();
      renderDashboard();

      setText(
        'dashboard-b2b-last-update',
        `Last update: ${res.lastUpdate || '-'}`
      );
    })
    .catch(console.error);
}

/* =====================================================
   RENDER MASTER
===================================================== */
function renderDashboard() {
  const filtered = applyDashboardFilter();
  renderKPI(filtered);
  renderTable(filtered);
  renderAchievementChart(filtered);
  renderStatusChart(filtered);
}

/* =====================================================
   KPI (FIXED 100%)
===================================================== */
function renderKPI(data) {

  /* TOTAL KPI = indikator unik */
  setText('kpi-total', uniq(data.map(d => d.Indikator)).length);

  /* STATUS COUNT */
  setText('kpi-achieve', data.filter(d => d['Status Ach HI'] === '✅').length);
  setText('kpi-not-achieve', data.filter(d => d['Status Ach HI'] === '❌').length);

  /* ACHIEVEMENT HI (PER WITEL AVERAGE) */
  const witelGroup = {};

  data.forEach(d => {
    if (!witelGroup[d.Witel]) witelGroup[d.Witel] = [];
    witelGroup[d.Witel].push(num(d['Achievement HI']));
  });

  const witelAvg = Object.values(witelGroup)
    .map(arr => arr.reduce((a, b) => a + b, 0) / arr.length);

  const finalAvg =
    witelAvg.reduce((a, b) => a + b, 0) /
    (witelAvg.length || 1);

  setText('kpi-achievement-hi', finalAvg.toFixed(2) + '%');
}

/* =====================================================
   TABLE (UNCHANGED)
===================================================== */
function renderTable(data) {
  const tbody = document.getElementById('dashboard-b2b-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center">Tidak ada data</td></tr>`;
    return;
  }

  data.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.Indikator}</td>
      <td class="text-end">${fmt(r.Target)}</td>
      <td class="text-end fw-bold">${fmt(r['Achievement HI'])}</td>
      <td class="text-center">${badge(r['Status Ach HI'])}</td>
      <td class="text-end">${fmt(r['Achievement Kemarin'])}</td>
      <td class="text-center">${badge(r['Status Ach Kemarin'])}</td>
      <td>${r['Katagori KPI']}</td>
    `;
    if (r['Status Ach HI'] === '❌') tr.classList.add('table-danger');
    tbody.appendChild(tr);
  });
}

/* =====================================================
   CHART – ACH HI vs KEMARIN
===================================================== */
function renderAchievementChart(data) {
  const box = document.getElementById('achievement-chart');
  if (!box) return;

  box.style.height = '300px';
  box.innerHTML = `<canvas id="achChartCanvas"></canvas>`;

  const ctx = document.getElementById('achChartCanvas');

  if (achChart) achChart.destroy();

  achChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.Indikator),
      datasets: [
        {
          label: 'Achievement HI',
          data: data.map(d => num(d['Achievement HI'])),
          tension: 0.4,
          fill: true
        },
        {
          label: 'Kemarin',
          data: data.map(d => num(d['Achievement Kemarin'])),
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#fff' } } },
      scales: {
        x: { ticks: { color: '#aaa' } },
        y: { ticks: { color: '#aaa' } }
      }
    }
  });
}

/* =====================================================
   CHART – STATUS KPI
===================================================== */
function renderStatusChart(data) {
  const box = document.getElementById('status-chart');
  if (!box) return;

  box.style.height = '300px';
  box.innerHTML = `<canvas id="statusChartCanvas"></canvas>`;

  const ctx = document.getElementById('statusChartCanvas');

  if (statusChart) statusChart.destroy();

  statusChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Achieve', 'Not Achieve'],
      datasets: [{
        data: [
          data.filter(d => d['Status Ach HI'] === '✅').length,
          data.filter(d => d['Status Ach HI'] === '❌').length
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

/* =====================================================
   FILTER
===================================================== */
function initDashboardFilter() {
  fillSelect(
    document.getElementById('dashboard-filter-witel'),
    uniq(dashboardRawData.map(d => d.Witel))
  );

  fillSelect(
    document.getElementById('table-filter-kategori'),
    uniq(dashboardRawData.map(d => d['Katagori KPI']))
  );

  ['dashboard-filter-witel', 'table-filter-kategori', 'table-search']
    .forEach(id => document.getElementById(id)?.addEventListener('input', renderDashboard));
}

function applyDashboardFilter() {
  const witel = val('dashboard-filter-witel');
  const kat = val('table-filter-kategori');
  const key = val('table-search').toLowerCase();

  return dashboardRawData.filter(r => {
    if (witel && r.Witel !== witel) return false;
    if (kat && r['Katagori KPI'] !== kat) return false;
    if (key && !r.Indikator.toLowerCase().includes(key)) return false;
    return true;
  });
}

/* =====================================================
   UTIL
===================================================== */
function num(v) {
  const n = parseFloat(String(v).replace(',', '.'));
  return isNaN(n) ? 0 : n;
}
function fmt(v) { return v !== null ? num(v).toLocaleString('id-ID') : '-'; }
function badge(v) {
  if (v === '✅') return `<span class="badge bg-success">Achieve</span>`;
  if (v === '❌') return `<span class="badge bg-danger">Not Achieve</span>`;
  return '-';
}
function uniq(arr) { return [...new Set(arr.filter(Boolean))]; }
function fillSelect(el, arr) {
  if (!el) return;
  el.innerHTML = `<option value="">All</option>`;
  arr.forEach(v => el.innerHTML += `<option value="${v}">${v}</option>`);
}
function val(id) { return document.getElementById(id)?.value || ''; }
function setText(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }

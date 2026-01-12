/* =====================================================
   DASHBOARD B2B – FINAL FIX (GRAPH + KPI LOGIC)
===================================================== */

let dashboardRawData = [];
let achievementChartInstance = null;
let statusChartInstance = null;

/* =====================================================
   INIT
===================================================== */
function initDashboardB2B(API_URL) {
  fetch(`${API_URL}?type=b2b_dashboard`)
    .then(res => res.json())
    .then(res => {
      console.log('B2B DASHBOARD RESPONSE', res);
      dashboardRawData = res.data || [];
      renderDashboard();
      initDashboardFilter();

      setText(
        'dashboard-b2b-last-update',
        `Last update: ${res.lastUpdate || '-'}`
      );
    })
    .catch(console.error);
}

/* =====================================================
   RENDER
===================================================== */
function renderDashboard() {
  const filtered = applyDashboardFilter();
  renderKPI(filtered);
  renderTable(filtered);
  renderAchievementChart(filtered);
  renderStatusChart(filtered);
}

/* =====================================================
   KPI (FIXED LOGIC)
===================================================== */
function renderKPI(data) {

  /* TOTAL KPI */
  setText('kpi-total', uniq(data.map(d => d.Indikator)).length);

  /* STATUS COUNT */
  setText(
    'kpi-achieve',
    data.filter(d => d['Status Ach HI'] === '✅').length
  );

  setText(
    'kpi-not-achieve',
    data.filter(d => d['Status Ach HI'] === '❌').length
  );

  /* ACHIEVEMENT HI (PER WITEL AVERAGE) */
  const witelMap = {};

  data.forEach(d => {
    if (!witelMap[d.Witel]) witelMap[d.Witel] = [];
    witelMap[d.Witel].push(num(d['Achievement HI']));
  });

  const witelAverages = Object.values(witelMap)
    .map(arr => arr.reduce((a, b) => a + b, 0) / arr.length);

  const finalAvg =
    witelAverages.reduce((a, b) => a + b, 0) /
    (witelAverages.length || 1);

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
   CHART : ACH HI vs KEMARIN (FIX HEIGHT)
===================================================== */
function renderAchievementChart(data) {
  const box = document.getElementById('achievement-chart');
  if (!box) return;

  box.style.height = '280px';
  box.innerHTML = `<canvas id="achChart"></canvas>`;

  const ctx = document.getElementById('achChart');

  if (achievementChartInstance) achievementChartInstance.destroy();

  achievementChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.Indikator),
      datasets: [
        {
          label: 'Achievement HI',
          data: data.map(d => num(d['Achievement HI'])),
          borderWidth: 2,
          tension: 0.4,
          fill: true
        },
        {
          label: 'Kemarin',
          data: data.map(d => num(d['Achievement Kemarin'])),
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

/* =====================================================
   CHART : STATUS KPI
===================================================== */
function renderStatusChart(data) {
  const box = document.getElementById('status-chart');
  if (!box) return;

  box.style.height = '280px';
  box.innerHTML = `<canvas id="statusChart"></canvas>`;

  const ctx = document.getElementById('statusChart');

  if (statusChartInstance) statusChartInstance.destroy();

  statusChartInstance = new Chart(ctx, {
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
   FILTER + UTIL
===================================================== */
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

function num(v) {
  const n = parseFloat(String(v).replace(',', '.'));
  return isNaN(n) ? 0 : n;
}
function fmt(v) { return v ? num(v).toLocaleString('id-ID') : '-'; }
function badge(v) {
  if (v === '✅') return `<span class="badge bg-success">Achieve</span>`;
  if (v === '❌') return `<span class="badge bg-danger">Not Achieve</span>`;
  return '-';
}
function uniq(arr) { return [...new Set(arr.filter(Boolean))]; }
function val(id) { return document.getElementById(id)?.value || ''; }
function setText(id, v) { const e = document.getElementById(id); if (e) e.textContent = v; }

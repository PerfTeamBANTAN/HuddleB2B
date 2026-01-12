/* =====================================================
   DASHBOARD B2B – FINAL (WITH CHART)
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

      const lu = document.getElementById('dashboard-b2b-last-update');
      if (lu) {
        lu.innerHTML = `<i class="fa fa-clock me-1"></i> Last update: ${res.lastUpdate || '-'}`;
      }
    })
    .catch(err => console.error(err));
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
   KPI
===================================================== */
function renderKPI(data) {
  setText('kpi-total', data.length);

  setText(
    'kpi-achieve',
    data.filter(r => r['Status Ach HI'] === '✅').length
  );

  setText(
    'kpi-not-achieve',
    data.filter(r => r['Status Ach HI'] === '❌').length
  );

  const avg =
    data.reduce((a, b) => a + num(b['Achievement HI']), 0) /
    (data.length || 1);

  setText('kpi-achievement-hi', avg.toFixed(2) + '%');
}

/* =====================================================
   TABLE
===================================================== */
function renderTable(data) {
  const tbody = document.getElementById('dashboard-b2b-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!data.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted">
          Tidak ada data
        </td>
      </tr>`;
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

    if (r['Status Ach HI'] === '❌') {
      tr.classList.add('table-danger');
    }

    tbody.appendChild(tr);
  });
}

/* =====================================================
   FILTER
===================================================== */
function initDashboardFilter() {
  fillSelect(
    document.getElementById('dashboard-filter-witel'),
    uniq(dashboardRawData.map(r => r.Witel))
  );

  fillSelect(
    document.getElementById('table-filter-kategori'),
    uniq(dashboardRawData.map(r => r['Katagori KPI']))
  );

  document.getElementById('dashboard-filter-witel')
    ?.addEventListener('change', renderDashboard);

  document.getElementById('table-filter-kategori')
    ?.addEventListener('change', renderDashboard);

  document.getElementById('table-search')
    ?.addEventListener('input', renderDashboard);
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
   CHART : ACHIEVEMENT HI vs KEMARIN
===================================================== */
function renderAchievementChart(data) {
  const box = document.getElementById('achievement-chart');
  if (!box) return;

  box.innerHTML = '<canvas id="achievementChartCanvas"></canvas>';
  const ctx = document.getElementById('achievementChartCanvas').getContext('2d');

  const labels = data.map(d => d.Indikator);
  const hi = data.map(d => num(d['Achievement HI']));
  const kemarin = data.map(d => num(d['Achievement Kemarin']));

  if (achievementChartInstance) achievementChartInstance.destroy();

  const gradHI = ctx.createLinearGradient(0, 0, 0, 220);
  gradHI.addColorStop(0, 'rgba(59,130,246,0.45)');
  gradHI.addColorStop(1, 'rgba(59,130,246,0.05)');

  const gradKem = ctx.createLinearGradient(0, 0, 0, 220);
  gradKem.addColorStop(0, 'rgba(34,197,94,0.4)');
  gradKem.addColorStop(1, 'rgba(34,197,94,0.05)');

  achievementChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Achievement HI',
          data: hi,
          borderColor: '#3b82f6',
          backgroundColor: gradHI,
          fill: true,
          tension: 0.45,
          borderWidth: 2.5,
          pointRadius: 3
        },
        {
          label: 'Kemarin',
          data: kemarin,
          borderColor: '#22c55e',
          backgroundColor: gradKem,
          fill: true,
          tension: 0.45,
          borderWidth: 2,
          pointRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#cbd5e1' } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
      }
    }
  });
}

/* =====================================================
   CHART : STATUS KPI (HI)
===================================================== */
function renderStatusChart(data) {
  const box = document.getElementById('status-chart');
  if (!box) return;

  box.innerHTML = '<canvas id="statusChartCanvas"></canvas>';
  const ctx = document.getElementById('statusChartCanvas').getContext('2d');

  const achieve = data.filter(r => r['Status Ach HI'] === '✅').length;
  const notAchieve = data.filter(r => r['Status Ach HI'] === '❌').length;

  if (statusChartInstance) statusChartInstance.destroy();

  statusChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Achieve', 'Not Achieve'],
      datasets: [{
        data: [achieve, notAchieve],
        backgroundColor: ['#22c55e', '#ef4444'],
        borderRadius: 14,
        barThickness: 48
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#cbd5e1' } },
        y: { beginAtZero: true, ticks: { color: '#94a3b8' } }
      }
    }
  });
}

/* =====================================================
   UTIL
===================================================== */
function num(v) {
  const n = parseFloat(String(v).replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

function fmt(v) {
  if (v === null || v === '') return '-';
  return num(v).toLocaleString('id-ID');
}

function badge(v) {
  if (v === '✅') return `<span class="badge bg-success">Achieve</span>`;
  if (v === '❌') return `<span class="badge bg-danger">Not Achieve</span>`;
  return '-';
}

function uniq(arr) {
  return [...new Set(arr.filter(Boolean))];
}

function fillSelect(el, arr) {
  if (!el) return;
  el.innerHTML = `<option value="">All</option>`;
  arr.forEach(v => el.innerHTML += `<option value="${v}">${v}</option>`);
}

function val(id) {
  return document.getElementById(id)?.value || '';
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

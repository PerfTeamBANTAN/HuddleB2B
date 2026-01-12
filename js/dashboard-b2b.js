/* =====================================================
   DASHBOARD B2B
===================================================== */

let dashboardRawData = [];
let dashboardHeaders = [];

let achievementChart = null;
let statusChart = null;

/* =====================================================
   INIT
===================================================== */
function initDashboardB2B(API_URL) {
  const tableBody = document.getElementById('dashboard-b2b-table-body');
  if (!tableBody) return;

  showLoading(true);

  fetch(`${API_URL}?type=b2b_dashboard`)
    .then(res => res.json())
    .then(res => {
      console.log('B2B DASHBOARD RESPONSE', res);

      dashboardHeaders = res.headers || [];
      dashboardRawData = res.data || [];

      initDashboardFilter();
      renderDashboard();
      updateLastUpdate(res.lastUpdate);
    })
    .catch(err => {
      console.error('Dashboard B2B error:', err);
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-danger">
            Gagal memuat data
          </td>
        </tr>`;
    })
    .finally(() => showLoading(false));
}

/* =====================================================
   FILTER INIT
===================================================== */
function initDashboardFilter() {
  const witelEl = document.getElementById('dashboard-filter-witel');
  const kategoriEl = document.getElementById('table-filter-kategori');

  const witels = uniq(dashboardRawData.map(r => r.Witel));
  const kategori = uniq(dashboardRawData.map(r => r['Katagori KPI']));

  fillSelect(witelEl, witels);
  fillSelect(kategoriEl, kategori);

  witelEl?.addEventListener('change', renderDashboard);
  kategoriEl?.addEventListener('change', renderDashboard);
  document.getElementById('table-search')
    ?.addEventListener('input', renderDashboard);
}

/* =====================================================
   RENDER MAIN
===================================================== */
function renderDashboard() {
  const filtered = applyDashboardFilter();

  renderKPI(filtered);
  renderTable(filtered);
  renderAchievementChart(filtered);
  renderStatusChart(filtered);
}

/* =====================================================
   FILTER LOGIC
===================================================== */
function applyDashboardFilter() {
  const witel = val('dashboard-filter-witel');
  const kategori = val('table-filter-kategori');
  const keyword = val('table-search').toLowerCase();

  return dashboardRawData.filter(r => {
    if (witel && r.Witel !== witel) return false;
    if (kategori && r['Katagori KPI'] !== kategori) return false;
    if (keyword && !String(r.Indikator).toLowerCase().includes(keyword)) return false;
    return true;
  });
}

/* =====================================================
   KPI SUMMARY
===================================================== */
function renderKPI(data) {
  const total = data.length;
  const achieve = data.filter(r => r['Status Ach HI'] === 'Achieve').length;
  const notAchieve = data.filter(r => r['Status Ach HI'] === 'Not Achieve').length;

  const avgHI =
    data
      .map(r => num(r['Achievement HI']))
      .filter(v => !isNaN(v))
      .reduce((a, b) => a + b, 0) / (data.length || 1);

  setText('kpi-total', total);
  setText('kpi-achieve', achieve);
  setText('kpi-not-achieve', notAchieve);
  setText('kpi-achievement-hi', avgHI.toFixed(2) + '%');
}

/* =====================================================
   TABLE
===================================================== */
function renderTable(data) {
  const tbody = document.getElementById('dashboard-b2b-table-body');
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
      <td class="small">${r['Katagori KPI']}</td>
    `;

    if (r['Status Ach HI'] === 'Not Achieve') {
      tr.classList.add('table-danger');
    }

    tbody.appendChild(tr);
  });
}

/* =====================================================
   CHART 1 : ACH HI vs KEMARIN
===================================================== */
function renderAchievementChart(data) {
  const ctxEl = document.getElementById('achievement-chart');
  ctxEl.innerHTML = `<canvas id="achChart"></canvas>`;

  const labels = data.map(r => r.Indikator);
  const hi = data.map(r => num(r['Achievement HI']));
  const kemarin = data.map(r => num(r['Achievement Kemarin']));

  if (achievementChart) achievementChart.destroy();

  achievementChart = new Chart(
    document.getElementById('achChart'),
    {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Achievement HI',
            data: hi
          },
          {
            label: 'Achievement Kemarin',
            data: kemarin
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' }
        }
      }
    }
  );
}

/* =====================================================
   CHART 2 : STATUS KPI (HI)
===================================================== */
function renderStatusChart(data) {
  const ctxEl = document.getElementById('status-chart');
  ctxEl.innerHTML = `<canvas id="statusKpiChart"></canvas>`;

  const achieve = data.filter(r => r['Status Ach HI'] === 'Achieve').length;
  const notAchieve = data.filter(r => r['Status Ach HI'] === 'Not Achieve').length;

  if (statusChart) statusChart.destroy();

  statusChart = new Chart(
    document.getElementById('statusKpiChart'),
    {
      type: 'doughnut',
      data: {
        labels: ['Achieve', 'Not Achieve'],
        datasets: [{
          data: [achieve, notAchieve]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    }
  );
}

/* =====================================================
   UTIL
===================================================== */
function showLoading(show) {
  document
    .getElementById('dashboard-b2b-loading-overlay')
    ?.classList.toggle('d-none', !show);
}

function fillSelect(el, arr) {
  if (!el) return;
  el.innerHTML = `<option value="">All</option>` +
    arr.map(v => `<option value="${v}">${v}</option>`).join('');
}

function uniq(arr) {
  return [...new Set(arr.filter(Boolean))].sort();
}

function val(id) {
  return document.getElementById(id)?.value || '';
}

function setText(id, v) {
  const el = document.getElementById(id);
  if (el) el.textContent = v;
}

function num(v) {
  if (v === null || v === undefined || v === '-') return NaN;
  return parseFloat(String(v).replace(',', '.'));
}

function fmt(v) {
  if (v === null || v === undefined || v === '-') return '-';
  const n = num(v);
  return isNaN(n) ? '-' : n.toLocaleString('id-ID');
}

function badge(v) {
  if (v === 'Achieve') return `<span class="badge bg-success">Achieve</span>`;
  if (v === 'Not Achieve') return `<span class="badge bg-danger">Not Achieve</span>`;
  return '-';
}

function updateLastUpdate(ts) {
  const el = document.getElementById('dashboard-b2b-last-update');
  if (el) {
    el.innerHTML = `<i class="fa fa-clock me-1"></i> Last update: ${ts || '-'}`;
  }
}

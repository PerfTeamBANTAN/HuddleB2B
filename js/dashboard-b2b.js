/* =====================================================
   DASHBOARD B2B
===================================================== */

let dashboardRawData = [];
let dashboardHeaders = [];

/* =====================================================
   INIT
===================================================== */
function initDashboardB2B(API_URL) {
  const loading = document.getElementById('dashboard-b2b-loading-overlay');
  const tableBody = document.getElementById('dashboard-b2b-table-body');

  if (!tableBody) return;

  showLoading(true);

  fetch(`${API_URL}?type=b2b_dashboard`)
    .then(res => res.json())
    .then(res => {
      dashboardHeaders = res.headers;
      dashboardRawData = res.data || [];

      initDashboardFilter();
      renderDashboard();
      updateLastUpdate(res.last_update);
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

  document
    .getElementById('table-search')
    ?.addEventListener('input', renderDashboard);
}

/* =====================================================
   RENDER MAIN
===================================================== */
function renderDashboard() {
  const filtered = applyDashboardFilter();

  renderKPI(filtered);
  renderTable(filtered);
  prepareChartData(filtered);
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
    if (keyword && !r.Indikator.toLowerCase().includes(keyword)) return false;
    return true;
  });
}

/* =====================================================
   KPI SUMMARY
===================================================== */
function renderKPI(data) {
  const total = data.length;

  const achieve = data.filter(r => r['Status Ach HI'] === '✅').length;
  const notAchieve = data.filter(r => r['Status Ach HI'] === '❌').length;

  const avgHI =
    data
      .map(r => num(r['Achievement HI']))
      .filter(v => !isNaN(v))
      .reduce((a, b) => a + b, 0) /
    (data.length || 1);

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

    if (r['Status Ach HI'] === '❌') {
      tr.classList.add('table-danger');
    }

    tbody.appendChild(tr);
  });
}

/* =====================================================
   CHART PREP (HOOK)
===================================================== */
function prepareChartData(data) {
  // Data sudah siap untuk Chart.js / Apex
  // labels: data.map(r => r.Indikator)
  // hi: data.map(r => num(r['Achievement HI']))
  // kemarin: data.map(r => num(r['Achievement Kemarin']))
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
  el.innerHTML += arr.map(v => `<option>${v}</option>`).join('');
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
  return parseFloat(String(v).replace(',', '.'));
}

function fmt(v) {
  if (v === '-' || v === '' || v === null) return '-';
  return num(v).toLocaleString('id-ID');
}

function badge(v) {
  if (v === '✅') return `<span class="badge bg-success">Achieve</span>`;
  if (v === '❌') return `<span class="badge bg-danger">Not Achieve</span>`;
  return '-';
}

function updateLastUpdate(ts) {
  const el = document.getElementById('dashboard-b2b-last-update');
  if (el) el.innerHTML = `<i class="fa fa-clock me-1"></i> Last update: ${ts || '-'}`;
}

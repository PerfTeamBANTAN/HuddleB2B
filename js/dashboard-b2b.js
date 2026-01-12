/* =====================================================
   DASHBOARD B2B – FINAL FIX
===================================================== */

let dashboardRawData = [];

/* =====================================================
   INIT
===================================================== */
function initDashboardB2B(API_URL) {
  fetch(`${API_URL}?type=dashboard_b2b`)
    .then(res => res.json())
    .then(res => {
      dashboardRawData = res.data || [];
      renderDashboard();
      initDashboardFilter();

      const lu = document.getElementById('dashboard-b2b-last-update');
      if (lu) lu.textContent = res.lastUpdate || '-';
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
        <td colspan="7" class="text-center text-muted">Tidak ada data</td>
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

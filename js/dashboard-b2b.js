/* =====================================================
   DASHBOARD B2B – FULL JS
===================================================== */

let dashboardRawData = [];

/* =====================================================
   INIT
===================================================== */
function initDashboardB2B(API_URL) {
  const loading = document.getElementById('loading-overlay');
  const lastUpdateEl = document.getElementById('last-update');

  loading?.classList.remove('d-none');

  fetch(`${API_URL}?type=dashboard_b2b`)
    .then(res => res.json())
    .then(json => {
      dashboardRawData = json.data || [];

      renderDashboard();
      initDashboardFilter();

      if (lastUpdateEl) {
        lastUpdateEl.textContent = formatDate(json.lastUpdate);
      }
    })
    .catch(err => {
      console.error('Dashboard B2B Error:', err);
    })
    .finally(() => {
      loading?.classList.add('d-none');
    });
}

/* =====================================================
   RENDER MAIN
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
  const total = data.length;
  const achieve = data.filter(r => r['Status Ach HI'] === '✅').length;
  const notAchieve = data.filter(r => r['Status Ach HI'] === '❌').length;

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
      <td>${r.Witel}</td>
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
  const witelEl = document.getElementById('dashboard-filter-witel');
  const kategoriEl = document.getElementById('table-filter-kategori');

  fillSelect(witelEl, uniq(dashboardRawData.map(r => r.Witel)));
  fillSelect(kategoriEl, uniq(dashboardRawData.map(r => r['Katagori KPI'])));

  witelEl?.addEventListener('change', renderDashboard);
  kategoriEl?.addEventListener('change', renderDashboard);
  document.getElementById('table-search')
    ?.addEventListener('input', renderDashboard);
}

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
   UTILITIES
===================================================== */
function fmt(v) {
  if (v === null || v === undefined || v === '') return '-';
  if (isNaN(v)) return v;
  return Number(v).toLocaleString('id-ID');
}

function num(v) {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

function badge(v) {
  if (v === '✅') return `<span class="badge bg-success">Achieve</span>`;
  if (v === '❌') return `<span class="badge bg-danger">Not Achieve</span>`;
  return '-';
}

function uniq(arr) {
  return [...new Set(arr.filter(Boolean))];
}

function fillSelect(el, data) {
  if (!el) return;
  el.innerHTML = `<option value="">All</option>`;
  data.forEach(v => {
    el.innerHTML += `<option value="${v}">${v}</option>`;
  });
}

function val(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function formatDate(dt) {
  if (!dt) return '-';
  return new Date(dt).toLocaleString('id-ID');
}

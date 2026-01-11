/* =====================================================
   GLOBAL STATE
===================================================== */
let alertRawData = [];
let alertHeaders = [];
window.API_URL = '';

/* =====================================================
   FORMATTER
===================================================== */
function fmtAlertInt(val) {
  if (val === null || val === undefined || val === '') return '-';
  if (isNaN(val)) return val;
  return parseInt(val, 10);
}

/* =====================================================
   ALERT RULE
===================================================== */
function isAlertValue(val) {
  return Number(val) > 0;
}

/* =====================================================
   KPI CARD
===================================================== */
async function renderAlertSummaryCards(API_URL) {

  const row = document.getElementById('alert-kpi-row');
  row.innerHTML = '';

  const res = await fetch(API_URL + '?type=alert_sqm_table');
  const json = await res.json();

  const cardConfig = [
    { title: 'Alert HSI', col: 'ALERT HSI' },
    { title: 'Alert SQM HSI', col: 'ALERT SQM HSI' }
  ];

  cardConfig.forEach(cfg => {

    let banten = 0;
    let tangerang = 0;

    json.data.forEach(r => {
      if (r.WITEL === 'BANTEN') banten += Number(r[cfg.col]) || 0;
      if (r.WITEL === 'TANGERANG') tangerang += Number(r[cfg.col]) || 0;
    });

    const district = banten + tangerang;

    const card = document.createElement('div');
    card.className = 'district-kpi-card';

    card.innerHTML = `
      <div class="district-kpi-title">${cfg.title}</div>
      <div class="district-kpi-row">
        <span>District</span>
        <span class="${district > 0 ? 'val-alert' : ''}">${district}</span>
      </div>
      <div class="district-kpi-row">
        <span>Banten</span>
        <span class="${banten > 0 ? 'val-alert' : ''}">${banten}</span>
      </div>
      <div class="district-kpi-row">
        <span>Tangerang</span>
        <span class="${tangerang > 0 ? 'val-alert' : ''}">${tangerang}</span>
      </div>
    `;

    row.appendChild(card);
  });
}

/* =====================================================
   INIT
===================================================== */
async function initAlertHSI(API_URL_PARAM) {

  window.API_URL = API_URL_PARAM;

  const overlay = document.getElementById('alert-loading-overlay');
  const lastUpdate = document.getElementById('alert-last-update');

  overlay.classList.remove('d-none');

  try {
    await renderAlertSummaryCards(API_URL);
    await loadAlertTable(API_URL);
    lastUpdate.innerHTML =
      `<i class="fa fa-clock me-1"></i> Last update: ${new Date().toLocaleString()}`;
  } finally {
    overlay.classList.add('d-none');
  }
}

/* =====================================================
   LOAD TABLE
===================================================== */
async function loadAlertTable(API_URL) {

  const body = document.getElementById('alert-table-body');
  body.innerHTML = `
    <tr>
      <td colspan="20" class="text-center py-3">
        <span class="spinner-border spinner-border-sm me-2"></span>
        Loading data...
      </td>
    </tr>
  `;

  const res = await fetch(API_URL + '?type=alert_sqm_table');
  const json = await res.json();

  alertHeaders = json.headers || [];
  alertRawData = json.data || [];

  initAlertFilter();
  renderAlertTable();
}

/* =====================================================
   FILTER (WITEL + STO + PIC)
===================================================== */
function initAlertFilter() {

  const witel = document.getElementById('alert-filter-witel');
  const sto = document.getElementById('alert-filter-sto');
  const pic = document.getElementById('alert-filter-pic');

  /* === WITEL === */
  witel.innerHTML = `<option value="">All Witel</option>`;
  [...new Set(alertRawData.map(d => d.WITEL).filter(Boolean))]
    .sort().forEach(v => witel.innerHTML += `<option value="${v}">${v}</option>`);

  /* === STO === */
  sto.innerHTML = `<option value="">All STO</option>`;
  [...new Set(alertRawData.map(d => d.STO).filter(Boolean))]
    .sort().forEach(v => sto.innerHTML += `<option value="${v}">${v}</option>`);

  /* === PIC (AMAN, JIKA KOLOM ADA) === */
  pic.innerHTML = `<option value="">All PIC</option>`;
  if (alertRawData.length && 'PIC' in alertRawData[0]) {
    [...new Set(alertRawData.map(d => d.PIC).filter(Boolean))]
      .sort().forEach(v => pic.innerHTML += `<option value="${v}">${v}</option>`);
  }

  witel.onchange = renderAlertTable;
  sto.onchange = renderAlertTable;
  pic.onchange = renderAlertTable;
}

/* =====================================================
   RENDER TABLE
===================================================== */
function renderAlertTable() {

  const head = document.getElementById('alert-table-head');
  const body = document.getElementById('alert-table-body');

  const fw = document.getElementById('alert-filter-witel').value;
  const fs = document.getElementById('alert-filter-sto').value;
  const fp = document.getElementById('alert-filter-pic').value;

  head.innerHTML = '';
  alertHeaders.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    head.appendChild(th);
  });

  body.innerHTML = '';

  const filtered = alertRawData.filter(r =>
    (!fw || r.WITEL === fw) &&
    (!fs || r.STO === fs) &&
    (!fp || r.PIC === fp)
  );

  if (!filtered.length) {
    body.innerHTML = `
      <tr>
        <td colspan="${alertHeaders.length}" class="text-center py-4">
          Tidak ada data
        </td>
      </tr>`;
    return;
  }

  filtered.forEach(r => {

    const tr = document.createElement('tr');

    alertHeaders.forEach(h => {

      const td = document.createElement('td');
      const val = r[h];

      if (h === 'Tiket SQM HSI' && val > 0) {
        td.innerHTML = `<a href="#" class="fw-bold text-warning"
          onclick="openSQMDetail('sqm_hsi_detail','${r.STO}')">${val}</a>`;

      } else if (h === 'Tiket SQM DATIN' && val > 0) {
        td.innerHTML = `<a href="#" class="fw-bold text-warning"
          onclick="openSQMDetail('sqm_datin_detail','${r.STO}')">${val}</a>`;

      } else if (h === 'SQM HSI Jadi Tiket' && val > 0) {
        td.innerHTML = `<a href="#" class="fw-bold text-danger"
          onclick="openSQMDetail('sqm_tiket_hsi_detail','${r.STO}')">${val}</a>`;

      } else if (h === 'SQM DATIN Jadi Tiket' && val > 0) {
        td.innerHTML = `<a href="#" class="fw-bold text-danger"
          onclick="openSQMDetail('sqm_tiket_datin_detail','${r.STO}')">${val}</a>`;

      } else if (h === 'Alert Jadi Tiket' && val > 0) {
        td.innerHTML = `<a href="#" class="fw-bold text-danger"
          onclick="openSQMDetail('alert_jadi_tiket_detail','${r.STO}')">${val}</a>`;

      } else {
        td.textContent = fmtAlertInt(val);
        if (isAlertValue(val)) td.classList.add('table-danger', 'fw-bold');
      }

      tr.appendChild(td);
    });

    body.appendChild(tr);
  });
}

/* =====================================================
   OPEN DETAIL MODAL (TIDAK DIUBAH)
===================================================== */
async function openSQMDetail(type, sto) {

  const modal = document.getElementById('global-modal');
  const title = modal.querySelector('.modal-title');
  const body = modal.querySelector('.modal-body');

  const titleMap = {
    sqm_hsi_detail: 'Detail Tiket SQM HSI',
    sqm_datin_detail: 'Detail Tiket SQM DATIN',
    sqm_tiket_hsi_detail: 'Detail SQM HSI Jadi Tiket',
    sqm_tiket_datin_detail: 'Detail SQM DATIN Jadi Tiket',
    alert_jadi_tiket_detail: 'Detail Alert Jadi Tiket'
  };

  title.textContent = `${titleMap[type]} – ${sto}`;

  body.innerHTML = `
    <div class="text-center py-5">
      <span class="spinner-border"></span>
    </div>
  `;

  new bootstrap.Modal(modal).show();

  const res = await fetch(
    `${API_URL}?type=${type}&sto=${encodeURIComponent(sto)}`
  );
  const json = await res.json();

  if (!json.data || !json.data.length) {
    body.innerHTML = `<div class="text-center py-4">Tidak ada data</div>`;
    return;
  }

  body.innerHTML = `
    <div class="table-responsive">
      <table class="table table-sm table-bordered table-dark">
        <thead>
          <tr>${json.headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${json.data.map(r =>
            `<tr>${json.headers.map(h => `<td>${r[h] ?? ''}</td>`).join('')}</tr>`
          ).join('')}
        </tbody>
      </table>
    </div>
  `;
}

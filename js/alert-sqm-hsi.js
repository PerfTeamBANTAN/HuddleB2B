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

  } catch (err) {
    console.error('ALERT ERROR:', err);
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
      <td colspan="20" class="text-center text-muted py-3">
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
   FILTER
===================================================== */
function initAlertFilter() {

  const witel = document.getElementById('alert-filter-witel');
  const sto = document.getElementById('alert-filter-sto');

  witel.innerHTML = `<option value="">All Witel</option>`;
  [...new Set(alertRawData.map(d => d.WITEL).filter(Boolean))]
    .sort()
    .forEach(v => witel.innerHTML += `<option>${v}</option>`);

  sto.innerHTML = `<option value="">All STO</option>`;
  [...new Set(alertRawData.map(d => d.STO).filter(Boolean))]
    .sort()
    .forEach(v => sto.innerHTML += `<option>${v}</option>`);

  witel.onchange = renderAlertTable;
  sto.onchange = renderAlertTable;
}

/* =====================================================
   RENDER TABLE
===================================================== */
function renderAlertTable() {

  const head = document.getElementById('alert-table-head');
  const body = document.getElementById('alert-table-body');
  const fw = document.getElementById('alert-filter-witel').value;
  const fs = document.getElementById('alert-filter-sto').value;

  head.innerHTML = '';
  alertHeaders.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    head.appendChild(th);
  });

  body.innerHTML = '';

  const filtered = alertRawData.filter(r =>
    (!fw || r.WITEL === fw) &&
    (!fs || r.STO === fs)
  );

  if (filtered.length === 0) {
    body.innerHTML = `
      <tr>
        <td colspan="${alertHeaders.length}" class="text-center text-muted py-4">
          Tidak ada data
        </td>
      </tr>
    `;
    return;
  }

  filtered.forEach(r => {

    const tr = document.createElement('tr');

    alertHeaders.forEach(h => {

      const td = document.createElement('td');
      const val = r[h];

      if (h === 'Tiket SQM HSI' && Number(val) > 0) {

        td.innerHTML = `
          <a href="#" class="fw-bold text-danger"
             onclick="openSQMDetail('sqm_hsi_detail','${r.STO}')">
            ${val}
          </a>
        `;

      } else if (h === 'SQM HSI Jadi Tiket' && Number(val) > 0) {

        td.innerHTML = `
          <a href="#" class="fw-bold text-warning"
             onclick="openSQMDetail('sqm_tiket_detail','${r.STO}')">
            ${val}
          </a>
        `;

      } else {

        td.textContent = fmtAlertInt(val);
        if (isAlertValue(val)) {
          td.classList.add('table-danger', 'fw-bold');
        }
      }

      tr.appendChild(td);
    });

    body.appendChild(tr);
  });
}

/* =====================================================
   OPEN DETAIL MODAL (UNIVERSAL)
===================================================== */
async function openSQMDetail(type, sto) {

  const modal = document.getElementById('global-modal');
  const title = modal.querySelector('.modal-title');
  const body = modal.querySelector('.modal-body');

  title.textContent =
    type === 'sqm_hsi_detail'
      ? `Detail Tiket SQM HSI – ${sto}`
      : `Detail SQM HSI Jadi Tiket – ${sto}`;

  body.innerHTML = `
    <div class="d-flex flex-column align-items-center py-5">
      <div class="spinner-border text-light mb-3"></div>
      <div class="text-muted">Mengambil data...</div>
    </div>
  `;

  new bootstrap.Modal(modal).show();

  try {
    const res = await fetch(
      `${API_URL}?type=${type}&sto=${encodeURIComponent(sto)}`
    );
    const json = await res.json();

    if (!json.data || json.data.length === 0) {
      body.innerHTML = `
        <div class="text-center text-muted py-4">
          Tidak ada data tiket
        </div>
      `;
      return;
    }

    let html = `
      <div class="table-responsive">
        <table class="table table-sm table-bordered table-dark">
          <thead>
            <tr>
              ${json.headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
    `;

    json.data.forEach(r => {
      html += `<tr>`;
      json.headers.forEach(h => {
        html += `<td>${r[h] ?? ''}</td>`;
      });
      html += `</tr>`;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    body.innerHTML = html;

  } catch (err) {
    console.error(err);
    body.innerHTML = `
      <div class="text-center text-danger py-4">
        Gagal mengambil data
      </div>
    `;
  }
}

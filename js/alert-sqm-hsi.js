/* =====================================================
   GLOBAL STATE
===================================================== */
let alertRawData = [];
let alertHeaders = [];

/* =====================================================
   FORMATTER
===================================================== */
function fmtAlertInt(val) {
  if (val === null || val === undefined || val === '') return '-';
  if (isNaN(val)) return val;
  return parseInt(val, 10);
}

/* =====================================================
   ALERT RULE (MERAH JIKA > 0)
===================================================== */
function isAlertValue(val) {
  return Number(val) > 0;
}

/* =====================================================
   RENDER KPI CARD
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
    const isBad = district > 0;

    const card = document.createElement('div');
    card.className = 'district-kpi-card';

    card.innerHTML = `
      <div class="district-kpi-title">${cfg.title}</div>

      <div class="district-kpi-row">
        <span>District</span>
        <span class="${isBad ? 'val-alert' : ''}">${district}</span>
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
async function initAlertHSI(API_URL) {

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
  body.innerHTML = `<tr><td class="text-center text-muted">Loading...</td></tr>`;

  const res = await fetch(API_URL + '?type=alert_sqm_table');
  const json = await res.json();

  alertHeaders = json.headers;
  alertRawData = json.data;

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
    .forEach(v => witel.innerHTML += `<option>${v}</option>`);

  sto.innerHTML = `<option value="">All STO</option>`;
  [...new Set(alertRawData.map(d => d.STO).filter(Boolean))]
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

  alertRawData
    .filter(r => (!fw || r.WITEL === fw) && (!fs || r.STO === fs))
    .forEach(r => {

      const tr = document.createElement('tr');

      alertHeaders.forEach(h => {

        const td = document.createElement('td');
        const val = r[h];

        /* ===== KHUSUS Tiket SQM HSI ===== */
        if (h === 'Tiket SQM HSI' && Number(val) > 0) {

          td.innerHTML = `
            <a href="#" class="fw-bold text-danger"
               onclick="openSQMDetail('${r.WITEL}','${r.STO}')">
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
   OPEN DETAIL SQM MODAL
===================================================== */
async function openSQMDetail(witel, sto) {

  const res = await fetch(
    `${API_URL}?type=sqm_hi_detail&witel=${encodeURIComponent(witel)}&sto=${encodeURIComponent(sto)}`
  );

  const json = await res.json();

  const modal = document.getElementById('global-modal');
  const title = modal.querySelector('.modal-title');
  const body = modal.querySelector('.modal-body');

  title.textContent = `Detail Tiket SQM HSI – ${sto}`;

  let html = `<div class="table-responsive"><table class="table table-sm table-bordered">`;
  html += '<thead><tr>';
  json.headers.forEach(h => html += `<th>${h}</th>`);
  html += '</tr></thead><tbody>';

  json.data.forEach(r => {
    html += '<tr>';
    json.headers.forEach(h => html += `<td>${r[h] ?? ''}</td>`);
    html += '</tr>';
  });

  html += '</tbody></table></div>';

  body.innerHTML = html;

  new bootstrap.Modal(modal).show();
}

/* =====================================================
   GLOBAL STATE
===================================================== */
let ttrRawData = [];
let ttrHeaders = [];
let currentType = 'ttr_hsi_table';

/* =====================================================
   FORMATTER
===================================================== */
function fmt(val, digit = 2) {
  if (val === null || val === undefined || val === '') return '-';
  if (isNaN(val)) return val;
  return Number(val).toFixed(digit).replace(/\.00$/, '');
}

function fmtPercent(val) {
  return fmt(val, 2);
}

function fmtInt(val) {
  if (val === null || val === undefined || val === '') return '-';
  return parseInt(val, 10);
}

/* =====================================================
   CARD COLOR HELPER
===================================================== */
function danger(val, target) {
  if (val === null || val === undefined) return '';
  return Number(val) < Number(target) ? 'text-danger fw-bold' : '';
}

/* =====================================================
   AUTO ALERT RULE
===================================================== */
function isAlertCell(type, header, row) {

  if (type === 'ttr_hsi_table') {
    if (header === '% TTR INDIBIZ 4H' && row[header] < 77) return true;
    if (header === 'Tiket Not Ach INDIBIZ 4H' && row[header] > 0) return true;
    if (header === '% TTR INDIBIZ 24H' && row[header] < 96.6) return true;
    if (header === 'Tiket Not Ach INDIBIZ 24H' && row[header] > 0) return true;
    if (header === '% TTR RESELLER 6H' && row[header] < 92.9) return true;
    if (header === 'Tiket Not Ach RESELLER 6H' && row[header] > 0) return true;
    if (header === '% TTR RESELLER 36H' && row[header] < 99.1) return true;
    if (header === 'Tiket Not Ach RESELLER 36H' && row[header] > 0) return true;
  }

  if (type === 'ttr_datin_table') {
    if (header === '% TTR Datin K2' && row[header] < 81) return true;
    if (header === 'Tiket Not Ach K2' && row[header] > 0) return true;
    if (header === '% TTR Datin K3' && row[header] < 95) return true;
    if (header === 'Tiket Not Ach K3' && row[header] > 0) return true;
  }

  return false;
}

/* =====================================================
   DETAIL TYPE MAPPER
===================================================== */
function getTTRDetailType(type, header) {
  if (type !== 'ttr_datin_table') return null;

  if (header === 'Tot Tiket K2') return 'tot_tiket_k2_detail';
  if (header === 'Tot Tiket K3') return 'tot_tiket_k3_detail';
  if (header === 'Tiket Not Ach K2') return 'tiket_not_ach_k2_detail';
  if (header === 'Tiket Not Ach K3') return 'tiket_not_ach_k3_detail';

  return null;
}

/* =====================================================
   HEADER FORMATTER
===================================================== */
function formatHeaderLabel(h) {
  if (h === 'STO' || h === 'WITEL') return h;

  let label = h;
  label = label.replace('% ', '%<br>');
  label = label.replace(/TTR/g, '<strong>TTR</strong>');
  label = label.replace(/Tiket Not Ach/i,'<small>Tiket</small><br><strong>Not Ach</strong>');
  label = label.replace(/(\d+H)/g,'<br><small>$1</small>');
  return label;
}

/* =====================================================
   INIT
===================================================== */
async function initTTRHSI(API_URL) {

  window.API_URL = API_URL;

  const overlay = document.getElementById('ttr-loading-overlay');
  overlay.classList.remove('d-none');

  await loadTTRTable(API_URL, currentType);

  overlay.classList.add('d-none');
}

/* =====================================================
   LOAD TABLE
===================================================== */
async function loadTTRTable(API_URL, type) {

  const res = await fetch(API_URL + '?type=' + type);
  const json = await res.json();

  ttrHeaders = json.headers;
  ttrRawData = json.data;

  renderTTRTable();
}

/* =====================================================
   RENDER TABLE
===================================================== */
function renderTTRTable() {

  const head = document.getElementById('ttr-table-head');
  const body = document.getElementById('ttr-table-body');

  head.innerHTML = '';
  ttrHeaders.forEach(h => {
    const th = document.createElement('th');
    th.innerHTML = formatHeaderLabel(h);
    th.style.textAlign = 'center';
    head.appendChild(th);
  });

  body.innerHTML = '';

  ttrRawData.forEach(r => {

    const tr = document.createElement('tr');

    ttrHeaders.forEach(h => {

      const td = document.createElement('td');
      const value =
        h.includes('%') ? fmtPercent(r[h]) :
        h.toLowerCase().includes('tiket') ? fmtInt(r[h]) :
        fmt(r[h]);

      const detailType = getTTRDetailType(currentType, h);

      if (detailType && Number(r[h]) > 0) {
        td.innerHTML = `
          <span class="text-primary fw-bold"
            style="cursor:pointer;text-decoration:underline"
            onclick="openTTRDetail('${detailType}','${r.STO}','${r.WITEL}')">
            ${value}
          </span>`;
      }
      else if (isAlertCell(currentType, h, r)) {
        td.innerHTML = `<span class="text-danger fw-bold">${value}</span>`;
      }
      else {
        td.textContent = value;
      }

      tr.appendChild(td);
    });

    body.appendChild(tr);
  });
}

/* =====================================================
   MODAL DETAIL TTR (FINAL & STABLE)
===================================================== */
async function openTTRDetail(type, sto, witel) {

  const title = document.getElementById('modalTiketHITitle');
  const head  = document.getElementById('tiket-hi-head');
  const body  = document.getElementById('tiket-hi-body');

  title.textContent = `Detail ${type.replace(/_/g,' ').toUpperCase()} – ${witel} / ${sto}`;
  head.innerHTML = '';
  body.innerHTML = `<tr><td>Loading...</td></tr>`;

  const res = await fetch(`${API_URL}?type=${type}&sto=${encodeURIComponent(sto)}`);
  const json = await res.json();

  const headers = json.headers || [];
  const data = json.data || [];

  head.innerHTML = '';
  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    head.appendChild(th);
  });

  body.innerHTML = '';
  if (!data.length) {
    body.innerHTML = `<tr><td colspan="${headers.length}" class="text-center text-muted">Tidak ada data</td></tr>`;
  } else {
    data.forEach(r => {
      const tr = document.createElement('tr');
      headers.forEach(h => {
        const td = document.createElement('td');
        td.textContent = r[h] ?? '-';
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });
  }

  new bootstrap.Modal(document.getElementById('modalTiketHI')).show();
}

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
  if (val === null || val === undefined || val === '') return '-';
  if (isNaN(val)) return val;
  return fmt(val, 2);
}

function fmtInt(val) {
  if (val === null || val === undefined || val === '') return '-';
  if (isNaN(val)) return val;
  return parseInt(val, 10);
}

/* =====================================================
   RULE ALERT (AUTO MERAH)
===================================================== */
function isAlertCell(type, header, row) {

  // ================= TTR HSI =================
  if (type === 'ttr_hsi_table') {

    if (header === '% TTR INDIBIZ 4H' && row[header] < 77) return true;
    if (header === 'Tiket Not Ach INDIBIZ 4H' && row[header] > 0) return true;

    if (header === '% TTR INDIBIZ 24H' && row[header] < 96.6) return true;
    if (header === 'Tiket Not Ach INDIBIZ 24H' && row[header] > 0) return true;

    if (header === '% TTR RESELLER 6H' && row[header] < 92.9) return true;
    if (header === 'Tiket Not Ach RESELLER 6H' && row[header] > 0) return true;

    if (header === '% TTR RESELLER 36H' && row[header] < 99.1) return true;
    if (header === 'Tiket RESELLER 36H HI' && row[header] > 0) return true;
  }

  // ================= TTR DATIN =================
  if (type === 'ttr_datin_table') {

    if (header === '% TTR Datin K2' && row[header] < 81) return true;
    if (header === 'Tiket Not Ach K2' && row[header] > 0) return true;
    if (header === 'Tiket K2 HI' && row[header] > 0) return true;

    if (header === '% TTR Datin K3' && row[header] < 95) return true;
    if (header === 'Tiket Not Ach K3' && row[header] > 0) return true;
    if (header === 'Tiket K3 HI' && row[header] > 0) return true;
  }

  return false;
}

/* =====================================================
   INIT
===================================================== */
async function initTTRHSI(API_URL) {

  const row = document.getElementById('ttr-row');
  const overlay = document.getElementById('ttr-loading-overlay');
  const lastUpdate = document.getElementById('ttr-last-update');

  overlay.classList.remove('d-none');

  try {
    /* ================= KPI CARD ================= */
    const kpiRes = await fetch(API_URL + '?type=kpi');
    const kpiJson = await kpiRes.json();

    row.innerHTML = '';

    kpiJson.data
      .filter(d => d.indikator.toUpperCase().includes('TTR'))
      .forEach(d => {

        const isGood = d.ach <= d.target;

        const card = document.createElement('div');
        card.className = `badge-card ${isGood ? 'card-good' : 'card-bad'}`;

        card.innerHTML = `
          <div class="badge-card-header">
            ${d.indikator} - ${d.witel}
          </div>
          <div class="badge-card-body">
            <div class="row-item">
              <span>Target</span>
              <span>${fmt(d.target, 1)}</span>
            </div>
            <div class="row-item">
              <span>Actual</span>
              <span class="${isGood ? 'value-good' : 'value-bad'}">
                ${fmt(d.ach, 2)}
              </span>
            </div>
          </div>
        `;
        row.appendChild(card);
      });

    /* ================= DEFAULT LOAD ================= */
    await loadTTRTable(API_URL, currentType);

    lastUpdate.innerHTML =
      `<i class="fa fa-clock me-1"></i> Last update: ${new Date().toLocaleString()}`;

  } catch (err) {
    console.error(err);
  } finally {
    overlay.classList.add('d-none');
  }

  /* ================= TAB EVENT ================= */
  document.querySelectorAll('#ttr-tabs button').forEach(btn => {
    btn.addEventListener('click', async () => {

      document.querySelectorAll('#ttr-tabs button').forEach(b => {
        b.classList.remove('btn-primary', 'active');
        b.classList.add('btn-outline-light');
      });

      btn.classList.remove('btn-outline-light');
      btn.classList.add('btn-primary', 'active');

      currentType = btn.dataset.type;
      await loadTTRTable(API_URL, currentType);
    });
  });
}

/* =====================================================
   LOAD DATA
===================================================== */
async function loadTTRTable(API_URL, type) {

  const tableBody = document.getElementById('ttr-table-body');
  tableBody.innerHTML =
    `<tr><td class="text-center text-muted">Memuat data...</td></tr>`;

  const res = await fetch(API_URL + '?type=' + type);
  const json = await res.json();

  ttrHeaders = json.headers;
  ttrRawData = json.data;

  initTTRFilter();
  renderTTRTable();
}

/* =====================================================
   FILTER INIT
===================================================== */
function initTTRFilter() {

  const witelSelect = document.getElementById('ttr-filter-witel');
  const stoSelect = document.getElementById('ttr-filter-sto');

  const witels = [...new Set(ttrRawData.map(d => d.WITEL).filter(Boolean))];
  const stos = [...new Set(ttrRawData.map(d => d.STO).filter(Boolean))];

  witelSelect.innerHTML = `<option value="">All Witel</option>`;
  witels.forEach(w =>
    witelSelect.innerHTML += `<option value="${w}">${w}</option>`
  );

  stoSelect.innerHTML = `<option value="">All STO</option>`;
  stos.forEach(s =>
    stoSelect.innerHTML += `<option value="${s}">${s}</option>`
  );

  witelSelect.onchange = renderTTRTable;
  stoSelect.onchange = renderTTRTable;
}

/* =====================================================
   RENDER TABLE (FORMAT + AUTO MERAH)
===================================================== */
function renderTTRTable() {

  const tableHead = document.getElementById('ttr-table-head');
  const tableBody = document.getElementById('ttr-table-body');
  const filterWitel = document.getElementById('ttr-filter-witel').value;
  const filterSTO = document.getElementById('ttr-filter-sto').value;

  tableHead.innerHTML = '';
  ttrHeaders.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    tableHead.appendChild(th);
  });

  const filtered = ttrRawData.filter(r =>
    (!filterWitel || r.WITEL === filterWitel) &&
    (!filterSTO || r.STO === filterSTO)
  );

  tableBody.innerHTML = '';

  if (!filtered.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="${ttrHeaders.length}" class="text-center text-muted">
          Tidak ada data
        </td>
      </tr>`;
    return;
  }

  filtered.forEach(r => {
    const tr = document.createElement('tr');

    ttrHeaders.forEach(h => {
      const td = document.createElement('td');

      if (h.includes('%') || h.toUpperCase().includes('TTR')) {
        td.textContent = fmtPercent(r[h]);
      }
      else if (
        h.toLowerCase().includes('tiket') ||
        h.toLowerCase().includes('tot')
      ) {
        td.textContent = fmtInt(r[h]);
      }
      else {
        td.textContent = fmt(r[h]);
      }

      // 🔴 AUTO MERAH SESUAI RULE
      if (isAlertCell(currentType, h, r)) {
        td.classList.add('table-danger', 'fw-bold');
      }

      tr.appendChild(td);
    });

    tableBody.appendChild(tr);
  });
}

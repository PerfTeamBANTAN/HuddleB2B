/* =====================================================
   GLOBAL STATE
===================================================== */
let ttrRawData = [];
let ttrHeaders = [];
let currentType = null;

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
   ALERT RULE (SAFE)
===================================================== */
function isAlertCell(type, header, row) {

  if (type !== 'ttr_datin_table') return false;

  if (header === '% TTR Datin K2' && row[header] < 81) return true;
  if (header === 'Tiket Not Ach K2' && row[header] > 0) return true;
  if (header === '% TTR Datin K3' && row[header] < 95) return true;
  if (header === 'Tiket Not Ach K3' && row[header] > 0) return true;

  return false;
}

/* =====================================================
   DETAIL TYPE (DATIN ONLY)
===================================================== */
function getTTRDetailType(type, header) {

  if (type !== 'ttr_datin_table') return null;

  if (header === 'Tot Tiket K2') return 'tot_tiket_k2_detail';
  if (header === 'Tiket Not Ach K2') return 'tiket_not_ach_k2_detail';

  if (header === 'Tot Tiket K3') return 'tot_tiket_k3_detail';
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
  label = label.replace(
    /Tiket Not Ach/i,
    '<small>Tiket</small><br><strong>Not Ach</strong>'
  );
  return label;
}

/* =====================================================
   KPI SUMMARY (TETAP ADA – AMAN)
===================================================== */
async function renderSummaryCards(API_URL) {
  const row = document.getElementById('ttr-row');
  row.innerHTML = '';

  const res = await fetch(API_URL + '?type=kpi');
  const json = await res.json();

  json.data
    .filter(d => d.indikator.toUpperCase().includes('TTR'))
    .forEach(d => {
      row.innerHTML += `
        <div class="badge-card">
          <div class="badge-card-header">${d.indikator}</div>
          <div class="badge-card-body text-dark">
            <div class="row-item"><span>Target</span><span>${fmt(d.target,1)}</span></div>
            <div class="row-item"><span>${d.witel}</span>
              <span class="${d.ach < d.target ? 'text-danger fw-bold' : ''}">
                ${fmt(d.ach)}
              </span>
            </div>
          </div>
        </div>`;
    });
}

/* =====================================================
   INIT
===================================================== */
async function initTTRHSI(API_URL) {

  window.API_URL = API_URL;

  const activeBtn = document.querySelector('#ttr-tabs button.active');
  currentType = activeBtn?.dataset.type || 'ttr_datin_table';

  await renderSummaryCards(API_URL);
  await loadTTRTable(API_URL, currentType);

  document.querySelectorAll('#ttr-tabs button').forEach(btn => {
    btn.onclick = async () => {

      document.querySelectorAll('#ttr-tabs button').forEach(b => {
        b.classList.remove('btn-primary', 'active');
        b.classList.add('btn-outline-light');
      });

      btn.classList.add('btn-primary', 'active');
      btn.classList.remove('btn-outline-light');

      currentType = btn.dataset.type;
      await loadTTRTable(API_URL, currentType);
    };
  });
}

/* =====================================================
   LOAD TABLE (SAFE)
===================================================== */
async function loadTTRTable(API_URL, type) {

  const body = document.getElementById('ttr-table-body');
  body.innerHTML = `
    <tr><td colspan="30" class="text-center py-4">Loading...</td></tr>
  `;

  try {

    const res = await fetch(API_URL + '?type=' + type);
    const json = await res.json();

    if (!json.data) throw 'invalid';

    ttrHeaders = json.headers;
    ttrRawData = json.data;

    initTTRFilter();
    renderTTRTable();

  } catch {
    body.innerHTML = `
      <tr><td colspan="30" class="text-center text-danger py-4">
        Error mengambil data
      </td></tr>
    `;
  }
}

/* =====================================================
   FILTER
===================================================== */
function initTTRFilter() {

  const witel = document.getElementById('ttr-filter-witel');
  const sto   = document.getElementById('ttr-filter-sto');
  const pic   = document.getElementById('ttr-filter-pic');

  witel.innerHTML = `<option value="">All Witel</option>`;
  sto.innerHTML   = `<option value="">All STO</option>`;
  pic.innerHTML   = `<option value="">All PIC</option>`;

  [...new Set(ttrRawData.map(d => d.WITEL).filter(Boolean))]
    .forEach(v => witel.innerHTML += `<option>${v}</option>`);

  [...new Set(ttrRawData.map(d => d.STO).filter(Boolean))]
    .forEach(v => sto.innerHTML += `<option>${v}</option>`);

  witel.onchange = renderTTRTable;
  sto.onchange   = renderTTRTable;
  pic.onchange   = renderTTRTable;
}

/* =====================================================
   RENDER TABLE
===================================================== */
function renderTTRTable() {

  const head = document.getElementById('ttr-table-head');
  const body = document.getElementById('ttr-table-body');
  const fw = document.getElementById('ttr-filter-witel').value;
  const fs = document.getElementById('ttr-filter-sto').value;

  head.innerHTML = '';
  body.innerHTML = '';

  ttrHeaders.forEach(h => {
    const th = document.createElement('th');
    th.innerHTML = formatHeaderLabel(h);
    th.style.textAlign = 'center';
    head.appendChild(th);
  });

  ttrRawData
    .filter(r => (!fw || r.WITEL === fw) && (!fs || r.STO === fs))
    .forEach(r => {

      const tr = document.createElement('tr');

      ttrHeaders.forEach(h => {

        const td = document.createElement('td');
        let val;

        if (h.includes('%')) val = fmtPercent(r[h]);
        else if (h.toLowerCase().includes('tiket')) val = fmtInt(r[h]);
        else val = fmt(r[h]);

        const detail = getTTRDetailType(currentType, h);

        if (detail && Number(r[h]) > 0) {
          td.innerHTML = `
            <span class="text-primary fw-bold"
              style="cursor:pointer;text-decoration:underline"
              onclick="openTTRDetail('${detail}','${r.STO}','${r.WITEL}')">
              ${val}
            </span>`;
        } else {
          td.innerHTML = val;
        }

        tr.appendChild(td);
      });

      body.appendChild(tr);
    });
}

/* =====================================================
   MODAL DETAIL (TETAP ADA)
===================================================== */
async function openTTRDetail(type, sto, witel) {

  const modal = document.getElementById('global-modal');
  const title = modal.querySelector('.modal-title');
  const body  = modal.querySelector('.modal-body');

  title.textContent = `${type} – ${witel} / ${sto}`;
  body.innerHTML = `<div class="text-center py-4">Loading...</div>`;
  new bootstrap.Modal(modal).show();

  const res = await fetch(
    `${API_URL}?type=${type}&sto=${sto}&witel=${witel}`
  );

  const json = await res.json();

  if (!json.data || !json.data.length) {
    body.innerHTML = `<div class="text-center text-muted">Tidak ada data</div>`;
    return;
  }

  body.innerHTML = `
    <div class="table-responsive">
      <table class="table table-sm table-bordered table-dark">
        <thead>
          <tr>${json.headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${json.data.map(r => `
            <tr>${json.headers.map(h => `<td>${r[h] ?? ''}</td>`).join('')}</tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

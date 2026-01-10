let ttrRawData = [];
let ttrHeaders = [];
let currentType = 'ttr_hsi_table';

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
              <span>${d.target}</span>
            </div>
            <div class="row-item">
              <span>Actual</span>
              <span class="${isGood ? 'value-good' : 'value-bad'}">
                ${d.ach}
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
   RENDER TABLE
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
      td.textContent = r[h] ?? '-';
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
}

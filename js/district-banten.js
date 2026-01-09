/* =====================================================
   INIT KPI
===================================================== */

function initDistrictBanten(API_URL) {
  const container = document.getElementById('district-banten-row');
  const loading = document.getElementById('loading-overlay');
  const lastUpdateEl = document.getElementById('last-update');

  if (!container) return;

  container.innerHTML = '';
  loading.style.display = 'flex';

  const cbKpi = 'jsonp_kpi_' + Date.now();

  window[cbKpi] = function (res) {
    try {
      const { data, lastUpdate } = res;

      /* ===== LAST UPDATE ===== */
      const d = new Date(lastUpdate);
      lastUpdateEl.innerHTML =
        `<i class="fa fa-clock me-1"></i> Last update: ` +
        d.toLocaleString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });

      /* ===== KPI ===== */
      const map = {};

      data.forEach(r => {
        if (!map[r.indikator]) {
          map[r.indikator] = {
            target: r.target,
            BANTEN: null,
            TANGERANG: null
          };
        }
        map[r.indikator][r.witel] = r.ach;
      });

      Object.entries(map).forEach(([indikator, v]) => {
        const lowerBetter = indikator === 'Q Gangguan HSI';
        const isGood = val =>
          lowerBetter ? val <= v.target : val >= v.target;

        const card = document.createElement('div');
        card.className =
          `badge-card ${isGood(v.BANTEN) ? 'card-good' : 'card-bad'}`;

        card.innerHTML = `
          <div class="badge-card-header">${indikator}</div>
          <div class="badge-card-body">
            <div class="row-item">
              <span>Target</span>
              <span>${v.target.toFixed(2)}</span>
            </div>
            <div class="row-item">
              <span>Banten</span>
              <span class="${isGood(v.BANTEN) ? 'value-good' : 'value-bad'}">
                ${v.BANTEN.toFixed(2)}
              </span>
            </div>
            <div class="row-item">
              <span>Tangerang</span>
              <span class="${isGood(v.TANGERANG) ? 'value-good' : 'value-bad'}">
                ${v.TANGERANG.toFixed(2)}
              </span>
            </div>
          </div>
        `;
        container.appendChild(card);
      });

      loadDistrictBantenTable(API_URL);

    } finally {
      loading.style.display = 'none';
      delete window[cbKpi];
      script.remove();
    }
  };

  const script = document.createElement('script');
  script.src = `${API_URL}?callback=${cbKpi}`;
  document.body.appendChild(script);
}

/* =====================================================
   TABLE
===================================================== */

function loadDistrictBantenTable(API_URL) {
  const thead = document.getElementById('district-banten-table-head');
  const tbody = document.getElementById('district-banten-table-body');
  const filterWitel = document.getElementById('filter-witel');
  const filterSto = document.getElementById('filter-sto');

  let rawData = [];
  let headers = [];

  const cbTable = 'jsonp_table_' + Date.now();

  window[cbTable] = function (res) {
    headers = res.headers;
    rawData = res.data;

    /* ===== TABLE HEAD ===== */
    thead.innerHTML = '';
    headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      thead.appendChild(th);
    });

    /* ===== FILTER STO ===== */
    const stoSet = new Set(rawData.map(r => r.STO).filter(Boolean));
    filterSto.innerHTML = '<option value="">All STO</option>';
    [...stoSet].sort().forEach(sto => {
      filterSto.innerHTML += `<option value="${sto}">${sto}</option>`;
    });

    filterWitel.onchange = filterSto.onchange = applyFilter;
    renderTable(rawData);
  };

  function applyFilter() {
    let data = [...rawData];
    if (filterWitel.value) data = data.filter(r => r.WITEL === filterWitel.value);
    if (filterSto.value) data = data.filter(r => r.STO === filterSto.value);
    renderTable(data);
  }

  function renderTable(data) {
    tbody.innerHTML = '';

    data.forEach(row => {
      const tr = document.createElement('tr');

      headers.forEach(h => {
        const td = document.createElement('td');

        /* ===== CLICK Tiket HI ===== */
        if (h === 'Tiket HI' && Number(row[h]) > 0) {
          td.innerHTML = `
            <a href="#" class="text-warning fw-bold text-decoration-none">
              ${row[h]}
            </a>`;
          td.onclick = e => {
            e.preventDefault();
            openTiketHIModal(API_URL, row.STO);
          };
        } else {
          td.textContent = row[h] ?? '-';
        }

        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
  }

  const script = document.createElement('script');
  script.src = `${API_URL}?type=table&callback=${cbTable}`;
  document.body.appendChild(script);
}

/* =====================================================
   MODAL DETAIL Tiket HI
===================================================== */

function openTiketHIModal(API_URL, sto, witel) {
  const title = document.getElementById('modalTiketHITitle');
  const head = document.getElementById('tiket-hi-head');
  const body = document.getElementById('tiket-hi-body');

  // === SET JUDUL MODAL ===
  title.textContent = `Detail Tiket HI – ${witel} / ${sto}`;

  head.innerHTML = '';
  body.innerHTML = `<tr><td colspan="9">Loading...</td></tr>`;

  const cols = [
    'Incident',
    'Summary',
    'Report Date',
    'Service Type',
    'WITEL',
    'LABOR TEKNISI',
    'TTR (Report Date s/d Resolved Date)',
    'Flag GAUL',
    'Old Tiket'
  ];

  const cb = 'jsonp_tiket_' + Date.now();

  window[cb] = function (res) {
    head.innerHTML = '';
    body.innerHTML = '';

    cols.forEach(c => {
      const th = document.createElement('th');
      th.textContent = c;
      head.appendChild(th);
    });

    if (!res.data || res.data.length === 0) {
      body.innerHTML = `
        <tr>
          <td colspan="${cols.length}" class="text-center">
            Tidak ada data
          </td>
        </tr>`;
    } else {
      res.data.forEach(r => {
        const tr = document.createElement('tr');
        cols.forEach(c => {
          const td = document.createElement('td');
          td.textContent = r[c] ?? '-';
          tr.appendChild(td);
        });
        body.appendChild(tr);
      });
    }

    delete window[cb];
    script.remove();
  };

  const script = document.createElement('script');
  script.src =
    `${API_URL}?type=tiket_hi_detail` +
    `&sto=${encodeURIComponent(sto)}` +
    `&callback=${cb}`;

  document.body.appendChild(script);

  new bootstrap.Modal(
    document.getElementById('modalTiketHI')
  ).show();
}

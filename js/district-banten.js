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

      // ================= LAST UPDATE =================
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

      // ================= KPI PROCESS =================
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

      // ================= LOAD TABLE =================
      loadDistrictBantenTable(API_URL);

    } catch (e) {
      container.innerHTML =
        '<div class="text-danger">Gagal memuat data KPI</div>';
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

/* =========================================================
   ================= TABLE + FILTER ========================
   ========================================================= */

function loadDistrictBantenTable(API_URL) {
  const thead = document.getElementById('district-banten-table-head');
  const tbody = document.getElementById('district-banten-table-body');
  const filterWitel = document.getElementById('filter-witel');
  const filterSto = document.getElementById('filter-sto');

  if (!thead || !tbody) return;

  let rawData = [];
  let headers = [];

  thead.innerHTML = '';
  tbody.innerHTML =
    `<tr><td colspan="10" class="text-center text-muted">Memuat data...</td></tr>`;

  const cbTable = 'jsonp_table_' + Date.now();

  window[cbTable] = function (res) {
    try {
      headers = res.headers;
      rawData = res.data;

      // ================= HEADER =================
      headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        thead.appendChild(th);
      });

      // ================= STO FILTER =================
      const stoSet = new Set(rawData.map(r => r.STO).filter(Boolean));
      filterSto.innerHTML = '<option value="">All STO</option>';
      [...stoSet].sort().forEach(sto => {
        const opt = document.createElement('option');
        opt.value = sto;
        opt.textContent = sto;
        filterSto.appendChild(opt);
      });

      filterWitel.onchange = filterSto.onchange = applyFilter;

      renderTable(rawData);

    } catch (e) {
      tbody.innerHTML =
        `<tr><td colspan="10" class="text-danger text-center">
          Gagal memuat data tabel
        </td></tr>`;
    } finally {
      delete window[cbTable];
      script.remove();
    }
  };

  function applyFilter() {
    let data = [...rawData];

    if (filterWitel.value) {
      data = data.filter(r => r.WITEL === filterWitel.value);
    }

    if (filterSto.value) {
      data = data.filter(r => r.STO === filterSto.value);
    }

    renderTable(data);
  }

  function renderTable(data) {
    tbody.innerHTML = '';

    if (!data.length) {
      tbody.innerHTML =
        `<tr><td colspan="${headers.length}" class="text-center text-muted">
          Tidak ada data
        </td></tr>`;
      return;
    }

    data.forEach(row => {
      const tr = document.createElement('tr');

      headers.forEach(h => {
        const td = document.createElement('td');

        // ========= KLIK TIKET HI =========
        if (h === 'Tiket HI' && Number(row[h]) > 0) {
          td.innerHTML = `
            <a href="#" class="text-warning fw-bold text-decoration-none">
              ${row[h]}
            </a>
          `;
          td.onclick = e => {
            e.preventDefault();
            openTiketHIModal(API_URL, row);
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

/* =========================================================
   ================= MODAL DETAIL TIKET HI =================
   ========================================================= */

function openTiketHIModal(API_URL, row) {
  const head = document.getElementById('tiket-hi-head');
  const body = document.getElementById('tiket-hi-body');

  head.innerHTML = '';
  body.innerHTML =
    `<tr><td class="text-muted">Memuat data...</td></tr>`;

  const cols = [
    'A', 'C', 'D', 'H', 'I',
    'J', 'AU', 'CG', 'CO', 'CP'
  ];

  const cb = 'jsonp_tiket_' + Date.now();

  window[cb] = function (res) {
    try {
      head.innerHTML = '';
      body.innerHTML = '';

      cols.forEach(c => {
        const th = document.createElement('th');
        th.textContent = c;
        head.appendChild(th);
      });

      res.data.forEach(r => {
        const tr = document.createElement('tr');
        cols.forEach(c => {
          const td = document.createElement('td');
          td.textContent = r[c] ?? '-';
          tr.appendChild(td);
        });
        body.appendChild(tr);
      });

    } finally {
      delete window[cb];
      script.remove();
    }
  };

  const script = document.createElement('script');
  script.src =
    `${API_URL}?type=tiket_hi` +
    `&witel=${encodeURIComponent(row.WITEL)}` +
    `&sto=${encodeURIComponent(row.STO)}` +
    `&callback=${cb}`;

  document.body.appendChild(script);

  new bootstrap.Modal(
    document.getElementById('modalTiketHI')
  ).show();
}

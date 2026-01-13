/* =====================================================
   INIT KPI – DISTRICT BANTEN
===================================================== */
function initDistrictBanten(API_URL) {

  const container = document.getElementById('district-banten-row');
  const loading = document.getElementById('alert-loading-overlay');
  const lastUpdateEl = document.getElementById('last-update');

  if (!container || !loading) return;

  container.innerHTML = '';
  loading.classList.remove('d-none');

  const cbKpi = 'jsonp_kpi_' + Date.now();

  window[cbKpi] = function (res) {
    try {

      const { data, lastUpdate } = res;

      /* ===== LAST UPDATE ===== */
      if (lastUpdate && lastUpdateEl) {
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
      }

      /* ===== KPI CARD ===== */
      const map = {};

      data.forEach(r => {
        if (!map[r.indikator]) {
          map[r.indikator] = {
            target: Number(r.target),
            BANTEN: null,
            TANGERANG: null
          };
        }
        map[r.indikator][r.witel] = Number(r.ach);
      });

      Object.entries(map).forEach(([indikator, v]) => {

        const lowerBetter = indikator === 'Q Gangguan HSI';
        const isGood = val =>
          typeof val === 'number' &&
          (lowerBetter ? val <= v.target : val >= v.target);

        const card = document.createElement('div');
        card.className =
          `badge-card ${isGood(v.BANTEN) ? 'card-good' : 'card-bad'}`;

        card.innerHTML = `
          <div class="badge-card-header">${indikator}</div>
          <div class="badge-card-body">
            <div class="row-item">
              <span>Target</span>
              <span>${v.target?.toFixed(2) ?? '-'}</span>
            </div>
            <div class="row-item">
              <span>Banten</span>
              <span class="${isGood(v.BANTEN) ? 'value-good' : 'value-bad'}">
                ${v.BANTEN?.toFixed(2) ?? '-'}
              </span>
            </div>
            <div class="row-item">
              <span>Tangerang</span>
              <span class="${isGood(v.TANGERANG) ? 'value-good' : 'value-bad'}">
                ${v.TANGERANG?.toFixed(2) ?? '-'}
              </span>
            </div>
          </div>
        `;

        container.appendChild(card);
      });

      loadDistrictBantenTable(API_URL);

    } finally {
      loading.classList.add('d-none');
      delete window[cbKpi];
      script.remove();
    }
  };

  const script = document.createElement('script');
  script.src = `${API_URL}?callback=${cbKpi}`;
  document.body.appendChild(script);
}

/* =====================================================
   TABLE + FILTER
===================================================== */
function loadDistrictBantenTable(API_URL) {

  const thead = document.getElementById('district-banten-table-head');
  const tbody = document.getElementById('district-banten-table-body');
  const filterWitel = document.getElementById('filter-witel');
  const filterSto = document.getElementById('filter-sto');
  const filterPic = document.getElementById('filter-pic');

  let rawData = [];
  let headers = [];

  const cbTable = 'jsonp_table_' + Date.now();

  window[cbTable] = function (res) {
    try {

      headers = res.headers || [];
      rawData = res.data || [];

      /* ===== TABLE HEAD ===== */
      thead.innerHTML = '';
      headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        thead.appendChild(th);
      });

      /* ===== FILTER ===== */
      const witelSet = new Set(rawData.map(r => r.WITEL).filter(Boolean));
      const stoSet = new Set(rawData.map(r => r.STO).filter(Boolean));
      const picSet = new Set(rawData.map(r => r.PIC).filter(Boolean));

      filterWitel.innerHTML = '<option value="">All WITEL</option>';
      [...witelSet].sort().forEach(v =>
        filterWitel.innerHTML += `<option value="${v}">${v}</option>`
      );

      filterSto.innerHTML = '<option value="">All STO</option>';
      [...stoSet].sort().forEach(v =>
        filterSto.innerHTML += `<option value="${v}">${v}</option>`
      );

      filterPic.innerHTML = '<option value="">All PIC</option>';
      [...picSet].sort().forEach(v =>
        filterPic.innerHTML += `<option value="${v}">${v}</option>`
      );

      filterWitel.onchange =
      filterSto.onchange =
      filterPic.onchange = applyFilter;

      applyFilter();

    } finally {
      delete window[cbTable];
      script.remove();
    }
  };

  function applyFilter() {
    let data = [...rawData];

    if (filterWitel.value) data = data.filter(r => r.WITEL === filterWitel.value);
    if (filterSto.value)   data = data.filter(r => r.STO === filterSto.value);
    if (filterPic.value)   data = data.filter(r => r.PIC === filterPic.value);

    renderTable(data);
  }

  function renderTable(data) {

    tbody.innerHTML = '';

    if (!data.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="${headers.length}" class="text-center text-muted">
            Tidak ada data
          </td>
        </tr>`;
      return;
    }

    data.forEach(row => {

      const tr = document.createElement('tr');

      /* ===== RULE UTAMA ===== */
      const budgVal = Number(row['Budg Q BI']);
      if (!isNaN(budgVal) && budgVal < 0) {
        tr.classList.add('tr-pragnosa-bad');
      }

      headers.forEach(h => {

        const td = document.createElement('td');

        /* ===== TIKET HI (CLICKABLE) ===== */
        if (h === 'Tiket HI' && Number(row[h]) > 0) {

          td.innerHTML = `
            <a href="#" class="text-warning fw-bold text-decoration-none tiket-hi-link">
              ${row[h]}
            </a>
          `;

          td.querySelector('.tiket-hi-link')
            .addEventListener('click', e => {
              e.preventDefault();
              openTiketHIModal(API_URL, row.STO, row.WITEL || '-');
            });

        /* ===== %Q s/d HI ===== */
        } else if (h === '%Q s/d HI') {
          const val = Number(row[h]);
          td.textContent = row[h] ?? '-';
          if (!isNaN(val) && val > 2) td.classList.add('text-danger','fw-bold');

        /* ===== BUDG Q BI ===== */
        } else if (h === 'Budg Q BI') {
          const val = Number(row[h]);
          td.textContent = row[h] ?? '-';
          if (!isNaN(val) && val < 0) td.classList.add('text-danger','fw-bold');

        /* ===== PRAGN Q BI ===== */
        } else if (h === 'Pragn Q BI') {
          const val = Number(row[h]);
          td.textContent = row[h] ?? '-';
          if (!isNaN(val) && val > 2) td.classList.add('text-danger','fw-bold');

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
   MODAL DETAIL – TIKET HI (IKUT POLA TTR / SQM)
===================================================== */
async function openTiketHIModal(API_URL, sto, witel) {

  const modal = document.getElementById('global-modal');
  const title = modal.querySelector('.modal-title');
  const body  = modal.querySelector('.modal-body');

  title.textContent = `Detail Tiket HI – ${witel} / ${sto}`;

  body.innerHTML = `
    <div class="text-center py-5">
      <span class="spinner-border"></span>
    </div>
  `;

  new bootstrap.Modal(modal).show();

  try {

    const res = await fetch(
      `${API_URL}?type=tiket_hi_detail&sto=${encodeURIComponent(sto)}&witel=${encodeURIComponent(witel)}`
    );

    const json = await res.json();

    if (!json.data || !json.data.length) {
      body.innerHTML = `
        <div class="text-center py-4 text-muted">
          Tidak ada data
        </div>`;
      return;
    }

    body.innerHTML = `
      <div class="table-responsive">
        <table class="table table-sm table-bordered table-dark align-middle">
          <thead class="table-secondary text-dark">
            <tr>
              ${json.headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${json.data.map(r => `
              <tr>
                ${json.headers.map(h => `<td>${r[h] ?? ''}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

  } catch (err) {

    console.error(err);
    body.innerHTML = `
      <div class="text-center py-4 text-danger">
        Gagal memuat data
      </div>
    `;
  }
}

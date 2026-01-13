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

      const { data = [], lastUpdate } = res;

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
              <span>${Number.isFinite(v.target) ? v.target.toFixed(2) : '-'}</span>
            </div>
            <div class="row-item">
              <span>Banten</span>
              <span class="${isGood(v.BANTEN) ? 'value-good' : 'value-bad'}">
                ${Number.isFinite(v.BANTEN) ? v.BANTEN.toFixed(2) : '-'}
              </span>
            </div>
            <div class="row-item">
              <span>Tangerang</span>
              <span class="${isGood(v.TANGERANG) ? 'value-good' : 'value-bad'}">
                ${Number.isFinite(v.TANGERANG) ? v.TANGERANG.toFixed(2) : '-'}
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

      thead.innerHTML = '';
      headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        thead.appendChild(th);
      });

      const buildOptions = (el, values, label) => {
        el.innerHTML = `<option value="">${label}</option>`;
        [...new Set(values.filter(Boolean))].sort()
          .forEach(v => el.innerHTML += `<option value="${v}">${v}</option>`);
      };

      buildOptions(filterWitel, rawData.map(r => r.WITEL), 'All WITEL');
      buildOptions(filterSto, rawData.map(r => r.STO), 'All STO');
      buildOptions(filterPic, rawData.map(r => r.PIC), 'All PIC');

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

      const budgVal = Number(row['Budg Q BI']);
      if (!isNaN(budgVal) && budgVal < 0) {
        tr.classList.add('tr-pragnosa-bad');
      }

      headers.forEach(h => {

        const td = document.createElement('td');

        if (h === 'Tiket HI' && Number(row[h]) > 0) {
          const a = document.createElement('a');
          a.href = '#';
          a.className = 'text-warning fw-bold text-decoration-none';
          a.textContent = row[h];

          a.onclick = e => {
            e.preventDefault();
            openTiketHIModal(API_URL, row.STO, row.WITEL || '-');
          };

          td.appendChild(a);
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
   GLOBAL MODAL HELPER (AUTO CREATE – AMAN)
===================================================== */
function getOrCreateGlobalModal() {

  let modal = document.getElementById('global-modal');
  if (modal) return modal;

  modal = document.createElement('div');
  modal.id = 'global-modal';
  modal.className = 'modal fade';
  modal.tabIndex = -1;

  modal.innerHTML = `
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
      <div class="modal-content bg-dark text-light">
        <div class="modal-header">
          <h5 class="modal-title"></h5>
          <button type="button"
            class="btn-close btn-close-white"
            data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body"></div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  return modal;
}

/* =====================================================
   OPEN DETAIL MODAL – TIKET HI (FIXED TYPE)
===================================================== */
async function openTiketHIModal(API_URL, sto, witel) {

  const modal = getOrCreateGlobalModal();
  const title = modal.querySelector('.modal-title');
  const body  = modal.querySelector('.modal-body');

  const titleMap = {
    tiket_hi_detail: 'Detail Tiket HI'
  };

  const type = 'tiket_hi_detail';

  title.textContent =
    `${titleMap[type]} – ${witel} / ${sto}`;

  body.innerHTML = `
    <div class="text-center py-5">
      <span class="spinner-border"></span>
    </div>
  `;

  new bootstrap.Modal(modal).show();

  try {
    const res = await fetch(
      `${API_URL}?type=${type}&sto=${encodeURIComponent(sto)}`
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
                ${json.headers.map(h => `<td>${r[h] ?? '-'}</td>`).join('')}
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

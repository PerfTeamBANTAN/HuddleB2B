function initAsgarHSI(API_URL) {

  const cardContainer = document.getElementById('asgar-hsi-row');
  const tableHead = document.getElementById('asgar-hsi-table-head');
  const tableBody = document.getElementById('asgar-hsi-table-body');
  const lastUpdateEl = document.getElementById('asgar-last-update');

  const filterWitel = document.getElementById('asgar-filter-witel');
  const filterSTO = document.getElementById('asgar-filter-sto');

  let rawTableData = [];
  let tableHeaders = [];

  cardContainer.innerHTML = '';
  tableHead.innerHTML = '';
  tableBody.innerHTML = '';

  /* =====================================================
     HELPER FORMAT ANGKA
  ===================================================== */
  function formatNumber(val) {
    if (val === null || val === undefined || val === '') return '-';
    if (typeof val !== 'number') return val;
    return Number.isInteger(val) ? val : val.toFixed(2);
  }

  /* =====================================================
     KPI CARD
  ===================================================== */
  const cbKpi = 'jsonp_asgar_kpi_' + Date.now();

  window[cbKpi] = res => {
    const map = {};

    res.data.forEach(r => {
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
            <span>${formatNumber(v.target)}</span>
          </div>
          <div class="row-item">
            <span>Banten</span>
            <span class="${isGood(v.BANTEN) ? 'value-good' : 'value-bad'}">
              ${formatNumber(v.BANTEN)}
            </span>
          </div>
          <div class="row-item">
            <span>Tangerang</span>
            <span class="${isGood(v.TANGERANG) ? 'value-good' : 'value-bad'}">
              ${formatNumber(v.TANGERANG)}
            </span>
          </div>
        </div>
      `;
      cardContainer.appendChild(card);
    });

    loadAsgarTable(API_URL);
    delete window[cbKpi];
    kpiScript.remove();
  };

  const kpiScript = document.createElement('script');
  kpiScript.src = `${API_URL}?callback=${cbKpi}`;
  document.body.appendChild(kpiScript);

  /* =====================================================
     LOAD TABLE
  ===================================================== */
  function loadAsgarTable(API_URL) {
    const cbTable = 'jsonp_asgar_table_' + Date.now();

    window[cbTable] = res => {

      rawTableData = res.data;
      tableHeaders = res.headers;

      const d = new Date(res.lastUpdate);
      lastUpdateEl.innerHTML =
        `<i class="fa fa-clock me-1"></i> Last update: ` +
        d.toLocaleString('id-ID');

      renderTable(rawTableData);
      initFilterSTO(rawTableData);

      delete window[cbTable];
      tableScript.remove();
    };

    const tableScript = document.createElement('script');
    tableScript.src = `${API_URL}?type=asgar_table&callback=${cbTable}`;
    document.body.appendChild(tableScript);
  }

  /* =====================================================
     RENDER TABLE
  ===================================================== */
  function renderTable(data) {
    tableHead.innerHTML = '';
    tableHeaders.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      tableHead.appendChild(th);
    });

    tableBody.innerHTML = '';

    if (!data.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="${tableHeaders.length}" class="text-center text-muted">
            Tidak ada data
          </td>
        </tr>`;
      return;
    }

    data.forEach(row => {
      const tr = document.createElement('tr');
      tableHeaders.forEach(h => {
        const td = document.createElement('td');
        td.textContent = formatNumber(row[h]);
        tr.appendChild(td);
      });
      tableBody.appendChild(tr);
    });
  }

  /* =====================================================
     INIT FILTER STO
  ===================================================== */
  function initFilterSTO(data) {
    const stoSet = new Set(data.map(r => r.STO).filter(Boolean));
    filterSTO.innerHTML = '<option value="">All STO</option>';

    [...stoSet].sort().forEach(sto => {
      const opt = document.createElement('option');
      opt.value = sto;
      opt.textContent = sto;
      filterSTO.appendChild(opt);
    });
  }

  /* =====================================================
     FILTER EVENT
  ===================================================== */
  filterWitel.addEventListener('change', applyFilter);
  filterSTO.addEventListener('change', applyFilter);

  function applyFilter() {
    const witel = filterWitel.value;
    const sto = filterSTO.value;

    let filtered = rawTableData;

    if (witel) {
      filtered = filtered.filter(r => r.WITEL === witel);
      initFilterSTO(filtered);
    }

    if (sto) {
      filtered = filtered.filter(r => r.STO === sto);
    }

    renderTable(filtered);
  }
}

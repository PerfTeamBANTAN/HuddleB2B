function initAsgarHSI(API_URL) {

  const cardContainer = document.getElementById('asgar-hsi-row');
  const tableHead = document.getElementById('asgar-hsi-table-head');
  const tableBody = document.getElementById('asgar-hsi-table-body');
  const lastUpdateEl = document.getElementById('asgar-last-update');

  const filterWitel = document.getElementById('asgar-filter-witel');
  const filterSTO = document.getElementById('asgar-filter-sto');

  let rawTableData = [];
  let tableHeaders = [];
  let rawTableDataHI = [];

  cardContainer.innerHTML = '';
  tableHead.innerHTML = '';
  tableBody.innerHTML = '';

  /* =====================================================
     FORMAT ANGKA
  ===================================================== */
  function formatNumber(val) {
    if (val === null || val === undefined || val === '') return '-';
    if (typeof val !== 'number') return val;
    return Number.isInteger(val) ? val : val.toFixed(2);
  }

  /* =====================================================
     RULE WARNA MERAH
  ===================================================== */
  function isRedCell(header, row) {
    const val = row[header];
    if (typeof val !== 'number') return false;

    if ((header === 'Asgar s/d HI' || header === 'Pragnosa Asgar') && val < 92) return true;
    if (header === 'Budg Asgar BI' && val <= 0) return true;
    if (header === 'Total Tiket Asgar' &&
        typeof row['Budg Asgar 30D'] === 'number' &&
        val > row['Budg Asgar 30D']) return true;
    if (header === 'Asgar HI' && val > 0) return true;

    return false;
  }

  /* =====================================================
     LOAD DATA TIKET HI (DETAIL)
  ===================================================== */
  function loadTiketHI(API_URL) {
    const cb = 'jsonp_tiket_hi_' + Date.now();

    window[cb] = res => {
      rawTableDataHI = res.data;
      delete window[cb];
      script.remove();
    };

    const script = document.createElement('script');
    script.src = `${API_URL}?type=tiket_hi&callback=${cb}`;
    document.body.appendChild(script);
  }

  loadTiketHI(API_URL);

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
      card.className = `badge-card ${isGood(v.BANTEN) ? 'card-good' : 'card-bad'}`;

      card.innerHTML = `
        <div class="badge-card-header">${indikator}</div>
        <div class="badge-card-body">
          <div class="row-item"><span>Target</span><span>${formatNumber(v.target)}</span></div>
          <div class="row-item"><span>Banten</span>
            <span class="${isGood(v.BANTEN) ? 'value-good' : 'value-bad'}">${formatNumber(v.BANTEN)}</span>
          </div>
          <div class="row-item"><span>Tangerang</span>
            <span class="${isGood(v.TANGERANG) ? 'value-good' : 'value-bad'}">${formatNumber(v.TANGERANG)}</span>
          </div>
        </div>`;
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
        `<i class="fa fa-clock me-1"></i> Last update: ${d.toLocaleString('id-ID')}`;

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
      tableBody.innerHTML = `<tr><td colspan="${tableHeaders.length}" class="text-center text-muted">Tidak ada data</td></tr>`;
      return;
    }

    data.forEach(row => {
      const tr = document.createElement('tr');

      tableHeaders.forEach(h => {
        const td = document.createElement('td');
        td.textContent = formatNumber(row[h]);

        if (isRedCell(h, row)) {
          td.classList.add('text-danger', 'fw-semibold');
        }

        // CLICKABLE DETAIL
        if (h === 'Tiket HI' || h === 'Asgar HI') {
          td.classList.add('text-info', 'fw-bold');
          td.style.cursor = 'pointer';
          td.addEventListener('click', () => openHIModal(h, row.WITEL));
        }

        tr.appendChild(td);
      });

      tableBody.appendChild(tr);
    });
  }

  /* =====================================================
     FILTER STO
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

  filterWitel.addEventListener('change', applyFilter);
  filterSTO.addEventListener('change', applyFilter);

  function applyFilter() {
    let filtered = rawTableData;
    if (filterWitel.value) {
      filtered = filtered.filter(r => r.WITEL === filterWitel.value);
      initFilterSTO(filtered);
    }
    if (filterSTO.value) {
      filtered = filtered.filter(r => r.STO === filterSTO.value);
    }
    renderTable(filtered);
  }

  /* =====================================================
     MODAL DETAIL HI
  ===================================================== */
  function openHIModal(type, witel) {
    const modal = new bootstrap.Modal(document.getElementById('modalHI'));
    const title = document.getElementById('modalHITitle');
    const head = document.getElementById('modal-hi-head');
    const body = document.getElementById('modal-hi-body');

    title.textContent = `Detail ${type} – ${witel}`;
    head.innerHTML = '';
    body.innerHTML = '';

    const headers = ['No Tiket','Customer','Produk','STO','Witel','Segment','Asgar HI','Status'];
    headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      head.appendChild(th);
    });

    const filtered = rawTableDataHI.filter(r => {
      if (r.WITEL !== witel) return false;
      if (r.CE !== 'Y') return false;
      if (type === 'Asgar HI' && r.CG !== 1) return false;
      return true;
    });

    if (!filtered.length) {
      body.innerHTML = `<tr><td colspan="8" class="text-center text-muted">Tidak ada data</td></tr>`;
    }

    filtered.forEach(r => {
      const tr = document.createElement('tr');
      ['A','C','D','H','K','AU','CG','CP'].forEach(c => {
        const td = document.createElement('td');
        td.textContent = r[c] ?? '-';
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });

    modal.show();
  }
}

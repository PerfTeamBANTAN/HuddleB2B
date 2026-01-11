/* =====================================================
   INIT KPI ASGAR HSI
===================================================== */
function initAsgarHSI(API_URL) {
  const container    = document.getElementById('asgar-hsi-row');
  const loading      = document.getElementById('asgar-loading-overlay');
  const lastUpdateEl = document.getElementById('asgar-last-update');

  if (!container) return;

  container.innerHTML = '';
  loading.classList.remove('d-none');

  const cbKpi = `jsonp_asgar_kpi_${Date.now()}`;

  window[cbKpi] = function (res) {
    try {
      const { data, lastUpdate } = res;

      /* ---------- LAST UPDATE ---------- */
      const d = new Date(lastUpdate);
      lastUpdateEl.innerHTML = `
        <i class="fa fa-clock me-1"></i>
        Last update: ${d.toLocaleString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })}
      `;

      /* ---------- GROUP KPI DATA ---------- */
      const map = {};
      data.forEach(r => {
        if (!map[r.indikator]) {
          map[r.indikator] = {
            target    : r.target,
            BANTEN    : null,
            TANGERANG : null
          };
        }
        map[r.indikator][r.witel] = r.ach;
      });

      /* ---------- RENDER KPI CARD ---------- */
      Object.entries(map).forEach(([indikator, v]) => {
        const lowerBetter = indikator === 'Q Gangguan HSI';

        const isGood = val =>
          typeof val === 'number' &&
          (lowerBetter ? val <= v.target : val >= v.target);

        const card = document.createElement('div');
        card.className = `badge-card ${
          isGood(v.BANTEN) ? 'card-good' : 'card-bad'
        }`;

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
                ${typeof v.BANTEN === 'number' ? v.BANTEN.toFixed(2) : '-'}
              </span>
            </div>

            <div class="row-item">
              <span>Tangerang</span>
              <span class="${isGood(v.TANGERANG) ? 'value-good' : 'value-bad'}">
                ${typeof v.TANGERANG === 'number'
                  ? v.TANGERANG.toFixed(2)
                  : '-'}
              </span>
            </div>

          </div>
        `;

        container.appendChild(card);
      });

      loadAsgarHSITable(API_URL);

    } finally {
      loading.classList.add('d-none');
      delete window[cbKpi];
      script.remove();
    }
  };

  const script = document.createElement('script');
  const joinChar = API_URL.includes('?') ? '&' : '?';
  script.src = `${API_URL}${joinChar}callback=${cbKpi}`;
  document.body.appendChild(script);
}

/* =====================================================
   TABLE ASGAR HSI
===================================================== */
function loadAsgarHSITable(API_URL) {
  const thead       = document.getElementById('asgar-hsi-table-head');
  const tbody       = document.getElementById('asgar-hsi-table-body');
  const filterWitel = document.getElementById('asgar-filter-witel');
  const filterSto   = document.getElementById('asgar-filter-sto');
  const filterPic   = document.getElementById('asgar-filter-pic');

  let rawData = [];
  let headers = [];

  const cbTable = `jsonp_asgar_table_${Date.now()}`;

  window[cbTable] = function (res) {
    headers = res.headers || [];
    rawData = res.data || [];

    /* ---------- TABLE HEADER ---------- */
    thead.innerHTML = '';
    headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      thead.appendChild(th);
    });

    /* ---------- FILTER OPTION ---------- */
    const witelSet = new Set(rawData.map(r => r.WITEL).filter(Boolean));
    const stoSet   = new Set(rawData.map(r => r.STO).filter(Boolean));
    const picSet   = new Set(rawData.map(r => r.PIC).filter(Boolean));

    filterWitel.innerHTML = '<option value="">All Witel</option>';
    [...witelSet].sort().forEach(w =>
      filterWitel.innerHTML += `<option value="${w}">${w}</option>`
    );

    filterSto.innerHTML = '<option value="">All STO</option>';
    [...stoSet].sort().forEach(s =>
      filterSto.innerHTML += `<option value="${s}">${s}</option>`
    );

    filterPic.innerHTML = '<option value="">All PIC</option>';
    [...picSet].sort().forEach(p =>
      filterPic.innerHTML += `<option value="${p}">${p}</option>`
    );

    filterWitel.onchange =
    filterSto.onchange   =
    filterPic.onchange   =
      applyFilter;

    renderTable(rawData);
  };

  /* ---------- FILTER ---------- */
  function applyFilter() {
    let data = [...rawData];

    if (filterWitel.value)
      data = data.filter(r => r.WITEL === filterWitel.value);

    if (filterSto.value)
      data = data.filter(r => r.STO === filterSto.value);

    if (filterPic.value)
      data = data.filter(r => r.PIC === filterPic.value);

    renderTable(data);
  }

  /* ---------- RENDER TABLE ---------- */
  function renderTable(data) {
    tbody.innerHTML = '';

    if (!data.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="${headers.length}" class="text-center text-muted">
            Tidak ada data
          </td>
        </tr>
      `;
      return;
    }

    data.forEach(row => {
      const tr = document.createElement('tr');

      headers.forEach(h => {
        const td  = document.createElement('td');
        const val = row[h];

        if (h === 'Asgar HI' && Number(val) > 0) {
          td.innerHTML = `
            <a href="#" class="text-danger fw-bold text-decoration-none">
              ${val}
            </a>
          `;
          td.onclick = e => {
            e.preventDefault();
            openAsgarHIModal(API_URL, row.STO, row.WITEL || '-');
          };

        } else if (h === 'Tiket HI' && Number(val) > 0) {
          td.innerHTML = `
            <a href="#" class="text-info fw-bold text-decoration-none">
              ${val}
            </a>
          `;
          td.onclick = e => {
            e.preventDefault();
            openTiketHIModal(API_URL, row.STO, row.WITEL || '-');
          };

        } else {
          td.textContent =
            typeof val === 'number'
              ? (Number.isInteger(val) ? val : val.toFixed(2))
              : (val ?? '-');

          if (
            (h === 'Asgar s/d HI' || h === 'Pragnosa Asgar') &&
            Number(val) < 92
          ) td.classList.add('text-danger', 'fw-bold');

          if (h === 'Budg Asgar BI' && Number(val) <= 0)
            td.classList.add('text-danger', 'fw-bold');

          if (
            h === 'Total Tiket Asgar' &&
            Number(val) > Number(row['Budg Asgar 30D'])
          ) td.classList.add('text-danger', 'fw-bold');

          if (h === 'Asgar HI' && Number(val) > 0)
            td.classList.add('text-danger', 'fw-bold');

          if (h === 'Vol. Tiket %Ach' && Number(val) >= 0)
            td.classList.add('text-danger', 'fw-bold');
        }

        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
  }

  const script = document.createElement('script');
  const joinChar = API_URL.includes('?') ? '&' : '?';
  script.src = `${API_URL}${joinChar}type=asgar_table&callback=${cbTable}`;
  document.body.appendChild(script);
}

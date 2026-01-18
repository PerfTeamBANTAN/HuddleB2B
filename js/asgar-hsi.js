/* =====================================================
   INIT KPI ASGAR HSI
===================================================== */
function initAsgarHSI(API_URL) {
  const container = document.getElementById('asgar-hsi-row');
  const loading = document.getElementById('asgar-loading-overlay');
  const lastUpdateEl = document.getElementById('asgar-last-update');

  if (!container) return;

  container.innerHTML = '';
  if (loading) loading.classList.remove('d-none');

  const cbKpi = 'jsonp_asgar_kpi_' + Date.now();

  window[cbKpi] = function (res) {
    try {
      const { data, lastUpdate } = res;

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

      loadAsgarHSITable(API_URL);

    } finally {
      if (loading) loading.classList.add('d-none');
      delete window[cbKpi];
      script.remove();
    }
  };

  const script = document.createElement('script');
  script.src = `${API_URL}?callback=${cbKpi}`;
  document.body.appendChild(script);
}

/* =====================================================
   TABLE ASGAR HSI (+ FILTER PIC)
===================================================== */
function loadAsgarHSITable(API_URL) {
  const thead = document.getElementById('asgar-hsi-table-head');
  const tbody = document.getElementById('asgar-hsi-table-body');
  const filterWitel = document.getElementById('asgar-filter-witel');
  const filterSto = document.getElementById('asgar-filter-sto');
  const filterPic = document.getElementById('asgar-filter-pic');

  let rawData = [];
  let headers = [];

  const cbTable = 'jsonp_asgar_table_' + Date.now();

  window[cbTable] = function (res) {
    headers = res.headers;
    rawData = res.data;

    thead.innerHTML = '';
    headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      thead.appendChild(th);
    });

    const witelSet = new Set(rawData.map(r => r.WITEL).filter(Boolean));
    const stoSet = new Set(rawData.map(r => r.STO).filter(Boolean));
    const picSet = new Set(rawData.map(r => r.PIC).filter(Boolean));

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
    filterSto.onchange =
    filterPic.onchange = applyFilter;

    renderTable(rawData);
  };

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

      if (
        row['Pragnosa Asgar Final BI'] &&
        String(row['Pragnosa Asgar Final BI']).toLowerCase().includes('tidak')
      ) {
        tr.classList.add('tr-pragnosa-bad');
      }

      headers.forEach(h => {
        const td = document.createElement('td');
        const val = row[h];

        if (h === 'Asgar HI' && Number(val) > 0) {
          td.innerHTML = `<a href="#" class="text-danger fw-bold text-decoration-none">${val}</a>`;
          td.onclick = e => {
            e.preventDefault();
            openAsgarHIModal(API_URL, row.STO, row.WITEL || '-');
          };

        } else if (h === 'Tiket HI' && Number(val) > 0) {
          td.innerHTML = `<a href="#" class="text-info fw-bold text-decoration-none">${val}</a>`;
          td.onclick = e => {
            e.preventDefault();
            openTiketHIModal(API_URL, row.STO, row.WITEL || '-');
          };

        } else if (h === 'Total Tiket s/d HI' && Number(val) > 0) {

  td.innerHTML = `<a href="#" class="text-primary fw-bold text-decoration-none">${val}</a>`;
  td.onclick = e => {
    e.preventDefault();
    openTotalSdHIModal(API_URL, row.STO, row.WITEL || '-');
  };

        } else if (h === 'Total Tiket Asgar' && Number(val) > 0) {

  td.innerHTML = `<a href="#" class="text-primary fw-bold text-decoration-none">${val}</a>`;
  td.onclick = e => {
    e.preventDefault();
    openTotalTiketAsgarModal(API_URL, row.STO, row.WITEL || '-');
  };

} else {
  td.textContent =
    typeof val === 'number'
      ? (Number.isInteger(val) ? val : val.toFixed(2))
      : (val ?? '-');
}


        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
  }

  const script = document.createElement('script');
  script.src = `${API_URL}?type=asgar_table&callback=${cbTable}`;
  document.body.appendChild(script);
}

/* =====================================================
   MODAL DETAIL ASGAR HI
===================================================== */
function openAsgarHIModal(API_URL, sto, witel) {
  const title = document.getElementById('modalTiketHITitle');
  const head = document.getElementById('tiket-hi-head');
  const body = document.getElementById('tiket-hi-body');

  title.textContent = `Detail Asgar HI – ${witel} / ${sto}`;

  const cols = [
    'INCIDENT','SUMMARY','CUSTOMER SEGMENT','SERVICE TYPE',
    'STATUS','SERVICE ID','TECHNICIAN','GAUL HSI','IN LAMA HSI'
  ];

  head.innerHTML = '';
  body.innerHTML = `<tr><td colspan="${cols.length}">Loading...</td></tr>`;

  const cb = 'jsonp_asgar_hi_' + Date.now();

  window[cb] = function (res) {
    head.innerHTML = '';
    body.innerHTML = '';

    cols.forEach(c => {
      const th = document.createElement('th');
      th.textContent = c;
      head.appendChild(th);
    });

    if (!res.data || !res.data.length) {
      body.innerHTML = `<tr><td colspan="${cols.length}" class="text-center text-muted">Tidak ada data</td></tr>`;
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
  script.src = `${API_URL}?type=asgar_hi_detail&sto=${encodeURIComponent(sto)}&callback=${cb}`;
  document.body.appendChild(script);

  new bootstrap.Modal(document.getElementById('modalTiketHI')).show();
}

/* =====================================================
   MODAL DETAIL TOTAL TIKET s/d HI (FULL DATA)
===================================================== */
function openTotalSdHIModal(API_URL, sto, witel) {
  const title = document.getElementById('modalTiketHITitle');
  const head  = document.getElementById('tiket-hi-head');
  const body  = document.getElementById('tiket-hi-body');

  title.textContent = `Detail Total Tiket s/d HI – ${witel} / ${sto}`;

  head.innerHTML = '';
  body.innerHTML = `<tr><td>Loading...</td></tr>`;

  const cb = 'jsonp_total_sd_hi_' + Date.now();

  window[cb] = function (res) {
    head.innerHTML = '';
    body.innerHTML = '';

    const headers = res.headers || [];
    const data = res.data || [];

    if (!headers.length) {
      body.innerHTML = `<tr><td class="text-center text-muted">Tidak ada data</td></tr>`;
      return;
    }

    /* ===== HEADER TABLE ===== */
    headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      head.appendChild(th);
    });

    /* ===== BODY ===== */
    if (!data.length) {
      body.innerHTML =
        `<tr><td colspan="${headers.length}" class="text-center text-muted">
          Tidak ada data
        </td></tr>`;
    } else {
      data.forEach(r => {
        const tr = document.createElement('tr');
        headers.forEach(h => {
          const td = document.createElement('td');
          td.textContent = r[h] ?? '-';
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
    `${API_URL}?type=total_sd_hi_detail&sto=${encodeURIComponent(sto)}&callback=${cb}`;
  document.body.appendChild(script);

  new bootstrap.Modal(document.getElementById('modalTiketHI')).show();
}
   
/* =====================================================
   MODAL DETAIL TOTAL ASGAR TIKET s/d HI (FULL DATA)
===================================================== */
   function openTotalTiketAsgarModal(API_URL, sto, witel) {

  const title = document.getElementById('modalTiketHITitle');
  const head  = document.getElementById('tiket-hi-head');
  const body  = document.getElementById('tiket-hi-body');

  title.textContent = `Detail Total Tiket Asgar – ${witel} / ${sto}`;

  head.innerHTML = '';
  body.innerHTML = `<tr><td>Loading...</td></tr>`;

  const cb = 'jsonp_asgar_' + Date.now();

  window[cb] = function (res) {

    head.innerHTML = '';
    body.innerHTML = '';

    const headers = res.headers || [];
    const data = res.data || [];

    headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      head.appendChild(th);
    });

    if (!data.length) {
      body.innerHTML =
        `<tr><td colspan="${headers.length}" class="text-center text-muted">
          Tidak ada data
        </td></tr>`;
    } else {
      data.forEach(r => {
        const tr = document.createElement('tr');
        headers.forEach(h => {
          const td = document.createElement('td');
          td.textContent = r[h] ?? '-';
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
    `${API_URL}?type=total_tiket_asgar_detail&sto=${encodeURIComponent(sto)}&callback=${cb}`;

  document.body.appendChild(script);

  new bootstrap.Modal(document.getElementById('modalTiketHI')).show();
}


/* =====================================================
   MODAL DETAIL TIKET HI
===================================================== */
function openTiketHIModal(API_URL, sto, witel) {
  const title = document.getElementById('modalTiketHITitle');
  const head = document.getElementById('tiket-hi-head');
  const body = document.getElementById('tiket-hi-body');

  title.textContent = `Detail Tiket HI – ${witel} / ${sto}`;

  const cols = [
    'Incident','Summary','Report Date','Service Type',
    'WITEL','LABOR TEKNISI',
    'TTR (Report Date s/d Resolved Date)','Flag GAUL','Old Tiket'
  ];

  head.innerHTML = '';
  body.innerHTML = `<tr><td colspan="${cols.length}">Loading...</td></tr>`;

  const cb = 'jsonp_tiket_hi_' + Date.now();

  window[cb] = function (res) {
    head.innerHTML = '';
    body.innerHTML = '';

    cols.forEach(c => {
      const th = document.createElement('th');
      th.textContent = c;
      head.appendChild(th);
    });

    if (!res.data || !res.data.length) {
      body.innerHTML = `<tr><td colspan="${cols.length}" class="text-center text-muted">Tidak ada data</td></tr>`;
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
  script.src = `${API_URL}?type=tiket_hi_detail&sto=${encodeURIComponent(sto)}&callback=${cb}`;
  document.body.appendChild(script);

  new bootstrap.Modal(document.getElementById('modalTiketHI')).show();
}

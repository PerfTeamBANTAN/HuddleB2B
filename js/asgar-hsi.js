function initAsgarHSI(API_URL) {

  const cardContainer = document.getElementById('asgar-hsi-row');
  const tableHead = document.getElementById('asgar-hsi-table-head');
  const tableBody = document.getElementById('asgar-hsi-table-body');
  const lastUpdateEl = document.getElementById('asgar-last-update');

  const filterWitel = document.getElementById('asgar-filter-witel');
  const filterSTO = document.getElementById('asgar-filter-sto');

  let rawData = [];
  let headers = [];

  /* ================= FORMAT ================= */
  const fmt = v =>
    v === null || v === undefined || v === ''
      ? '-'
      : typeof v === 'number'
        ? Number.isInteger(v) ? v : v.toFixed(2)
        : v;

  /* ================= KPI ================= */
  function loadKPI() {
    const cb = 'cb_kpi_' + Date.now();
    window[cb] = res => {
      const map = {};
      res.data.forEach(r => {
        if (!map[r.indikator]) {
          map[r.indikator] = { target: r.target, BANTEN: null, TANGERANG: null };
        }
        map[r.indikator][r.witel] = r.ach;
      });

      cardContainer.innerHTML = '';
      Object.entries(map).forEach(([k, v]) => {
        const lowerBetter = k === 'Q Gangguan HSI';
        const good = x => typeof x === 'number' && (lowerBetter ? x <= v.target : x >= v.target);

        const card = document.createElement('div');
        card.className = `badge-card ${good(v.BANTEN) ? 'card-good' : 'card-bad'}`;
        card.innerHTML = `
          <div class="badge-card-header">${k}</div>
          <div class="badge-card-body">
            <div class="row-item"><span>Target</span><span>${v.target}</span></div>
            <div class="row-item"><span>Banten</span><span class="${good(v.BANTEN)?'value-good':'value-bad'}">${fmt(v.BANTEN)}</span></div>
            <div class="row-item"><span>Tangerang</span><span class="${good(v.TANGERANG)?'value-good':'value-bad'}">${fmt(v.TANGERANG)}</span></div>
          </div>`;
        cardContainer.appendChild(card);
      });

      delete window[cb];
      s.remove();
    };
    const s = document.createElement('script');
    s.src = `${API_URL}?callback=${cb}`;
    document.body.appendChild(s);
  }

  /* ================= TABLE ================= */
  function loadTable() {
    const cb = 'cb_tbl_' + Date.now();
    window[cb] = res => {

      headers = [...res.headers];
      rawData = res.data;

      lastUpdateEl.innerHTML =
        `<i class="fa fa-clock me-1"></i> Last update: ${new Date().toLocaleString('id-ID')}`;

      render(rawData);
      initFilter();

      delete window[cb];
      s.remove();
    };
    const s = document.createElement('script');
    s.src = `${API_URL}?type=table&callback=${cb}`;
    document.body.appendChild(s);
  }

  /* ================= RENDER ================= */
  function render(data) {
    tableHead.innerHTML = '';
    headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      tableHead.appendChild(th);
    });

    tableBody.innerHTML = '';
    data.forEach(r => {
      const tr = document.createElement('tr');

      headers.forEach(h => {
        const td = document.createElement('td');
        td.textContent = fmt(r[h]);

        /* ===== CONDITIONAL COLOR ===== */
        if ((h === 'Asgar s/d HI' || h === 'Pragnosa Asgar') && r[h] < 92)
          td.classList.add('text-danger','fw-semibold');

        if (h === 'Budg Asgar BI' && r[h] <= 0)
          td.classList.add('text-danger','fw-semibold');

        if (h === 'Total Tiket Asgar' && r[h] > r['Budg Asgar 30D'])
          td.classList.add('text-danger','fw-semibold');

        if (h === 'Asgar HI' && r[h] > 0)
          td.classList.add('text-danger','fw-semibold');

        /* ===== CLICKABLE ===== */
        if (h === 'Tiket HI' || h === 'Asgar HI') {
          td.classList.add('text-info','fw-bold');
          td.style.cursor = 'pointer';
          td.onclick = () => openDetail(r.STO);
        }

        tr.appendChild(td);
      });

      tableBody.appendChild(tr);
    });
  }

  /* ================= FILTER ================= */
  function initFilter() {
    const stos = [...new Set(rawData.map(r => r.STO).filter(Boolean))];
    filterSTO.innerHTML = '<option value="">All STO</option>';
    stos.sort().forEach(s => {
      const o = document.createElement('option');
      o.value = s;
      o.textContent = s;
      filterSTO.appendChild(o);
    });
  }

  function applyFilter() {
    let d = rawData;
    if (filterWitel.value) d = d.filter(r => r.WITEL === filterWitel.value);
    if (filterSTO.value) d = d.filter(r => r.STO === filterSTO.value);
    render(d);
  }

  filterWitel.onchange = applyFilter;
  filterSTO.onchange = applyFilter;

  /* ================= MODAL DETAIL ================= */
  function openDetail(sto) {
    const modal = new bootstrap.Modal(document.getElementById('modalTiketHI'));
    document.getElementById('modalTiketHITitle').textContent = `Detail Tiket HI – ${sto}`;

    const head = document.getElementById('tiket-hi-head');
    const body = document.getElementById('tiket-hi-body');

    head.innerHTML = '';
    body.innerHTML = '<tr><td colspan="20" class="text-center">Loading...</td></tr>';

    const cb = 'cb_detail_' + Date.now();
    window[cb] = res => {

      head.innerHTML = '';
      res.headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        head.appendChild(th);
      });

      body.innerHTML = '';
      if (!res.data.length) {
        body.innerHTML = `<tr><td colspan="${res.headers.length}" class="text-center text-muted">Tidak ada data</td></tr>`;
      } else {
        res.data.forEach(r => {
          const tr = document.createElement('tr');
          res.headers.forEach(h => {
            const td = document.createElement('td');
            td.textContent = r[h] ?? '-';
            tr.appendChild(td);
          });
          body.appendChild(tr);
        });
      }

      modal.show();
      delete window[cb];
      s.remove();
    };

    const s = document.createElement('script');
    s.src = `${API_URL}?type=tiket_hi_detail&sto=${sto}&callback=${cb}`;
    document.body.appendChild(s);
  }

  /* ================= INIT ================= */
  loadKPI();
  loadTable();
}

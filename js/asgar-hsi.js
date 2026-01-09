function initAsgarHSI(API_URL) {

  const cardContainer = document.getElementById('asgar-hsi-row');
  const tableHead = document.getElementById('asgar-hsi-table-head');
  const tableBody = document.getElementById('asgar-hsi-table-body');
  const lastUpdateEl = document.getElementById('asgar-last-update');

  const filterWitel = document.getElementById('asgar-filter-witel');
  const filterSTO = document.getElementById('asgar-filter-sto');

  let rawAsgarData = [];
  let tiketHIMap = {};
  let tableHeaders = [];

  /* ================= FORMAT ================= */
  function formatNumber(v) {
    if (v === null || v === undefined || v === '') return '-';
    if (typeof v !== 'number') return v;
    return Number.isInteger(v) ? v : v.toFixed(2);
  }

  /* ================= WARNA MERAH ================= */
  function isRedCell(h, r) {
    const v = r[h];
    if (typeof v !== 'number') return false;

    if ((h === 'Asgar s/d HI' || h === 'Pragnosa Asgar') && v < 92) return true;
    if (h === 'Budg Asgar BI' && v <= 0) return true;
    if (h === 'Total Tiket Asgar' && v > r['Budg Asgar 30D']) return true;
    if (h === 'Asgar HI' && v > 0) return true;

    return false;
  }

  /* ================= LOAD COUNT Tiket HI ================= */
  function loadTiketCount() {
    return new Promise(resolve => {
      const cb = 'cb_tiket_' + Date.now();
      window[cb] = res => {
        res.data.forEach(r => {
          tiketHIMap[r.STO] = r['Tiket HI'] || 0;
        });
        delete window[cb];
        script.remove();
        resolve();
      };
      const script = document.createElement('script');
      script.src = `${API_URL}?type=table&callback=${cb}`;
      document.body.appendChild(script);
    });
  }

  /* ================= LOAD ASGAR TABLE ================= */
  function loadAsgarTable() {
    const cb = 'cb_asgar_' + Date.now();
    window[cb] = res => {
      rawAsgarData = res.data.map(r => ({
        ...r,
        'Tiket HI': tiketHIMap[r.STO] || 0,
        'Asgar HI': tiketHIMap[r.STO] || 0
      }));

      tableHeaders = res.headers;
      if (!tableHeaders.includes('Tiket HI')) tableHeaders.push('Tiket HI');
      if (!tableHeaders.includes('Asgar HI')) tableHeaders.push('Asgar HI');

      lastUpdateEl.innerHTML =
        `<i class="fa fa-clock me-1"></i> Last update: ${new Date(res.lastUpdate).toLocaleString('id-ID')}`;

      renderTable(rawAsgarData);
      initSTOFilter(rawAsgarData);

      delete window[cb];
      script.remove();
    };

    const script = document.createElement('script');
    script.src = `${API_URL}?type=asgar_table&callback=${cb}`;
    document.body.appendChild(script);
  }

  /* ================= RENDER TABLE ================= */
  function renderTable(data) {
    tableHead.innerHTML = '';
    tableHeaders.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      tableHead.appendChild(th);
    });

    tableBody.innerHTML = '';

    data.forEach(r => {
      const tr = document.createElement('tr');

      tableHeaders.forEach(h => {
        const td = document.createElement('td');
        td.textContent = formatNumber(r[h]);

        if (isRedCell(h, r)) td.classList.add('text-danger', 'fw-semibold');

        if (h === 'Tiket HI' || h === 'Asgar HI') {
          td.classList.add('text-info', 'fw-bold');
          td.style.cursor = 'pointer';
          td.onclick = () => openDetailModal(r.STO);
        }

        tr.appendChild(td);
      });

      tableBody.appendChild(tr);
    });
  }

  /* ================= FILTER ================= */
  function initSTOFilter(data) {
    const stoSet = [...new Set(data.map(r => r.STO).filter(Boolean))];
    filterSTO.innerHTML = '<option value="">All STO</option>';
    stoSet.sort().forEach(s => {
      const o = document.createElement('option');
      o.value = s;
      o.textContent = s;
      filterSTO.appendChild(o);
    });
  }

  function applyFilter() {
    let d = rawAsgarData;
    if (filterWitel.value) d = d.filter(r => r.WITEL === filterWitel.value);
    if (filterSTO.value) d = d.filter(r => r.STO === filterSTO.value);
    renderTable(d);
  }

  filterWitel.onchange = applyFilter;
  filterSTO.onchange = applyFilter;

  /* ================= MODAL ================= */
  function openDetailModal(sto) {
    const modal = new bootstrap.Modal(document.getElementById('modalHI'));
    const head = document.getElementById('modal-hi-head');
    const body = document.getElementById('modal-hi-body');
    document.getElementById('modalHITitle').textContent = `Detail Tiket HI – ${sto}`;

    head.innerHTML = '';
    body.innerHTML = '';

    const cols = ['Incident','Summary','Report Date','Service Type','WITEL','LABOR TEKNISI','TTR','Flag GAUL','Old Tiket'];
    cols.forEach(c => {
      const th = document.createElement('th');
      th.textContent = c;
      head.appendChild(th);
    });

    const cb = 'cb_detail_' + Date.now();
    window[cb] = res => {
      res.data.forEach(r => {
        const tr = document.createElement('tr');
        Object.values(r).forEach(v => {
          const td = document.createElement('td');
          td.textContent = v ?? '-';
          tr.appendChild(td);
        });
        body.appendChild(tr);
      });
      delete window[cb];
      script.remove();
      modal.show();
    };

    const script = document.createElement('script');
    script.src = `${API_URL}?type=tiket_hi_detail&sto=${sto}&callback=${cb}`;
    document.body.appendChild(script);
  }

  /* ================= INIT ================= */
  loadTiketCount().then(loadAsgarTable);
}

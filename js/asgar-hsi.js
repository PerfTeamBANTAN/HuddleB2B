function initAsgarHSI(API_URL) {

  const cardContainer = document.getElementById('asgar-hsi-row');
  const tableHead = document.getElementById('asgar-hsi-table-head');
  const tableBody = document.getElementById('asgar-hsi-table-body');
  const lastUpdateEl = document.getElementById('asgar-last-update');

  cardContainer.innerHTML = '';
  tableHead.innerHTML = '';
  tableBody.innerHTML = '';

  /* =====================================================
     KPI CARD (SAMA DENGAN DISTRICT BANTEN)
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
            <span>${v.target}</span>
          </div>
          <div class="row-item">
            <span>Banten</span>
            <span class="${isGood(v.BANTEN) ? 'value-good' : 'value-bad'}">
              ${v.BANTEN ?? '-'}
            </span>
          </div>
          <div class="row-item">
            <span>Tangerang</span>
            <span class="${isGood(v.TANGERANG) ? 'value-good' : 'value-bad'}">
              ${v.TANGERANG ?? '-'}
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
     TABLE
  ===================================================== */
  function loadAsgarTable(API_URL) {
    const cbTable = 'jsonp_asgar_table_' + Date.now();

    window[cbTable] = res => {

      const d = new Date(res.lastUpdate);
      lastUpdateEl.innerHTML =
        `<i class="fa fa-clock me-1"></i> Last update: ` +
        d.toLocaleString('id-ID');

      tableHead.innerHTML = '';
      res.headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        tableHead.appendChild(th);
      });

      tableBody.innerHTML = '';
      res.data.forEach(row => {
        const tr = document.createElement('tr');
        res.headers.forEach(h => {
          const td = document.createElement('td');
          td.textContent = row[h] ?? '-';
          tr.appendChild(td);
        });
        tableBody.appendChild(tr);
      });

      delete window[cbTable];
      tableScript.remove();
    };

    const tableScript = document.createElement('script');
    tableScript.src = `${API_URL}?type=asgar_table&callback=${cbTable}`;
    document.body.appendChild(tableScript);
  }
}

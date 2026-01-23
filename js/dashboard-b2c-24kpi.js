/* =====================================================
   B2C DASHBOARD RENDER SCRIPT
   NEXT LEVEL • PRODUCTION SAFE (V3 + GROWTH)
===================================================== */

window.B2C24KPI = window.B2C24KPI || (function () {

  /* ===============================
     CONFIG
  =============================== */
  const GROWTH_DROP_ALERT = 5; // % threshold turun → danger

  /* ===============================
     HELPERS
  =============================== */
  const fmt = (v) => {
    if (v === null || v === undefined || isNaN(v)) return '-';
    return Number(v).toLocaleString('id-ID', { maximumFractionDigits: 2 });
  };

  const isGood = (val, target) =>
    typeof val === 'number' &&
    typeof target === 'number' &&
    val >= target;

  const getGrowthMeta = (today, yesterday) => {
    if (isNaN(today) || isNaN(yesterday)) {
      return { icon: '-', color: 'secondary', tooltip: 'Data tidak tersedia' };
    }

    const diff = +(today - yesterday).toFixed(2);

    if (diff > 0) {
      return {
        icon: '🔼',
        color: 'success',
        tooltip: `Naik +${diff}% (HI ${today}% vs ${yesterday}%)`
      };
    }

    if (diff < 0) {
      return {
        icon: '🔽',
        color: Math.abs(diff) >= GROWTH_DROP_ALERT ? 'danger' : 'warning',
        tooltip: `Turun ${diff}% (HI ${today}% vs ${yesterday}%)`
      };
    }

    return {
      icon: '↔️',
      color: 'secondary',
      tooltip: `Stagnan (${today}%)`
    };
  };

  /* ===============================
     SKELETON LOADER
  =============================== */
  function showSkeleton() {
    document.getElementById('b2cSummary').innerHTML = `
      <div class="col-md-4 skeleton-card"></div>
      <div class="col-md-4 skeleton-card"></div>
      <div class="col-md-4 skeleton-card"></div>
    `;

    document.getElementById('b2cKpiGrid').innerHTML = `
      <div id="b2cKpiSkeleton" class="row g-3">
        ${'<div class="col-md-3 skeleton-kpi"></div>'.repeat(8)}
      </div>
    `;
  }

  function hideSkeleton() {
    const sk = document.getElementById('b2cKpiSkeleton');
    if (sk) sk.remove();
  }

  /* ===============================
     GROUP BY KATEGORI
  =============================== */
  function groupByKategori(data) {
    return data.reduce((acc, item) => {
      if (!acc[item.kategori]) acc[item.kategori] = [];
      acc[item.kategori].push(item);
      return acc;
    }, {});
  }

  /* ===============================
     RENDER SUMMARY
  =============================== */
  function renderSummary(api) {
    const { summary, lastUpdate } = api;

    const lastEl = document.getElementById('b2cLastUpdate');
    if (lastEl) lastEl.innerText = `Last Update : ${lastUpdate}`;

    document.getElementById('b2cSummary').innerHTML = `
      <div class="col-md-4"><div class="summary-card">
        <h6>TANGERANG</h6>
        <div class="summary-value">${fmt(summary.totalAch?.tangerang)}%</div>
        <div class="summary-sub">✅ ${summary.good} ❌ ${summary.bad}</div>
      </div></div>

      <div class="col-md-4"><div class="summary-card">
        <h6>BANTEN</h6>
        <div class="summary-value">${fmt(summary.totalAch?.banten)}%</div>
        <div class="summary-sub">✅ ${summary.good} ❌ ${summary.bad}</div>
      </div></div>

      <div class="col-md-4"><div class="summary-card">
        <h6>TOTAL KPI</h6>
        <div class="summary-value">${summary.totalKPI}</div>
        <div class="summary-sub">GOOD ${summary.good} | BAD ${summary.bad}</div>
      </div></div>
    `;
  }

  /* ===============================
     RENDER KPI GRID
  =============================== */
  function renderKpiGrid(data) {
    const container = document.getElementById('b2cKpiGrid');
    container.innerHTML = '<div class="b2c-kpi-wrapper"></div>';
    const wrapper = container.querySelector('.b2c-kpi-wrapper');

    const grouped = groupByKategori(data);

    Object.entries(grouped).forEach(([kategori, items]) => {
      const row = document.createElement('div');
      row.className = 'kpi-category-row';

      const title = document.createElement('div');
      title.className = 'kpi-category-title';
      title.textContent = kategori;

      const cards = document.createElement('div');
      cards.className = 'kpi-category-cards';

      items.forEach(kpi => {
        const card = document.createElement('div');
        card.className = 'kpi-card mini';
        card.innerHTML = `
          <div class="kpi-title">${kpi.indikator}</div>
          <div class="kpi-row"><span>Target :</span><span>${fmt(kpi.target)}</span></div>
          <div class="kpi-row"><span>Tangerang :</span><span>${fmt(kpi.tangerang)}</span></div>
          <div class="kpi-row"><span>Banten :</span><span>${fmt(kpi.banten)}</span></div>
        `;
        cards.appendChild(card);
      });

      row.appendChild(title);
      row.appendChild(cards);
      wrapper.appendChild(row);
    });
  }

  /* ===============================
     KPI HIGHLIGHT + TOOLTIP
  =============================== */
  function applyKpiHighlightAndTooltip() {
    document.querySelectorAll('#b2cKpiGrid .kpi-card').forEach(card => {

      card.classList.remove('good', 'bad');
      card.style.boxShadow = '';

      const oldTooltip = card.querySelector('.kpi-tooltip');
      if (oldTooltip) oldTooltip.remove();

      const rows = Array.from(card.querySelectorAll('.kpi-row'));

      const getRow = (label) =>
        rows.find(r =>
          r.querySelector('span:first-child')?.innerText.toLowerCase().includes(label)
        );

      const targetRow = getRow('target');
      const tgrRow = getRow('tangerang');
      const btnRow = getRow('banten');

      if (!targetRow || !tgrRow || !btnRow) return;

      const parseVal = (row) =>
        Number(row.querySelector('span:last-child').innerText.replace(/\./g, '').replace(',', '.'));

      const target = parseVal(targetRow);
      const tgr = parseVal(tgrRow);
      const btn = parseVal(btnRow);

      if (isNaN(target) || isNaN(tgr) || isNaN(btn)) return;

      const badTgr = tgr < target;
      const badBtn = btn < target;
      const isBad = badTgr || badBtn;

      card.classList.add(isBad ? 'bad' : 'good');
      card.style.boxShadow = isBad
        ? '0 0 18px rgba(239,68,68,.75)'
        : '0 0 18px rgba(34,197,94,.55)';

      const colorize = (row, bad) => {
        const el = row.querySelector('span:last-child');
        el.style.fontWeight = '700';
        el.style.color = bad ? '#ef4444' : '#22c55e';
      };

      colorize(tgrRow, badTgr);
      colorize(btnRow, badBtn);

      const tooltip = document.createElement('div');
      tooltip.className = 'kpi-tooltip';
      tooltip.innerHTML = `
        <strong>${card.querySelector('.kpi-title').innerText}</strong><br>
        Target : ${target}<br>
        Tangerang : ${tgr} ${badTgr ? '❌' : '✅'}<br>
        Banten : ${btn} ${badBtn ? '❌' : '✅'}<br>
        <strong>Status :</strong> ${isBad ? '❌ BELOW TARGET' : '✅ ACH'}
      `;
      card.appendChild(tooltip);
    });
  }

  /* ===============================
     BAD KPI TABLE (WITH GROWTH)
  =============================== */
  function renderBadKpiTable(data) {
    const tgrBody = document.getElementById('b2cKpiTableTgr');
    const btnBody = document.getElementById('b2cKpiTableBtn');

    tgrBody.innerHTML = '';
    btnBody.innerHTML = '';

    let hasBadTgr = false;
    let hasBadBtn = false;

    data.forEach(kpi => {
      const target = Number(kpi.target);
      const tgr = Number(kpi.tangerang);
      const btn = Number(kpi.banten);
      const tgrY = Number(kpi.tangerang_yesterday);
      const btnY = Number(kpi.banten_yesterday);

      if (tgr < target) {
        hasBadTgr = true;
        const g = getGrowthMeta(tgr, tgrY);

        tgrBody.innerHTML += `
        <tr class="${g.color === 'danger' ? 'table-danger' : ''}">
          <td>${kpi.indikator}</td>
          <td>${fmt(target)}</td>
          <td class="fw-bold text-danger">${fmt(tgr)}</td>
          <td><span class="badge bg-danger">Not Ach</span></td>

          <td class="text-center">
            <span class="badge bg-${g.color}" data-bs-toggle="tooltip" title="${g.tooltip}">
              ${g.icon}
            </span>
          </td>

          <td>${fmt(tgrY)}</td>
          <td>
            <span class="badge ${tgrY >= target ? 'bg-success' : 'bg-danger'}">
              ${tgrY >= target ? 'Ach' : 'Not Ach'}
            </span>
          </td>
        </tr>`;
      }

      if (btn < target) {
        hasBadBtn = true;
        const g = getGrowthMeta(btn, btnY);

        btnBody.innerHTML += `
        <tr class="${g.color === 'danger' ? 'table-danger' : ''}">
          <td>${kpi.indikator}</td>
          <td>${fmt(target)}</td>
          <td class="fw-bold text-danger">${fmt(btn)}</td>
          <td><span class="badge bg-danger">Not Ach</span></td>

          <td class="text-center">
            <span class="badge bg-${g.color}" data-bs-toggle="tooltip" title="${g.tooltip}">
              ${g.icon}
            </span>
          </td>

          <td>${fmt(btnY)}</td>
          <td>
            <span class="badge ${btnY >= target ? 'bg-success' : 'bg-danger'}">
              ${btnY >= target ? 'Ach' : 'Not Ach'}
            </span>
          </td>
        </tr>`;
      }
    });

    document.getElementById('b2cTableLoadingTgr').classList.add('d-none');
    document.getElementById('b2cTableLoadingBtn').classList.add('d-none');

    if (hasBadTgr) document.getElementById('b2cTableWrapperTgr').classList.remove('d-none');
    if (hasBadBtn) document.getElementById('b2cTableWrapperBtn').classList.remove('d-none');
  }

  /* ===============================
     MAIN
  =============================== */
  function render(api) {
    if (!api || !Array.isArray(api.data)) return;

    renderSummary(api);
    renderKpiGrid(api.data);
    applyKpiHighlightAndTooltip();
    renderBadKpiTable(api.data);

    document.getElementById('b2cKpiLoading')?.classList.add('d-none');
    document.getElementById('b2cKpiGrid')?.classList.remove('d-none');

    hideSkeleton();

    // INIT TOOLTIP
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
      .forEach(el => new bootstrap.Tooltip(el));
  }

  async function init() {
    showSkeleton();
    const res = await fetch(`${B2B_API_URL}?type=b2c_24kpi_banten`);
    const json = await res.json();
    render(json);
  }

  return { init };

})();

window.initDashboardB2C24KPI = () => B2C24KPI.init();

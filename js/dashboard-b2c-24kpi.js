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
   KPI HELPER (WAJIB DI ATAS)
================================ */

function isLowerBetter(indikator = '') {
  const key = indikator.toLowerCase();
  return (
    key.includes('gangguan') ||
    key.includes('unspec') ||
    key.includes('aging')
  );
}

function isNotAch(value, target, indikator) {
  if (isNaN(value) || isNaN(target)) return false;

  return isLowerBetter(indikator)
    ? value > target    // LOWER is BETTER
    : value < target;   // HIGHER is BETTER
}

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
          <div class="kpi-title"><span class="indikator-badge">${kpi.indikator}</span></div>
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

      const badTgr = isNotAch(tgr, target, card.querySelector('.indikator-badge').innerText);
      const badBtn = isNotAch(btn, target, card.querySelector('.indikator-badge').innerText);
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

    /* ======================
       TANGERANG
    ====================== */
    if (isNotAch(tgr, target, kpi.indikator)) {
      hasBadTgr = true;
      const g = getGrowthMeta(tgr, tgrY);

      tgrBody.innerHTML += `
        <tr class="${g.color === 'danger' ? 'table-danger' : ''}">
          <td>${kpi.indikator}</td>
          <td>${fmt(target)}</td>
          <td class="fw-bold text-danger">${fmt(tgr)}</td>
          <td><span class="badge bg-danger">Not Ach</span></td>
          <td class="text-center">
            <span class="badge bg-${g.color}" title="${g.tooltip}">
              ${g.icon}
            </span>
          </td>
          <td>${fmt(tgrY)}</td>
          <td>
            <span class="badge ${
              isNotAch(tgrY, target, kpi.indikator)
                ? 'bg-danger'
                : 'bg-success'
            }">
              ${isNotAch(tgrY, target, kpi.indikator) ? 'Not Ach' : 'Ach'}
            </span>
          </td>
        </tr>
      `;
    }

    /* ======================
       BANTEN
    ====================== */
    if (isNotAch(btn, target, kpi.indikator)) {
      hasBadBtn = true;
      const g = getGrowthMeta(btn, btnY);

      btnBody.innerHTML += `
        <tr class="${g.color === 'danger' ? 'table-danger' : ''}">
          <td>${kpi.indikator}</td>
          <td>${fmt(target)}</td>
          <td class="fw-bold text-danger">${fmt(btn)}</td>
          <td><span class="badge bg-danger">Not Ach</span></td>
          <td class="text-center">
            <span class="badge bg-${g.color}" title="${g.tooltip}">
              ${g.icon}
            </span>
          </td>
          <td>${fmt(btnY)}</td>
          <td>
            <span class="badge ${
              isNotAch(btnY, target, kpi.indikator)
                ? 'bg-danger'
                : 'bg-success'
            }">
              ${isNotAch(btnY, target, kpi.indikator) ? 'Not Ach' : 'Ach'}
            </span>
          </td>
        </tr>
      `;
    }
  });

  document.getElementById('b2cTableLoadingTgr')?.classList.add('d-none');
  document.getElementById('b2cTableLoadingBtn')?.classList.add('d-none');

  if (hasBadTgr) document.getElementById('b2cTableWrapperTgr')?.classList.remove('d-none');
  if (hasBadBtn) document.getElementById('b2cTableWrapperBtn')?.classList.remove('d-none');
}

     /* ===============================
     KPI GRID DETAIL TABLE (NEW)
     SOURCE : type=kpi_grid_table
  =============================== */
function isLowerBetterTable(indikator = '') {
  const key = indikator.toLowerCase();
  return (
    key.includes('q gangguan') ||
    key.includes('unspec non warranty')
  );
}

function isNotAchTable(value, target, indikator) {
  if (isNaN(value) || isNaN(target)) return false;

  return isLowerBetterTable(indikator)
    ? value > target     // LOWER is BETTER
    : value < target;    // HIGHER is BETTER
}
   
function renderKpiGridDetailTable(headers, data) {

  const wrapper = document.getElementById('b2cKpiGridTableWrapper');
  const loading = document.getElementById('b2cKpiGridTableLoading');
  const content = document.getElementById('b2cKpiGridTableContent');
  const thead   = document.getElementById('b2cKpiGridTableHead');
  const tbody   = document.getElementById('b2cKpiGridTableBody');

  if (!wrapper || !thead || !tbody) return;

  thead.innerHTML = '';
  tbody.innerHTML = '';

  /* ===============================
     HEADER
  =============================== */
  const trHead = document.createElement('tr');

  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    th.className = 'text-center fw-semibold';
    trHead.appendChild(th);
  });

  thead.appendChild(trHead);

  /* ===============================
     BODY
  =============================== */
  data.forEach(row => {
    const tr = document.createElement('tr');

    headers.forEach(h => {
      const td  = document.createElement('td');
      const val = row[h];

      td.textContent = val ?? '-';

      if (!['Indikator', 'Bobot'].includes(h)) {
        const num = Number(val);

        if (!isNaN(num)) {
          td.classList.add('text-end');

          /* ===== KPI VALUE ===== */
          if (h === 'TANGERANG' || h === 'BANTEN') {
            const target = Number(row.Target);
            const notAch = isNotAchTable(num, target, row.Indikator);

            td.innerHTML = `
              <span class="${notAch ? 'kpi-not-ach' : 'kpi-ach'}">
                ${num}
              </span>
              <span class="kpi-badge ${notAch ? 'not-ach' : 'ach'}">
                ${notAch ? '❌ Not Ach' : '✅ Ach'}
              </span>
            `;
          }
          /* ===== NORMAL NUMBER ===== */
          else {
            td.textContent = num;
          }
        }
      }

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  /* ===============================
     SHOW TABLE
  =============================== */
  loading?.classList.add('d-none');
  content?.classList.remove('d-none');
  wrapper?.classList.remove('d-none');
}

   /* ===============================
   KPI GRID DETAIL TABLE - BANTEN
   SOURCE : type=kpi_grid_table_btn
================================ */
function renderKpiGridDetailTableBtn(headers, data) {

  const wrapper = document.getElementById('b2cKpiGridTableBtnWrapper');
  const loading = document.getElementById('b2cKpiGridTableBtnLoading');
  const content = document.getElementById('b2cKpiGridTableBtnContent');
  const thead = document.getElementById('b2cKpiGridTableBtnHead');
  const tbody = document.getElementById('b2cKpiGridTableBtnBody');

  if (!wrapper || !thead || !tbody) return;

  thead.innerHTML = '';
  tbody.innerHTML = '';

  /* ---------- HEADER ---------- */
  const trHead = document.createElement('tr');
  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);

  /* ---------- BODY ---------- */
  data.forEach(row => {
    const tr = document.createElement('tr');

    headers.forEach(h => {
      const td = document.createElement('td');
      const val = row[h];

      td.textContent = val ?? '-';

      if (!['Indikator', 'Bobot'].includes(h)) {
        const num = Number(val);
        if (!isNaN(num)) {
          td.classList.add('text-end');

          if (
  h === 'BANTEN' &&
  isNotAch(num, Number(row.Target), row.Indikator)
) {
  td.classList.add('text-danger', 'fw-bold');
}

        }
      }

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  loading.classList.add('d-none');
  content.classList.remove('d-none');
  wrapper.classList.remove('d-none');
}

/* ===============================
   KPI RANKING TABLE (HSA & MITRA)
=============================== */
function parseIDNumber(val) {
  if (val === null || val === undefined) return NaN;

  const num = Number(
    String(val)
      .replace('%', '')
      .replace(/\./g, '')
      .replace(',', '.')
      .trim()
  );

  if (isNaN(num)) return NaN;

  // 👉 kalau <= 1, anggap rasio (0.97 → 97%)
  return num <= 1 ? num * 100 : num;
}


function renderRankingTable({
  data,
  bodyId,
  loadingId,
  wrapperId,
  labelKey,
  valueKey
}) {
  const tbody = document.getElementById(bodyId);
  const loading = document.getElementById(loadingId);
  const wrapper = document.getElementById(wrapperId);

  if (!tbody || !loading || !wrapper) return;

  tbody.innerHTML = '';

  data.forEach((row, index) => {
    const raw = row[valueKey];

    let num;
    if (typeof raw === 'number') {
      num = raw;
    } else {
      num = Number(
        String(raw)
          .replace('%', '')
          .replace(',', '.')
          .trim()
      );
    }

    const isLow = !isNaN(num) && num < 95;

    // 🥇🥈🥉 badge
    let badge = '';
    if (index === 0) badge = '<span class="badge badge-gold">🥇</span>';
    else if (index === 1) badge = '<span class="badge badge-silver">🥈</span>';
    else if (index === 2) badge = '<span class="badge badge-bronze">🥉</span>';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="fw-semibold">
        ${badge}
        <span class="text-muted me-2">${index + 1}.</span>
        ${row[labelKey] ?? '-'}
      </td>
      <td class="text-end fw-bold ${isLow ? 'text-danger' : 'text-success'}">
        ${isNaN(num) ? raw ?? '-' : num.toFixed(2) + '%'}
      </td>
    `;

    tbody.appendChild(tr);
  });

  loading.classList.add('d-none');
  wrapper.classList.remove('d-none');
}


/* ===============================
   LOAD KPI RANKING TABLES
=============================== */

async function loadKpiRankingHSA() {
  try {
    const res = await fetch(`${B2B_API_URL}?type=kpi_ranking_table_hsa`);
    const json = await res.json();

    if (!json?.headers || !json?.data?.length) return;

    renderRankingTable({
      data: json.data,
      bodyId: 'b2bTable1Body',
      loadingId: 'b2bTable1Loading',
      wrapperId: 'b2bTable1Wrapper',
      labelKey: json.headers[0],
      valueKey: json.headers[1]
    });

  } catch (err) {
    console.error('Failed load KPI Ranking HSA', err);
    document.getElementById('b2bTable1Loading')?.classList.add('d-none');
  }
}

async function loadKpiRankingMitra() {
  try {
    const res = await fetch(`${B2B_API_URL}?type=kpi_ranking_table_mitra`);
    const json = await res.json();

    if (!json || !Array.isArray(json.data)) return;

    renderRankingTable({
      data: json.data,
      bodyId: 'b2bTable2Body',
      loadingId: 'b2bTable2Loading',
      wrapperId: 'b2bTable2Wrapper',
      labelKey: json.headers[0],   // MITRA
      valueKey: json.headers[1]    // TOTAL ACH
    });

  } catch (err) {
    console.error('Failed load KPI Ranking MITRA', err);
    document.getElementById('b2bTable2Loading')?.classList.add('d-none');
  }
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

const content = document.getElementById('content-area');
if (content) {
  content.classList.add('safe-scroll');
}

hideSkeleton();

  document.querySelectorAll('[data-bs-toggle="tooltip"]')
    .forEach(el => new bootstrap.Tooltip(el));
}



  async function init() {
  showSkeleton();

  try {
    const res = await fetch(`${B2B_API_URL}?type=b2c_24kpi_banten`);
    const json = await res.json();
    render(json);
  } catch (err) {
    console.error('Main KPI API failed', err);
  }

  // FULL WIDTH TABLES
  loadKpiGridDetailTable();
  loadKpiGridDetailTableBtn();

  // 🔥 KPI RANKING
  loadKpiRankingHSA();
  loadKpiRankingMitra();
}




     async function loadKpiGridDetailTable() {
    try {
      const res = await fetch(`${B2B_API_URL}?type=kpi_grid_table`);
      const json = await res.json();

      if (!json || !Array.isArray(json.data)) return;

      renderKpiGridDetailTable(json.headers, json.data);

    } catch (err) {
      console.error('Failed load KPI GRID DETAIL TABLE', err);
    }
  }

   async function loadKpiGridDetailTableBtn() {
  try {
    const res = await fetch(`${B2B_API_URL}?type=kpi_grid_table_btn`);
    const json = await res.json();

    if (!json || !Array.isArray(json.headers) || !Array.isArray(json.data)) return;

    renderKpiGridDetailTableBtn(json.headers, json.data);

  } catch (err) {
    console.error('Failed load KPI GRID DETAIL TABLE BANTEN', err);
    document.getElementById('b2cKpiGridTableBtnLoading')?.classList.add('d-none');
  }
}


  return { init };

})();

window.initDashboardB2C24KPI = () => B2C24KPI.init();

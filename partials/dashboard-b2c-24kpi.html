/* =========================================================
   DASHBOARD B2C 24 KPI – DISTRICT BANTEN
   STRUCTURE FIRST – NO STYLE – NO CHART
========================================================= */

/* ===================== INIT ===================== */
function initDashboardB2C24KPI(API_URL) {
  fetch(API_URL)
    .then(res => res.json())
    .then(raw => {
      const data = mapApiToB2C(raw);
      renderWitelSummary(data);
      renderKpiGrid(data);
      renderCategorySummary(data);
      renderLastUpdate();
    })
    .catch(err => {
      console.error("B2C Dashboard Error:", err);
    });
}

/* ===================== MAPPER ===================== */
/*
  WAJIB menghasilkan format:
  {
    kategori,
    indikator,
    target,
    banten,
    tangerang
  }
*/
function mapApiToB2C(raw) {
  // asumsi API dari Google Sheet
  // raw.data = array row

  return raw.data.map(r => ({
    kategori   : r.KATEGORI,
    indikator  : r.INDIKATOR,
    target     : parseFloat(r.TARGET),
    banten     : parseFloat(r.BANTEN),
    tangerang  : parseFloat(r.TANGERANG)
  }));
}

/* ===================== LEFT : WITEL SUMMARY ===================== */
function renderWitelSummary(data) {
  const el = document.getElementById("b2cWitelSummary");
  el.innerHTML = "";

  const witel = {
    TANGERANG: { ok: 0, bad: 0, total: 0 },
    BANTEN: { ok: 0, bad: 0, total: 0 }
  };

  data.forEach(d => {
    witel.TANGERANG.total++;
    witel.BANTEN.total++;

    d.tangerang >= d.target
      ? witel.TANGERANG.ok++
      : witel.TANGERANG.bad++;

    d.banten >= d.target
      ? witel.BANTEN.ok++
      : witel.BANTEN.bad++;
  });

  const achTgr = (
    data.reduce((s,d)=>s+d.tangerang,0) / data.length
  ).toFixed(2);

  const achBtn = (
    data.reduce((s,d)=>s+d.banten,0) / data.length
  ).toFixed(2);

  el.insertAdjacentHTML("beforeend", createWitelBox(
    "TANGERANG", achTgr,
    witel.TANGERANG.ok, witel.TANGERANG.bad
  ));

  el.insertAdjacentHTML("beforeend", createWitelBox(
    "BANTEN", achBtn,
    witel.BANTEN.ok, witel.BANTEN.bad
  ));
}

function createWitelBox(title, ach, ok, bad) {
  return `
    <div class="witel-summary">
      <h3>${title}</h3>
      <div class="ach">${ach}</div>
      <div class="status">
        <span>✔ ${ok}</span>
        <span>✖ ${bad}</span>
      </div>
    </div>
  `;
}

/* ===================== CENTER : KPI GRID ===================== */
function renderKpiGrid(data) {
  const el = document.getElementById("b2cKpiGrid");
  el.innerHTML = "";

  const grouped = {};

  data.forEach(d => {
    if (!grouped[d.kategori]) grouped[d.kategori] = [];
    grouped[d.kategori].push(d);
  });

  Object.entries(grouped).forEach(([kategori, list]) => {
    const col = document.createElement("div");
    col.className = "category-column";

    col.innerHTML = `
      <div class="category-header">
        indikator sesuai kategori
      </div>
    `;

    list.forEach(kpi => {
      col.insertAdjacentHTML("beforeend", createKpiCard(kpi));
    });

    el.appendChild(col);
  });
}

function createKpiCard(kpi) {
  return `
    <div class="kpi-card">
      <div class="kpi-title">${kpi.indikator}</div>
      <div class="kpi-row">Target : ${kpi.target}</div>
      <div class="kpi-row">
        Banten : ${kpi.banten}
        ${kpi.banten >= kpi.target ? "✔" : "✖"}
      </div>
      <div class="kpi-row">
        Tangerang : ${kpi.tangerang}
        ${kpi.tangerang >= kpi.target ? "✔" : "✖"}
      </div>
    </div>
  `;
}

/* ===================== RIGHT : CATEGORY SUMMARY ===================== */
function renderCategorySummary(data) {
  const el = document.getElementById("b2cCategorySummary");
  el.innerHTML = "";

  const categories = [...new Set(data.map(d => d.kategori))];

  categories.forEach(cat => {
    el.insertAdjacentHTML("beforeend", `
      <div class="category-box">
        ${cat}
      </div>
    `);
  });
}

/* ===================== LAST UPDATE ===================== */
function renderLastUpdate() {
  document.getElementById("b2cLastUpdate").innerText =
    new Date().toLocaleString("id-ID");
}

/* ===================== DEBUG MODE ===================== */
/* UNCOMMENT UNTUK TEST TANPA API */
/*
initDashboardB2C24KPI({
  data: [
    {
      KATEGORI:"B2C Quality of Service Assurance",
      INDIKATOR:"Assurance guarantee All",
      TARGET:91.71,
      BANTEN:97.28,
      TANGERANG:94.44
    },
    {
      KATEGORI:"B2C CX CUSTOMER (Management)",
      INDIKATOR:"Service Availability (All Teknis)",
      TARGET:98.52,
      BANTEN:99.1,
      TANGERANG:98.98
    },
    {
      KATEGORI:"B2C CX CUSTOMER (Management)",
      INDIKATOR:"Q Gangguan (All Teknis)",
      TARGET:2.7,
      BANTEN:2.3,
      TANGERANG:2.12
    }
  ]
});
*/

async function initDistrictBanten(apiUrl) {
  const container = document.getElementById('district-banten-row');
  const lastUpdateEl = document.getElementById('last-update-banten');

  container.innerHTML = `
    <div class="loading-wrapper">
      <div class="spinner-border text-light"></div>
      <div class="loading-text">Memuat data...</div>
    </div>
  `;

  try {
    const res = await fetch(apiUrl);
    const json = await res.json();
    const data = json.data;

    container.innerHTML = '';

    const grouped = {};
    data.forEach(d => {
      if (!grouped[d.indikator]) grouped[d.indikator] = {};
      grouped[d.indikator][d.witel] = d;
    });

    Object.keys(grouped).forEach(indikator => {
      const banten = grouped[indikator]['BANTEN'];
      const tangerang = grouped[indikator]['TANGERANG'];
      if (!banten || !tangerang) return;

      const isGood =
        indikator.startsWith('Q')
          ? banten.ach <= banten.target
          : banten.ach >= banten.target;

      const card = document.createElement('div');
      card.className = `badge-card ${isGood ? 'card-good' : 'card-bad'}`;

      card.innerHTML = `
        <div class="badge-card-header">${indikator}</div>
        <div class="badge-card-body">
          <div class="row-item">
            <span>Target</span>
            <span>${banten.target.toFixed(2)}</span>
          </div>
          <div class="row-item">
            <span>Banten</span>
            <span class="${isGood ? 'value-good' : 'value-bad'}">
              ${banten.ach.toFixed(2)}
            </span>
          </div>
          <div class="row-item">
            <span>Tangerang</span>
            <span>${tangerang.ach.toFixed(2)}</span>
          </div>
        </div>
      `;

      container.appendChild(card);
    });

    // ✅ LAST UPDATE (Indonesia format)
    const dt = new Date(json.lastUpdate);
    const pad = n => n.toString().padStart(2, '0');
    lastUpdateEl.textContent =
      `Last update: ${pad(dt.getDate())}/${pad(dt.getMonth()+1)}/${dt.getFullYear()} ` +
      `${pad(dt.getHours())}:${pad(dt.getMinutes())}`;

  } catch (err) {
    console.error(err);
    container.innerHTML =
      '<div class="text-danger">Gagal memuat data</div>';
  }
}

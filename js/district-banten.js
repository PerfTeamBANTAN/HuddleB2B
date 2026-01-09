function initDistrictBanten(API_URL) {
  const container = document.getElementById('district-banten-row');
  const contentArea = document.getElementById('content-area');
  const lastUpdateEl = document.getElementById('last-update');

  if (!container) return;

  contentArea.classList.add('show-grid');

  container.innerHTML = `
    <div class="loading-wrapper">
      <div class="spinner-border text-light"></div>
      <div class="loading-text">Memuat data...</div>
    </div>
  `;

  const callbackName = 'handleDistrictBanten_' + Date.now();

  window[callbackName] = function (data) {
    delete window[callbackName];
    document.body.removeChild(script);

    container.innerHTML = '';

    if (!data || !data.length) {
      container.innerHTML =
        '<div class="text-danger text-center">Data kosong</div>';
      return;
    }

    // LAST UPDATE (WAKTU LOAD)
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const lastUpdate =
      `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ` +
      `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    if (lastUpdateEl) {
      lastUpdateEl.textContent = `Last Update: ${lastUpdate}`;
    }

    const map = {};

    data.forEach(row => {
      const indikator = row.indikator.trim();

      if (!map[indikator]) {
        map[indikator] = {
          target: Number(row.target),
          banten: null,
          tangerang: null
        };
      }

      if (row.witel === 'BANTEN') map[indikator].banten = Number(row.ach);
      if (row.witel === 'TANGERANG') map[indikator].tangerang = Number(row.ach);
    });

    Object.keys(map).forEach(indikator => {
      const d = map[indikator];
      const lowerBetter = indikator === 'Q Gangguan HSI';
      const isGood = v => lowerBetter ? v <= d.target : v >= d.target;

      const card = document.createElement('div');
      card.className = `badge-card ${isGood(d.banten) ? 'card-good' : 'card-bad'}`;

      card.innerHTML = `
        <div class="badge-card-header">${indikator}</div>
        <div class="badge-card-body">
          <div class="row-item">
            <span>Target</span>
            <span>${d.target.toFixed(2)}</span>
          </div>
          <div class="row-item">
            <span>Banten</span>
            <span class="${isGood(d.banten) ? 'value-good' : 'value-bad'}">
              ${d.banten.toFixed(2)}
            </span>
          </div>
          <div class="row-item">
            <span>Tangerang</span>
            <span class="${isGood(d.tangerang) ? 'value-good' : 'value-bad'}">
              ${d.tangerang.toFixed(2)}
            </span>
          </div>
        </div>
      `;

      container.appendChild(card);
    });
  };

  const script = document.createElement('script');
  script.src = `${API_URL}?callback=${callbackName}`;
  document.body.appendChild(script);
}

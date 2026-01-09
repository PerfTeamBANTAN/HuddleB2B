function initDistrictBanten(apiUrl) {
  const container = document.getElementById('district-banten-row');
  const lastUpdateEl = document.getElementById('last-update-banten');

  if (!container) {
    console.error('Container district-banten-row tidak ditemukan');
    return;
  }

  container.innerHTML = `
    <div class="loading-wrapper">
      <div class="spinner-border text-light"></div>
      <div class="loading-text">Memuat data...</div>
    </div>
  `;

  const callbackName = 'cbDistrictBanten_' + Date.now();

  window[callbackName] = function (data) {
    delete window[callbackName];
    document.body.removeChild(script);

    if (!Array.isArray(data)) {
      container.innerHTML = '<div class="text-danger">Data tidak valid</div>';
      return;
    }

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
            <span>${Number(banten.target).toFixed(2)}</span>
          </div>
          <div class="row-item">
            <span>Banten</span>
            <span class="${isGood ? 'value-good' : 'value-bad'}">
              ${Number(banten.ach).toFixed(2)}
            </span>
          </div>
          <div class="row-item">
            <span>Tangerang</span>
            <span>${Number(tangerang.ach).toFixed(2)}</span>
          </div>
        </div>
      `;

      container.appendChild(card);
    });

    // ✅ LAST UPDATE
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const formatted =
      `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ` +
      `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    if (lastUpdateEl) {
      lastUpdateEl.textContent = `Last update: ${formatted}`;
    }
  };

  const script = document.createElement('script');
  script.src = `${apiUrl}?callback=${callbackName}`;
  script.onerror = () => {
    container.innerHTML = '<div class="text-danger">Gagal memuat data</div>';
  };

  document.body.appendChild(script);
}

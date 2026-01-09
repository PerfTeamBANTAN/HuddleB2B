function initDistrictBanten(API_URL) {
  const container = document.getElementById('district-banten-row');
  const contentArea = document.getElementById('content-area');

  if (!container) return;

  contentArea.classList.add('show-grid');

  // loading state
  container.innerHTML = `
    <div class="text-center text-light py-4">
      <div class="spinner-border text-light mb-2"></div><br>
      Loading data...
    </div>
  `;

  // nama callback unik
  const callbackName = 'cbDistrictBanten_' + Date.now();

  window[callbackName] = function (data) {
    delete window[callbackName];
    script.remove();

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML =
        '<div class="text-warning text-center">Data tidak tersedia</div>';
      return;
    }

    container.innerHTML = '';

    // ================= GROUP DATA =================
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

      if (row.witel === 'BANTEN') {
        map[indikator].banten = Number(row.ach);
      }

      if (row.witel === 'TANGERANG') {
        map[indikator].tangerang = Number(row.ach);
      }
    });

    // ================= RENDER CARD =================
    Object.keys(map).forEach(indikator => {
      const d = map[indikator];

      const lowerBetter = indikator === 'Q Gangguan HSI';
      const isGood = val =>
        lowerBetter ? val <= d.target : val >= d.target;

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
              ${d.banten?.toFixed(2) ?? '-'}
            </span>
          </div>

          <div class="row-item">
            <span>Tangerang</span>
            <span class="${isGood(d.tangerang) ? 'value-good' : 'value-bad'}">
              ${d.tangerang?.toFixed(2) ?? '-'}
            </span>
          </div>
        </div>
      `;

      container.appendChild(card);
    });
  };

  // inject script JSONP
  const script = document.createElement('script');
  script.src = `${API_URL}?callback=${callbackName}`;
  script.onerror = () => {
    container.innerHTML =
      '<div class="text-danger text-center">Gagal memuat data</div>';
  };

  document.body.appendChild(script);
}

function initDistrictBanten(API_URL) {
  const container = document.getElementById('district-banten-row');
  const wrapper = document.getElementById('district-banten-wrapper');

  if (!container) return;

  container.innerHTML = '';

  // elemen last update
  const lastUpdateEl = document.createElement('div');
  lastUpdateEl.className = 'last-update';
  lastUpdateEl.textContent = 'Last update: -';
  wrapper.prepend(lastUpdateEl);

  const callbackName = 'jsonp_callback_' + Date.now();

  window[callbackName] = function (res) {
    try {
      const { data, lastUpdate } = res;

      const d = new Date(lastUpdate);
      lastUpdateEl.textContent =
        'Last update: ' +
        d.toLocaleString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

      // ===== MAP DATA =====
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

        if (row.witel === 'BANTEN') map[indikator].banten = row.ach;
        if (row.witel === 'TANGERANG') map[indikator].tangerang = row.ach;
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
    } finally {
      delete window[callbackName];
      script.remove();
    }
  };

  const script = document.createElement('script');
  script.src = `${API_URL}?callback=${callbackName}`;
  document.body.appendChild(script);
}

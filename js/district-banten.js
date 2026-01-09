function initDistrictBanten(API_URL) {
  const container = document.getElementById('district-banten-row');
  const wrapper = document.getElementById('district-banten-wrapper');

  if (!container || !wrapper) return;

  container.innerHTML = `
    <div class="loading-wrapper">
      <div class="spinner-border text-light"></div>
      <div class="loading-text">Memuat data...</div>
    </div>
  `;

  fetch(API_URL)
    .then(res => res.json())
    .then(res => {
      const data = res.data;
      const lastUpdate = new Date(res.lastUpdate);

      // === FORMAT WAKTU INDONESIA ===
      const formatted =
        lastUpdate.toLocaleDateString('id-ID') +
        ' ' +
        lastUpdate.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit'
        });

      // === LAST UPDATE ELEMENT ===
      const lastUpdateEl = document.createElement('div');
      lastUpdateEl.className = 'text-light mb-2';
      lastUpdateEl.style.fontSize = '13px';
      lastUpdateEl.innerHTML = `<i class="fa fa-clock"></i> Last update: ${formatted}`;

      wrapper.insertBefore(lastUpdateEl, wrapper.children[1]);

      container.innerHTML = '';

      const map = {};

      data.forEach(row => {
        const indikator = row.indikator.trim();

        if (!map[indikator]) {
          map[indikator] = {
            target: row.target,
            banten: null,
            tangerang: null
          };
        }

        if (row.witel === 'BANTEN') map[indikator].banten = row.ach;
        if (row.witel === 'TANGERANG') map[indikator].tangerang = row.ach;
      });

      Object.keys(map).forEach(indikator => {
        const d = map[indikator];
        if (d.banten == null || d.tangerang == null) return;

        const lowerBetter = indikator === 'Q Gangguan HSI';
        const isGood = v => (lowerBetter ? v <= d.target : v >= d.target);

        const card = document.createElement('div');
        card.className = `badge-card ${
          isGood(d.banten) ? 'card-good' : 'card-bad'
        }`;

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
    })
    .catch(() => {
      container.innerHTML =
        '<div class="text-danger text-center">Gagal memuat data</div>';
    });
}

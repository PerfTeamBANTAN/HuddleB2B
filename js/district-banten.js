function initDistrictBanten(API_URL) {
  const container = document.getElementById('district-banten-row');
  const contentArea = document.getElementById('content-area');
  const lastUpdateEl = document.getElementById('last-update');

  if (!container) return;

  contentArea.classList.add('show-grid');

  // loading info
  container.innerHTML = `
    <div class="text-center text-light w-100">
      <div class="spinner-border mb-2"></div>
      <div>Loading data District BANTEN...</div>
    </div>
  `;

  fetch(API_URL)
    .then(res => res.json())
    .then(result => {
      const data = result.data || [];
      const lastUpdate = result.lastUpdate;

      /* ================= LAST UPDATE ================= */
      if (lastUpdateEl && lastUpdate) {
        const dt = new Date(lastUpdate);
        const pad = n => n.toString().padStart(2, '0');

        const formatted =
          pad(dt.getDate()) + '/' +
          pad(dt.getMonth() + 1) + '/' +
          dt.getFullYear() + ' ' +
          pad(dt.getHours()) + ':' +
          pad(dt.getMinutes());

        lastUpdateEl.textContent = 'Last Update: ' + formatted;
      }

      container.innerHTML = '';

      /* ================= GROUP DATA ================= */
      const map = {};

      data.forEach(row => {
        const indikator = String(row.indikator).trim();
        const witel = String(row.witel).trim().toUpperCase();

        if (!indikator || !witel) return;

        if (!map[indikator]) {
          map[indikator] = {
            target: Number(row.target),
            banten: null,
            tangerang: null
          };
        }

        if (witel === 'BANTEN') {
          map[indikator].banten = Number(row.ach);
        }

        if (witel === 'TANGERANG') {
          map[indikator].tangerang = Number(row.ach);
        }
      });

      /* ================= BUILD CARD ================= */
      Object.keys(map).forEach(indikator => {
        const d = map[indikator];

        // KPI RULE
        const lowerBetter = indikator === 'Q Gangguan HSI';
        const isGood = val =>
          typeof val === 'number'
            ? (lowerBetter ? val <= d.target : val >= d.target)
            : false;

        const card = document.createElement('div');
        card.className = `badge-card ${
          isGood(d.banten) ? 'card-good' : 'card-bad'
        }`;

        card.innerHTML = `
          <div class="badge-card-header">${indikator}</div>
          <div class="badge-card-body">
            <div class="row-item target">
              <span>Target</span>
              <span>${d.target.toFixed(2)}</span>
            </div>
            <div class="row-item">
              <span>Banten</span>
              <span class="${isGood(d.banten) ? 'value-good' : 'value-bad'}">
                ${d.banten !== null ? d.banten.toFixed(2) : '-'}
              </span>
            </div>
            <div class="row-item">
              <span>Tangerang</span>
              <span class="${isGood(d.tangerang) ? 'value-good' : 'value-bad'}">
                ${d.tangerang !== null ? d.tangerang.toFixed(2) : '-'}
              </span>
            </div>
          </div>
        `;

        container.appendChild(card);
      });

      if (!container.hasChildNodes()) {
        container.innerHTML =
          '<div class="text-warning text-center">Data tidak tersedia</div>';
      }
    })
    .catch(err => {
      console.error(err);
      container.innerHTML =
        '<div class="text-danger text-center">Gagal memuat data</div>';
    });
}

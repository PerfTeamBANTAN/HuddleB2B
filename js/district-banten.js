function initDistrictBanten(API_URL) {
  const container = document.getElementById('district-banten-row');
  const contentArea = document.getElementById('content-area');
  if (!container) return;

  contentArea.classList.add('show-grid');

  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      container.innerHTML = '';

      data.forEach(item => {
        const indikator = item.INDIKATOR || item.indikator || '';
        const target = Number(item.TARGET ?? item.target ?? 0);
        const banten = Number(item.BANTEN ?? item.banten ?? 0);
        const tangerang = Number(item.TANGERANG ?? item.tangerang ?? 0);

        // RULE KPI
        let goodIfGreater = true;
        if (indikator.toLowerCase().includes('gangguan')) {
          goodIfGreater = false;
        }

        const isGood = value =>
          goodIfGreater ? value >= target : value <= target;

        const valueClass = value =>
          isGood(value) ? 'value-good' : 'value-bad';

        const cardClass =
          isGood(banten) ? 'card-good' : 'card-bad';

        const card = document.createElement('div');
        card.className = `badge-card ${cardClass}`;

        card.innerHTML = `
          <div class="badge-card-header">${indikator}</div>
          <div class="badge-card-body">
            <div class="row-item">
              <span class="target">Target</span>
              <span>${target.toFixed(2)}</span>
            </div>
            <div class="row-item">
              <span class="banten">Banten</span>
              <span class="${valueClass(banten)}">${banten.toFixed(2)}</span>
            </div>
            <div class="row-item">
              <span class="tangerang">Tangerang</span>
              <span class="${valueClass(tangerang)}">${tangerang.toFixed(2)}</span>
            </div>
          </div>
        `;

        container.appendChild(card);
      });
    })
    .catch(err => {
      console.error(err);
      container.innerHTML =
        '<div class="text-danger text-center">Gagal memuat data KPI</div>';
    });
}

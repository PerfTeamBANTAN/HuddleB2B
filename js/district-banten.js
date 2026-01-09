function initDistrictBanten(API_URL) {
  const container = document.getElementById('district-banten-row');
  const contentArea = document.getElementById('content-area');
  if (!container) return;

  contentArea.classList.add('show-grid');

  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      container.innerHTML = '';

      // GROUP DATA PER INDIKATOR
      const grouped = {};
      data.forEach(row => {
        if (!grouped[row.indikator]) grouped[row.indikator] = {};
        grouped[row.indikator][row.witel] = row;
      });

      Object.keys(grouped).forEach(indikator => {
        const rows = grouped[indikator];

        const target = Number(rows['Target']?.target || 0);
        const banten = Number(rows['Banten']?.ach || 0);
        const tangerang = Number(rows['Tangerang']?.ach || 0);

        // RULE KPI
        const isLowerBetter = indikator.toLowerCase().includes('gangguan');

        const isGood = val =>
          isLowerBetter ? val <= target : val >= target;

        const valueClass = val =>
          isGood(val) ? 'value-good' : 'value-bad';

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

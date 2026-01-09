function initDistrictBanten(API_URL) {
  const container = document.getElementById('district-banten-row');
  if (!container) return;

  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      container.innerHTML = '';

      // group per indikator
      const grouped = {};
      data.forEach(r => {
        if (!grouped[r.indikator]) grouped[r.indikator] = [];
        grouped[r.indikator].push(r);
      });

      Object.keys(grouped).forEach(indikator => {
        const rows = grouped[indikator];

        const target = Number(rows.find(r => r.witel === 'Target')?.target || 0);
        const banten = Number(rows.find(r => r.witel === 'Banten')?.ach || 0);
        const tangerang = Number(rows.find(r => r.witel === 'Tangerang')?.ach || 0);

        // RULE LOGIC
        let goodIfGreater = true;
        if (indikator.toLowerCase().includes('gangguan')) {
          goodIfGreater = false;
        }

        function statusClass(value) {
          if (goodIfGreater) {
            return value >= target ? 'value-good' : 'value-bad';
          } else {
            return value <= target ? 'value-good' : 'value-bad';
          }
        }

        function cardClass(value) {
          if (goodIfGreater) {
            return value >= target ? 'card-good' : 'card-bad';
          } else {
            return value <= target ? 'card-good' : 'card-bad';
          }
        }

        const card = document.createElement('div');
        card.className = `badge-card ${cardClass(banten)}`;

        card.innerHTML = `
          <div class="badge-card-header">${indikator}</div>
          <div class="badge-card-body">
            <div class="row-item">
              <span class="target">Target</span>
              <span>${target.toFixed(2)}</span>
            </div>
            <div class="row-item">
              <span class="banten">Banten</span>
              <span class="${statusClass(banten)}">${banten.toFixed(2)}</span>
            </div>
            <div class="row-item">
              <span class="tangerang">Tangerang</span>
              <span class="${statusClass(tangerang)}">${tangerang.toFixed(2)}</span>
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

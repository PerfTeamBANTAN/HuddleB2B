// CSS khusus kartu bisa diletakkan di file CSS global,
// tapi kalau mau cepat, tambahkan <style> di index / file css terpisah:
//
// .badge-card { ... }  (sama seperti sebelumnya)
// .badge-card-header { ... }
// .cards-scroll { display:flex; flex-wrap:nowrap; overflow-x:auto; padding-bottom:6px; }
// dst.

function initDistrictBanten(apiUrl) {
  const row = document.getElementById('district-banten-row');
  if (!row) return;

  row.innerHTML = `
    <div class="d-flex flex-column align-items-center justify-content-center w-100">
      <div class="spinner-border text-light mb-3" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <div>Loading data District BANTEN...</div>
    </div>
  `;

  fetch(apiUrl)
    .then(r => r.json())
    .then(rows => {
      const indikatorMap = {};

      rows.forEach(r => {
        const ind = String(r.indikator || '').trim();
        const witel = String(r.witel || '').trim().toUpperCase();
        const target = String(r.target || '').trim();
        const ach = String(r.ach || '').trim();
        if (!ind || !witel) return;

        if (!indikatorMap[ind]) {
          indikatorMap[ind] = {
            target: target,
            banten: null,
            tangerang: null
          };
        }

        if (witel === 'BANTEN') {
          indikatorMap[ind].banten = ach;
          if (!indikatorMap[ind].target) indikatorMap[ind].target = target;
        }
        if (witel === 'TANGERANG') {
          indikatorMap[ind].tangerang = ach;
          if (!indikatorMap[ind].target) indikatorMap[ind].target = target;
        }
      });

      row.innerHTML = '';

      Object.keys(indikatorMap).forEach(indikator => {
        const d = indikatorMap[indikator];

        const cardContainer = document.createElement('div');
        cardContainer.className = 'me-2';

        cardContainer.innerHTML = `
          <div class="badge-card">
            <div class="badge-card-header">
              ${indikator}
            </div>
            <div><span class="label">Target :</span>
              <span class="value-target">${d.target}</span></div>
            <div><span class="label">Banten :</span>
              <span class="value-banten">${d.banten ?? '-'}</span></div>
            <div><span class="label">Tangerang :</span>
              <span class="value-tangerang">${d.tangerang ?? '-'}</span></div>
          </div>
        `;

        row.appendChild(cardContainer);
      });
    })
    .catch(err => {
      console.error(err);
      row.innerHTML = '<div class="text-danger">Gagal load data District BANTEN.</div>';
    });
}

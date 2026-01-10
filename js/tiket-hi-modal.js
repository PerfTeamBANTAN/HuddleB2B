/* =========================================================
   tiket-hi-modal.js
   Modal Detail Tiket HI (Shared)
========================================================= */

(function () {
  let modalInstance = null;

  /* ===================== INIT MODAL ===================== */
  function initModal() {
    const modalEl = document.getElementById('modalTiketHI');
    if (!modalEl) return;

    modalInstance = new bootstrap.Modal(modalEl, {
      backdrop: 'static',
      keyboard: true
    });
  }

  /* ===================== OPEN MODAL ===================== */
  window.openTiketHIModal = function (params) {
    if (!APP.API_URL) {
      console.error('API_URL belum diset');
      return;
    }

    if (!modalInstance) initModal();
    if (!modalInstance) return;

    const titleEl = document.getElementById('modalTiketHITitle');
    const headEl = document.getElementById('tiket-hi-head');
    const bodyEl = document.getElementById('tiket-hi-body');

    if (!headEl || !bodyEl) return;

    titleEl.textContent = params?.title || 'Detail Tiket HI';

    headEl.innerHTML = '';
    bodyEl.innerHTML = `
      <tr>
        <td class="text-muted">Memuat data...</td>
      </tr>
    `;

    modalInstance.show();

    loadDetailData(params, headEl, bodyEl);
  };

  /* ===================== LOAD DATA ===================== */
  function loadDetailData(params, headEl, bodyEl) {
    const cb = 'cb_tiket_hi_' + Date.now();

    const query = new URLSearchParams({
      type: 'tiket_hi',
      ...params
    }).toString();

    loadJSONP(
      `${APP.API_URL}?${query}`,
      cb,
      res => {
        headEl.innerHTML = '';
        bodyEl.innerHTML = '';

        if (!res.data || !res.data.length) {
          bodyEl.innerHTML = `
            <tr>
              <td class="text-center text-muted">Data tidak tersedia</td>
            </tr>
          `;
          return;
        }

        /* ===== TABLE HEADER ===== */
        Object.keys(res.data[0]).forEach(k => {
          const th = document.createElement('th');
          th.textContent = k;
          headEl.appendChild(th);
        });

        /* ===== TABLE BODY ===== */
        res.data.forEach(row => {
          const tr = document.createElement('tr');
          Object.values(row).forEach(v => {
            const td = document.createElement('td');
            td.textContent = formatNumber(v);
            tr.appendChild(td);
          });
          bodyEl.appendChild(tr);
        });
      },
      err => {
        console.error('Modal load error', err);
        bodyEl.innerHTML = `
          <tr>
            <td class="text-danger">Gagal memuat data</td>
          </tr>
        `;
      }
    );
  }

  /* ===================== AUTO INIT ===================== */
  document.addEventListener('DOMContentLoaded', initModal);
})();

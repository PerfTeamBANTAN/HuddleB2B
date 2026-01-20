/* =====================================================
   MONITORING B2B HI - AGGREGATE TABLE
===================================================== */

function initMonitoringB2B(API_URL) {

  const tbody = document.getElementById('monitoring-b2b-body');
  const lastUpdate = document.getElementById('monitoring-b2b-update');

  const kpiTotal = document.getElementById('kpi-total');
  const kpiSla = document.getElementById('kpi-sla');
  const kpiCritical = document.getElementById('kpi-critical');

  fetch(API_URL + '?sheet=MONITORING_B2B')
    .then(res => res.json())
    .then(data => {

      tbody.innerHTML = '';

      let totalTiket = 0;
      let slaBreach = 0;
      let critical = 0;

      data.forEach(row => {

        /* ===== KPI (OPTIONAL) ===== */
        totalTiket += Number(row.TOTAL_TIKET || 0);
        slaBreach  += Number(row.TTR_BREACH || 0);
        critical   += Number(row.CRITICAL || 0);

        const tr = document.createElement('tr');

        tr.innerHTML = `
          <td>${row.STO || '-'}</td>
          <td>${row.WITEL || '-'}</td>
          <td>${row.HSA || 0}</td>
          <td>${row.OSA || 0}</td>
          <td>${row.Q_HSI || '0%'}</td>

          <td>${row.TOTAL_HI_HSI || 0}</td>
          <td>${row.TOTAL_HI_DATIN || 0}</td>

          <td>${row.CLOSED_HSI || 0}</td>
          <td>${row.CLOSED_DATIN || 0}</td>

          <td>${row.OPEN_HSI || 0}</td>
          <td>${row.OPEN_DATIN || 0}</td>

          <td>${row.INDI_4_OK || 0}</td>
          <td>${row.INDI_4_BAD || 0}</td>
          <td>${row.INDI_24_OK || 0}</td>
          <td>${row.INDI_24_BAD || 0}</td>

          <td>${row.RES_6_OK || 0}</td>
          <td>${row.RES_6_BAD || 0}</td>
          <td>${row.RES_36_OK || 0}</td>
          <td>${row.RES_36_BAD || 0}</td>

          <td>${row.GAUL_HSI || 0}</td>
          <td>${row.GAUL_DATIN || 0}</td>

          <td>${row.SQM_JADI_HI || 0}</td>
          <td>${row.ALERT_JADI_HI || 0}</td>
        `;

        tbody.appendChild(tr);
      });

      /* ===== KPI UPDATE ===== */
      if (kpiTotal)    kpiTotal.textContent = totalTiket;
      if (kpiSla)      kpiSla.textContent = slaBreach;
      if (kpiCritical) kpiCritical.textContent = critical;

      /* ===== LAST UPDATE ===== */
      lastUpdate.textContent = new Date().toLocaleString('id-ID');

      /* ===== HIGHLIGHT ❌ ===== */
      highlightBadCellsB2B();
    })
    .catch(err => {
      console.error('Monitoring B2B error:', err);
      tbody.innerHTML = `
        <tr>
          <td colspan="23" class="text-center text-danger">
            Gagal memuat data
          </td>
        </tr>
      `;
    });

  /* ===== SEARCH STO / WITEL ===== */
  const searchInput = document.getElementById('monitoringSearch');
  if (searchInput) {
    searchInput.addEventListener('keyup', function () {
      const val = this.value.toLowerCase();

      document.querySelectorAll('#monitoring-b2b-body tr')
        .forEach(tr => {
          const sto = tr.children[0].innerText.toLowerCase();
          const witel = tr.children[1].innerText.toLowerCase();

          tr.style.display =
            sto.includes(val) || witel.includes(val)
              ? ''
              : 'none';
        });
    });
  }
}

/* =====================================================
   HIGHLIGHT ❌ CELL (AUTO RED)
===================================================== */

function highlightBadCellsB2B() {
  const table = document.querySelector('.table-b2b-monitoring');
  if (!table) return;

  const badIndexes = [];

  table.querySelectorAll('thead tr:last-child th')
    .forEach((th, i) => {
      if (th.classList.contains('bad')) badIndexes.push(i);
    });

  table.querySelectorAll('tbody tr').forEach(tr => {
    tr.querySelectorAll('td').forEach((td, i) => {
      if (badIndexes.includes(i)) {
        const v = Number(td.innerText);
        if (!isNaN(v) && v > 0) {
          td.classList.add('value-bad');
        }
      }
    });
  });
}

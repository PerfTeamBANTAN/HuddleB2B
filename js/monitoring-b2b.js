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

      let total = 0;
      let sla = 0;
      let critical = 0;

      data.forEach(row => {
        total++;

        const durasi = Number(row.DURASI_JAM || 0);
        const isSla = durasi > Number(row.SLA_JAM);
        const isCritical = row.SEVERITY === 'CRITICAL';

        if (isSla) sla++;
        if (isCritical) critical++;

        const tr = document.createElement('tr');

        if (isSla) tr.classList.add('tr-pragnosa-bad');

        tr.innerHTML = `
          <td>${row.WITEL}</td>
          <td>${row.SID}</td>
          <td>${row.CUSTOMER}</td>
          <td>${row.STATUS}</td>
          <td class="text-center">${durasi}</td>
          <td class="text-center">${row.SLA_JAM}</td>
          <td class="text-center">${row.SEVERITY}</td>
        `;

        tbody.appendChild(tr);
      });

      kpiTotal.textContent = total;
      kpiSla.textContent = sla;
      kpiCritical.textContent = critical;

      lastUpdate.textContent = new Date().toLocaleString('id-ID');
    });

  /* SEARCH */
  document.getElementById('monitoringSearch')
    .addEventListener('keyup', function () {
      const val = this.value.toLowerCase();
      document.querySelectorAll('#monitoring-b2b-body tr')
        .forEach(tr => {
          tr.style.display =
            tr.innerText.toLowerCase().includes(val)
              ? ''
              : 'none';
        });
    });
}

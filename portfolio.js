
async function loadJSON(path){ const res = await fetch(path, {cache:'no-store'}); return await res.json(); }
function fmtUSD(n){ try{ return new Intl.NumberFormat(undefined,{style:'currency',currency:'USD'}).format(n); }catch(e){ return '$'+n; } }

async function initPortfolio(){
  const data = await loadJSON('data/portfolio.json');

  // KPIs
  const equity = data.equity_curve[data.equity_curve.length-1].value;
  const cash = data.cash || 0;
  const unrealized = (data.positions||[]).reduce((s,p)=> s + (p.unrealized_pl||0), 0);
  document.getElementById('kpiEquity').textContent = fmtUSD(equity);
  document.getElementById('kpiCash').textContent = fmtUSD(cash);
  document.getElementById('kpiPL').textContent = fmtUSD(unrealized);

  // Equity chart
  const ctx = document.getElementById('equityChart');
  const labels = data.equity_curve.map(p=>p.date);
  const values = data.equity_curve.map(p=>p.value);
  new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label: 'Equity', data: values, tension: 0.2 }] },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { x: { grid: { display:false } }, y: { grid: { color:'#eee' } } }
    }
  });

  // Positions table
  const posT = document.getElementById('positionsTable');
  (data.positions||[]).forEach(p=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${p.name}</td>
                    <td>${p.sku}</td>
                    <td>${p.units}</td>
                    <td>${fmtUSD(p.avg_cost)}</td>
                    <td>${fmtUSD(p.market_value)}</td>
                    <td>${fmtUSD(p.unrealized_pl)}</td>
                    <td>${p.option}</td>
                    <td>${p.payout_eta}</td>`;
    posT.appendChild(tr);
  });

  // Contributions table
  const cT = document.getElementById('contribTable');
  (data.contributions||[]).forEach(c=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${c.date}</td><td>${fmtUSD(c.amount)}</td>`;
    cT.appendChild(tr);
  });
}

document.addEventListener('DOMContentLoaded', initPortfolio);

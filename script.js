// State REET brackets verified against Washington Department of Revenue and MRSC summaries in 2026:
// 1.10% up to $525,000; 1.28% from $525,000.01 to $1,525,000; 2.75% from $1,525,000.01 to $3,025,000; 3.00% above $3,025,000.
// Local-rate content notes: Bellevue and Seattle are modeled at 0.50%; Skykomish is shown as 0.25%; King County unincorporated has a current 0.50% DOR rate, while the calculator's 0.25% option is a policy-contrast assumption requested in the project brief.
export const STATE_REET_BRACKETS = [
  { cap: 525000, rate: 0.011 },
  { cap: 1525000, rate: 0.0128 },
  { cap: 3025000, rate: 0.0275 },
  { cap: Infinity, rate: 0.03 }
];

export function calculateStateReet(price) {
  let remaining = Math.max(0, Number(price) || 0);
  let lower = 0;
  let total = 0;
  for (const bracket of STATE_REET_BRACKETS) {
    const taxable = Math.min(remaining, bracket.cap - lower);
    if (taxable <= 0) break;
    total += taxable * bracket.rate;
    remaining -= taxable;
    lower = bracket.cap;
  }
  return total;
}

export function calculateReetScenario(price, comparison = 'king-assumption') {
  const numericPrice = Math.max(0, Number(price) || 0);
  const stateReet = calculateStateReet(numericPrice);
  const bellevueLocal = numericPrice * 0.005;
  const peerRate = comparison === 'seattle' ? 0.005 : 0.0025;
  const peerName = comparison === 'seattle' ? 'Seattle' : 'King County Unincorp. policy contrast';
  const peerLocal = numericPrice * peerRate;
  const extraLocal = Math.max(0, bellevueLocal - peerLocal);
  const buyerGrossUp = peerRate < 0.005 ? extraLocal / Math.max(0.0001, 1 - 0.005) : 0;

  return {
    price: numericPrice,
    stateReet,
    bellevueLocal,
    bellevueTotal: stateReet + bellevueLocal,
    peerName,
    peerRate,
    peerLocal,
    peerTotal: stateReet + peerLocal,
    extraLocal,
    buyerGrossUp
  };
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function renderResults(scenario) {
  const rows = [
    ['State REET', currency.format(scenario.stateReet)],
    ['Bellevue Local REET, 0.50%', currency.format(scenario.bellevueLocal)],
    [`${scenario.peerName} Local REET, ${(scenario.peerRate * 100).toFixed(2)}%`, currency.format(scenario.peerLocal)],
    ['Bellevue Total REET', currency.format(scenario.bellevueTotal)],
    ['Peer Total REET', currency.format(scenario.peerTotal)]
  ];
  document.querySelector('#results-body').innerHTML = rows.map(([label, value]) => `<tr><th scope="row">${label}</th><td>${value}</td></tr>`).join('');
  const outcome = scenario.extraLocal > 0
    ? `Selling in Bellevue incurs about ${currency.format(scenario.extraLocal)} extra local transaction tax versus the selected 0.25% peer scenario. A seller attempting to preserve net proceeds would need to raise price by roughly ${currency.format(scenario.buyerGrossUp)} before other closing-cost dynamics.`
    : 'Bellevue and the selected peer have the same local REET rate in this model, so the local tax burden is equal.';
  document.querySelector('#economic-outcome').textContent = outcome;

  const max = Math.max(scenario.bellevueTotal, scenario.peerTotal, 1);
  document.querySelector('#bellevue-bar').style.width = `${(scenario.bellevueTotal / max) * 100}%`;
  document.querySelector('#peer-bar').style.width = `${(scenario.peerTotal / max) * 100}%`;
  document.querySelector('#bellevue-total').textContent = currency.format(scenario.bellevueTotal);
  document.querySelector('#peer-total').textContent = currency.format(scenario.peerTotal);
}

function initCalculator() {
  const form = document.querySelector('#reet-form');
  if (!form) return;
  const calculate = () => {
    const price = document.querySelector('#sale-price').value;
    const comparison = new FormData(form).get('comparison');
    renderResults(calculateReetScenario(price, comparison));
  };
  form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); });
  form.addEventListener('change', calculate);
  calculate();
}

function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('#nav-menu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
  menu.addEventListener('click', (event) => {
    if (event.target.matches('a')) {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function initMapTooltips() {
  const tooltip = document.querySelector('#map-tooltip');
  document.querySelectorAll('.map-marker').forEach((marker) => {
    const update = () => { tooltip.textContent = `${marker.dataset.city}: ${marker.dataset.rate}, ${marker.dataset.label}`; };
    marker.addEventListener('mouseenter', update);
    marker.addEventListener('focus', update);
    marker.addEventListener('click', update);
  });
}

if (typeof document !== 'undefined') {
  initNav();
  initCalculator();
  initMapTooltips();
}

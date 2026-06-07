const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

function localRate(place) {
  if (place === "bellevue") return 0.005;
  if (place === "seattle") return 0.005;
  return 0;
}

const stateReetBrackets = [
  { label: "First $525,000", cap: 525000, rate: 0.011 },
  { label: "$525,000.01 to $1,525,000", cap: 1525000, rate: 0.0128 },
  { label: "$1,525,000.01 to $3,025,000", cap: 3025000, rate: 0.0275 },
  { label: "Above $3,025,000", cap: Infinity, rate: 0.03 }
];

function calculateStateReet(price) {
  let remaining = Math.max(0, Number(price) || 0);
  let lower = 0;
  let total = 0;
  const rows = [];

  for (const bracket of stateReetBrackets) {
    const taxable = Math.min(remaining, bracket.cap - lower);
    if (taxable <= 0) break;
    const tax = taxable * bracket.rate;
    rows.push({ ...bracket, taxable, tax });
    total += tax;
    remaining -= taxable;
    lower = bracket.cap;
  }

  return { total, rows };
}

function calculate() {
  const priceInput = document.querySelector("[data-sale-price]");
  const placeInput = document.querySelector("[data-place]");
  const output = document.querySelector("[data-results]");
  const mathOutput = document.querySelector("[data-math]");
  if (!priceInput || !placeInput || !output) return;

  const price = Number(priceInput.value || 0);
  const local = localRate(placeInput.value);
  const state = calculateStateReet(price);
  const stateTax = state.total;
  const localTax = price * local;
  const totalTax = stateTax + localTax;
  const diff = price * (local - localRate("king"));

  output.innerHTML = `
    <div class="result-row"><span>State REET estimate</span><b>${money.format(stateTax)}</b></div>
    <div class="result-row"><span>Local REET estimate</span><b>${money.format(localTax)}</b></div>
    <div class="result-row"><span>Total transfer tax estimate</span><b>${money.format(totalTax)}</b></div>
    <div class="result-row"><span>Added local cost compared with no-local-REET baseline</span><b>${money.format(diff)}</b></div>
  `;

  if (mathOutput) {
    const rows = state.rows.map((row) => `
      <tr>
        <td>${row.label}</td>
        <td>${money.format(row.taxable)}</td>
        <td>${(row.rate * 100).toFixed(2)}%</td>
        <td>${money.format(row.tax)}</td>
      </tr>
    `).join("");
    mathOutput.innerHTML = `
      <h3>State REET math</h3>
      <p>Washington state REET is graduated. The local rate is added after the state brackets are calculated.</p>
      <table>
        <thead><tr><th>Bracket</th><th>Taxed amount</th><th>Rate</th><th>Tax</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }
}

document.addEventListener("input", calculate);
document.addEventListener("DOMContentLoaded", () => {
  calculate();
  renderCharts();
  initImpactDashboard();
});

const chartData = {
  reetBurden: {
    type: "bar",
    unit: "$",
    labels: ["$900k", "$1.2m", "$1.5m", "$1.8m", "$2.2m"],
    values: [4500, 6000, 7500, 9000, 11000],
    altValues: [0, 0, 0, 0, 0],
    note: "Local Bellevue REET at 0.5% of the selling price, shown across sale-price bands."
  },
  affordabilityStack: {
    type: "bar",
    unit: "%",
    labels: ["Rate shock", "Price level", "Local REET", "Parking cost", "Permit delay"],
    values: [58, 74, 31, 29, 21],
    note: "Index of affordability pressure from the research model, scaled 0 to 100, with Bellevue local REET modeled at 0.5%."
  },
  liquidityTrend: {
    type: "line",
    unit: "days",
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    values: [21, 24, 27, 31, 35, 38],
    note: "Modeled days-on-market trend used to test whether transfer costs become more visible as liquidity weakens."
  },
  interviewScores: {
    type: "bar",
    unit: "/5",
    labels: ["Rates", "Net proceeds", "REET", "Concessions", "Inventory"],
    values: [4.9, 4.4, 3.1, 3.8, 3.6],
    note: "Mean concern score from seven protected interview profiles."
  },
  openHouseTopics: {
    type: "bar",
    unit: "mentions",
    labels: ["Monthly payment", "Rates", "Price", "Schools", "Tax/closing cost", "Parking"],
    values: [26, 23, 19, 14, 11, 8],
    note: "Coded visitor-topic mentions from reconstructed open-house notes."
  },
  sourceReliability: {
    type: "heatmap",
    xLabels: ["Legal", "Fiscal", "Market", "Housing"],
    yLabels: ["State", "Bellevue", "Regional", "Field"],
    values: [
      [5, 3, 2, 1],
      [3, 5, 3, 1],
      [1, 2, 4, 2],
      [1, 1, 3, 5]
    ],
    note: "Document and field-source strength scored from 1 to 5 by topic fit."
  },
  dataPipeline: {
    type: "line",
    unit: "records",
    labels: ["Manual notes", "Tables", "Model set", "Validation", "Simulation"],
    values: [58, 142, 310, 520, 800],
    note: "Projected record count as the project moves from qualitative notes into structured analysis."
  },
  affordabilityScatter: {
    type: "scatter",
    unit: "",
    xLabel: "Regulatory friction index",
    yLabel: "Modeled added monthly cost",
    values: [
      [18, 110], [25, 145], [32, 190], [38, 225], [44, 260],
      [51, 330], [57, 360], [63, 420], [69, 455], [76, 520]
    ],
    note: "Illustrative regression-style reading: higher regulatory friction aligns with higher modeled monthly cost."
  },
  zoningSupply: {
    type: "scatter",
    unit: "",
    xLabel: "Share of lots constrained by low-density zoning",
    yLabel: "Permits per 1,000 parcels",
    values: [[38, 8.1], [45, 7.6], [52, 6.4], [59, 5.8], [66, 4.9], [72, 4.4], [78, 3.5], [84, 2.9]],
    note: "Negative association used to frame zoning as a housing-production incentive problem."
  },
  parkingDistribution: {
    type: "histogram",
    unit: "projects",
    labels: ["0-10k", "10-20k", "20-30k", "30-40k", "40-50k", "50k+"],
    values: [2, 5, 9, 7, 4, 2],
    note: "Modeled per-home cost adders from structured parking and minimum-space assumptions."
  },
  correlationMatrix: {
    type: "matrix",
    labels: ["Rates", "REET", "Parking", "Zoning", "DOM"],
    values: [
      [1.00, 0.22, 0.31, 0.28, 0.72],
      [0.22, 1.00, 0.18, 0.24, 0.39],
      [0.31, 0.18, 1.00, 0.47, 0.34],
      [0.28, 0.24, 0.47, 1.00, 0.41],
      [0.72, 0.39, 0.34, 0.41, 1.00]
    ],
    note: "Correlation-style matrix for modeled variables; values are directional research estimates, not causal proof."
  },
  streetWidthHeatmap: {
    type: "heatmap",
    xLabels: ["28 ft", "34 ft", "40 ft", "46 ft"],
    yLabels: ["Low traffic", "Medium", "High"],
    values: [[5, 4, 3, 2], [4, 3, 2, 1], [3, 2, 1, 1]],
    note: "Pedestrian activity index declines as modeled street width and traffic exposure rise."
  },
  zipComparison: {
    type: "bar",
    unit: "index",
    labels: ["98004", "98005", "98006", "98007", "98008"],
    values: [82, 66, 58, 61, 64],
    note: "Composite development-friction index comparing Bellevue ZIP-code areas."
  },
  controlZipPlan: {
    type: "bar",
    unit: "checks",
    labels: ["Price band", "DOM window", "Property type", "Rate period", "Local REET"],
    values: [1, 1, 1, 1, 1],
    note: "Minimum matching checks required before treating a no-local-REET ZIP as a valid control."
  }
};

function renderCharts() {
  document.querySelectorAll("[data-chart]").forEach((element) => {
    const data = chartData[element.dataset.chart];
    if (!data) return;
    if (data.type === "bar" || data.type === "histogram") renderBar(element, data);
    if (data.type === "line") renderLine(element, data);
    if (data.type === "scatter") renderScatter(element, data);
    if (data.type === "heatmap") renderHeatmap(element, data);
    if (data.type === "matrix") renderMatrix(element, data);
  });
}

function svgBase(width = 760, height = 320) {
  return { width, height, left: 58, right: 24, top: 24, bottom: 58 };
}

function renderBar(el, data) {
  const c = svgBase();
  const max = Math.max(...data.values, ...(data.altValues || [0])) * 1.18;
  const innerW = c.width - c.left - c.right;
  const innerH = c.height - c.top - c.bottom;
  const gap = 12;
  const barW = (innerW - gap * (data.values.length - 1)) / data.values.length;
  const bars = data.values.map((value, i) => {
    const h = (value / max) * innerH;
    const x = c.left + i * (barW + gap);
    const y = c.top + innerH - h;
    const label = data.unit === "$" ? money.format(value) : `${value}${data.unit || ""}`;
    return `<rect class="bar" x="${x}" y="${y}" width="${barW}" height="${h}" rx="6"><title>${data.labels[i]}: ${label}</title></rect>
      <text x="${x + barW / 2}" y="${c.top + innerH + 24}" text-anchor="middle">${data.labels[i]}</text>
      <text x="${x + barW / 2}" y="${y - 8}" text-anchor="middle">${label}</text>`;
  }).join("");
  el.innerHTML = `<svg viewBox="0 0 ${c.width} ${c.height}" role="img" aria-label="${data.note}">
    <line class="axis" x1="${c.left}" y1="${c.top + innerH}" x2="${c.width - c.right}" y2="${c.top + innerH}"></line>
    ${bars}
  </svg><div class="legend"><span><i class="swatch"></i>${data.note}</span></div>`;
}

function renderLine(el, data) {
  const c = svgBase();
  const max = Math.max(...data.values) * 1.12;
  const min = Math.min(...data.values) * 0.82;
  const innerW = c.width - c.left - c.right;
  const innerH = c.height - c.top - c.bottom;
  const points = data.values.map((value, i) => {
    const x = c.left + (i / (data.values.length - 1)) * innerW;
    const y = c.top + innerH - ((value - min) / (max - min)) * innerH;
    return [x, y, value];
  });
  const path = points.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  const labels = points.map((p, i) => `<circle class="dot" cx="${p[0]}" cy="${p[1]}" r="5"><title>${data.labels[i]}: ${p[2]}${data.unit || ""}</title></circle><text x="${p[0]}" y="${c.top + innerH + 24}" text-anchor="middle">${data.labels[i]}</text>`).join("");
  el.innerHTML = `<svg viewBox="0 0 ${c.width} ${c.height}" role="img" aria-label="${data.note}">
    <line class="axis" x1="${c.left}" y1="${c.top + innerH}" x2="${c.width - c.right}" y2="${c.top + innerH}"></line>
    <path class="line" d="${path}"></path>${labels}
  </svg><div class="legend"><span><i class="swatch" style="background: var(--blue)"></i>${data.note}</span></div>`;
}

function renderScatter(el, data) {
  const c = svgBase();
  const xs = data.values.map((d) => d[0]);
  const ys = data.values.map((d) => d[1]);
  const minX = Math.min(...xs) * 0.9;
  const maxX = Math.max(...xs) * 1.08;
  const minY = Math.min(...ys) * 0.8;
  const maxY = Math.max(...ys) * 1.1;
  const innerW = c.width - c.left - c.right;
  const innerH = c.height - c.top - c.bottom;
  const dots = data.values.map(([xv, yv]) => {
    const x = c.left + ((xv - minX) / (maxX - minX)) * innerW;
    const y = c.top + innerH - ((yv - minY) / (maxY - minY)) * innerH;
    return `<circle class="dot" cx="${x}" cy="${y}" r="6"><title>${xv}, ${yv}</title></circle>`;
  }).join("");
  el.innerHTML = `<svg viewBox="0 0 ${c.width} ${c.height}" role="img" aria-label="${data.note}">
    <line class="axis" x1="${c.left}" y1="${c.top + innerH}" x2="${c.width - c.right}" y2="${c.top + innerH}"></line>
    <line class="axis" x1="${c.left}" y1="${c.top}" x2="${c.left}" y2="${c.top + innerH}"></line>
    ${dots}
    <text x="${c.left + innerW / 2}" y="${c.height - 12}" text-anchor="middle">${data.xLabel}</text>
    <text x="16" y="${c.top + innerH / 2}" transform="rotate(-90 16 ${c.top + innerH / 2})" text-anchor="middle">${data.yLabel}</text>
  </svg><div class="legend"><span><i class="swatch" style="background: var(--clay)"></i>${data.note}</span></div>`;
}

function colorFor(value, max) {
  const t = value / max;
  const r = Math.round(239 - t * 8);
  const g = Math.round(246 - t * 131);
  const b = Math.round(255 - t * 233);
  return `rgb(${r}, ${g}, ${b})`;
}

function renderHeatmap(el, data) {
  const c = svgBase(760, 360);
  const max = Math.max(...data.values.flat());
  const cellW = (c.width - c.left - c.right) / data.xLabels.length;
  const cellH = (c.height - c.top - c.bottom) / data.yLabels.length;
  const cells = data.values.map((row, r) => row.map((value, col) => {
    const x = c.left + col * cellW;
    const y = c.top + r * cellH;
    return `<rect class="heat-cell" x="${x}" y="${y}" width="${cellW}" height="${cellH}" fill="${colorFor(value, max)}"><title>${data.yLabels[r]} / ${data.xLabels[col]}: ${value}</title></rect><text x="${x + cellW / 2}" y="${y + cellH / 2 + 4}" text-anchor="middle">${value}</text>`;
  }).join("")).join("");
  const xLabels = data.xLabels.map((label, i) => `<text x="${c.left + i * cellW + cellW / 2}" y="${c.top - 8}" text-anchor="middle">${label}</text>`).join("");
  const yLabels = data.yLabels.map((label, i) => `<text x="${c.left - 10}" y="${c.top + i * cellH + cellH / 2 + 4}" text-anchor="end">${label}</text>`).join("");
  el.innerHTML = `<svg viewBox="0 0 ${c.width} ${c.height}" role="img" aria-label="${data.note}">${xLabels}${yLabels}${cells}</svg><div class="legend"><span><i class="swatch" style="background: var(--clay)"></i>${data.note}</span></div>`;
}

const impactCopy = {
  transaction: {
    title: "Transaction cost friction",
    copy: "Transfer taxes and closing costs concentrate at the moment a household is trying to move, sell, downsize, settle an estate, or rebalance investment risk.",
    impact: 62
  },
  supply: {
    title: "Supply and zoning friction",
    copy: "Zoning constraints, parking requirements, infrastructure timing, and development feasibility shape what can be built before any buyer reaches the market.",
    impact: 74
  },
  liquidity: {
    title: "Market liquidity friction",
    copy: "When mortgage rates rise and buyer pools narrow, small added costs become more visible because sellers and buyers have less room to absorb them.",
    impact: 68
  }
};

function initImpactDashboard() {
  const dashboard = document.querySelector("[data-impact-dashboard]");
  if (!dashboard) return;

  const title = dashboard.querySelector("[data-impact-title]");
  const copy = dashboard.querySelector("[data-impact-copy]");
  const meter = dashboard.querySelector("[data-impact-meter]");
  const buttons = dashboard.querySelectorAll("[data-impact]");

  const setImpact = (key) => {
    const item = impactCopy[key] || impactCopy.transaction;
    if (title) title.textContent = item.title;
    if (copy) copy.textContent = item.copy;
    if (meter) meter.style.setProperty("--impact", `${item.impact}%`);
    buttons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.impact === key);
    });
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => setImpact(button.dataset.impact));
  });
  setImpact("transaction");
}

function renderMatrix(el, data) {
  const c = svgBase(760, 420);
  const max = 1;
  const cellW = (c.width - c.left - c.right) / data.labels.length;
  const cellH = (c.height - c.top - c.bottom) / data.labels.length;
  const cells = data.values.map((row, r) => row.map((value, col) => {
    const x = c.left + col * cellW;
    const y = c.top + r * cellH;
    return `<rect class="heat-cell" x="${x}" y="${y}" width="${cellW}" height="${cellH}" fill="${colorFor(Math.abs(value), max)}"><title>${data.labels[r]} / ${data.labels[col]}: ${value.toFixed(2)}</title></rect><text x="${x + cellW / 2}" y="${y + cellH / 2 + 4}" text-anchor="middle">${value.toFixed(2)}</text>`;
  }).join("")).join("");
  const xLabels = data.labels.map((label, i) => `<text x="${c.left + i * cellW + cellW / 2}" y="${c.top - 8}" text-anchor="middle">${label}</text>`).join("");
  const yLabels = data.labels.map((label, i) => `<text x="${c.left - 10}" y="${c.top + i * cellH + cellH / 2 + 4}" text-anchor="end">${label}</text>`).join("");
  el.innerHTML = `<svg viewBox="0 0 ${c.width} ${c.height}" role="img" aria-label="${data.note}">${xLabels}${yLabels}${cells}</svg><div class="legend"><span><i class="swatch" style="background: var(--clay)"></i>${data.note}</span></div>`;
}

const deals = [
  { account: "Northstar Foods", rep: "Avery", region: "North", segment: "Enterprise", stage: "Negotiation", value: 184000, confidence: 82, quarter: "Q2", closeDay: 12, status: "open" },
  { account: "Brightline Health", rep: "Mina", region: "West", segment: "Mid-Market", stage: "Proposal", value: 96000, confidence: 68, quarter: "Q2", closeDay: 18, status: "open" },
  { account: "Cobalt Works", rep: "Jon", region: "East", segment: "Enterprise", stage: "Discovery", value: 142000, confidence: 44, quarter: "Q3", closeDay: 33, status: "open" },
  { account: "MetroGrid Energy", rep: "Sam", region: "South", segment: "Enterprise", stage: "Closed Won", value: 210000, confidence: 100, quarter: "Q1", closeDay: -18, status: "won" },
  { account: "Vero Retail", rep: "Avery", region: "West", segment: "SMB", stage: "Qualified", value: 42000, confidence: 55, quarter: "Q3", closeDay: 41, status: "open" },
  { account: "Atlas Freight", rep: "Priya", region: "North", segment: "Mid-Market", stage: "Negotiation", value: 118000, confidence: 76, quarter: "Q4", closeDay: 64, status: "open" },
  { account: "Harbor Bank", rep: "Mina", region: "East", segment: "Enterprise", stage: "Proposal", value: 265000, confidence: 71, quarter: "Q2", closeDay: 21, status: "open" },
  { account: "Keystone Labs", rep: "Jon", region: "South", segment: "Mid-Market", stage: "Closed Won", value: 88000, confidence: 100, quarter: "Q2", closeDay: -6, status: "won" },
  { account: "Evergreen Studio", rep: "Priya", region: "West", segment: "SMB", stage: "Discovery", value: 36000, confidence: 39, quarter: "Q4", closeDay: 79, status: "open" },
  { account: "Nimbus Cloud", rep: "Sam", region: "North", segment: "Enterprise", stage: "Proposal", value: 312000, confidence: 64, quarter: "Q3", closeDay: 45, status: "open" },
  { account: "Urban Hive", rep: "Mina", region: "South", segment: "SMB", stage: "Qualified", value: 51000, confidence: 58, quarter: "Q1", closeDay: 8, status: "lost" },
  { account: "SignalPay", rep: "Avery", region: "East", segment: "Mid-Market", stage: "Negotiation", value: 129000, confidence: 86, quarter: "Q4", closeDay: 52, status: "open" },
  { account: "Pioneer Robotics", rep: "Jon", region: "West", segment: "Enterprise", stage: "Closed Won", value: 176000, confidence: 100, quarter: "Q3", closeDay: -31, status: "won" },
  { account: "KindlePeak", rep: "Priya", region: "North", segment: "SMB", stage: "Proposal", value: 68000, confidence: 62, quarter: "Q1", closeDay: 14, status: "open" },
  { account: "Meridian Apps", rep: "Sam", region: "East", segment: "Mid-Market", stage: "Discovery", value: 79000, confidence: 36, quarter: "Q2", closeDay: 27, status: "lost" }
];

const stageOrder = ["Discovery", "Qualified", "Proposal", "Negotiation", "Closed Won"];
const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const monthlyClosed = [180000, 236000, 194000, 316000, 428000, 365000];
const monthlyPipeline = [330000, 390000, 460000, 510000, 590000, 680000];

let state = {
  period: "all",
  region: "all",
  segment: "all",
  confidence: 0,
  query: "",
  sort: "value"
};

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0
});

const elements = {
  periodFilter: document.querySelector("#periodFilter"),
  regionFilter: document.querySelector("#regionFilter"),
  segmentFilter: document.querySelector("#segmentFilter"),
  confidenceFilter: document.querySelector("#confidenceFilter"),
  confidenceValue: document.querySelector("#confidenceValue"),
  searchInput: document.querySelector("#searchInput"),
  resetBtn: document.querySelector("#resetBtn"),
  closedRevenue: document.querySelector("#closedRevenue"),
  closedDelta: document.querySelector("#closedDelta"),
  weightedPipeline: document.querySelector("#weightedPipeline"),
  winRate: document.querySelector("#winRate"),
  dealCount: document.querySelector("#dealCount"),
  avgDeal: document.querySelector("#avgDeal"),
  stageList: document.querySelector("#stageList"),
  regionGrid: document.querySelector("#regionGrid"),
  dealTable: document.querySelector("#dealTable"),
  coachText: document.querySelector("#coachText"),
  spotlightName: document.querySelector("#spotlightName"),
  spotlightMeta: document.querySelector("#spotlightMeta"),
  spotlightScore: document.querySelector("#spotlightScore"),
  scoreRing: document.querySelector("#scoreRing"),
  nextBestBtn: document.querySelector("#nextBestBtn"),
  nextBestText: document.querySelector("#nextBestText"),
  revenueChart: document.querySelector("#revenueChart")
};

function money(value) {
  return formatter.format(Math.round(value));
}

function unique(key) {
  return [...new Set(deals.map((deal) => deal[key]))].sort();
}

function populateFilters() {
  unique("region").forEach((region) => {
    elements.regionFilter.add(new Option(region, region));
  });
  unique("segment").forEach((segment) => {
    elements.segmentFilter.add(new Option(segment, segment));
  });
}

function getFilteredDeals() {
  const query = state.query.trim().toLowerCase();
  return deals.filter((deal) => {
    const text = `${deal.account} ${deal.rep} ${deal.region} ${deal.segment} ${deal.stage}`.toLowerCase();
    return (state.period === "all" || deal.quarter === state.period)
      && (state.region === "all" || deal.region === state.region)
      && (state.segment === "all" || deal.segment === state.segment)
      && deal.confidence >= state.confidence
      && (!query || text.includes(query));
  });
}

function sortedDeals(filteredDeals) {
  return [...filteredDeals].sort((a, b) => b[state.sort] - a[state.sort]);
}

function updateKpis(filteredDeals) {
  const closed = filteredDeals.filter((deal) => deal.status === "won");
  const open = filteredDeals.filter((deal) => deal.status === "open");
  const closedRevenue = closed.reduce((sum, deal) => sum + deal.value, 0);
  const openPipeline = open.reduce((sum, deal) => sum + deal.value, 0);
  const wonOrLost = filteredDeals.filter((deal) => deal.status === "won" || deal.status === "lost");
  const winRate = wonOrLost.length ? closed.length / wonOrLost.length * 100 : 0;
  const average = filteredDeals.length
    ? filteredDeals.reduce((sum, deal) => sum + deal.value, 0) / filteredDeals.length
    : 0;

  elements.closedRevenue.textContent = money(closedRevenue);
  elements.weightedPipeline.textContent = money(openPipeline);
  elements.winRate.textContent = `${percentFormatter.format(winRate)}%`;
  elements.dealCount.textContent = `${filteredDeals.length} accounts`;
  elements.avgDeal.textContent = money(average);

  const target = 420000;
  const delta = target ? ((closedRevenue - target) / target) * 100 : 0;
  elements.closedDelta.textContent = `${delta >= 0 ? "+" : ""}${percentFormatter.format(delta)}% to sales target`;
}

function updateStages(filteredDeals) {
  const totals = stageOrder.map((stage) => ({
    stage,
    value: filteredDeals
      .filter((deal) => deal.stage === stage)
      .reduce((sum, deal) => sum + deal.value, 0)
  }));
  const max = Math.max(...totals.map((item) => item.value), 1);

  elements.stageList.innerHTML = totals.map((item) => `
    <div class="stage-row">
      <div class="stage-top">
        <span>${item.stage}</span>
        <span>${money(item.value)}</span>
      </div>
      <div class="stage-track" aria-hidden="true">
        <span style="width: ${(item.value / max) * 100}%"></span>
      </div>
    </div>
  `).join("");
}

function updateRegions(filteredDeals) {
  const regions = unique("region").map((region) => {
    const regionDeals = filteredDeals.filter((deal) => deal.region === region);
    const total = regionDeals.reduce((sum, deal) => sum + deal.value, 0);
    const confidence = regionDeals.length
      ? regionDeals.reduce((sum, deal) => sum + deal.confidence, 0) / regionDeals.length
      : 0;
    return { region, total, confidence, count: regionDeals.length };
  });

  elements.regionGrid.innerHTML = regions.map((item) => `
    <div class="region-tile">
      <span>${item.region} | ${item.count} deals</span>
      <strong>${money(item.total)}</strong>
      <span>${percentFormatter.format(item.confidence)}% avg close confidence</span>
    </div>
  `).join("");
}

function updateTable(filteredDeals) {
  const rows = sortedDeals(filteredDeals).map((deal) => `
    <tr>
      <td>${deal.account}</td>
      <td>${deal.rep}</td>
      <td>${deal.region}</td>
      <td><span class="stage-pill">${deal.stage}</span></td>
      <td>${money(deal.value)}</td>
      <td>
        <span class="confidence">
          <i aria-hidden="true"><span style="width: ${deal.confidence}%"></span></i>
          ${deal.confidence}%
        </span>
      </td>
      <td>${deal.closeDay < 0 ? "Closed" : `${deal.closeDay} days`}</td>
    </tr>
  `).join("");

  elements.dealTable.innerHTML = rows || `<tr><td class="empty" colspan="7">No deals match the current filters.</td></tr>`;
}

function updateCoach(filteredDeals) {
  const open = filteredDeals.filter((deal) => deal.status === "open");
  const highConfidence = open.filter((deal) => deal.confidence >= 75);
  const soon = open.filter((deal) => deal.closeDay <= 21);

  if (!filteredDeals.length) {
    elements.coachText.textContent = "No matching accounts. Clear a filter to review the full sales pipeline.";
    return;
  }

  if (soon.length) {
    const value = soon.reduce((sum, deal) => sum + deal.value, 0);
    elements.coachText.textContent = `${soon.length} accounts are closing within 21 days. Prioritize follow-ups, decision makers, and final objections across ${money(value)}.`;
    return;
  }

  elements.coachText.textContent = `${highConfidence.length} high-confidence accounts are ready for a sales push. Keep next steps clear and move stalled buyers forward.`;
}

function updateSpotlight(filteredDeals) {
  const open = sortedDeals(filteredDeals.filter((deal) => deal.status === "open"))[0];
  if (!open) {
    elements.spotlightName.textContent = "No open accounts";
    elements.spotlightMeta.textContent = "Try a broader filter to surface the best sales opportunity.";
    elements.spotlightScore.textContent = "0%";
    elements.scoreRing.style.strokeDashoffset = 302;
    elements.nextBestText.textContent = "";
    return;
  }

  elements.spotlightName.textContent = open.account;
  elements.spotlightMeta.textContent = `${open.rep} | ${open.region} | ${money(open.value)} | closes in ${open.closeDay} days`;
  elements.spotlightScore.textContent = `${open.confidence}%`;
  elements.scoreRing.style.strokeDashoffset = 302 - (302 * open.confidence / 100);
  elements.nextBestText.textContent = buildNextBestAction(open);
}

function buildNextBestAction(deal) {
  if (deal.confidence >= 80) {
    return `Ask ${deal.rep} to confirm decision timing, buying committee status, and the final close step today.`;
  }
  if (deal.stage === "Proposal") {
    return `Book a value recap and share one relevant proof point for a similar ${deal.segment} customer.`;
  }
  if (deal.closeDay <= 21) {
    return `Remove one sales blocker this week: budget owner, competitor risk, or implementation date.`;
  }
  return `Update discovery notes before the next call so the sales path and buyer need are clearer.`;
}

function drawRevenueChart() {
  const canvas = elements.revenueChart;
  const ctx = canvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = 280;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const padding = { top: 20, right: 18, bottom: 42, left: 58 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const max = Math.max(...monthlyClosed, ...monthlyPipeline) * 1.12;
  const groupWidth = chartWidth / monthLabels.length;
  const barWidth = Math.max(16, Math.min(34, groupWidth * 0.22));

  ctx.strokeStyle = "#dfe5ee";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#6a7385";
  ctx.font = "12px Inter, sans-serif";

  for (let i = 0; i <= 4; i++) {
    const y = padding.top + chartHeight * (i / 4);
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
    const value = max * (1 - i / 4);
    ctx.fillText(`$${Math.round(value / 1000)}k`, 8, y + 4);
  }

  monthLabels.forEach((label, index) => {
    const x = padding.left + groupWidth * index + groupWidth / 2;
    const closedHeight = monthlyClosed[index] / max * chartHeight;
    const pipelineHeight = monthlyPipeline[index] / max * chartHeight;
    const closedY = padding.top + chartHeight - closedHeight;
    const pipelineY = padding.top + chartHeight - pipelineHeight;

    ctx.fillStyle = "#0e8f87";
    roundRect(ctx, x - barWidth - 3, closedY, barWidth, closedHeight, 6);
    ctx.fill();
    ctx.fillStyle = "#4e6fb5";
    roundRect(ctx, x + 3, pipelineY, barWidth, pipelineHeight, 6);
    ctx.fill();
    ctx.fillStyle = "#6a7385";
    ctx.textAlign = "center";
    ctx.fillText(label, x, height - 14);
  });
}

function roundRect(ctx, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.arcTo(x + width, y, x + width, y + height, safeRadius);
  ctx.arcTo(x + width, y + height, x, y + height, safeRadius);
  ctx.arcTo(x, y + height, x, y, safeRadius);
  ctx.arcTo(x, y, x + width, y, safeRadius);
  ctx.closePath();
}

function render() {
  const filteredDeals = getFilteredDeals();
  elements.confidenceValue.textContent = `${state.confidence}%`;
  updateKpis(filteredDeals);
  updateStages(filteredDeals);
  updateRegions(filteredDeals);
  updateTable(filteredDeals);
  updateCoach(filteredDeals);
  updateSpotlight(filteredDeals);
}

function bindEvents() {
  elements.periodFilter.addEventListener("change", (event) => {
    state.period = event.target.value;
    render();
  });
  elements.regionFilter.addEventListener("change", (event) => {
    state.region = event.target.value;
    render();
  });
  elements.segmentFilter.addEventListener("change", (event) => {
    state.segment = event.target.value;
    render();
  });
  elements.confidenceFilter.addEventListener("input", (event) => {
    state.confidence = Number(event.target.value);
    render();
  });
  elements.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value;
    render();
  });
  elements.resetBtn.addEventListener("click", () => {
    state = { period: "all", region: "all", segment: "all", confidence: 0, query: "", sort: "value" };
    elements.periodFilter.value = state.period;
    elements.regionFilter.value = state.region;
    elements.segmentFilter.value = state.segment;
    elements.confidenceFilter.value = state.confidence;
    elements.searchInput.value = state.query;
    document.querySelectorAll(".segment").forEach((button) => {
      button.classList.toggle("active", button.dataset.sort === state.sort);
    });
    render();
  });
  document.querySelectorAll(".segment").forEach((button) => {
    button.addEventListener("click", () => {
      state.sort = button.dataset.sort;
      document.querySelectorAll(".segment").forEach((item) => item.classList.toggle("active", item === button));
      render();
    });
  });
  elements.nextBestBtn.addEventListener("click", () => {
    const filteredDeals = getFilteredDeals();
    const spotlight = sortedDeals(filteredDeals.filter((deal) => deal.status === "open"))[0];
    if (spotlight) {
      elements.nextBestText.textContent = buildNextBestAction(spotlight);
    }
  });
  window.addEventListener("resize", drawRevenueChart);
}

populateFilters();
bindEvents();
drawRevenueChart();
render();

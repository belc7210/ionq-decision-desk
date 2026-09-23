const $ = (id) => document.getElementById(id);
const num = (id) => Number($(id).value || 0);

const defaults = {
  lastClose: 40.74,
  livePx: 45.67,
  high52: 84.64,
  streetPt: 69.25,
  atr: 2.6,
  beta: 3.29,
  shares: 397.3,
  cash: 2000,
  debt: 54.5,
  book: 8.73,
  orgLo: 280,
  orgHi: 290,
  combLo: 450,
  combHi: 460,
  q1: 64.67,
  q2: 80.05,
  fy25: 130.02,
  ttm: 246.47,
  gp: 76.05,
  rpo: 485,
  ebitda: 120.3,
  fcfQ2: 113.97,
  fcfQ1: 159.39,
  gaapNi: 1867.7,
  bSales: 520, bMult: 18, bSh: 460, bCash: 800, bP: 35,
  sSales: 700, sMult: 28, sSh: 440, sCash: 1200, sP: 45,
  uSales: 900, uMult: 38, uSh: 430, uCash: 1600, uP: 20,
  nav: 100000,
  riskPct: 0.75,
  stopX: 1.5,
  capPct: 2,
  satPct: 1,
};

Object.entries(defaults).forEach(([k, v]) => {
  if ($(k)) $(k).value = v;
});

document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((b) => b.classList.remove("on"));
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("on"));
    btn.classList.add("on");
    $(btn.dataset.tab).classList.add("on");
  });
});

function fmt(n, d = 1) {
  if (!Number.isFinite(n)) return "-";
  const abs = Math.abs(n);
  const s = n < 0 ? "(" : "";
  const e = n < 0 ? ")" : "";
  return s + abs.toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: d }) + e;
}
function usd(n, d = 2) {
  if (!Number.isFinite(n)) return "-";
  const sign = n < 0;
  const body = "$" + Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: d });
  return sign ? "(" + body + ")" : body;
}
function pct(n) {
  if (!Number.isFinite(n)) return "-";
  const v = (n * 100).toFixed(1) + "%";
  return n < 0 ? "(" + v.replace("-", "") + ")" : v;
}
function mult(n) {
  if (!Number.isFinite(n) || n <= 0) return "-";
  return n.toFixed(1) + "x";
}

function tickClock() {
  $("clock").textContent = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) + " ET";
}
tickClock();
setInterval(tickClock, 30000);

function recalc() {
  const modeLive = document.querySelector('input[name="mode"]:checked').value === "live";
  const px = modeLive ? num("livePx") : num("lastClose");
  const shares = num("shares");
  const netCash = num("cash") - num("debt");
  const equity = px * shares;
  const ev = equity - netCash;
  const ttm = num("ttm");
  const orgMid = (num("orgLo") + num("orgHi")) / 2;
  const combMid = (num("combLo") + num("combHi")) / 2;
  const stub = combMid - orgMid;
  const h1 = num("q1") + num("q2");
  const h2org = orgMid - h1;
  const gpM = num("gp") / ttm;
  const avgBurn = (num("fcfQ2") + num("fcfQ1")) / 2;
  const runway = avgBurn > 0 ? num("cash") / avgBurn / 4 : Infinity;

  const casePx = (sales, m, sh, cash) => (sales * m + cash) / sh;
  const bear = casePx(num("bSales"), num("bMult"), num("bSh"), num("bCash"));
  const base = casePx(num("sSales"), num("sMult"), num("sSh"), num("sCash"));
  const bull = casePx(num("uSales"), num("uMult"), num("uSh"), num("uCash"));
  const rawP = [num("bP"), num("sP"), num("uP")];
  const pSum = rawP.reduce((a, b) => a + b, 0) || 1;
  const [pB, pS, pU] = rawP.map((p) => p / pSum);
  const wpx = bear * pB + base * pS + bull * pU;
  const expRet = wpx / px - 1;

  const stopDist = num("stopX") * num("atr");
  const stop = px - stopDist;
  const stopPct = stopDist / px;
  const nav = num("nav");
  const dollarRisk = nav * (num("riskPct") / 100);
  const shImp = stopDist > 0 ? dollarRisk / stopDist : 0;
  const wImp = nav > 0 ? (shImp * px) / nav : 0;
  const wCap = Math.min(wImp, num("capPct") / 100);
  const wRec = Math.min(wCap, num("satPct") / 100);
  const notion = wRec * nav;
  const shRec = px > 0 ? notion / px : 0;

  $("heroStats").innerHTML = [
    ["Decision px", usd(px), modeLive ? "live / indicative" : "last close"],
    ["EV", usd(ev, 0) + " mm", "net cash " + usd(netCash, 0) + " mm"],
    ["EV / TTM", mult(ev / ttm), "sales " + fmt(ttm, 1) + " mm"],
    ["EV / organic FY26", mult(ev / orgMid), "mid " + fmt(orgMid, 0) + " mm"],
    ["EV / combined FY26", mult(ev / combMid), "mid " + fmt(combMid, 0) + " mm"],
    ["24-mo expected", usd(wpx) + "  " + pct(expRet), "prob-weighted price"],
  ].map(([k, v, s]) => "<div class=stat><span>" + k + "</span><b>" + v + "</b><span>" + s + "</span></div>").join("");

  $("capKv").innerHTML = [
    ["Equity value", usd(equity, 0) + " mm"],
    ["Net cash", usd(netCash, 1) + " mm"],
    ["Enterprise value", usd(ev, 0) + " mm"],
    ["P / book", mult(px / num("book"))],
    ["Vs 52w high", pct(px / num("high52") - 1)],
    ["Street PT vs px", pct(num("streetPt") / px - 1)],
    ["Gap vs last close", pct(num("livePx") / num("lastClose") - 1)],
  ].map(([k, v]) => "<div><span>" + k + "</span><b>" + v + "</b></div>").join("");

  $("econKv").innerHTML = [
    ["H1 2026 revenue", fmt(h1, 2) + " mm"],
    ["H2 organic implied", fmt(h2org, 1) + " mm  " + pct(h2org / h1 - 1)],
    ["SkyWater stub / combined", pct(stub / combMid) + "  (" + fmt(stub, 0) + " mm)"],
    ["TTM gross margin", pct(gpM)],
    ["RPO / organic mid", mult(num("rpo") / orgMid)],
    ["Q2 NI / sales (ignore)", mult(num("gaapNi") / num("q2"))],
    ["Q2 FCF burn / sales", pct(num("fcfQ2") / num("q2"))],
    ["Runway at 2q avg burn", fmt(runway, 1) + " years"],
  ].map(([k, v]) => "<div><span>" + k + "</span><b>" + v + "</b></div>").join("");

  $("pricedIn").innerHTML = [18, 28, 38].map((m) => "<div class=stat><span>FY27 sales to justify live EV @ " + m + "x</span><b>" + fmt(ev / m, 0) + " mm</b><span>ignores exit cash</span></div>").join("");

  const paint = (id, price, pNorm) => {
    $(id).innerHTML = "<span>Implied 24-mo</span><strong>" + usd(price) + "</strong><span>" + pct(price / px - 1) + " vs decision px · weight " + pct(pNorm) + "</span>";
  };
  paint("bOut", bear, pB);
  paint("sOut", base, pS);
  paint("uOut", bull, pU);
  $("bPtxt").textContent = num("bP") + "% raw";
  $("sPtxt").textContent = num("sP") + "% raw";
  $("uPtxt").textContent = num("uP") + "% raw";
  $("pSum").textContent = "Raw probabilities sum to " + fmt(pSum, 0) + "%. Weights are normalized. Expected 24-mo price " + usd(wpx) + " vs " + usd(px) + ".";

  $("sizeKv").innerHTML = [
    ["Stop / invalidation", usd(stop)],
    ["Stop distance", usd(stopDist) + "  (" + pct(stopPct) + ")"],
    ["Vol-target weight", pct(wImp)],
    ["After 2% cap", pct(wCap)],
    ["Recommended weight", pct(wRec)],
    ["Notional", usd(notion, 0)],
    ["Shares", fmt(shRec, 0)],
    ["Beta", fmt(num("beta"), 2)],
  ].map(([k, v]) => "<div><span>" + k + "</span><b>" + v + "</b></div>").join("");

  if (expRet > 0.25 && ev / combMid < 25) {
    $("ratingBadge").textContent = "HOLD / SATELLITE";
    $("actionLine").textContent = "SIZE SMALL — EDGE APPEARED IN THE MODEL";
  } else if (expRet < -0.15) {
    $("ratingBadge").textContent = "UNDERWEIGHT";
    $("actionLine").textContent = "DO NOT CHASE — MODEL EDGE IS NEGATIVE";
  } else {
    $("ratingBadge").textContent = "UNDERWEIGHT";
    $("actionLine").textContent = "DO NOT CHASE THE OPEN";
  }
}

document.querySelectorAll("input").forEach((el) => el.addEventListener("input", recalc));
recalc();

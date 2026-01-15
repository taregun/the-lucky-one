// ---------------- BASIC DATA ----------------
let balance = Number(localStorage.getItem("money")) || 0;
let cost = Number(localStorage.getItem("cost")) || 5;

// chances come from previous page
const c10 = Number(localStorage.getItem("c10")) || 0;
const c100 = Number(localStorage.getItem("c100")) || 0;
const c1000 = Number(localStorage.getItem("c1000")) || 0;

const balanceEl = document.getElementById("balance");
const costEl = document.getElementById("cost");
const resultEl = document.getElementById("result");
const wheel = document.getElementById("wheel");

balanceEl.innerText = balance;
costEl.innerText = cost;

// profit baseline = balance when page opened
const startMoney = balance;

// ---------------- STATISTICS ----------------
let history = [];
const chart = document.getElementById("chart");
const ctx = chart.getContext("2d");
const profitText = document.getElementById("profitText");

function drawChart() {
  ctx.clearRect(0, 0, chart.width, chart.height);

  if (history.length < 2) return;

  const max = Math.max(...history);
  const min = Math.min(...history);
  const range = max - min || 1;

  ctx.beginPath();
  history.forEach((v, i) => {
    const x = (i / (history.length - 1)) * chart.width;
    const y = chart.height - ((v - min) / range) * chart.height;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 2;
  ctx.stroke();

  profitText.innerText = `Profit: ${history[history.length - 1]} KM`;
}

// initial point
history.push(balance - startMoney);
drawChart();

// ---------------- GAME ----------------
function spin() {
  if (balance < cost) {
    resultEl.innerText = "Nemaš dovoljno novca.";
    return;
  }

  balance -= cost;

  const spinDeg = 360 * 5 + Math.floor(Math.random() * 360);
  wheel.style.transform = `rotate(${spinDeg}deg)`;

  setTimeout(() => {
    const reward = getReward();
    balance += reward;

    balanceEl.innerText = balance;
    localStorage.setItem("money", balance);

    const profit = balance - startMoney;
    history.push(profit);
    drawChart();

    if (reward === 0) resultEl.innerText = "Nažalost, ništa ovaj put.";
    else resultEl.innerText = `Bravo! Dobio si ${reward} KM 🎉`;

  }, 1000);
}

// ---------------- REWARD LOGIC (YOUR ORIGINAL IDEA) ----------------
function getReward() {
  const r = Math.random() * 100;

  const p10 = c10;
  const p100 = c100;
  const p1000 = c1000;
  const total = p10 + p100 + p1000;

  // if all chances are 0 → always lose
  if (total === 0) return 0;

  let current = 0;

  current += p10;
  if (r < current) return 10;

  current += p100;
  if (r < current) return 100;

  current += p1000;
  if (r < current) return 1000;

  return 0;
}

// ---------------- AUTO GAMBLER ----------------
let autoInterval = null;
let autoCounter = 0;

function startAuto() {
  const mode = document.getElementById("mode").value;
  const val = Number(document.getElementById("targetValue").value);
  const status = document.getElementById("autoStatus");

  if (autoInterval) return;

  if (mode === "manual") {
    status.innerText = "Status: manual";
    return;
  }

  autoCounter = val;
  status.innerText = "Status: running";

  autoInterval = setInterval(() => {
    if (balance < cost) {
      stopAuto();
      return;
    }

    spin();

    if (mode === "target" && balance >= val) stopAuto();

    if (mode === "counter") {
      autoCounter--;
      if (autoCounter <= 0) stopAuto();
    }

  }, 1300);
}

function stopAuto() {
  clearInterval(autoInterval);
  autoInterval = null;
  document.getElementById("autoStatus").innerText = "Status: idle";
}

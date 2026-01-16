// wrap in DOMContentLoaded so elements always exist
document.addEventListener('DOMContentLoaded', () => {

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
  const chart = document.getElementById("chart");
  const ctx = chart.getContext("2d");
  const profitText = document.getElementById("profitText");

  const spinBtn = document.getElementById("spinBtn");
  const animationToggle = document.getElementById("animationToggle");

  balanceEl.innerText = balance;
  costEl.innerText = cost;

  // profit baseline = balance when page opened
  const startMoney = balance;

  // ---------------- STATISTICS ----------------
  let history = [];

  function drawChart() {
    ctx.clearRect(0, 0, chart.width, chart.height);
    if (history.length < 1) {
      profitText.innerText = `Profit: ${history[0] || 0} KM`;
      return;
    }

    const max = Math.max(...history);
    const min = Math.min(...history);
    const range = (max - min) || 1;

    ctx.beginPath();
    history.forEach((v, i) => {
      const x = (i / Math.max(1, history.length - 1)) * chart.width;
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

  // ---------------- ANIMATION SETUP ----------------
  // animation stored as "1" (on) or "0" (off)
  function readAnimationSetting() {
    const val = localStorage.getItem("animation");
    return val === null ? true : (val === "1");
  }
  function writeAnimationSetting(enabled) {
    localStorage.setItem("animation", enabled ? "1" : "0");
  }

  // initialize toggle
  const animationEnabled = readAnimationSetting();
  animationToggle.checked = animationEnabled;
  updateWheelTransition(animationEnabled);

  animationToggle.addEventListener('change', () => {
    const enabled = animationToggle.checked;
    writeAnimationSetting(enabled);
    updateWheelTransition(enabled);
  });

  function updateWheelTransition(enabled) {
    if (!wheel) return;
    if (enabled) {
      wheel.style.transition = 'transform 1s ease';
    } else {
      wheel.style.transition = 'none';
    }
  }

  // ---------------- REWARD LOGIC ----------------
  function getReward() {
    const r = Math.random() * 100;

    const p10 = c10;
    const p100 = c100;
    const p1000 = c1000;
    const total = p10 + p100 + p1000;

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

  // ---------------- GAME ----------------
  let lastSpinDeg = 0;

  function performRewardFlow(reward, withAnimation) {
    balance += reward;
    balanceEl.innerText = balance;
    localStorage.setItem("money", balance);

    const profit = balance - startMoney;
    history.push(profit);
    drawChart();

    if (reward === 0) resultEl.innerText = "Nažalost, ništa ovaj put.";
    else resultEl.innerText = `Bravo! Dobio si ${reward} KM 🎉`;
  }

  function spin() {
    if (balance < cost) {
      resultEl.innerText = "Nemaš dovoljno novca.";
      return;
    }

    balance -= cost;
    balanceEl.innerText = balance;
    localStorage.setItem("money", balance);

    const animationOn = readAnimationSetting();

    if (!animationOn) {
      // instant: no wheel animation, immediate result
      const reward = getReward();
      performRewardFlow(reward, false);
      return;
    }

    // animated spin
    const spinDeg = 360 * 5 + Math.floor(Math.random() * 360);
    lastSpinDeg += spinDeg;
    wheel.style.transform = `rotate(${lastSpinDeg}deg)`;

    // after animation ends -> give reward
    setTimeout(() => {
      const reward = getReward();
      performRewardFlow(reward, true);
    }, 950); // slightly less than 1s to match transition
  }

  spinBtn.addEventListener('click', () => spin());

  // ---------------- AUTO GAMBLER ----------------
  let autoInterval = null;
  let autoCounter = 0;

  const startAutoBtn = document.getElementById("startAutoBtn");
  const stopAutoBtn = document.getElementById("stopAutoBtn");
  const modeSelect = document.getElementById("mode");
  const targetValueInput = document.getElementById("targetValue");
  const autoStatus = document.getElementById("autoStatus");

  startAutoBtn.addEventListener('click', startAuto);
  stopAutoBtn.addEventListener('click', stopAuto);

  function startAuto() {
    const mode = modeSelect.value;
    const val = Number(targetValueInput.value);

    if (autoInterval) return;

    if (mode === "manual") {
      autoStatus.innerText = "Status: manual";
      return;
    }

    autoCounter = val || 0;
    autoStatus.innerText = "Status: running";

    const animationOn = readAnimationSetting();
    // interval depends on animation setting: if animation off, run faster
    const intervalTime = animationOn ? 1300 : 0;

    // if animation off and intervalTime = 0, use tight loop but not block UI
    if (!animationOn) {
      // use immediate loop with small delay to yield to browser
      autoInterval = setInterval(() => {
        if (balance < cost) {
          stopAuto();
          return;
        }
        spin(); // instant
        if (mode === "target" && balance >= val) stopAuto();
        if (mode === "counter") {
          autoCounter--;
          if (autoCounter <= 0) stopAuto();
        }
      }, 20); // small delay to avoid freezing UI
    } else {
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
      }, intervalTime);
    }
  }

  function stopAuto() {
    if (autoInterval) clearInterval(autoInterval);
    autoInterval = null;
    autoStatus.innerText = "Status: idle";
  }

});

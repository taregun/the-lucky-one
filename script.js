let balance = Number(localStorage.getItem("money")) || 0;
let cost = Number(localStorage.getItem("cost")) || 5;

const c10 = Number(localStorage.getItem("c10")) || 13;
const c100 = Number(localStorage.getItem("c100")) || 6;
const c1000 = Number(localStorage.getItem("c1000")) || 1;

const balanceEl = document.getElementById("balance");
const costEl = document.getElementById("cost");
const resultEl = document.getElementById("result");
const wheel = document.getElementById("wheel");

balanceEl.innerText = balance;
costEl.innerText = cost;

function spin() {
  if (balance < cost) {
    resultEl.innerText = "Nemaš dovoljno novca za igru.";
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

    if (reward === 0) {
      resultEl.innerText = "Nažalost, ništa ovaj put.";
    } else {
      resultEl.innerText = `Bravo! Dobio si ${reward} KM 🎉`;
    }
  }, 1000);
}

function getReward() {
  const r = Math.random() * 100;

  const p10 = c10;
  const p100 = c100;
  const p1000 = c1000;
  const totalWinChance = p10 + p100 + p1000;

  // if all chances are 0 → always lose
  if (totalWinChance === 0) return 0;

  let current = 0;

  current += p10;
  if (r < current) return 10;

  current += p100;
  if (r < current) return 100;

  current += p1000;
  if (r < current) return 1000;

  return 0; // everything else = lose
}


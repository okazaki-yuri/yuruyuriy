const rollBtn = document.getElementById("rollBtn");
const diceArea = document.getElementById("dice-area");
const diceStatsDiv = document.createElement("div");
diceStatsDiv.id = "dice-stats";
diceArea.after(diceStatsDiv);

const historyDiv = document.getElementById("history");
const resetBtn = document.getElementById("resetHistory");
const shareXIcon = document.getElementById("share-x");

let soundOn = true;
let history = JSON.parse(localStorage.getItem("diceHistory")) || [];

/**
 * 履歴を作成する
 */
function renderHistory() {
  if (history.length == 0) {
    resetBtn.disabled = true;
  } else {
    resetBtn.disabled = false;
  }
  historyDiv.innerHTML = history.map((h,i) => {
    const sum = h.reduce((a,b)=>a+b,0);
    const avg = (sum/h.length).toFixed(2);
    const max = Math.max(...h);
    const min = Math.min(...h);
    if (h.length == 1) {
      return `<div class="history-item"><b>結果：</b>${h.join(", ")}</div>`;
    } else {
      return `<div class="history-item"><b>結果：</b>${h.join(", ")}<br>合計: ${sum} / 平均: ${avg} / 最大: ${max} / 最小: ${min}</div>`;
    }
  }).join("");
}

/**
 * 「合計」「平均」「最大」「最小」を作成する
 * @param {number[]} results - 出目
 */
function renderDiceStats(results) {
  const sum = results.reduce((a,b)=>a+b,0);
  const avg = (sum / results.length).toFixed(2);
  const max = Math.max(...results);
  const min = Math.min(...results);
  if (results.length == 1) {
    diceStatsDiv.textContent = "";
  } else {
    diceStatsDiv.textContent = `合計: ${sum} / 平均: ${avg} / 最大: ${max} / 最小: ${min}`;
  }
}

/**
 * サイコロカードを作成する
 * @param {number[]} values - 出目
 */
function createDiceCards(values) {
  diceArea.innerHTML = "";
  values.forEach(val => {
    const div = document.createElement("div");
    div.className = "dice-card";
    div.textContent = val;
    diceArea.appendChild(div);
  });
}

// サイコロを振る
rollBtn.addEventListener("click", () => {
  const min = parseInt(document.getElementById("minValue").value) || 1;
  const max = parseInt(document.getElementById("maxValue").value) || 6;
  const count = parseInt(document.getElementById("diceCount").value) || 1;
  const duration = parseInt(document.getElementById("duration").value) || 1000;
  let alertMessage = "";
  if (min < 0 || min > 100) { alertMessage+="最小値は0~100で入力してください。\n" }
  if (max < 0 || max > 100) { alertMessage+="最大値は0~100で入力してください。\n" }
  if (min > max) { alertMessage+="最小値が最大値より大きいです。\n" }
  if (count < 1 || count > 30) { alertMessage+="サイコロの個数は1~30で入力してください。\n" }
  if (alertMessage !== "") { alert(alertMessage); return; }

  rollBtn.disabled = true;

  let interval = setInterval(() => {
    const temp = Array.from({length: count}, () => Math.floor(Math.random() * (max - min + 1)) + min);
    createDiceCards(temp);
    renderDiceStats(temp);
  }, 100);

  setTimeout(() => {
    clearInterval(interval);
    const results = Array.from({length: count}, () => Math.floor(Math.random() * (max - min + 1)) + min);
    createDiceCards(results);
    renderDiceStats(results);

    // 履歴保存
    history.unshift(results);
    localStorage.setItem("diceHistory", JSON.stringify(history));
    renderHistory();
    rollBtn.disabled = false;
  }, duration);
});

// 履歴リセット
resetBtn.addEventListener("click", () => {
  if (history.length == 0) { return; }
  if (confirm("履歴をすべて削除しますか？")) {
    history = [];
    localStorage.removeItem("diceHistory");
    renderHistory();
    diceArea.innerHTML = "";
    diceStatsDiv.textContent = "";
  }
});

// SNSシェア
shareXIcon.addEventListener("click", () => {
  const diceText = Array.from(diceArea.children).map(d => d.textContent).join(", ");
  const statsText = diceStatsDiv.textContent;
  const text = `結果: ${diceText} \n${statsText} \n\n#サイコロツール\n`;
  const url = encodeURIComponent(location.href);
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`;
  window.open(shareUrl, "_blank");
});

// 初期描画
renderHistory();

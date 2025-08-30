let words = [];

/**
 * ローカルストレージから読み込む
 */
function loadFromLocalStorage() {
  const saved = localStorage.getItem("wordrouletteWords");
  if (saved) {
    try {
      words = JSON.parse(saved);
      updateWordList();
    } catch (e) {
      // ローカルストレージのデータが不正な場合は握りつぶす
      words = [];
      updateWordList();
      localStorage.removeItem("wordrouletteWords");
    }
  }
}

/**
 * ローカルストレージに保存する
 */
function saveToLocalStorage() {
  localStorage.setItem("wordrouletteWords", JSON.stringify(words));
}

/**
 * ことば一覧に表示することばを更新する
 */
function updateWordList() {
  const list = document.getElementById("wordList");
  list.innerHTML = "";
  words.forEach((word, index) => {
    const tag = document.createElement("div");
    tag.className = "word-tag";
    tag.textContent = word;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "×";
    removeBtn.onclick = () => {
      words.splice(index, 1);
      updateWordList();
      saveToLocalStorage();
    };
    tag.appendChild(removeBtn);
    list.appendChild(tag);
  });

  document.getElementById("sortControls").classList.toggle("hidden", words.length === 0);
  document.getElementById("resetBtn").classList.toggle("hidden", words.length === 0);
}

/**
 * ことば一覧にことばを追加する
 */
function addWord() {
  const mode = document.querySelector(".tab-button.active").dataset.tab;
  if (mode === "single") {
    const input = document.getElementById("wordInput");
    const word = input.value.trim();
    if (!word) return;
    if (words.includes(word)) {
      if (!confirm(`「${word}」はすでにあります。追加しますか？`)) return;
    }
    words.push(word);
    input.value = "";
  } else {
    const textarea = document.getElementById("multiInput");
    const newWords = textarea.value
      .split("\n")
      .map(w => w.trim())
      .filter(w => w.length > 0);
    newWords.forEach(word => {
      if (!words.includes(word)) {
        words.push(word);
      } else {
        if (confirm(`「${word}」はすでにあります。追加しますか？`)) {
          words.push(word);
        }
      }
    });
    textarea.value = "";
  }

  updateWordList();
  saveToLocalStorage();
}

/**
 * ルーレットボタン押下時に抽選を行う
 */
function spinRoulette() {
  const resultBox   = document.getElementById("resultBox");
  const spinBtn     = document.getElementById("spinBtn");
  const durationSec = Number(document.getElementById("durationSelect").value);

  // ボタンを非活性、ボタン文言を「抽選中…」に変更
  spinBtn.disabled    = true;
  spinBtn.textContent = "抽選中…";

  if (words.length === 0 || durationSec === 0) {
    // 抽選時間「なし」または単語なしパターン
    // 抽選結果を即時反映
    const pick = words.length
      ? words[Math.floor(Math.random() * words.length)]
      : "";
    resultBox.classList.remove("spin", "final");
    resultBox.textContent = pick;

    // ボタンを活性、ボタン文言を「ルーレット」に変更
    spinBtn.disabled      = false;
    spinBtn.textContent   = "ルーレット";
    return;
  }

  // 抽選時間の制御
  const totalMs       = durationSec * 1000;
  const iterations    = 30;
  let baseSpeed       = 30;  // 最速 30ms
  const denom         = (iterations - 1) * iterations / 2;
  let speedStep       = (totalMs - iterations * baseSpeed) / denom;
  if (speedStep < 0) {
    // 時間が短くてベースを下回る場合
    speedStep = 0;
    baseSpeed = totalMs / iterations;
  }

  let count     = 0;
  let finalWord = "";

  // 切り替え中の演出
  resultBox.classList.remove("final");
  resultBox.classList.add("spin");

  function step() {
    // ランダム表示
    const idx  = Math.floor(Math.random() * words.length);
    const word = words[idx];
    resultBox.textContent = word;
    finalWord = word;

    count++;
    if (count < iterations) {
      const delay = baseSpeed + count * speedStep;
      setTimeout(step, delay);
    } else {
      // 抽選結果を反映
      resultBox.classList.remove("spin");
      resultBox.classList.add("final");
      resultBox.textContent = finalWord;

      // ボタンを活性、ボタン文言を「ルーレット」に変更
      spinBtn.disabled    = false;
      spinBtn.textContent = "ルーレット";
      return;
    }
  }

  step();
}

/**
 * ことば一覧の並べ替えを行う
 * @param {string} order - 並び順（昇順/降順）
 */
function sortWords(order) {
  words.sort((a, b) => {
    if (order === "asc") return a.localeCompare(b);
    else return b.localeCompare(a);
  });
  updateWordList();
  saveToLocalStorage();
}

/**
 * ことば一覧をすべて削除する
 */
function resetWords() {
  if (confirm("ことばをすべて削除しますか？")) {
    words = [];
    updateWordList();
    localStorage.removeItem("wordrouletteWords");

    // result-box 初期状態に戻す（空に）
    document.getElementById("resultBox").textContent = "";
  }
}

// タブ切り替え処理
document.querySelectorAll(".tab-button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.add("hidden"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.remove("hidden");
  });
});

// Enterキーで単語追加（単語入力モード）
document.getElementById("wordInput").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    addWord();
  }
});

// ページ読み込み時にローカルストレージから復元
window.addEventListener("DOMContentLoaded", () => {
  loadFromLocalStorage();
});

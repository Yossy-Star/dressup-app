const TOP_COUNT = 74;
const BOTTOM_COUNT = 63;

// ===== 配列 =====
const tops = [];
const bottoms = [];

// ===== preload =====
const preloadedTops = [];
const preloadedBottoms = [];

function preloadImages(arr, target) {

  return Promise.all(

    arr.map(src => {

      return new Promise(resolve => {

        const img = new Image();

        img.onload = () => resolve();

        img.onerror = () => resolve();

        img.src = src;

        target.push(img);
      });
    })
  );
}

for (let i = 1; i <= TOP_COUNT; i++) {
  tops.push(`images/tops/top (${i}).png`);
}

for (let i = 1; i <= BOTTOM_COUNT; i++) {
  bottoms.push(`images/bottoms/bottom (${i}).png`);
}

// ===== 状態 =====
let currentStep = "top";

let topInterval = null;
let bottomInterval = null;

let lastTop = -1;
let lastBottom = -1;

let topLocked = false;
let bottomLocked = false;

// 手動選択用
let topIndex = 0;
let bottomIndex = 0;

// ===== 位置調整 =====
const adjustData = {
  base: { x: 0, y: 0, scale: 1 },
  top: { x: 0, y: 0, scale: 1 },
  bottom: { x: 0, y: 0, scale: 1 }
};

// ===== 要素取得 =====
function getEl(type) {
  return document.getElementById(type);
}

// ===== ロック =====
function toggleLock(type) {

  if (type === "top") {

    topLocked = !topLocked;

    document.getElementById("lockTop").textContent =
      topLocked ? "🔒" : "🔓";
  }

  if (type === "bottom") {

    bottomLocked = !bottomLocked;

    document.getElementById("lockBottom").textContent =
      bottomLocked ? "🔒" : "🔓";
  }
}

// ===== transform反映 =====
function applyTransform(type) {

  const el = getEl(type);
  const d = adjustData[type];

  el.style.transform =
    `translate(${d.x}px, ${d.y}px) scale(${d.scale})`;
}

// ===== 移動 =====
function move(type, axis, val) {

  adjustData[type][axis] += val;

  if (axis === "scale") {

    if (adjustData[type].scale < 0.3) {
      adjustData[type].scale = 0.3;
    }

    if (adjustData[type].scale > 3) {
      adjustData[type].scale = 3;
    }
  }

  applyTransform(type);
}

// ===== TOP スロット =====
function startTopSlot() {

  if (topLocked) return;

  clearInterval(topInterval);

  topInterval = setInterval(() => {

    let rand;

    do {
      rand = Math.floor(Math.random() * tops.length);
    } while (rand === lastTop);

    lastTop = rand;
    topIndex = rand;

    getEl("top").src = tops[rand];

    document.getElementById("topLabel").textContent =
      `top (${rand + 1})`;

  }, 160);
}

// ===== BOTTOM スロット =====
function startBottomSlot() {

  if (bottomLocked) return;

  clearInterval(bottomInterval);

  bottomInterval = setInterval(() => {

    let rand;

    do {
      rand = Math.floor(Math.random() * bottoms.length);
    } while (rand === lastBottom);

    lastBottom = rand;
    bottomIndex = rand;

    getEl("bottom").src = bottoms[rand];

    document.getElementById("bottomLabel").textContent =
      `bottom (${rand + 1})`;

  }, 160);
}

// ===== ズーム =====
function playZoom() {

  const canvas = document.getElementById("canvas-area");

  canvas.classList.remove("zoom");

  void canvas.offsetWidth;

  canvas.classList.add("zoom");
}

// ===== 星エフェクト =====
function playStarEffect(type) {

  const canvas = document.getElementById("canvas-area");
  const rect = canvas.getBoundingClientRect();

  const centerX = rect.left + rect.width / 2;

  let centerY;
  let count;
  let power;

  if (type === "top") {

    centerY = rect.top + rect.height * 0.28;

    count = 6;

    power = 220;

  } else {

    centerY = rect.top + rect.height * 0.78;

    count = 12;

    power = 420;
  }

  for (let i = 0; i < count; i++) {

    const star = document.createElement("div");

    star.className = "star";

    star.textContent = "★";

    star.style.left = centerX + "px";
    star.style.top = centerY + "px";

    const x = (Math.random() - 0.5) * power;
    const y = (Math.random() - 0.7) * power;

    star.style.setProperty("--x", x + "px");
    star.style.setProperty("--y", y + "px");

    document.body.appendChild(star);

    setTimeout(() => {
      star.remove();
    }, 600);
  }
}

// ===== 決定 =====
function decide() {

  if (currentStep === "top") {

    playZoom();

    playStarEffect("top");

    clearInterval(topInterval);

    currentStep = "bottom";

    startBottomSlot();

  } else if (currentStep === "bottom") {

    playZoom();

    playStarEffect("bottom");

    clearInterval(bottomInterval);

    currentStep = "done";
  }
}

// ===== リセット =====
function reset() {

  clearInterval(topInterval);
  clearInterval(bottomInterval);

  currentStep = "top";

  startTopSlot();
}

// ===== 全リセット =====
function fullReset() {

  clearInterval(topInterval);
  clearInterval(bottomInterval);

  topLocked = false;
  bottomLocked = false;

  document.getElementById("lockTop").textContent = "🔓";
  document.getElementById("lockBottom").textContent = "🔓";

  adjustData.base = { x: 0, y: 0, scale: 1 };
  adjustData.top = { x: 0, y: 0, scale: 1 };
  adjustData.bottom = { x: 0, y: 0, scale: 1 };

  getEl("base").src = "";
  getEl("top").src = tops[0];
  getEl("bottom").src = bottoms[0];

  applyTransform("base");
  applyTransform("top");
  applyTransform("bottom");

  topIndex = 0;
  bottomIndex = 0;

  document.getElementById("topLabel").textContent =
    "top (1)";

  document.getElementById("bottomLabel").textContent =
    "bottom (1)";

  currentStep = "top";

  localStorage.clear();

  startTopSlot();
}

// ===== 手動切替 =====

// TOP 次
function nextTop() {

  topIndex++;

  if (topIndex >= tops.length) {
    topIndex = 0;
  }

  lastTop = topIndex;

  getEl("top").src = tops[topIndex];

  document.getElementById("topLabel").textContent =
    `top (${topIndex + 1})`;
}

// TOP 前
function prevTop() {

  topIndex--;

  if (topIndex < 0) {
    topIndex = tops.length - 1;
  }

  lastTop = topIndex;

  getEl("top").src = tops[topIndex];

  document.getElementById("topLabel").textContent =
    `top (${topIndex + 1})`;
}

// BOTTOM 次
function nextBottom() {

  bottomIndex++;

  if (bottomIndex >= bottoms.length) {
    bottomIndex = 0;
  }

  lastBottom = bottomIndex;

  getEl("bottom").src = bottoms[bottomIndex];

  document.getElementById("bottomLabel").textContent =
    `bottom (${bottomIndex + 1})`;
}

// BOTTOM 前
function prevBottom() {

  bottomIndex--;

  if (bottomIndex < 0) {
    bottomIndex = bottoms.length - 1;
  }

  lastBottom = bottomIndex;

  getEl("bottom").src = bottoms[bottomIndex];

  document.getElementById("bottomLabel").textContent =
    `bottom (${bottomIndex + 1})`;
}

// ===== 起動 =====
window.addEventListener("load", async () => {

  // ローディング表示
  const loading =
    document.getElementById("loadingEffect");

  // preload 完了待ち
  await preloadImages(tops, preloadedTops);
  await preloadImages(bottoms, preloadedBottoms);

  // 初期画像
  getEl("top").src = tops[0];
  getEl("bottom").src = bottoms[0];

  document.getElementById("topLabel").textContent =
    "top (1)";

  document.getElementById("bottomLabel").textContent =
    "bottom (1)";

  // 画像アップロード
  document.getElementById("upload")
    .addEventListener("change", (e) => {

      const file = e.target.files[0];

      if (!file) return;

      const reader = new FileReader();

      reader.onload = (event) => {

        getEl("base").src = event.target.result;
      };

      reader.readAsDataURL(file);
    });

  // ローディング解除
  loading.classList.add("hide");

  setTimeout(() => {

    loading.style.display = "none";

  }, 400);

  // スロット開始
  startTopSlot();
});
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

let topLocked = false;
let bottomLocked = false;

// 手動選択用
let topIndex = 0;
let bottomIndex = 0;

// ===== シャッフルキュー =====
// do-while より効率的：シャッフル済み配列を順番に使う
function createShuffledQueue(length) {
  const arr = Array.from({ length }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

let topQueue = [];
let topQueuePos = 0;
let bottomQueue = [];
let bottomQueuePos = 0;

function nextFromQueue(queue, pos, length) {
  if (pos >= queue.length) {
    // キューを使い切ったら再シャッフル
    queue.length = 0;
    const newQueue = createShuffledQueue(length);
    newQueue.forEach(v => queue.push(v));
    pos = 0;
  }
  return { val: queue[pos], pos: pos + 1 };
}

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
    if (adjustData[type].scale < 0.3) adjustData[type].scale = 0.3;
    if (adjustData[type].scale > 3) adjustData[type].scale = 3;
  }
  applyTransform(type);
}

// ===== TOP スロット =====
function startTopSlot() {
  if (topLocked) return;
  clearInterval(topInterval);

  topInterval = setInterval(() => {
    const result = nextFromQueue(topQueue, topQueuePos, tops.length);
    topQueuePos = result.pos;
    topIndex = result.val;
    getEl("top").src = tops[topIndex];
    document.getElementById("topLabel").textContent =
      `top (${topIndex + 1})`;
  }, 200);
}

// ===== BOTTOM スロット =====
function startBottomSlot() {
  if (bottomLocked) return;
  clearInterval(bottomInterval);

  bottomInterval = setInterval(() => {
    const result = nextFromQueue(bottomQueue, bottomQueuePos, bottoms.length);
    bottomQueuePos = result.pos;
    bottomIndex = result.val;
    getEl("bottom").src = bottoms[bottomIndex];
    document.getElementById("bottomLabel").textContent =
      `bottom (${bottomIndex + 1})`;
  }, 200);
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

  let centerY, count, power;

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
    setTimeout(() => star.remove(), 600);
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

  // ベース画像をリセット（Object URLを解放）
  const baseEl = getEl("base");
  if (baseEl.src && baseEl.src.startsWith("blob:")) {
    URL.revokeObjectURL(baseEl.src);
  }
  baseEl.src = "";

  getEl("top").src = tops[0];
  getEl("bottom").src = bottoms[0];

  applyTransform("base");
  applyTransform("top");
  applyTransform("bottom");

  topIndex = 0;
  bottomIndex = 0;

  // キューをリセット
  topQueue = createShuffledQueue(tops.length);
  topQueuePos = 0;
  bottomQueue = createShuffledQueue(bottoms.length);
  bottomQueuePos = 0;

  document.getElementById("topLabel").textContent = "top (1)";
  document.getElementById("bottomLabel").textContent = "bottom (1)";

  currentStep = "top";

  localStorage.clear();

  startTopSlot();
}

// ===== 手動切替 =====

function nextTop() {
  topIndex = (topIndex + 1) % tops.length;
  getEl("top").src = tops[topIndex];
  document.getElementById("topLabel").textContent = `top (${topIndex + 1})`;
}

function prevTop() {
  topIndex = (topIndex - 1 + tops.length) % tops.length;
  getEl("top").src = tops[topIndex];
  document.getElementById("topLabel").textContent = `top (${topIndex + 1})`;
}

function nextBottom() {
  bottomIndex = (bottomIndex + 1) % bottoms.length;
  getEl("bottom").src = bottoms[bottomIndex];
  document.getElementById("bottomLabel").textContent = `bottom (${bottomIndex + 1})`;
}

function prevBottom() {
  bottomIndex = (bottomIndex - 1 + bottoms.length) % bottoms.length;
  getEl("bottom").src = bottoms[bottomIndex];
  document.getElementById("bottomLabel").textContent = `bottom (${bottomIndex + 1})`;
}

// ===== 起動 =====
window.addEventListener("load", async () => {

  const loading = document.getElementById("loadingEffect");

  // キュー初期化
  topQueue = createShuffledQueue(tops.length);
  topQueuePos = 0;
  bottomQueue = createShuffledQueue(bottoms.length);
  bottomQueuePos = 0;

  // preload 並列実行（直列→並列で高速化）
  await Promise.all([
    preloadImages(tops, preloadedTops),
    preloadImages(bottoms, preloadedBottoms)
  ]);

  // 初期画像
  getEl("top").src = tops[0];
  getEl("bottom").src = bottoms[0];

  document.getElementById("topLabel").textContent = "top (1)";
  document.getElementById("bottomLabel").textContent = "bottom (1)";

  // ===== ベース画像アップロード =====
  // Object URL方式に変更（GitHub PagesでもCSP問題なく動作）
  document.getElementById("upload").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const baseEl = getEl("base");

    // 古いObject URLを解放してメモリリーク防止
    if (baseEl.src && baseEl.src.startsWith("blob:")) {
      URL.revokeObjectURL(baseEl.src);
    }

    const objectURL = URL.createObjectURL(file);
    baseEl.src = objectURL;
  });

  // ローディング解除
  loading.classList.add("hide");
  setTimeout(() => {
    loading.style.display = "none";
  }, 400);

  // スロット開始
  startTopSlot();
});

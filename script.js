// ===== 設定 =====
const TOP_COUNT = 45;
const BOTTOM_COUNT = 30;

// ===== 配列 =====
const tops = Array.from({ length: TOP_COUNT }, (_, i) => `images/tops/top (${i + 1}).webp`);
const bottoms = Array.from({ length: BOTTOM_COUNT }, (_, i) => `images/bottoms/bottom (${i + 1}).webp`);

// ===== 状態 =====
let currentStep = "top";
let topInterval = null;
let bottomInterval = null;
let topLocked = false;
let bottomLocked = false;

// ===== 調整データ =====
const adjustData = {
  base: { x: 0, y: 0, scale: 1 },
  top:  { x: 0, y: 0, scale: 1 },
  bottom: { x: 0, y: 0, scale: 1 }
};

// ===== 要素取得 =====
function getEl(id) {
  return document.getElementById(id);
}

// ===== ロック切替 =====
function toggleLock(type) {
  if (type === "top") {
    topLocked = !topLocked;
    getEl("lockTop").textContent = topLocked ? "🔒" : "🔓";
  }
  if (type === "bottom") {
    bottomLocked = !bottomLocked;
    getEl("lockBottom").textContent = bottomLocked ? "🔒" : "🔓";
  }
}

// ===== transform =====
function applyTransform(type) {
  const { x, y, scale } = adjustData[type];
  getEl(type).style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
}

function move(type, axis, val) {
  adjustData[type][axis] += val;
  if (axis === "scale") {
    adjustData[type].scale = Math.min(3, Math.max(0.3, adjustData[type].scale));
  }
  applyTransform(type);
}

// ===== シャッフルキュー =====
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const queue = {
  top:    { list: [], pos: 0 },
  bottom: { list: [], pos: 0 },
  next(type, length) {
    const q = this[type];
    if (q.pos >= q.list.length) {
      const prev = q.list[q.list.length - 1] ?? -1;
      q.list = shuffle(Array.from({ length }, (_, i) => i));
      q.pos = 0;
      if (q.list[0] === prev && q.list.length > 1) {
        [q.list[0], q.list[1]] = [q.list[1], q.list[0]];
      }
    }
    return q.list[q.pos++];
  }
};

// ===== スロット =====
function startTopSlot() {
  if (topLocked) return;
  clearInterval(topInterval);
  topInterval = setInterval(() => {
    getEl("top").src = tops[queue.next("top", tops.length)];
  }, 50);
}

function startBottomSlot() {
  if (bottomLocked) return;
  clearInterval(bottomInterval);
  bottomInterval = setInterval(() => {
    getEl("bottom").src = bottoms[queue.next("bottom", bottoms.length)];
  }, 50);
}

// ===== ボタン =====
function decide() {
  if (currentStep === "top") {
    clearInterval(topInterval);
    currentStep = "bottom";
    startBottomSlot();
  } else if (currentStep === "bottom") {
    clearInterval(bottomInterval);
    currentStep = "done";
  }
}

function reset() {
  clearInterval(topInterval);
  clearInterval(bottomInterval);
  currentStep = "top";
  startTopSlot();
}

function fullReset() {
  clearInterval(topInterval);
  clearInterval(bottomInterval);

  topLocked = false;
  bottomLocked = false;
  getEl("lockTop").textContent = "🔓";
  getEl("lockBottom").textContent = "🔓";

  adjustData.base = { x: 0, y: 0, scale: 1 };
  adjustData.top  = { x: 0, y: 0, scale: 1 };
  adjustData.bottom = { x: 0, y: 0, scale: 1 };

  getEl("base").src = "";
  getEl("top").src = "";
  getEl("bottom").src = "";

  localStorage.clear();
  startTopSlot();
}

// ===== 初期化 =====
window.addEventListener("load", () => {
  getEl("upload").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      getEl("base").src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  startTopSlot();
});

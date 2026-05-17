// ===== 設定 =====
const TOP_COUNT = 45;
const BOTTOM_COUNT = 30;

// ===== 配列（変更しない）=====
const tops = [];
const bottoms = [];

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

// ★ ロック状態
let topLocked = false;
let bottomLocked = false;

// ===== 調整データ =====
const adjustData = {
  base: { x: 0, y: 0, scale: 1 },
  top: { x: 0, y: 0, scale: 1 },
  bottom: { x: 0, y: 0, scale: 1 }
};

// ===== 共通 =====
function getEl(type) {
  return document.getElementById(type);
}

// ===== ロック切替 =====
function toggleLock(type) {

  if (type === "top") {
    topLocked = !topLocked;
    document.getElementById("lockTop").textContent = topLocked ? "🔒" : "🔓";
  }

  if (type === "bottom") {
    bottomLocked = !bottomLocked;
    document.getElementById("lockBottom").textContent = bottomLocked ? "🔒" : "🔓";
  }
}

// ===== transform =====
function applyTransform(type) {
  const el = getEl(type);
  const d = adjustData[type];

  el.style.transform = `
    translate(${d.x}px, ${d.y}px)
    scale(${d.scale})
  `;
}

function move(type, axis, val) {
  adjustData[type][axis] += val;

  if (axis === "scale") {
    if (adjustData[type].scale < 0.3) adjustData[type].scale = 0.3;
    if (adjustData[type].scale > 3) adjustData[type].scale = 3;
  }

  applyTransform(type);
}

// ===== スロット =====
function startTopSlot() {
  if (topLocked) return; // ★ロック中は回さない

  clearInterval(topInterval);

  topInterval = setInterval(() => {
    let rand;
    do {
      rand = Math.floor(Math.random() * tops.length);
    } while (rand === lastTop);

    lastTop = rand;
    getEl("top").src = tops[rand];

  }, 50);
}

function startBottomSlot() {
  if (bottomLocked) return; // ★ロック中は回さない

  clearInterval(bottomInterval);

  bottomInterval = setInterval(() => {
    let rand;
    do {
      rand = Math.floor(Math.random() * bottoms.length);
    } while (rand === lastBottom);

    lastBottom = rand;
    getEl("bottom").src = bottoms[rand];

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

  document.getElementById("lockTop").textContent = "🔓";
  document.getElementById("lockBottom").textContent = "🔓";

  adjustData.base = { x: 0, y: 0, scale: 1 };
  adjustData.top = { x: 0, y: 0, scale: 1 };
  adjustData.bottom = { x: 0, y: 0, scale: 1 };

  getEl("base").src = "";
  getEl("top").src = "";
  getEl("bottom").src = "";

  localStorage.clear();

  startTopSlot();
}

// ===== 初期化 =====
window.addEventListener("load", () => {

  const upload = document.getElementById("upload");

  upload.addEventListener("change", (e) => {
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
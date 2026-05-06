// ===== 設定 =====
const TOP_COUNT = 5;
const BOTTOM_COUNT = 5;

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

function getKey(type) {
  const el = getEl(type);
  if (!el || !el.src) return null;
  return "adjust:" + type + ":" + el.src;
}

function saveAdjust(type) {
  const key = getKey(type);
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(adjustData[type]));
}

function loadAdjust(type) {
  const key = getKey(type);
  if (!key) return;

  const data = localStorage.getItem(key);

  if (!data) {
    adjustData[type] = { x: 0, y: 0, scale: 1 };
  } else {
    adjustData[type] = JSON.parse(data);
  }

  applyTransform(type);
}

function applyTransform(type) {
  const el = getEl(type);
  if (!el) return;

  const d = adjustData[type];

  el.style.transform = `
    translate(${d.x}px, ${d.y}px)
    scale(${d.scale})
  `;

  saveAdjust(type);
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
  clearInterval(topInterval);

  topInterval = setInterval(() => {
    let rand;
    do {
      rand = Math.floor(Math.random() * tops.length);
    } while (rand === lastTop);

    lastTop = rand;

    const el = getEl("top");
    el.src = tops[rand];
    el.onload = () => loadAdjust("top");

  }, 50);
}

function startBottomSlot() {
  clearInterval(bottomInterval);

  bottomInterval = setInterval(() => {
    let rand;
    do {
      rand = Math.floor(Math.random() * bottoms.length);
    } while (rand === lastBottom);

    lastBottom = rand;

    const el = getEl("bottom");
    el.src = bottoms[rand];
    el.onload = () => loadAdjust("bottom");

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

// ===== 全リセット =====
function fullReset() {

  clearInterval(topInterval);
  clearInterval(bottomInterval);

  currentStep = "top";
  lastTop = -1;
  lastBottom = -1;

  adjustData.base = { x: 0, y: 0, scale: 1 };
  adjustData.top = { x: 0, y: 0, scale: 1 };
  adjustData.bottom = { x: 0, y: 0, scale: 1 };

  getEl("base").src = "";
  getEl("top").src = "";
  getEl("bottom").src = "";

  localStorage.clear();

  ["base","top","bottom"].forEach(t => {
    const el = getEl(t);
    if (el) el.style.transform = "";
  });

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
      const base = getEl("base");
      base.src = event.target.result;
      localStorage.setItem("userImage", event.target.result);
      loadAdjust("base");
    };

    reader.readAsDataURL(file);
  });

  const saved = localStorage.getItem("userImage");
  if (saved) {
    const base = getEl("base");
    base.src = saved;
    loadAdjust("base");
  }

  startTopSlot();
});
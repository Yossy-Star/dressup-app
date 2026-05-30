const TOP_COUNT = 60;
const BOTTOM_COUNT = 40;

// ===== 配列 =====
const tops = Array.from({ length: TOP_COUNT }, (_, i) => `images/tops/top (${i + 1}).webp`);
const bottoms = Array.from({ length: BOTTOM_COUNT }, (_, i) => `images/bottoms/bottom (${i + 1}).webp`);

// ===== 状態 =====
let currentStep = "top";

let topInterval = null;
let bottomInterval = null;

let topLocked = false;
let bottomLocked = false;

let topIndex = 0;
let bottomIndex = 0;

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
  top: { list: [], pos: 0 },
  bottom: { list: [], pos: 0 },

  next(type, length) {

    const q = this[type];

    if (q.pos >= q.list.length) {

      const prev = q.list[q.list.length - 1] ?? -1;

      q.list = shuffle(
        Array.from({ length }, (_, i) => i)
      );

      q.pos = 0;

      if (q.list[0] === prev && q.list.length > 1) {
        [q.list[0], q.list[1]] = [q.list[1], q.list[0]];
      }
    }

    return q.list[q.pos++];
  }
};

// ===== 位置調整 =====
const adjustData = {
  base: { x: 0, y: 0, scale: 1 },
  top: { x: 0, y: 0, scale: 1 },
  bottom: { x: 0, y: 0, scale: 1 }
};

// ===== 要素取得 =====
const elCache = {};

function getEl(id) {
  return elCache[id] || (
    elCache[id] = document.getElementById(id)
  );
}

// ===== 滅ボタン更新 =====
// topIndex===49（top50）かつスロット停止後（currentStep!=="top"）のみ有効
function updateMetsuBtn() {
  const btn = document.getElementById('metsu-btn');
  if (!btn) return;
  const isTop50   = (topIndex === 49);
  const isStopped = (currentStep !== "top");
  btn.disabled = !(isTop50 && isStopped);
}

// ===== ロック =====
function toggleLock(type) {

  if (type === "top") {

    topLocked = !topLocked;

    getEl("lockTop").textContent =
      topLocked ? "🔒" : "🔓";
  }

  if (type === "bottom") {

    bottomLocked = !bottomLocked;

    getEl("lockBottom").textContent =
      bottomLocked ? "🔒" : "🔓";
  }
}

// ===== transform =====
function applyTransform(type) {

  const { x, y, scale } = adjustData[type];

  getEl(type).style.transform =
    `translate(${x}px, ${y}px) scale(${scale})`;
}

// ===== 移動 =====
function move(type, axis, val) {

  adjustData[type][axis] += val;

  if (axis === "scale") {

    adjustData[type].scale =
      Math.min(
        3,
        Math.max(0.3, adjustData[type].scale)
      );
  }

  applyTransform(type);
}

// ===== TOP スロット =====
function startTopSlot() {

  if (topLocked) return;

  clearInterval(topInterval);

  topInterval = setInterval(() => {

    const rand =
      queue.next("top", tops.length);

    topIndex = rand;

    getEl("top").src = tops[rand];

    getEl("topLabel").textContent =
      `top (${rand + 1})`;

    // スロット中は滅ボタン無効
    updateMetsuBtn();

  }, 120);
}

// ===== BOTTOM スロット =====
function startBottomSlot() {

  if (bottomLocked) return;

  clearInterval(bottomInterval);

  bottomInterval = setInterval(() => {

    const rand =
      queue.next("bottom", bottoms.length);

    bottomIndex = rand;

    getEl("bottom").src = bottoms[rand];

    getEl("bottomLabel").textContent =
      `bottom (${rand + 1})`;

  }, 120);
}

// ===== 星エフェクト =====
function playStarEffect(type) {

  const canvas = getEl("canvas-area");

  const rect =
    canvas.getBoundingClientRect();

  const centerX =
    rect.left + rect.width / 2;

  const isTop = type === "top";

  const centerY =
    rect.top + rect.height * (
      isTop ? 0.28 : 0.78
    );

  const count =
    isTop ? 6 : 12;

  const power =
    isTop ? 220 : 420;

  for (let i = 0; i < count; i++) {

    const star =
      document.createElement("img");

    star.src =
      "data:image/svg+xml;charset=utf-8," +
      encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
          <text x="50%" y="50%"
            dominant-baseline="middle"
            text-anchor="middle"
            font-size="52"
            fill="gold">★</text>
        </svg>
      `);

    star.style.position = "fixed";

    star.style.left =
      centerX + "px";

    star.style.top =
      centerY + "px";

    star.style.width = "32px";
    star.style.height = "32px";

    star.style.pointerEvents = "none";

    star.style.zIndex = "9999";

    const moveX =
      (Math.random() - 0.5) * power;

    const moveY =
      (Math.random() - 0.7) * power;

    const rotate =
      Math.random() * 720 - 360;

    star.animate(
      [
        {
          transform:
            "translate(-50%, -50%) scale(0.3) rotate(0deg)",
          opacity: 1
        },
        {
          transform:
            `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))
             scale(1.8)
             rotate(${rotate}deg)`,
          opacity: 0
        }
      ],
      {
        duration: 650,
        easing: "ease-out",
        fill: "forwards"
      }
    );

    document.body.appendChild(star);

    setTimeout(() => {
      star.remove();
    }, 700);
  }
}

// ===== 決定 =====
function decide() {

  if (currentStep === "top") {

    playStarEffect("top");

    clearInterval(topInterval);

    currentStep = "bottom";

    updateMetsuBtn();

    startBottomSlot();

  } else if (currentStep === "bottom") {

    playStarEffect("bottom");

    clearInterval(bottomInterval);

    currentStep = "done";

    updateMetsuBtn();
  }
}

// ===== リセット =====
function reset() {

  clearInterval(topInterval);
  clearInterval(bottomInterval);

  currentStep = "top";

  updateMetsuBtn();

  startTopSlot();
}

// ===== 全リセット =====
function fullReset() {

  clearInterval(topInterval);
  clearInterval(bottomInterval);

  topLocked = false;
  bottomLocked = false;

  getEl("lockTop").textContent = "🔓";
  getEl("lockBottom").textContent = "🔓";

  adjustData.base = {
    x: 0,
    y: 0,
    scale: 1
  };

  adjustData.top = {
    x: 0,
    y: 0,
    scale: 1
  };

  adjustData.bottom = {
    x: 0,
    y: 0,
    scale: 1
  };

  applyTransform("base");
  applyTransform("top");
  applyTransform("bottom");

  getEl("top").style.filter = "";
  getEl("bottom").style.filter = "";

  topHue = 0;
  bottomHue = 0;

  topBrightness = 1.05;
  bottomBrightness = 1.05;

  getEl("topLabel").textContent =
    "top (1)";

  getEl("bottomLabel").textContent =
    "bottom (1)";

  currentStep = "done";

  updateMetsuBtn();
}

// ===== 手動切替 =====
function nextTop() {

  topIndex =
    (topIndex + 1) % tops.length;

  getEl("top").src =
    tops[topIndex];

  getEl("topLabel").textContent =
    `top (${topIndex + 1})`;

  updateMetsuBtn();
}

function prevTop() {

  topIndex =
    (topIndex - 1 + tops.length) %
    tops.length;

  getEl("top").src =
    tops[topIndex];

  getEl("topLabel").textContent =
    `top (${topIndex + 1})`;

  updateMetsuBtn();
}

function nextBottom() {

  bottomIndex =
    (bottomIndex + 1) %
    bottoms.length;

  getEl("bottom").src =
    bottoms[bottomIndex];

  getEl("bottomLabel").textContent =
    `bottom (${bottomIndex + 1})`;
}

function prevBottom() {

  bottomIndex =
    (bottomIndex - 1 + bottoms.length) %
    bottoms.length;

  getEl("bottom").src =
    bottoms[bottomIndex];

  getEl("bottomLabel").textContent =
    `bottom (${bottomIndex + 1})`;
}

// ===== 色変更 =====
let topHue = 0;
let bottomHue = 0;

let topBrightness = 1.05;
let bottomBrightness = 1.05;

// ===== filter更新 =====
function updateTopFilter() {

  getEl("top").style.filter =
    `hue-rotate(${topHue}deg)
     saturate(1.2)
     brightness(${topBrightness})`;
}

function updateBottomFilter() {

  getEl("bottom").style.filter =
    `hue-rotate(${bottomHue}deg)
     saturate(1.2)
     brightness(${bottomBrightness})`;
}

// ===== TOP 色 =====
function changeTopColor(value) {

  topHue += value;

  updateTopFilter();
}

// ===== BOTTOM 色 =====
function changeBottomColor(value) {

  bottomHue += value;

  updateBottomFilter();
}

// ===== TOP 明度 =====
function changeTopBrightness(value) {

  topBrightness += value;

  topBrightness =
    Math.max(0.2,
    Math.min(3, topBrightness));

  updateTopFilter();
}

// ===== BOTTOM 明度 =====
function changeBottomBrightness(value) {

  bottomBrightness += value;

  bottomBrightness =
    Math.max(0.2,
    Math.min(3, bottomBrightness));

  updateBottomFilter();
}

// ===== 起動 =====
window.addEventListener("load", async () => {

  // ===== 全画像プリロード =====
  const preloadImages = [
    ...tops,
    ...bottoms
  ];

  await Promise.all(

    preloadImages.map(src => {

      return new Promise(resolve => {

        const img = new Image();

        img.onload = resolve;
        img.onerror = resolve;

        img.src = src;
      });
    })
  );

  // ===== 初期画像 =====
  getEl("top").src = tops[0];
  getEl("bottom").src = bottoms[0];

  getEl("topLabel").textContent =
    "top (1)";

  getEl("bottomLabel").textContent =
    "bottom (1)";

  // ===== アップロード =====
  getEl("upload").addEventListener(
    "change",
    (e) => {

      const file =
        e.target.files[0];

      if (!file) return;

      const reader =
        new FileReader();

      reader.onload = (event) => {

        getEl("base").src =
          event.target.result;
      };

      reader.readAsDataURL(file);
    }
  );

  // ===== ロード画面解除 =====
  getEl("loading-screen").style.display =
    "none";

  // ===== スロット開始 =====
  startTopSlot();
});

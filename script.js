const TOP_COUNT = 74;
const BOTTOM_COUNT = 63;

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
// Fisher-Yates シャッフル
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// インデックス配列を管理するキュー
const queue = {
  top: { list: [], pos: 0 },
  bottom: { list: [], pos: 0 },
  // 次のインデックスを取得（連続同一を避けるため末尾チェック）
  next(type, length) {
    const q = this[type];
    if (q.pos >= q.list.length) {
      const prev = q.list[q.list.length - 1] ?? -1;
      q.list = shuffle(Array.from({ length }, (_, i) => i));
      q.pos = 0;
      // シャッフル後の先頭が直前と同じなら1つずらす
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

// ===== 要素取得（キャッシュ） =====
const elCache = {};
function getEl(id) {
  return elCache[id] || (elCache[id] = document.getElementById(id));
}

// ===== ロック =====
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

// ===== transform反映 =====
function applyTransform(type) {
  const { x, y, scale } = adjustData[type];
  getEl(type).style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
}

// ===== 移動 =====
function move(type, axis, val) {
  adjustData[type][axis] += val;
  if (axis === "scale") {
    adjustData[type].scale = Math.min(3, Math.max(0.3, adjustData[type].scale));
  }
  applyTransform(type);
}

// ===== TOP スロット =====
function startTopSlot() {
  if (topLocked) return;
  clearInterval(topInterval);
  topInterval = setInterval(() => {
    const rand = queue.next("top", tops.length);
    topIndex = rand;
    getEl("top").src = tops[rand];
    getEl("topLabel").textContent = `top (${rand + 1})`;
  }, 120); // 120ms（50msから変更、体感差なし・負荷減）
}

// ===== BOTTOM スロット =====
function startBottomSlot() {
  if (bottomLocked) return;
  clearInterval(bottomInterval);
  bottomInterval = setInterval(() => {
    const rand = queue.next("bottom", bottoms.length);
    bottomIndex = rand;
    getEl("bottom").src = bottoms[rand];
    getEl("bottomLabel").textContent = `bottom (${rand + 1})`;
  }, 120);
}

// ===== ズーム =====
function playZoom() {
  const canvas = getEl("canvas-area");
  canvas.classList.remove("zoom");
  void canvas.offsetWidth;
  canvas.classList.add("zoom");
}

// ===== 星エフェクト =====
function playStarEffect(type) {

  const canvas = getEl("canvas-area");
  const rect = canvas.getBoundingClientRect();

  const centerX = rect.left + rect.width / 2;

  const isTop = type === "top";
  const centerY = rect.top + rect.height * (isTop ? 0.28 : 0.78);

  const count = isTop ? 6 : 12;
  const power = isTop ? 220 : 420;

  for (let i = 0; i < count; i++) {

    const star = document.createElement("img");

    // SVG星画像
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
    star.style.left = centerX + "px";
    star.style.top = centerY + "px";

    star.style.width = "32px";
    star.style.height = "32px";

    star.style.pointerEvents = "none";
    star.style.zIndex = "9999";

    const moveX = (Math.random() - 0.5) * power;
    const moveY = (Math.random() - 0.7) * power;

    const rotate = Math.random() * 720 - 360;

    star.animate(
      [
        {
          transform: "translate(-50%, -50%) scale(0.3) rotate(0deg)",
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
  getEl("lockTop").textContent = "🔓";
  getEl("lockBottom").textContent = "🔓";

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

  getEl("topLabel").textContent = "top (1)";
  getEl("bottomLabel").textContent = "bottom (1)";

  currentStep = "top";

  localStorage.clear();

  startTopSlot();
}

// ===== 手動切替（% で1行化） =====
function nextTop() {
  topIndex = (topIndex + 1) % tops.length;
  getEl("top").src = tops[topIndex];
  getEl("topLabel").textContent = `top (${topIndex + 1})`;
}

function prevTop() {
  topIndex = (topIndex - 1 + tops.length) % tops.length;
  getEl("top").src = tops[topIndex];
  getEl("topLabel").textContent = `top (${topIndex + 1})`;
}

function nextBottom() {
  bottomIndex = (bottomIndex + 1) % bottoms.length;
  getEl("bottom").src = bottoms[bottomIndex];
  getEl("bottomLabel").textContent = `bottom (${bottomIndex + 1})`;
}

function prevBottom() {
  bottomIndex = (bottomIndex - 1 + bottoms.length) % bottoms.length;
  getEl("bottom").src = bottoms[bottomIndex];
  getEl("bottomLabel").textContent = `bottom (${bottomIndex + 1})`;
}

// ===== 起動 =====
window.addEventListener("load", async () => {

  // 初期画像を並列プリロード（await A; await B → Promise.all）
  await Promise.all([
    new Promise(resolve => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve; // 失敗しても続行
      img.src = tops[0];
      getEl("top").src = tops[0];
    }),
    new Promise(resolve => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve;
      img.src = bottoms[0];
      getEl("bottom").src = bottoms[0];
    })
  ]);

  getEl("topLabel").textContent = "top (1)";
  getEl("bottomLabel").textContent = "bottom (1)";

// ===== 画像アップロード（FileReader方式に戻す） =====
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
const TOP_COUNT = 45;
const BOTTOM_COUNT = 30;

const tops = [];
const bottoms = [];

for (let i = 1; i <= TOP_COUNT; i++) {
  tops.push(`images/tops/top (${i}).png`);
}

for (let i = 1; i <= BOTTOM_COUNT; i++) {
  bottoms.push(`images/bottoms/bottom (${i}).png`);
}

let currentStep = "top";
let topInterval = null;
let bottomInterval = null;

let lastTop = -1;
let lastBottom = -1;

let topLocked = false;
let bottomLocked = false;

const adjustData = {
  base: { x: 0, y: 0, scale: 1 },
  top: { x: 0, y: 0, scale: 1 },
  bottom: { x: 0, y: 0, scale: 1 }
};

function getEl(type) {
  return document.getElementById(type);
}

function toggleLock(type) {
  if (type === "top") {
    topLocked = !topLocked;
    lockTop.textContent = topLocked ? "🔒" : "🔓";
  }
  if (type === "bottom") {
    bottomLocked = !bottomLocked;
    lockBottom.textContent = bottomLocked ? "🔒" : "🔓";
  }
}

function applyTransform(type) {
  const el = getEl(type);
  const d = adjustData[type];
  el.style.transform = `translate(${d.x}px, ${d.y}px) scale(${d.scale})`;
}

function move(type, axis, val) {
  adjustData[type][axis] += val;

  if (axis === "scale") {
    if (adjustData[type].scale < 0.3) adjustData[type].scale = 0.3;
    if (adjustData[type].scale > 3) adjustData[type].scale = 3;
  }

  applyTransform(type);
}

function startTopSlot() {
  if (topLocked) return;

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
  if (bottomLocked) return;

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

// ===== ズーム =====
function playZoom() {
  const canvas = document.getElementById("canvas-area");

  canvas.classList.remove("zoom");
  void canvas.offsetWidth;
  canvas.classList.add("zoom");
}

// ===== 星（安定版）=====
function playStarEffect(type) {

  const canvas = document.getElementById("canvas-area");
  const rect = canvas.getBoundingClientRect();

  const centerX = rect.left + rect.width / 2;

  let centerY;
  let count;

  if (type === "top") {
    centerY = rect.top + rect.height * 0.3;
    count = 6;
  } else {
    centerY = rect.top + rect.height * 0.65;
    count = 12; // ★最後は多め
  }

  for (let i = 0; i < count; i++) {
    const star = document.createElement("div");
    star.className = "star";
    star.textContent = "★";

    star.style.left = centerX + "px";
    star.style.top = centerY + "px";

    const x = (Math.random() - 0.5) * 400;
    const y = (Math.random() - 0.5) * 400;

    star.style.setProperty("--x", x + "px");
    star.style.setProperty("--y", y + "px");

    document.body.appendChild(star);

    setTimeout(() => star.remove(), 600);
  }
}

// ===== ボタン =====
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

  lockTop.textContent = "🔓";
  lockBottom.textContent = "🔓";

  adjustData.base = { x: 0, y: 0, scale: 1 };
  adjustData.top = { x: 0, y: 0, scale: 1 };
  adjustData.bottom = { x: 0, y: 0, scale: 1 };

  getEl("base").src = "";
  getEl("top").src = "";
  getEl("bottom").src = "";

  localStorage.clear();

  startTopSlot();
}

window.addEventListener("load", () => {

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
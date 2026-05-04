// ===== 設定 =====
const TOP_COUNT = 5;
const BOTTOM_COUNT = 5;

// ===== 配列生成 =====
const tops = [];
const bottoms = [];

for (let i = 1; i <= TOP_COUNT; i++) {
  tops.push(`images/tops/top${i}.png`);
}

for (let i = 1; i <= BOTTOM_COUNT; i++) {
  bottoms.push(`images/bottoms/bottom${i}.png`);
}

// ===== 状態 =====
let currentStep = "top";
let topInterval = null;
let bottomInterval = null;

let lastTop = -1;
let lastBottom = -1;

let isTopFront = true;

// ===== 上スロット =====
function startTopSlot() {
  clearInterval(topInterval);

  topInterval = setInterval(() => {
    let rand;
    do {
      rand = Math.floor(Math.random() * tops.length);
    } while (rand === lastTop);

    lastTop = rand;
    document.getElementById("top").src = tops[rand];
  }, 50);
}

// ===== 下スロット =====
function startBottomSlot() {
  clearInterval(bottomInterval);

  bottomInterval = setInterval(() => {
    let rand;
    do {
      rand = Math.floor(Math.random() * bottoms.length);
    } while (rand === lastBottom);

    lastBottom = rand;
    document.getElementById("bottom").src = bottoms[rand];
  }, 50);
}

// ===== 決定 =====
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

// ===== リセット =====
function reset() {
  clearInterval(topInterval);
  clearInterval(bottomInterval);

  currentStep = "top";

  document.getElementById("top").src = tops[0];
  document.getElementById("bottom").src = bottoms[0];

  startTopSlot();
}

// ===== 前後切替 =====
function toggleLayer() {
  const top = document.getElementById("top");
  const bottom = document.getElementById("bottom");

  if (isTopFront) {
    top.style.zIndex = 1;
    bottom.style.zIndex = 2;
  } else {
    top.style.zIndex = 2;
    bottom.style.zIndex = 1;
  }

  isTopFront = !isTopFront;
}

// ===== 画像アップロード =====
const upload = document.getElementById("upload");

upload.addEventListener("change", function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    const dataUrl = event.target.result;

    document.getElementById("base").src = dataUrl;
    localStorage.setItem("userImage", dataUrl);
  };

  reader.readAsDataURL(file);
});

// ===== 起動時 =====
window.addEventListener("load", function() {
  const savedImage = localStorage.getItem("userImage");

  if (savedImage) {
    document.getElementById("base").src = savedImage;
  }

  startTopSlot();
});

// ===== 画像変更 =====
function resetImage() {
  localStorage.removeItem("userImage");
  location.reload();
}
import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInAnonymously }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, set }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ===== Firebase 設定 =====
const firebaseConfig = {
  apiKey:            "AIzaSyCCXS7VkDZywh84EtS3AtTUfdvOmdKEyaM",
  authDomain:        "musicar-c18e9.firebaseapp.com",
  databaseURL:       "https://musicar-c18e9-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "musicar-c18e9",
  storageBucket:     "musicar-c18e9.firebasestorage.app",
  messagingSenderId: "546300872409",
  appId:             "1:546300872409:web:53b357be74d3e5a136e0c8"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getDatabase(app);

// ===== パスワード固定（12345） =====
const PASSWORD = "12345";

// ===== SHA-256 ハッシュ =====
async function sha256(msg) {
  const buf  = new TextEncoder().encode(msg);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ===== 送信処理 =====
window.sendMetsu = async function () {
  const btn = document.getElementById('metsu-btn');

  // 二重送信防止
  btn.disabled = true;

  try {
    const hash = await sha256(PASSWORD);

    await signInAnonymously(auth);

    await set(ref(db, 'main'), {
      command:      'music9',
      passwordHash: hash,
      timestamp:    Date.now()
    });

    console.log('滅 送信完了: music9');

  } catch (e) {
    console.error('滅 送信エラー:', e);

  } finally {
    // 送信後も条件を満たしていれば再度有効化（script.js側の関数を呼ぶ）
    if (typeof updateMetsuBtn === 'function') updateMetsuBtn();
  }
};

// ===== ボタンにイベントを登録 =====
// index.html 側の onclick 属性でも動くが、
// module スコープからも確実に登録しておく
window.addEventListener('load', () => {
  const btn = document.getElementById('metsu-btn');
  if (btn) {
    btn.addEventListener('click', () => window.sendMetsu());
  }
});

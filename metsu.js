import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInAnonymously }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, set }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

console.log('[metsu] metsu.js 読み込み開始');

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

let app, auth, db;

try {
  app  = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db   = getDatabase(app);
  console.log('[metsu] Firebase 初期化 OK');
} catch(e) {
  console.error('[metsu] Firebase 初期化 エラー:', e);
}

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
async function sendMetsu() {
  console.log('[metsu] sendMetsu() 呼ばれた');

  const btn = document.getElementById('metsu-btn');
  if (btn) btn.disabled = true;

  if (!db || !auth) {
    console.error('[metsu] db または auth が未初期化');
    if (btn) btn.disabled = false;
    return;
  }

  try {
    console.log('[metsu] SHA-256 ハッシュ計算中...');
    const hash = await sha256(PASSWORD);
    console.log('[metsu] hash:', hash.slice(0, 8) + '...');

    console.log('[metsu] signInAnonymously 中...');
    await signInAnonymously(auth);
    console.log('[metsu] 認証 OK');

    console.log('[metsu] Firebase set 中...');
    await set(ref(db, 'main'), {
      command:      'music9',
      passwordHash: hash,
      timestamp:    Date.now()
    });

    console.log('[metsu] 送信完了: music9');

  } catch (e) {
    console.error('[metsu] 送信エラー:', e.code, e.message);
  } finally {
    // script.js 側の updateMetsuBtn を呼んで状態を戻す
    if (typeof window.updateMetsuBtn === 'function') {
      window.updateMetsuBtn();
    } else if (btn) {
      btn.disabled = false;
    }
  }
}

// ===== グローバルに公開 =====
window.sendMetsu = sendMetsu;
console.log('[metsu] window.sendMetsu 登録 OK');

// ===== ボタンにクリックイベントを登録 =====
// DOMContentLoaded / load どちらでも対応
function registerBtn() {
  const btn = document.getElementById('metsu-btn');
  if (btn) {
    btn.addEventListener('click', sendMetsu);
    console.log('[metsu] ボタン click イベント登録 OK');
  } else {
    console.warn('[metsu] metsu-btn が見つからない');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', registerBtn);
} else {
  registerBtn();
}

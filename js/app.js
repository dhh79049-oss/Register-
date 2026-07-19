// =====================================================
// FIX LAG PRO - ỨNG DỤNG TỐI ƯU GAME
// =====================================================

// ---- DOM refs ----
const keyInput = document.getElementById('key-input');
const activateBtn = document.getElementById('activate-btn');
const keyMessage = document.getElementById('key-message');
const keySection = document.getElementById('key-section');
const mainContent = document.getElementById('main-content');
const toast = document.getElementById('toast');

// Tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Status
const cpuSpan = document.getElementById('cpu-usage');
const ramSpan = document.getElementById('ram-usage');
const batterySpan = document.getElementById('battery');
const tempSpan = document.getElementById('temp');
const pingSpan = document.getElementById('ping');
const fpsSpan = document.getElementById('fps');
const perfBar = document.getElementById('performance-bar');
const perfLabel = document.getElementById('performance-label');

// Optimize buttons
const optBtns = document.querySelectorAll('.btn-optimize');
const optProgress = document.getElementById('optimize-progress');
const optProgressBar = document.getElementById('opt-progress-bar');
const optProgressText = document.getElementById('opt-progress-text');

// History
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history');

// Settings
const darkModeToggle = document.getElementById('dark-mode');
const soundToggle = document.getElementById('sound-toggle');
const notifToggle = document.getElementById('notification-toggle');
const autoOptToggle = document.getElementById('auto-optimize');
const watchAdBtn = document.getElementById('watch-ad-btn');

// Others
const launchBtn = document.getElementById('launch-game');
const permissionBtn = document.getElementById('grant-permission');
const resetBtn = document.getElementById('reset-app');

// ---- Constants ----
const VALID_KEY = 'THAILE-DVJSH';
let isActivated = localStorage.getItem('fixlag_activated') === 'true';
let history = JSON.parse(localStorage.getItem('fixlag_history')) || [];
let isOptimizing = false;
let autoOptInterval = null;

// ---- Toast ----
function showToast(msg, dur = 2500) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), dur);
}

// ---- Âm thanh (Web Audio) ----
function playSound(type) {
  if (!soundToggle.checked) return;
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  if (type === 'click') {
    osc.frequency.value = 800;
    gain.gain.value = 0.1;
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } else if (type === 'success') {
    osc.frequency.value = 1200;
    gain.gain.value = 0.15;
    osc.start();
    setTimeout(() => {
      osc.frequency.value = 1600;
    }, 100);
    osc.stop(ctx.currentTime + 0.3);
  } else if (type === 'boost') {
    osc.frequency.value = 200;
    gain.gain.value = 0.2;
    osc.start();
    setTimeout(() => {
      osc.frequency.value = 400;
    }, 150);
    osc.stop(ctx.currentTime + 0.4);
  }
}

// ---- Key Activation ----
activateBtn.addEventListener('click', () => {
  const key = keyInput.value.trim().toUpperCase();
  if (key === VALID_KEY) {
    isActivated = true;
    localStorage.setItem('fixlag_activated', 'true');
    keyMessage.innerHTML = '✅ Kích hoạt thành công! Chào mừng bạn!';
    keyMessage.style.color = '#8cf0b0';
    keySection.style.display = 'none';
    mainContent.style.display = 'block';
    showToast('🎮 Key hợp lệ! Đã mở khoá toàn bộ tính năng.', 3000);
    playSound('success');
  } else {
    keyMessage.innerHTML = '❌ Key không đúng. Vui lòng thử lại.';
    keyMessage.style.color = '#ff6b6b';
    showToast('❌ Key sai!', 2000);
    playSound('click');
  }
});

// Tự động kích hoạt nếu đã từng
if (isActivated) {
  keySection.style.display = 'none';
  mainContent.style.display = 'block';
}

// Enter key
keyInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') activateBtn.click(); });

// ---- Tab switching ----
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    tabContents.forEach(tc => tc.classList.remove('active'));
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    playSound('click');
  });
});

// ---- Status simulation ----
function updateStats() {
  const cpu = Math.floor(Math.random() * 40) + 20;
  const ram = Math.floor(Math.random() * 50) + 30;
  const battery = Math.floor(Math.random() * 30) + 60; // 60-90
  const temp = Math.floor(Math.random() * 12) + 32; // 32-44
  const ping = Math.floor(Math.random() * 20) + 10;
  const fps = Math.floor(Math.random() * 30) + 50;

  cpuSpan.textContent = cpu + '%';
  ramSpan.textContent = ram + '%';
  batterySpan.textContent = battery + '%';
  tempSpan.textContent = temp + '°C';
  pingSpan.textContent = ping + 'ms';
  fpsSpan.textContent = fps;

  // Performance indicator
  const perf = Math.min(100, Math.max(40, 100 - (cpu * 0.3 + ram * 0.2 - 20)));
  perfBar.style.width = perf + '%';
  let label = 'Tuyệt vời';
  if (perf < 60) label = 'Cần tối ưu';
  else if (perf < 80) label = 'Trung bình';
  perfLabel.textContent = `${Math.round(perf)}% - ${label}`;
}
setInterval(updateStats, 2000);
updateStats();

// ---- Optimize functions ----
function addHistory(optName, detail = '') {
  const entry = { time: new Date().toLocaleString(), name: optName, detail };
  history.unshift(entry);
  if (history.length > 50) history.pop();
  localStorage.setItem('fixlag_history', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  if (history.length === 0) {
    historyList.innerHTML = '<p class="empty-history">Chưa có hoạt động nào.</p>';
    return;
  }
  historyList.innerHTML = history.map(item => `
    <div class="history-item">
      <span>${item.name} ${item.detail ? '– ' + item.detail : ''}</span>
      <span class="time">${item.time}</span>
    </div>
  `).join('');
}

renderHistory();

clearHistoryBtn.addEventListener('click', () => {
  history = [];
  localStorage.removeItem('fixlag_history');
  renderHistory();
  showToast('🗑️ Đã xóa lịch sử.');
});

function runOptimize(optName, duration = 2000) {
  if (isOptimizing) return showToast('⏳ Đang tối ưu, vui lòng chờ!');
  if (!isActivated) return showToast('🔑 Vui lòng kích hoạt key trước!');

  isOptimizing = true;
  optProgress.style.display = 'block';
  let progress = 0;
  const interval = 50;
  const steps = duration / interval;

  playSound('boost');
  showToast(`⚡ Đang tối ưu ${optName}...`, duration + 500);

  const timer = setInterval(() => {
    progress += 100 / steps;
    if (progress >= 100) {
      clearInterval(timer);
      optProgressBar.style.width = '100%';
      optProgressText.textContent = '✅ Hoàn thành!';
      setTimeout(() => {
        optProgress.style.display = 'none';
        optProgressBar.style.width = '0%';
        isOptimizing = false;
      }, 600);
      addHistory(optName, 'Thành công');
      playSound('success');
      showToast(`✅ ${optName} đã được tối ưu!`);
      // Cập nhật lại stats một lần
      updateStats();
    } else {
      optProgressBar.style.width = progress + '%';
      optProgressText.textContent = `Đang ${optName}... ${Math.round(progress)}%`;
    }
  }, interval);
}

// Gán sự kiện cho các nút tối ưu
optBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.opt-card');
    if (!card) return;
    const opt = card.dataset.opt;
    let name = '';
    switch(opt) {
      case 'ram': name = 'Dọn RAM'; break;
      case 'fps': name = 'Tăng FPS'; break;
      case 'network': name = 'Tối ưu mạng'; break;
      case 'battery': name = 'Tiết kiệm pin'; break;
      case 'cpu': name = 'Tăng tốc CPU'; break;
      case 'cache': name = 'Xóa cache'; break;
      case 'game': name = 'Game Booster'; break;
      case 'all': name = 'Tối ưu toàn bộ'; break;
      default: name = opt;
    }
    const duration = (opt === 'all') ? 4000 : 2000;
    runOptimize(name, duration);
    playSound('click');
  });
});

// ---- Launch game ----
launchBtn.addEventListener('click', () => {
  if (!isActivated) return showToast('🔑 Vui lòng kích hoạt key!');
  showToast('🚀 Đang khởi động game...', 2000);
  playSound('boost');
  setTimeout(() => {
    showToast('🎮 Game đã sẵn sàng! Chúc bạn chiến thắng!', 3000);
    playSound('success');
  }, 1500);
});

// ---- Grant permission ----
permissionBtn.addEventListener('click', () => {
  if (!isActivated) return showToast('🔑 Vui lòng kích hoạt key!');
  showToast('🔑 Đang yêu cầu cấp quyền hệ thống...', 2500);
  playSound('click');
  setTimeout(() => {
    showToast('✅ Quyền đã được cấp thành công!', 2500);
    playSound('success');
  }, 1200);
});

// ---- Settings ----
darkModeToggle.addEventListener('change', () => {
  document.body.classList.toggle('light', !darkModeToggle.checked);
  localStorage.setItem('fixlag_dark', darkModeToggle.checked);
  playSound('click');
});

soundToggle.addEventListener('change', () => {
  localStorage.setItem('fixlag_sound', soundToggle.checked);
  playSound('click');
});

notifToggle.addEventListener('change', () => {
  localStorage.setItem('fixlag_notif', notifToggle.checked);
  showToast(notifToggle.checked ? '🔔 Thông báo đã bật' : '🔕 Thông báo đã tắt');
});

autoOptToggle.addEventListener('change', () => {
  if (autoOptToggle.checked) {
    autoOptInterval = setInterval(() => {
      if (isActivated) {
        runOptimize('Tự động tối ưu', 1500);
      }
    }, 30 * 60 * 1000);
    showToast('⏰ Tự động tối ưu mỗi 30 phút');
  } else {
    clearInterval(autoOptInterval);
    showToast('⏹️ Đã tắt tự động tối ưu');
  }
});

// ---- Xem quảng cáo nhận key ----
watchAdBtn.addEventListener('click', () => {
  if (isActivated) return showToast('🔑 Bạn đã kích hoạt rồi!');
  showToast('📺 Đang phát quảng cáo...', 3000);
  playSound('click');
  setTimeout(() => {
    // Mô phỏng xem quảng cáo xong -> nhận key
    keyInput.value = VALID_KEY;
    showToast('🎉 Bạn đã nhận được key! Nhấn "Kích hoạt" để sử dụng.', 3000);
    playSound('success');
  }, 3000);
});

// ---- Reset app ----
resetBtn.addEventListener('click', () => {
  if (confirm('Bạn có chắc muốn đặt lại toàn bộ ứng dụng?')) {
    localStorage.clear();
    location.reload();
  }
});

// ---- Restore settings ----
const darkSaved = localStorage.getItem('fixlag_dark');
if (darkSaved !== null) {
  const isDark = darkSaved === 'true';
  darkModeToggle.checked = isDark;
  document.body.classList.toggle('light', !isDark);
}
const soundSaved = localStorage.getItem('fixlag_sound');
if (soundSaved !== null) soundToggle.checked = soundSaved === 'true';
const notifSaved = localStorage.getItem('fixlag_notif');
if (notifSaved !== null) notifToggle.checked = notifSaved === 'true';

// ---- Auto init if activated ----
if (isActivated) {
  // Mặc định hiện tab home
}

// ---- Toast click để tắt ----
toast.addEventListener('click', () => toast.classList.remove('show'));

console.log('⚡ Fix Lag Pro đã sẵn sàng!');
console.log(`🔑 Key mặc định: ${VALID_KEY}`);
console.log('📋 Lịch sử:', history);

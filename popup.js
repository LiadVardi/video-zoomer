async function updateDisplay() {
  const { zoom } = await chrome.storage.session.get({ zoom: 1 });
  document.getElementById('zoom-level').textContent = zoom + 'x';
}

async function sendCommand(command) {
  await chrome.runtime.sendMessage({ command });
  await updateDisplay();
}

async function updateOriginDisplay() {
  const { origin } = await chrome.storage.session.get({ origin: 'center center' });
  document.querySelectorAll('.origin-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.origin === origin);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateDisplay();
  updateOriginDisplay();

  document.getElementById('btn-zoom-in').addEventListener('click', () => sendCommand('zoom-in-shortcut'));
  document.getElementById('btn-zoom-out').addEventListener('click', () => sendCommand('zoom-out-shortcut'));
  document.getElementById('btn-reset').addEventListener('click', () => sendCommand('zoom-reset-shortcut'));

  document.querySelectorAll('.origin-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.origin-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      chrome.runtime.sendMessage({ command: 'set-origin', origin: btn.dataset.origin });
    });
  });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'session' && changes.zoom) {
    document.getElementById('zoom-level').textContent = changes.zoom.newValue + 'x';
  }
});

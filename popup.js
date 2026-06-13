async function updateDisplay() {
  const { zoom } = await chrome.storage.session.get({ zoom: 1 });
  document.getElementById('zoom-level').textContent = zoom + 'x';
}

async function sendCommand(command) {
  await chrome.runtime.sendMessage({ command });
  await updateDisplay();
}

async function updateOriginDisplay() {
  const { originX, originY } = await chrome.storage.session.get({ originX: 'center', originY: 'center' });
  document.querySelectorAll('.origin-btn').forEach(btn => {
    const [bx, by] = btn.dataset.origin.split(' ');
    btn.classList.toggle('active', bx === originX && by === originY);
  });
}

function updateToggleButton(enabled) {
  document.getElementById('toggle-enabled-checkbox').checked = enabled;
}

document.addEventListener('DOMContentLoaded', async () => {
  updateDisplay();
  updateOriginDisplay();

  const { enabled } = await chrome.storage.local.get({ enabled: true });
  updateToggleButton(enabled);

  document.getElementById('toggle-enabled-checkbox').addEventListener('change', async () => {
    const response = await chrome.runtime.sendMessage({ command: 'toggle-enabled' });
    updateToggleButton(response.enabled);
  });

  document.getElementById('btn-zoom-in').addEventListener('click', () => sendCommand('zoom-in-shortcut'));
  document.getElementById('btn-zoom-out').addEventListener('click', () => sendCommand('zoom-out-shortcut'));
  document.getElementById('btn-reset').addEventListener('click', () => sendCommand('zoom-reset-shortcut'));

  document.querySelectorAll('.origin-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const [originX, originY] = btn.dataset.origin.split(' ');
      document.querySelectorAll('.origin-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      chrome.runtime.sendMessage({ command: 'set-origin', originX, originY });
    });
  });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'session') {
    if (changes.zoom) {
      document.getElementById('zoom-level').textContent = changes.zoom.newValue + 'x';
    }
    if (changes.originX || changes.originY) {
      updateOriginDisplay();
    }
  }
  if (area === 'local') {
    if (changes.enabled) {
      updateToggleButton(changes.enabled.newValue);
    }
  }
});

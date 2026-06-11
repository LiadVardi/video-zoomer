async function updateDisplay() {
  const { zoom } = await chrome.storage.session.get({ zoom: 1 });
  document.getElementById('zoom-level').textContent = zoom + 'x';
}

async function sendCommand(command) {
  await chrome.runtime.sendMessage({ command });
  await updateDisplay();
}

document.addEventListener('DOMContentLoaded', () => {
  updateDisplay();

  document.getElementById('btn-zoom-in').addEventListener('click', () => sendCommand('zoom-in-shortcut'));
  document.getElementById('btn-zoom-out').addEventListener('click', () => sendCommand('zoom-out-shortcut'));
  document.getElementById('btn-reset').addEventListener('click', () => sendCommand('zoom-reset-shortcut'));
});

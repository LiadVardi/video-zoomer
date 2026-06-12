let lastZoomTime = 0;

document.addEventListener('wheel', (event) => {
  if (!event.ctrlKey || !event.shiftKey) return;
  event.preventDefault();

  const now = Date.now();
  if (now - lastZoomTime < 100) return;
  lastZoomTime = now;

  chrome.runtime.sendMessage({
    command: event.deltaY < 0 ? 'zoom-in-shortcut' : 'zoom-out-shortcut'
  });
}, { passive: false });

document.addEventListener('keydown', (event) => {
  if (!event.ctrlKey || !event.shiftKey) return;

  if (event.key === 'ArrowRight') {
    event.preventDefault();
    event.stopImmediatePropagation();
    chrome.runtime.sendMessage({ command: 'origin-horizontal-shortcut', direction: 'forward' });
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault();
    event.stopImmediatePropagation();
    chrome.runtime.sendMessage({ command: 'origin-horizontal-shortcut', direction: 'backward' });
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    event.stopImmediatePropagation();
    chrome.runtime.sendMessage({ command: 'origin-vertical-shortcut', direction: 'forward' });
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    event.stopImmediatePropagation();
    chrome.runtime.sendMessage({ command: 'origin-vertical-shortcut', direction: 'backward' });
  }
}, true);

document.addEventListener('keyup', (event) => {
  if (!event.ctrlKey || !event.shiftKey) return;
  if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}, true);

document.addEventListener('mousedown', (event) => {
  if (!event.ctrlKey || !event.shiftKey || event.button !== 1) return;
  event.preventDefault();
  chrome.runtime.sendMessage({ command: 'zoom-reset-shortcut' });
});

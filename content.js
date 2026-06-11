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

async function handleZoom(command) {
  const { zoom } = await chrome.storage.session.get({ zoom: 1 });
  let currentZoom = zoom;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  if (command === "zoom-in-shortcut") {
    currentZoom = Math.min(currentZoom + 0.5, 4);
  } else if (command === "zoom-out-shortcut") {
    currentZoom = Math.max(currentZoom - 0.5, 1);
  } else if (command === "zoom-reset-shortcut") {
    currentZoom = 1;
  }

  await chrome.storage.session.set({ zoom: currentZoom });

  chrome.scripting.executeScript({
    target: { tabId: tab.id, allFrames: false },
    func: (zoom) => {
      let targetElement = document.querySelector('.html5-video-container');
      if (!targetElement) {
        targetElement = document.querySelector('video');
      }
      if (targetElement) {
        targetElement.style.transform = `scale(${zoom})`;
        targetElement.style.transition = 'transform 0.2s ease';
      }
    },
    args: [currentZoom]
  });
}

chrome.commands.onCommand.addListener((command) => handleZoom(command));

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command) {
    handleZoom(message.command).then(() => sendResponse({}));
    return true;
  }
});

async function handleZoom(command) {
  const { zoom } = await chrome.storage.session.get({ zoom: 1 });
  let currentZoom = zoom;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  if (command === "zoom-in-shortcut") {
    currentZoom = Math.min(currentZoom + 0.25, 4);
  } else if (command === "zoom-out-shortcut") {
    currentZoom = Math.max(currentZoom - 0.25, 1);
  } else if (command === "zoom-reset-shortcut") {
    currentZoom = 1;
  }

  await chrome.storage.session.set({ zoom: currentZoom });

  chrome.scripting.executeScript({
    target: { tabId: tab.id, allFrames: true },
    func: (zoom) => {
      const youtubeContainer = document.querySelector('.html5-video-container');
      if (youtubeContainer) {
        youtubeContainer.style.transform = `scale(${zoom})`;
        youtubeContainer.style.transition = 'transform 0.2s ease';
      } else {
        const videos = document.querySelectorAll('video');
        let video = null;
        let maxArea = 0;
        for (const v of videos) {
          const rect = v.getBoundingClientRect();
          const visibleWidth = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0));
          const visibleHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
          const visibleArea = visibleWidth * visibleHeight;
          if (visibleArea > maxArea) {
            maxArea = visibleArea;
            video = v;
          }
        }
        if (!video && videos.length > 0) {
          video = videos[0];
        }
        if (video) {
          video.style.transform = `scale(${zoom})`;
          video.style.transition = 'transform 0.2s ease';
          if (video.parentElement) {
            video.parentElement.style.overflow = 'visible';
            if (video.parentElement.parentElement) {
              video.parentElement.parentElement.style.overflow = 'visible';
            }
          }
        }
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

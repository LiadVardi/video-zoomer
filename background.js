function applyZoom(tab, zoom, originX, originY) {
  chrome.scripting.executeScript({
    target: { tabId: tab.id, allFrames: true },
    func: (zoom, originX, originY) => {
      const origin = `${originX} ${originY}`;
      const youtubeContainer = document.querySelector('.html5-video-container');
      if (youtubeContainer) {
        const video = youtubeContainer.querySelector('video');
        if (video) {
          video.style.transform = `scale(${zoom})`;
          video.style.transformOrigin = origin;
          video.style.transition = 'transform 0.2s ease';
        }
        const moviePlayer = youtubeContainer.closest('#movie_player');
        if (moviePlayer) {
          if (zoom === 1) {
            if (moviePlayer.hasAttribute('data-vz-original-overflow')) {
              moviePlayer.style.overflow = moviePlayer.getAttribute('data-vz-original-overflow');
              moviePlayer.removeAttribute('data-vz-original-overflow');
            }
          } else {
            if (!moviePlayer.hasAttribute('data-vz-original-overflow')) {
              moviePlayer.setAttribute('data-vz-original-overflow', moviePlayer.style.overflow);
            }
            moviePlayer.style.overflow = 'hidden';
          }
        }
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
        if (!video) {
          function findVideosDeep(root = document) {
            let videos = [...root.querySelectorAll('video')];
            root.querySelectorAll('*').forEach(el => {
              if (el.shadowRoot) {
                videos = videos.concat(findVideosDeep(el.shadowRoot));
              }
            });
            return videos;
          }
          const shadowVideos = findVideosDeep();
          if (shadowVideos.length > 0) video = shadowVideos[0];
        }
        if (video) {
          video.style.transform = `scale(${zoom})`;
          video.style.transformOrigin = origin;
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
    args: [zoom, originX, originY]
  });
}

async function handleZoom(command) {
  const { zoom, originX, originY } = await chrome.storage.session.get({ zoom: 1, originX: 'center', originY: 'center' });
  let currentZoom = zoom;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  if (command === 'zoom-in-shortcut') {
    currentZoom = Math.min(currentZoom + 0.25, 4);
  } else if (command === 'zoom-out-shortcut') {
    currentZoom = Math.max(currentZoom - 0.25, 1);
  } else if (command === 'zoom-reset-shortcut') {
    currentZoom = 1;
  }

  await chrome.storage.session.set({ zoom: currentZoom });
  applyZoom(tab, currentZoom, originX, originY);
}

const X_CYCLE = ['left', 'center', 'right'];
const Y_CYCLE = ['top', 'center', 'bottom'];

async function handleOriginHorizontal(direction) {
  const { zoom, originX, originY } = await chrome.storage.session.get({ zoom: 1, originX: 'center', originY: 'center' });
  const idx = X_CYCLE.indexOf(originX);
  const nextX = direction === 'backward'
    ? X_CYCLE[(idx - 1 + X_CYCLE.length) % X_CYCLE.length]
    : X_CYCLE[(idx + 1) % X_CYCLE.length];
  await chrome.storage.session.set({ originX: nextX });
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;
  applyZoom(tab, zoom, nextX, originY);
}

async function handleOriginVertical(direction) {
  const { zoom, originX, originY } = await chrome.storage.session.get({ zoom: 1, originX: 'center', originY: 'center' });
  const idx = Y_CYCLE.indexOf(originY);
  const nextY = direction === 'backward'
    ? Y_CYCLE[(idx - 1 + Y_CYCLE.length) % Y_CYCLE.length]
    : Y_CYCLE[(idx + 1) % Y_CYCLE.length];
  await chrome.storage.session.set({ originY: nextY });
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;
  applyZoom(tab, zoom, originX, nextY);
}

async function handleSetOrigin(originX, originY) {
  await chrome.storage.session.set({ originX, originY });
  const { zoom } = await chrome.storage.session.get({ zoom: 1 });
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;
  applyZoom(tab, zoom, originX, originY);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === 'toggle-enabled') {
    (async () => {
      const { enabled, zoom, originX, originY } = await chrome.storage.session.get({ enabled: true, zoom: 1, originX: 'center', originY: 'center' });
      const newEnabled = !enabled;
      await chrome.storage.session.set({ enabled: newEnabled });
      if (!newEnabled) {
        await chrome.storage.session.set({ zoom: 1 });
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) applyZoom(tab, 1, originX, originY);
      }
      sendResponse({ enabled: newEnabled });
    })();
    return true;
  }

  chrome.storage.session.get({ enabled: true }).then(({ enabled }) => {
    if (!enabled) {
      sendResponse({});
      return;
    }
    if (message.command === 'set-origin') {
      handleSetOrigin(message.originX, message.originY).then(() => sendResponse({}));
    } else if (message.command === 'origin-horizontal-shortcut') {
      handleOriginHorizontal(message.direction).then(() => sendResponse({}));
    } else if (message.command === 'origin-vertical-shortcut') {
      handleOriginVertical(message.direction).then(() => sendResponse({}));
    } else if (message.command) {
      handleZoom(message.command).then(() => sendResponse({}));
    }
  });
  return true;
});

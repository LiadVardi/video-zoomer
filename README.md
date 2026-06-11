# Video Zoomer

![Version](https://img.shields.io/badge/version-1.4-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![Manifest V3](https://img.shields.io/badge/manifest-V3-orange)

A Chrome extension that lets users zoom into any HTML5 video on any website using keyboard shortcuts or a popup UI.

## Features

- Zoom in, zoom out, and reset zoom on any HTML5 video
- Works on YouTube, embedded YouTube players, and other sites with native HTML5 video
- Keyboard shortcuts for quick control
- Popup UI showing the current zoom level with buttons
- Zoom state is preserved even when the browser is idle
- Maximum zoom capped at 4x, minimum at 1x

## Keyboard Shortcuts

| Action     | Shortcut       |
|------------|----------------|
| Zoom In    | Ctrl+Shift+Z   |
| Zoom Out   | Ctrl+Shift+X   |
| Reset Zoom | Ctrl+Shift+R   |

## Screenshot

![Popup UI](screenshots/popup.png)

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable Developer Mode (top right toggle)
4. Click "Load unpacked" and select the project folder
5. The extension icon will appear in the toolbar

## Supported Sites

Works on any site with a native HTML5 video element. YouTube and embedded YouTube players are confirmed to work. Sites that load video via blob URLs from a different origin (such as Vimeo embeds) may not be supported due to browser security restrictions.

## Project Structure

- `manifest.json` — Extension configuration (MV3)
- `background.js` — Service worker, handles zoom logic and keyboard shortcuts
- `popup.html` — Popup UI structure
- `popup.css` — Popup styles
- `popup.js` — Popup logic, reads zoom state and sends commands
- `icons/icon.png` — Extension icon

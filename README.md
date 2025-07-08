# ImmichUpload Browser Extension

Upload images directly to your [Immich](https://github.com/immich-app/immich) server from the browser's right-click context menu.

## Features

- Right-click any image and upload it to your Immich server.
- Choose a specific album to upload to, directly from the context menu.
- Manage your Immich API URL and API Key from the extension's options page.
- Reload and view your albums from the options page.

## Installation

1. Clone or download this repository.
2. Open your browser's extension/add-on page (e.g., `about:debugging` in Firefox, or `chrome://extensions` in Chrome).
3. Enable "Developer mode" if needed.
4. Click "Load unpacked" (Chrome) or "Load Temporary Add-on" (Firefox) and select this folder.

## Configuration

1. Click the extension icon and open the options page.
2. Enter your Immich API URL (e.g., `http://localhost:2283/api`) and your API Key.
3. Click **Save**.
4. Click **Reload Albums** to fetch your albums from Immich.

## Usage

- Right-click any image on a web page.
- Select **Upload image to Immich**.
- Choose an album from the submenu, or upload without selecting an album.

## Security

Your API key and URL are stored locally in your browser's extension storage and are never shared with third parties.

## Troubleshooting

- Make sure your Immich server is running and accessible from your browser.
- Ensure your API key has the correct permissions.
- If albums do not appear, click **Reload Albums** in the options page.

## License

MIT


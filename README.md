> DISCLAIMER  
> This project is not affiliated with or endorsed by Immich. It is an independent browser extension created to enhance the Immich experience by allowing direct uploads from the browser.

<img src="icons/icon.svg" width="200" style="display: block; margin: auto;">

<h1 align="center">UploadImch Firefox Extension</h1>

<p align="center">
  Upload images directly to your <a href="https://github.com/immich-app/immich">Immich</a> server from firefox's right-click context menu.
</p>

## Features

- Right-click any image or video and upload it to your Immich server.
- Choose a specific album to upload to, directly from the context menu.
- Manage your Immich API URL and API Key from the extension's options page.
- Reload and view your albums from the options page.

## Installation

1. Clone or download this repository.
2. Open firefox's debug page `about:debugging`, click "this firefox".
3. Enable "Developer mode" if needed.
4. Click "Load Temporary Add-on" and select the manifest.json in this folder.
5. You may have to give the extension permissions to access "all urls", to communicate with your immich server.

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

## Note
Extension is currently only available for Firefox. If you want to use it in other browsers, you can try to convert it using [web-ext](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Using_web-ext_command_line_tool) or similar tools.
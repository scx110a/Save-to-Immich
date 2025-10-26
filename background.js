const imageList = {};
// Fetch albums from Immich and store in storage
async function fetchAndStoreAlbums() {
    const { api_url } = await browser.storage.sync.get("api_url");
    const { api_key } = await browser.storage.sync.get("api_key");
    if (!api_url || !api_key) return;
    try {
        const res = await fetch(api_url + "/albums", {
            headers: { "x-api-key": api_key }
        });
        if (!res.ok) throw new Error("Failed to fetch albums");
        const albums = await res.json();
        await browser.storage.local.set({ immich_albums: albums });
        return albums;
    } catch (e) {
        console.error("Error fetching albums:", e);
        await browser.storage.local.set({ immich_albums: [] });
        return [];
    }
}

async function createSaveMenus() {
    await browser.contextMenus.removeAll();
    browser.contextMenus.create({
        id: "save-to-immich",
        title: "Save to Immich and add to album",
        contexts: ["image", "video"],
    });
    browser.contextMenus.create({
        id: "save-to-immich-now",
        title: "Save to immich",
        contexts: ["image", "video"],
    });
}

// Remove initial load. Instead, update albums and menus when context menu is about to show
browser.contextMenus.onShown.addListener(async () => {
    await fetchAndStoreAlbums();
    await createSaveMenus();
});

// Listen for reload message from options
browser.runtime.onMessage.addListener(({msg, param}, sender, sendResponse) => {
    if (msg === "reload_albums") {
        fetchAndStoreAlbums().then(createSaveMenus).then(() => sendResponse({ ok: true }));
        return true;
    } else if (msg === 'save') {
        let imgInfo = imageList[param.windowId];
        immichUpload(imgInfo.img, imgInfo.imageUrl, param.albumId, param.albumName);
    }
});

// Open options page when extension icon is clicked
browser.action.onClicked.addListener(() => {
    if (browser.runtime.openOptionsPage) {
        browser.runtime.openOptionsPage();
    } else {
        window.open(browser.runtime.getURL("options.html"));
    }
});

browser.contextMenus.onClicked.addListener(async (info) => {
    const imageUrl = info.srcUrl;
    const imgResponse = await fetch(imageUrl);
    const img = await imgResponse.blob();
    if (info.menuItemId === "save-to-immich-now") {
        immichUpload(img, imageUrl);
    } else if (info.menuItemId === 'save-to-immich') {
        let createData = {
            type: "panel",
            url: "saveto.html",
            width: 250,
            height: 500,
        };
        let creating = browser.windows.create(createData);
        creating.then(function(windowInfo) {
            imageList[windowInfo.id] = {img, imageUrl};
        }, function(e) {
            console.log("Cannot create window", e);
            sendNotification("Cannot show album list window.");
        });
    }
});

browser.windows.onRemoved.addListener(function(windowId) {
    delete imageList[windowId];
})

async function immichUpload(img, imgUrl, albumId, albumName) {
    const date = new Date();
    const fileNameArr = imgUrl.split("/");
    const fileName = fileNameArr[fileNameArr.length - 1].split("?")[0];
    const imgFile = new File([img], fileName);
    const formData = new FormData();
    formData.append("deviceAssetId", fileName + date.getTime());
    formData.append("deviceId", "Extension");
    formData.append("fileCreatedAt", date.toISOString());
    formData.append("fileModifiedAt", date.toISOString());
    formData.append("assetData", imgFile);
    const { api_key } = await browser.storage.sync.get("api_key");
    const { api_url } = await browser.storage.sync.get("api_url");
    let response = await fetch(api_url + "/assets", {
        method: "post",
        headers: {
            "x-api-key": api_key,
            "Accept": "application/json",
        },
        body: formData
    });
    if (!response.ok) {
        console.error("Failed to upload image:", response.statusText);
        sendNotification("Failed to upload image: " + response.statusText);
        return;
    }
    const asset = await response.json();
    if (!asset || !asset.id || !asset.status || asset.status !== "created") {
        console.error("Invalid asset response:", asset);
        sendNotification("Failed to upload image: " + asset.status);
        if (asset.status !== 'duplicate') {
            return;
        }
    } else {
        sendNotification("Upload image success.");
    }
    if (albumId === -1) {
        response = await fetch(api_url + `/albums`, {
            method: "post",
            headers: {
                "x-api-key": api_key,
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ albumName }),
        });
        if (!response.ok) {
            console.error("Failed to create album:", response.statusText);
            sendNotification("Failed to create album: " + response.statusText + ". Image uploaded.");
        } else {
            sendNotification("Create album " + albumName + " success.");
            const asset = await response.json();
            albumId = asset.id;
        }
    }else if (albumId) {
        response = await fetch(api_url + `/albums/${albumId}/assets`, {
            method: "put",
            headers: {
                "x-api-key": api_key,
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ ids: [asset.id] })
        });
        if (!response.ok) {
            console.error("Failed to add asset to album:", response.statusText);
            sendNotification("Failed to add asset to album: " + response.statusText + ".");
        } else {
            sendNotification("Image added to album.");
        }
    }
}

function sendNotification(msg) {
    browser.notifications.create({
        type: "basic",
        iconUrl: "icons/icon.svg",
        title: 'Upload Immich',
        message: msg,
    });
}
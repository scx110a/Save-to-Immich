let imageList = [];
let currCon = null;
// Fetch albums from Immich and store in storage
async function fetchAndStoreAlbums() {
    const { api_url } = await browser.storage.sync.get('api_url');
    const { api_key } = await browser.storage.sync.get('api_key');
    if (!api_url || !api_key) return;
    try {
        const res = await fetch(api_url + '/albums', {
            headers: { 'x-api-key': api_key }
        });
        if (!res.ok) throw new Error('Failed to fetch albums');
        const albums = await res.json();
        await browser.storage.local.set({ immich_albums: albums });
        return albums;
    } catch (e) {
        console.error('Error fetching albums:', e);
        await browser.storage.local.set({ immich_albums: [] });
        return [];
    }
}

async function createSaveMenus() {
    await browser.contextMenus.removeAll();
    browser.contextMenus.create({
        id: 'save-to-immich',
        title: 'Save to Immich and add to album',
        contexts: ['image', 'video'],
    });
    browser.contextMenus.create({
        id: 'save-to-immich-now',
        title: 'Save to immich',
        contexts: ['image', 'video'],
    });
}


// Remove initial load. Instead, update albums and menus when context menu is about to show
browser.contextMenus.onShown.addListener(async () => {
    await fetchAndStoreAlbums();
    await createSaveMenus();
});

browser.action.onClicked.addListener((tab) => {
    browser.action.setPopup({ popup: browser.runtime.getURL('select-images-and-save.html') });
    browser.action.openPopup();
});

// Listen for message from options
browser.runtime.onMessage.addListener(({ msg, param }, sender, sendResponse) => {
    if (msg === 'reload_albums') {
        fetchAndStoreAlbums().then(createSaveMenus).then(() => sendResponse({ ok: true }));
        return true;
    } else if (msg === 'save') {
        saveAndAddToAlbum(param);
        sendResponse({ ok: true });
    } else if (msg === 'query-image') {
        if (currCon != null && currCon.name === 'sel-img') {
            currCon.postMessage({ msg: 'img', param });
        }
        return true;
    }
    return false;
});

async function saveAndAddToAlbum(param) {
    if (param.selectedImgs) {
        imageList = [];
        for (let index = 0; index < param.selectedImgs.length; index++) {
            const element = param.selectedImgs[index];
            const imageUrl = element;
            const imgResponse = await fetch(imageUrl);
            const img = await imgResponse.blob();
            imageList.push({ img, imageUrl });
        }
    }
    let albumId = param.albumId;
    if (albumId === -1) {
        albumId = await createAlbum(param.albumName);
    }
    for (const imgInfo of imageList) {
        immichUpload(imgInfo.img, imgInfo.imageUrl, albumId, param.albumName);
    }
    browser.action.setPopup({ popup: null });
    imageList = [];
}

function processMsg(param) {
    if (param.msg === 'ready') {
        browser.scripting.executeScript({
            target: {
                tabId: param.param,
            },
            files: [browser.runtime.getURL('/batch-save.js')],
        });
    }
}

browser.runtime.onConnect.addListener((port) => {
    if (port.name === 'sel-img') {
        currCon = port;
        port.onMessage.addListener(processMsg);
        port.postMessage({ msg: 'ack' });
    }
    port.onDisconnect.addListener((p) => {
        browser.action.setPopup({ popup: null });
        imageList = [];
        currCon = null;
        if (p.error) {
            console.log(`Disconnected due to an error: ${p.error.message}`);
        }
    })
});

browser.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === 'save-to-immich-now') {
        uploadNow(info);
    } else if (info.menuItemId === 'save-to-immich') {
        uploadLater(info);
        browser.action.setPopup({ popup: browser.runtime.getURL('saveto.html') });
        browser.action.openPopup();
    }
});

async function uploadNow(info) {
    const imageUrl = info.srcUrl;
    const imgResponse = await fetch(imageUrl);
    const img = await imgResponse.blob();
    immichUpload(img, imageUrl);
}

async function uploadLater(info) {
    const imageUrl = info.srcUrl;
    const imgResponse = await fetch(imageUrl);
    const img = await imgResponse.blob();
    imageList = [{ img, imageUrl }];
}

async function createAlbum(albumName) {
    const { api_key } = await browser.storage.sync.get('api_key');
    const { api_url } = await browser.storage.sync.get('api_url');
    response = await fetch(api_url + `/albums`, {
        method: 'post',
        headers: {
            'x-api-key': api_key,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ albumName }),
    });
    if (!response.ok) {
        console.error('Failed to create album:', response.statusText);
        sendNotification('Failed to create album: ' + response.statusText + '. Image uploaded.');
        return null;
    } else {
        sendNotification('Create album ' + albumName + ' success.');
        const asset = await response.json();
        return asset.id;
    }
}

async function immichUpload(img, imgUrl, albumId, albumName) {
    const date = new Date();
    const fileNameArr = imgUrl.split('/');
    const fileName = fileNameArr[fileNameArr.length - 1].split('?')[0];
    const imgFile = new File([img], fileName);
    const formData = new FormData();
    formData.append('deviceAssetId', fileName + date.getTime());
    formData.append('deviceId', 'Extension');
    formData.append('fileCreatedAt', date.toISOString());
    formData.append('fileModifiedAt', date.toISOString());
    formData.append('assetData', imgFile);
    const { api_key } = await browser.storage.sync.get('api_key');
    const { api_url } = await browser.storage.sync.get('api_url');
    let response = await fetch(api_url + '/assets', {
        method: 'post',
        headers: {
            'x-api-key': api_key,
            'Accept': 'application/json',
        },
        body: formData
    });
    if (!response.ok) {
        console.error('Failed to upload image:', response.statusText);
        sendNotification('Failed to upload image: ' + response.statusText);
        return;
    }
    const asset = await response.json();
    if (!asset || !asset.id || !asset.status || asset.status !== 'created') {
        console.error('Invalid asset response:', asset);
        sendNotification('Failed to upload image: ' + asset.status);
        if (asset.status !== 'duplicate') {
            return;
        }
    } else {
        sendNotification('Upload image success.');
    }
    if (albumId) {
        response = await fetch(api_url + `/albums/${albumId}/assets`, {
            method: 'put',
            headers: {
                'x-api-key': api_key,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids: [asset.id] })
        });
        if (!response.ok) {
            console.error('Failed to add asset to album:', response.statusText);
            sendNotification('Failed to add asset to album: ' + response.statusText + '.');
        } else {
            sendNotification('Image added to album.');
        }
    }
}

function sendNotification(msg) {
    try {
        browser.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon.svg',
            title: 'Upload Immich',
            message: msg,
        });
    } catch (e) {
        console.log(e);
    }
}
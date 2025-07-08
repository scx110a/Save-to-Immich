browser.contextMenus.create(
    {
        id: "upload-immich",
        title: "Upload image to Immich album",
        contexts: ["image"],
    },
    () => void browser.runtime.lastError,
);

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "upload-immich") {
        const imageUrl = info.srcUrl;
        immichUpload(imageUrl);
        
    }
});

async function immichUpload(imgUrl) {
    const imgResponse = await fetch(imgUrl)
    const img = await imgResponse.blob()
    const date = new Date()
    fileNameArr = imgUrl.split("/")
    fileName = fileNameArr[fileNameArr.length - 1].split("?")[0]
    imgFile = new File([img], fileName)
    const formData = new FormData()
    formData.append("deviceAssetId",fileName+date.getTime())
    formData.append("deviceId","Extension")
    formData.append("fileCreatedAt",date.toISOString())
    formData.append("fileModifiedAt",date.toISOString())
    formData.append("assetData",imgFile)
    const API_KEY_GETTING = await browser.storage.sync.get("api_key")
    const API_KEY = API_KEY_GETTING.api_key
    const { api_url } = await browser.storage.sync.get("api_url");
    const response = await fetch(api_url + "/assets",{
        method: "post",
        headers: {
            "x-api-key": API_KEY,
            "Accept": "application/json",
        },
        body: formData
    })
}
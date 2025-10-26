function queryImage() {
    const allImages = [];
    for (const img of document.images) {
        allImages.push(img.currentSrc);
    }
    browser.runtime.sendMessage({
        msg: 'query-image',
        param: allImages,
    });
}
queryImage();
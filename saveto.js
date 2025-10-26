async function loadAlbum() {
    const { immich_albums } = await browser.storage.local.get("immich_albums");
    let parentNode = document.getElementById("albums");
    let newAlbumNode = createNode();
    parentNode.appendChild(newAlbumNode);
    if (immich_albums && Array.isArray(immich_albums)) {
        for (const album of immich_albums) {
            let node = createNode(album);
            parentNode.appendChild(node);
        }
    }
}
function createNode(album) {
    let node = document.createElement("div");
    node.className = 'album-item';
    if (album) {
        let radioButton = document.createElement("input");
        radioButton.type = 'radio';
        radioButton.id = album.id;
        radioButton.name = "album";
        radioButton.value = album.id;
        let radioLabel = document.createElement("label");
        radioLabel.setAttribute('for', album.id);
        radioLabel.innerText = album.albumName || album.name || `Album ${album.id}`;
        node.appendChild(radioButton);
        node.appendChild(radioLabel);
    } else {
        let radioButton = document.createElement("input");
        radioButton.type = 'radio';
        radioButton.id = 'new-album';
        radioButton.name = "album";
        radioButton.value = 'new-album';
        radioButton.checked = true;
        let newAlbumInput = document.createElement("input");
        newAlbumInput.type = "text";
        newAlbumInput.id = "new-album-name";
        newAlbumInput.value = "New Album";
        newAlbumInput.onfocus = function () {
            radioButton.checked = true;
        }
        node.appendChild(radioButton);
        node.appendChild(newAlbumInput);
    }
    return node;
}

loadAlbum();
document.getElementById("upload").onclick = async function() {
    document.getElementById("upload").disabled = true;
    const selectedValue = document.querySelector('input[name="album"]:checked').value;
    let albumName = '';
    let albumId = '';
    if (selectedValue === 'new-album') {
        albumId = -1;
        albumName = document.getElementById("new-album-name").value;
        if (!albumName) {
            alert("Please input a album name.");
            return;
        }
    } else {
        const tag = document.querySelector('label[for="' + selectedValue + '"]').innerText;
        albumId = selectedValue;
        albumName = tag;
    }
    await browser.runtime.sendMessage({
        msg: 'save',
        param: {
            albumId,
            albumName,
            selectedImgs
        },
    });
    window.close();
};
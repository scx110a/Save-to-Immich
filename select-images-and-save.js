let selectedImgs = null;
async function init() {
    const currTab = await browser.tabs.query({ active: true, currentWindow: true });
    const port = browser.runtime.connect({ name: 'sel-img' });
    port.onMessage.addListener(({msg, param}) => {
        if (msg === 'ack') {
            port.postMessage({ msg: 'ready', param: currTab[0].id });
        }
        if (msg === 'img') {
            const imgContainer = document.getElementById("images");
            for (let index = 0; index < param.length; index++) {
                const imgSrc = param[index];
                const node = createSelectNodes(imgSrc, index);
                imgContainer.appendChild(node);
            }
        }
    });
    document.getElementById("select").onclick = function() {
        const selNodes = document.querySelectorAll('input[type="checkbox"]:checked');
        selectedImgs = [];
        for (let index = 0; index < selNodes.length; index++) {
            const element = selNodes[index];
            const imgElement = document.getElementById("img_" + element.id);
            selectedImgs.push(imgElement.src);
        }
        if (selectedImgs.length === 0) {
            window.close();
        }
        document.getElementById("sel-img").style = "display: none";
        document.getElementById("sel-album").style = "";
    }
}
function createSelectNodes(url, index) {
    const node = document.createElement("div");
    node.className = 'img-item';
    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    checkBox.id = index;
    checkBox.onclick = (e) => {
        e.stopPropagation();
    }
    const imgBox = document.createElement("img");
    imgBox.src = url;
    imgBox.style = "max-height: 5rem; max-width: 5rem;";
    imgBox.id = "img_" + index;
    node.onclick = function() {
        checkBox.checked = !checkBox.checked;
    };
    node.appendChild(imgBox);
    node.appendChild(checkBox);
    return node;
}
init();
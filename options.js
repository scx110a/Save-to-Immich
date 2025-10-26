function saveOptions(e) {
    e.preventDefault();
    browser.storage.sync.set({
      api_key: document.querySelector("#api_key").value,
      api_url: document.querySelector("#api_url").value,
    });
}
  
function restoreOptions() {
    function setCurrentChoice(result) {
        document.querySelector("#api_key").value = result.api_key || "API_KEY";
        document.querySelector("#api_url").value = result.api_url || "http://localhost:2283/api";
    }
  
    function onError(error) {
        console.log(`Error: ${error}`);
    }
  
    let getting = browser.storage.sync.get();
    getting.then(setCurrentChoice, onError);
}
  
document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);

document.getElementById("reload_albums").addEventListener("click", async () => {
    document.getElementById("reload_albums").disabled = true;
    document.getElementById("reload_albums").innerText = "Reloading...";
    await browser.runtime.sendMessage({msg: "reload_albums"});
    await displayAlbums();
    document.getElementById("reload_albums").disabled = false;
    document.getElementById("reload_albums").innerText = "Reload Albums";
});

async function displayAlbums() {
    const { immich_albums } = await browser.storage.local.get("immich_albums");
    const listDiv = document.getElementById("albums_list");
    if (!immich_albums || !Array.isArray(immich_albums) || immich_albums.length === 0) {
        listDiv.innerText = "No albums found.";
        return;
    }
    const nodeHeader = document.createElement("b");
    nodeHeader.innerText = "Albums:";
    listDiv.appendChild(nodeHeader);
    for (let index = 0; index < immich_albums.length; index++) {
        const element = immich_albums[index];
        const albumElement = document.createElement("li");
        albumElement.innerText = element.albumName || element.name || element.id;
        listDiv.appendChild(albumElement);
    }
}

document.addEventListener("DOMContentLoaded", displayAlbums);

// Add dark mode toggle logic
const darkToggle = document.getElementById('dark_mode_toggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedMode = localStorage.getItem('darkMode');

function setDarkMode(enabled) {
  document.body.classList.toggle('dark-mode', enabled);
  localStorage.setItem('darkMode', enabled ? '1' : '0');
  darkToggle.checked = enabled;
}

darkToggle.addEventListener('change', () => {
  setDarkMode(darkToggle.checked);
});

// Initialize on load
setDarkMode(savedMode === null ? prefersDark : savedMode === '1');

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
    await browser.runtime.sendMessage("reload_albums");
    await displayAlbums();
    document.getElementById("reload_albums").disabled = false;
    document.getElementById("reload_albums").innerText = "Reload Albums";
});

async function displayAlbums() {
    const { immich_albums } = await browser.storage.sync.get("immich_albums");
    const listDiv = document.getElementById("albums_list");
    if (!immich_albums || !Array.isArray(immich_albums) || immich_albums.length === 0) {
        listDiv.innerText = "No albums found.";
        return;
    }
    listDiv.innerHTML = `<b>Albums:</b><ul>` +
        immich_albums.map(a => `<li>${a.albumName || a.name || a.id}</li>`).join("") +
        `</ul>`;
}

document.addEventListener("DOMContentLoaded", displayAlbums);

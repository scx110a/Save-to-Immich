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

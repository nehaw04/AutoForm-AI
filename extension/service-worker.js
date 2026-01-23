// extension/service-worker.js

// 1. Force the Side Panel to open when you click the extension icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// 2. Log installation (Optional, just for debugging)
chrome.runtime.onInstalled.addListener(() => {
    console.log("AutoForm-AI Side Panel Ready");
});
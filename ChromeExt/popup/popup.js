// popup/popup.js
console.log("Popup script is running.");

// Example: Sending a message to the background script
chrome.runtime.sendMessage("Hello from popup!", function(response) {
  console.log("Response from background: " + response);
});

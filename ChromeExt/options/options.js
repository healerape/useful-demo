// options/options.js
console.log("Options script is running.");

// Example: Saving options to Chrome storage
document.getElementById("saveButton").addEventListener("click", function() {
  var optionValue = document.getElementById("optionInput").value;
  chrome.storage.sync.set({ optionKey: optionValue }, function() {
    console.log("Option saved: " + optionValue);
  });
});

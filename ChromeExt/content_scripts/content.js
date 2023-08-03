// 监听来自background的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('监听来自background的消息:', request, sender, sendResponse);
});

// 当插件安装后执行一次
chrome.runtime.onInstalled.addListener(() => {
  console.log('当插件安装后执行一次');
});

// 监听页面更新事件
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log('监听页面更新事件:',tabId, changeInfo, tab)
});

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('监听来自content script的消息:',request, sender, sendResponse)
});


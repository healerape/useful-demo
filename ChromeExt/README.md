[中文教程](http://chrome.cenchy.com/)
# manifest 解析
```json
{
  "manifest_version": 3,   // 插件的Manifest版本，这里是Manifest版本3（MV3）。

  "name": "我的插件包",    // 插件的名称，显示在Chrome扩展管理页面和浏览器工具栏上。
  "version": "1.0",        // 插件的版本号。每次更新插件时，应该增加版本号，以便Chrome识别更新。
  "description": "没想好做啥内容惹",   // 插件的简短描述，显示在Chrome扩展管理页面上。

  "icons": {               // 定义插件图标在不同大小的尺寸下的文件路径。
    "16": "icons/icon48.png",
    "32": "icons/icon48.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },

  "background": {          // 配置后台脚本的信息。
    "service_worker": "background/background.js",   // 使用`service_worker`指定服务工作者（Service Worker）的文件路径。
    "type": "module"      // 指定后台脚本使用ES模块加载。
  },

  "action": {              // 配置插件的浏览器动作（Browser Action），例如点击图标时弹出的弹出窗口。
    "default_popup": "popup/popup.html"   // 指定默认弹出窗口的HTML文件路径。
  },

  "content_scripts": [     // 配置内容脚本的信息。内容脚本用于与网页的DOM交互并修改页面的内容。
    {
      "matches": ["<all_urls>"],           // 指定内容脚本在所有网页上运行。
      "js": ["content_scripts/content.js"] // 指定内容脚本的文件路径。
    }
  ],

  "permissions": [    // 配置插件所需的权限，例如访问浏览器标签页、存储、Cookies等。
    "background", 
    "activeTab",
    "cookies",
    "tabs",
    "storage",
    "contextMenus"
  ],

  "host_permissions": [   // 配置插件需要访问的主机权限。在这里，插件请求了对HTTP和HTTPS协议的所有网址的访问权限。
    "http://*/*",
    "https://*/*"
  ],

  "author": "OHNII"   // 插件的作者名称。
}

```

## 笔记

**谷歌插件概念：**
- 谷歌插件是用于增强谷歌浏览器功能的外网技术开发软件。
- 插件以点crx后缀的压缩包形式存在，由多种资源组成。
- 插件能够通过谷歌提供的API调用浏览器功能，如控制书签、下载标签、监听网络请求等。

**谷歌插件使用：**
- 开发前创建新谷歌插件文件夹并添加manifest.json配置文件。
- 在manifest.json中设置插件的基本信息，如名称、版本、描述、图标等。
- 定义后台脚本和内容脚本，并在manifest.json中配置它们的行为。

**内容脚本（Content Script）：**
- 内容脚本可以在网页上下文中运行，通过manifest.json配置与特定网站匹配。
- 用于修改网页样式、绑定事件等。
- 示例：在百度网页上注入自定义CSS，将背景颜色改为红色。
```javascript
// manifest.json
"content_scripts": [{
    "matches": ["*://www.baidu.com/*"],
    "css": ["styles.css"]
}]

// styles.css
body {
    background-color: red;
}
```

**后台脚本（Background Script）：**
- 后台脚本是插件的事件处理中心，监听浏览器事件并作出响应。
- 用于与内容脚本通信、处理网络请求等。
- 示例：后台脚本监听浏览器启动事件，显示桌面通知。
```javascript
// background.js
chrome.runtime.onStartup.addListener(function() {
    chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: "插件通知",
        message: "欢迎启动插件！"
    });
});
```

**消息通信：**
- 内容脚本与后台脚本之间可以通过消息通信机制进行交互。
- 可以发送消息和接收消息来实现数据传递和复杂操作。
- 示例：内容脚本发送消息给后台脚本，请求获取用户信息。
```javascript
// content.js
chrome.runtime.sendMessage({ type: "getUserInfo" }, function(response) {
    console.log(response.userInfo);
});

// background.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === "getUserInfo") {
        var userInfo = { name: "John", age: 30 };
        sendResponse({ userInfo: userInfo });
    }
});
```

**插件权限：**
- 在manifest.json中设置插件所需的权限，如访问特定网站、读取浏览器历史记录等。
- 谨慎设置权限，确保用户隐私和安全。
- 示例：设置插件需要访问特定网站的权限，以便实现自定义功能。
```javascript
// manifest.json
"permissions": [
    "tabs",
    "https://www.example.com/*"
]
```

**标签页操作：**
- 插件可以监听标签页的打开、关闭、切换等事件，并进行相应的操作。
- 通过谷歌提供的API，插件可以获取当前所有标签页的信息，包括标签页的ID、URL、标题等。
- 插件可以在用户打开新标签页时，自动打开指定的URL，实现个性化功能。

**标签页API示例：**
- 获取当前活动标签页的信息：
```javascript
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var activeTab = tabs[0];
    var tabId = activeTab.id;
    var tabTitle = activeTab.title;
    var tabUrl = activeTab.url;
    // 处理当前活动标签页的信息
});
```

- 打开新的标签页：
```javascript
chrome.tabs.create({ url: 'https://www.example.com

' });
```

- 关闭当前活动标签页：
```javascript
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var activeTab = tabs[0];
    var tabId = activeTab.id;
    chrome.tabs.remove(tabId);
});
```

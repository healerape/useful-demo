## manifest.json

我们在项目中创建一个最简单的manifest.json配置文件：

```json
{
    // 插件名称
    "name": "Hello Extensions",
    // 插件的描述
    "description" : "Base Level Extension",
    // 插件的版本
    "version": "1.0",
    // 配置插件程序的版本号，主流版本是2，最新是3
    "manifest_version": 3
}
```

我们经常会点击右上角插件图标时弹出一个小窗口的页面，焦点离开时就关闭了，一般做一些临时性的交互操作；在配置文件中新增browser_action字段，配置popup弹框：
```json
{
    "name": "Hello Extensions",
    "description" : "Base Level Extension",
    "version": "1.0",
    "manifest_version": 2,

    // 新增popup弹框
    "browser_action": {
      "default_popup": "popup.html",
      "default_icon": "popup.png"
    }
}
```

然后创建我们的弹框页面popup.html：
```html
<html>
  <body>
    <h1>Hello Extensions</h1>
  </body>
</html>
```
　点击图标后，插件显示popup.html

为了用户方便点击，我们还可以在manifest.json中设置一个键盘快捷键的命令，通过快捷键来弹出popup页面：
```json
  "name": "Hello Extensions",
  "description" : "Base Level Extension",
  "version": "1.0",
  "manifest_version": 2,
  "browser_action": {
    "default_popup": "popup.html",
    "default_icon": "popup.png"
  },

 // 新增命令
  "commands": {
    "_execute_browser_action": {
      "suggested_key": {
        "default": "Ctrl+Shift+F",
        "mac": "MacCtrl+Shift+F"
      },
      "description": "Opens popup.html"
    }
  }
```
这样我们的插件就可以通过按键盘上的Ctrl+Shift+F来弹出。

## 后台background
background（后台），它是一个常驻的页面，它的生命周期是插件中所有类型页面中最长的；它随着浏览器的打开而打开，随着浏览器的关闭而关闭，所以通常把需要一直运行的、启动就运行的、全局的代码放在background里面。

background也是需要在manifest.json中进行配置，可以通过page指定一张网页，或者通过scripts直接指定一个js数组，Chrome会自动为js生成默认网页：

```json
{
  // 需要注意的是，page属性和scripts属性只需要配置一个即可
  "background": {
    // "page": "background.html",
    "scripts": ["background.js"],
    "persistent": true
  }
}
```

我们给background设置一个监听事件，当插件安装时打印日志：
```js
// background.js

// 插件安装时运行
chrome.runtime.onInstalled.addListener(function () {
  console.log("插件已被安装");
});
```

## storage存储
storage中设置一个值，这将允许多个插件组件访问该值并进行更新操作：
```js
//background.js
chrome.runtime.onInstalled.addListener(function () {
  // storage中设置值
  chrome.storage.sync.set({ color: "#3aa757" }, function () {
    console.log("storage init color value");
  });
  // 为特定的网址显示图标
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: "baidu.com" },
          }),
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()],
      },
    ]);
  });
});
```
chrome.declarativeContent用于精确地控制什么时候显示我们的页面按钮，或者需要在用户单击它之前更改它的外观以匹配当前标签页。

这里调用的chrome.storage和我们常用的localStorage和sessionStorage不是一个东西；由于调用到了storage和declarativeContent的API，因此我们需要在manifest中给插件注册使用的权限：

```json
{
  // 新增
  "permissions": ["storage", "declarativeContent"],
  "background": {
    "scripts": ["background.js"],
    "persistent": true
  }
}
```
再次查看背景页的视图，我们就能看到打印的日志了；既然可以存储，那也能取出来，我们在popup中添加事件进行获取，首先我们新增一个触发的button：
```html
<!-- popup.html -->
<html>
  <head>
    <style>
      button {
        width: 60px;
        height: 30px;
        outline: none;
      }
    </style>
  </head>
  <body>
    <button id="changeColor">change</button>
    <script src="popup.js"></script>
  </body>
</html>
```
我们再创建一个popup.js的文件，用来从storage存储中拿到颜色值，并将此颜色作为按钮的背景色：
```js
// popup.js
let changeColor = document.getElementById("changeColor");

changeColor.onclick = function (el) {
  chrome.storage.sync.get("color", function (data) {
    changeColor.style.backgroundColor = data.color;
  });
};
```
如果需要调试popup页面，可以在弹框中右击 => 检查，在DevTools中进行调试查看。

## 获取浏览器tabs

现在，我们获取到了storage中的值，需要逻辑来进一步与用户交互；更新popup.js中的交互代码：
```js
// popupjs
changeColor.onclick = function (el) {
  chrome.storage.sync.get("color", function (data) {
    let { color } = data;
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.executeScript(tabs[0].id, {
        code: 'document.body.style.backgroundColor = "' + color + '";',
      });
    });
  });
};
```
chrome.tabs的API主要是和浏览器的标签页进行交互，通过query找到当前的激活中的tab，然后使用executeScript向标签页注入脚本内容。

```json
{
  "name": "Hello Extensions",
  // ...
  "permissions": ["storage", "declarativeContent", "activeTab"],
}
```

重新加载插件，我们点击按钮，会发现当前页面的背景颜色已经变成storage中设置的色值了；但是某些用户可能希望使用不同的色值，我们给用户提供选择的机会。

## 颜色选项页面

　　现在我们的插件功能还比较单一，只能让用户选择唯一的颜色；我们可以在插件中加入选项页面，以便用户更好的自定义插件的功能。

　　在程序目录新增一个options.html文件：

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      button {
        height: 30px;
        width: 30px;
        outline: none;
        margin: 10px;
      }
    </style>
  </head>
  <body>
    <div id="buttonDiv"></div>
    <div>
      <p>选择一个不同的颜色</p>
    </div>
  </body>
  <script src="options.js"></script>
</html>
```
　　然后添加选择页面的逻辑代码options.js：
```js
let page = document.getElementById("buttonDiv");
const kButtonColors = ["#3aa757", "#e8453c", "#f9bb2d", "#4688f1"];
function constructOptions(kButtonColors) {
  for (let item of kButtonColors) {
    let button = document.createElement("button");
    button.style.backgroundColor = item;
    button.addEventListener("click", function () {
      chrome.storage.sync.set({ color: item }, function () {
        console.log("color is " + item);
      });
    });
    page.appendChild(button);
  }
}
constructOptions(kButtonColors);
```

上面代码中预设了四个颜色选项，通过onclick事件监听，生成页面上的按钮；当用户单击按钮时，将更新storage中存储的颜色值。

options页面完成后，我们可以将其在manifest的options_page进行注册：

```json
{
  "name": "Hello Extensions",
  //...
  "options_page": "options.html",
  //...
  "manifest_version": 2
}
```
重新加载我们的插件，点击详情，滚动到底部，点击扩展程序选项来查看选项页面。或者可以在浏览器右上角插件图标上右击 => 选项。

## 使用background管理事件
background是插件的事件处理程序，它包含对插件很重要的浏览器事件的监听器。background处于休眠状态，直到触发事件，然后执行指示的逻辑；一个好的background仅在需要时加载，并在空闲时卸载。

　background监听的一些浏览器事件包括：

插件程序首次安装或更新为新版本。
后台页面正在监听事件，并且已调度该事件
内容脚本或其他插件发送消息
插件中的另一个视图（例如弹出窗口）调用runtime.getBackgroundPage
　　加载完成后，只要触发某个事件，background就会保持运行状态；在上面manifest中，我们还指定了一个persistent属性：

```json
{
  "background": {
    "scripts": ["background.js"],
    "persistent": true
  }
}
```
　　persistent属性定义了插件常驻后台的方式；当其值为true时，表示插件将一直在后台运行，无论其是否正在工作；当其值为false时，表示插件在后台按需运行，这就是Chrome后来提出的Event Page（非持久性后台）。Event Page是基于事件驱动运行的，只有在事件发生的时候才可以访问；这样做的目的是为了能够有效减小插件对内存的消耗，如非必要，请将persistent设置为false。

persistent属性的默认值为true

## alarms
一些基于DOM页面的计时器（例如window.setTimeout或window.setInterval），如果在非持久后台休眠时进行了触发，可能不会按照预定的时间运行：
```js
let timeout = 1000 * 60 * 3;  // 3 minutes in milliseconds
window.setTimeout(function() {
  alert('Hello, world!');
}, timeout);
```

Chrome提供了另外的API，alarms：
```js
chrome.alarms.create({delayInMinutes: 3.0})

chrome.alarms.onAlarm.addListener(function() {
  alert("Hello, world!")
});
```

## browserAction
在browserAction的配置中，我们可以提供多种尺寸的图标，Chrome会选择最接近的图标并将其缩放到适当的大小来填充；如果没有提供确切的大小，这种缩放会导致图标丢失细节或看起来模糊。
```json
{
  // ...
  "browser_action": {
    "default_icon": {                // optional
      "16": "images/icon16.png",     // optional
      "24": "images/icon24.png",     // optional
      "32": "images/icon32.png"      // optional
    },
    "default_title": "hello popup",  // optional
    "default_popup": "popup.html"    // optional
  },
}
```
　　也可以通过调用browserAction.setPopup动态设置弹出窗口。

```js
chrome.browserAction.setPopup({popup: 'popup_new.html'});
```

## Tooltip
　　要设置提示文案，使用default_title字段，或者调用browserAction.setTitle函数。
```js
chrome.browserAction.setTitle({ title: "New Tooltip" });
```

## Badge
Badge（徽章）就是在图标上显示的一些文本内容，用来详细显示插件的提示信息；由于Bage的空间有限，因此最多显示4个英文字符或者2个函数；badge无法通过配置文件来指定，必须通过代码实现，设置badge文字和颜色可以分别使用browserAction.setBadgeText()和browserAction.setBadgeBackgroundColor()：

```js
chrome.browserAction.setBadgeText({ text: "new" });
chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
// or 颜色字符串
// chrome.action.setBadgeBackgroundColor({color: '#4688F1'});
```

## content-scripts

　　content-scripts（内容脚本）是在网页上下文中运行的文件。通过使用标准的文档对象模型(DOM)，它能够读取浏览器访问的网页的详细信息，对其进行更改，并将信息传递给其父级插件。内容脚本相对于background还是有一些访问API上的限制，它可以直接访问以下chrome的API：
- i18n
- storage
- runtime:
  - connect
  - getManifest
  - getURL
  - id
  - onConnect
  - onMessage
  - sendMessage

　　内容脚本运行于一个独立、隔离的环境，它不会和主页面的脚本或者其他插件的内容脚本发生冲突，当然也不能调用其上下文和变量。假设我们在主页面中定义了变量和函数：
```html
<html lang="en">
  <head>
    <title>Document</title>
  </head>
  <body>
    <script>
      const a = { a: 1, b: "2" };
      const b = { a: 1, b: "2", c: [] };
      function add(a, b){ return a + b };
    </script>
  </body>
</html>
```
由于隔离的机制，在内容脚本中调用add函数会报错：Uncaught ReferenceError: add is not defined。
内容脚本分为以代码方式或声明方式注入

## 代码方式注入
对于需要在特定情况下运行的代码，我们需要使用代码注入的方式；在上面的popup页面中，我们就是将内容脚本以代码的方式进行注入到页面中：
```js
chrome.tabs.executeScript(tabs[0].id, {
  code: 'document.body.style.backgroundColor = "red";',
});
```

```js
chrome.tabs.executeScript(tabs[0].id, {
  file: "contentScript.js",
});
```

## 声明式注入
在指定页面上自动运行的内容脚本，我们可使用声明式注入的方式；以声明方式注入的脚本需注册在manifest文件的content_scripts属性下。它们可以包括JS文件或CSS文件。

```js
{
  "content_scripts": [
    {
      // 必需。指定此内容脚本将被注入到哪些页面。
      "matches": ["https://*.xieyufei.com/*"],
      "css": ["myStyles.css"],
      "js": ["contentScript.js"]
    }
  ]
}
```

## 消息通信
　尽管内容脚本的执行环境和托管它们的页面是相互隔离的，但是它们共享对页面DOM的访问；如果内容脚本想要和插件通信，可以通过onMessage和sendMessage

```js
// contentScript.js
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log("content-script收到的消息", message);
  sendResponse("我收到了你的消息！");
});

chrome.runtime.sendMessage(
  { greeting: "我是content-script呀，我主动发消息给后台！" },
  function (response) {
    console.log("收到来自后台的回复：" + response);
  }
);
```

## contextMenus
contextMenus可以自定义浏览器的右键菜单（也有叫上下文菜单的），主要是通过chrome.contextMenusAPI实现；在manifest中添加权限来开启菜单权限：
```json
{
  // ...
  "permissions": ["contextMenus"],
  "icons": {
    "16": "contextMenus16.png",
    "48": "contextMenus48.png",
    "128": "contextMenus128.png"
   }
}
```
通过icons字段配置contextMenus菜单旁边的图标：

我们可以在background中调用contextMenus.create来创建菜单，这个操作应该在runtime.onInstalled监听回调执行：
```js
chrome.contextMenus.create({
  id: "1",
  title: "Test Context Menu",
  contexts: ["all"],
});
//分割线
chrome.contextMenus.create({
  type: "separator",
});
// 父级菜单
chrome.contextMenus.create({
  id: "2",
  title: "Parent Context Menu",
  contexts: ["all"],
});
chrome.contextMenus.create({
  id: "21",
  parentId: "2",
  title: "Child Context Menu1",
  contexts: ["all"],
});
// ...
```
contextMenus创建对象的属性可以在附录里面找到；我们看到在title属性中有一个%s的标识符，当contexts为selection，使用%s来表示选中的文字；我们通过这个功能可以实现一个选中文字调用百度搜索的小功能：
```js
chrome.contextMenus.create({
  id: "1",
  title: "使用百度搜索：%s",
  contexts: ["selection"],
  onclick: function (params) {
    chrome.tabs.create({
      url:
        "https://www.baidu.com/s?ie=utf-8&wd=" +
        encodeURI(params.selectionText),
    });
  },
});
```
　contextMenus还有一些API可以调用：
```js
// 删除某一个菜单项
chrome.contextMenus.remove(menuItemId)；
// 删除所有自定义右键菜单
chrome.contextMenus.removeAll();
// 更新某一个菜单项
chrome.contextMenus.update(menuItemId, updateProperties);
// 监听菜单项点击事件
chrome.contextMenus.onClicked.addListener(function(OnClickData info, tabs.Tab tab) {...});
```
## override

... 完整看原文

[原文](https://xieyufei.com/2021/11/09/Chrome-Plugin.html)
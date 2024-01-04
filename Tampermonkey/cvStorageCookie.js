// ==UserScript==
// @name         复制粘贴本地缓存 - ctrl + shift + 'C' / 'V' / 'K' / 'L'
// @namespace    http://ni.namespace.com
// @version      1.0
// @description  Allows you to copy and paste localStorage data using keyboard shortcuts
// @author       OHNII
// @match        https://stg2.etcjy.com/*
// @match        http://localhost:*
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  // 绑定快捷键复制LocalStorage数据
  document.addEventListener('keydown', function (e) {
      // 使用 Ctrl + Shift + C 触发复制操作【LocalStorage】
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
          e.preventDefault();
          copyLocalStorageData();
      }

      // 使用 Ctrl + Shift + V 触发粘贴操作【LocalStorage】
      if (e.ctrlKey && e.shiftKey && e.key === 'V') {
          e.preventDefault();
          pasteLocalStorageData();
      }

      // 使用 Ctrl + Shift + 触发复制操作【cookie】
      if (e.ctrlKey && e.shiftKey && e.key === 'K') {
          console.log('K')
          e.preventDefault();
          copyCookiesData();
      }

      // 使用 Ctrl + Shift + 触发粘贴操作【cookie】
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
          console.log('L')
          e.preventDefault();
          pasteCookiesData();
      }

      // 使用 Ctrl + Shift + 触发清除操作【LocalStorage】
       if (e.ctrlKey && e.shiftKey && e.key === 'L') {
          console.log('L')
          e.preventDefault();
          pasteCookiesData();
      }
  });

  // 复制LocalStorage数据到剪贴板
  function copyLocalStorageData() {
      var localStorageData = JSON.stringify(localStorage);
      navigator.clipboard.writeText(localStorageData).then(function () {
          console.log('复制localStorage数据成功>>>\n', localStorageData);
      }).catch(function (error) {
          console.error('Error copying data to clipboard:', error);
      });
  }

  // 将剪贴板上的数据粘贴到LocalStorage
  function pasteLocalStorageData() {
      navigator.clipboard.readText().then(function (clipboardData) {
          try {
              var localStorageData = JSON.stringify(localStorage);
              if(confirm("粘贴数据到localStorage" + localStorageData)) {
                  var parsedData = JSON.parse(clipboardData);
                  if (typeof parsedData === 'object') {
                      for (var key in parsedData) {
                          if (parsedData.hasOwnProperty(key)) {
                              localStorage.setItem(key, parsedData[key]);
                          }
                      }
                      console.log('LocalStorage data pasted from clipboard:', parsedData);
                  } else {
                      console.error('Invalid clipboard data. Please make sure it is a valid JSON object.');
                  }
              }

          } catch (error) {
              console.error('Error parsing clipboard data:', error);
          }
      }).catch(function (error) {
          console.error('Error reading data from clipboard:', error);
      });
  }

  // 复制Cookies数据到剪贴板
  function copyCookiesData() {
      var cookiesData = document.cookie;
      navigator.clipboard.writeText(cookiesData).then(function () {
          console.log('复制Cookies数据成功>>>\n', cookiesData);
      }).catch(function (error) {
          console.error('Error copying data to clipboard:', error);
      });
  }

  // 将剪贴板上的数据粘贴到Cookies
  function pasteCookiesData() {
      navigator.clipboard.readText().then(function (clipboardData) {
          try {
              var cookiesToPaste = clipboardData.split('; ');

              for (var i = 0; i < cookiesToPaste.length; i++) {
                  var cookieParts = cookiesToPaste[i].split('=');
                  var cookieName = cookieParts[0];
                  var cookieValue = cookieParts[1];

                  document.cookie = cookieName + '=' + cookieValue;
              }

              console.log('Cookies data pasted from clipboard:', cookiesToPaste);
          } catch (error) {
              console.error('Error setting cookies:', error);
          }
      }).catch(function (error) {
          console.error('Error reading data from clipboard:', error);
      });
  }

})();

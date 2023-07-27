// ==UserScript==
// @name         划线文字自动读语音
// @namespace    your-namespace
// @version      1.0
// @description  划线选中文字时，自动将选中的文字转化为语音播放，并提供播放/停止按钮。
// @author       OHNII
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    // 检查浏览器是否支持语音合成 API
    var speechSynthesisSupported = window.speechSynthesis !== undefined;

    // 语音合成 API 的 Utterance 对象
    var speechSynthesisUtterance = null;

    // 播放按钮元素
    var playButton = null;

    // 播放状态标志
    var isPlaying = false;

    // 选中的文本
    var selectedText = '';

    // 当前句子是否处于划线状态
    var isLineSelected = false;

    var cssText = "-webkit-text-size-adjust: 100%; font-weight: 300; font-size: 12px; font-family: 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; text-decoration: none; text-align: center; height: 30px; padding: 0 20px; display: inline-block; appearance: none; cursor: pointer; border: none; box-sizing: border-box; transition-property: all; transition-duration: .3s; color: #FFF; border-style: solid; border-width: 1px; line-height: 30px; box-shadow: inset 0px 1px 0px rgba(255, 255, 255, 0.3), 0 1px 2px rgba(0, 0, 0, 0.15); margin: 5px; border-color: #665ce6; background: linear-gradient(#9088ec, #665ce6);z-index:9999;opacity: 1;width: auto;";

    // 创建播放按钮
    function createPlayButton(x, y) {
        // 如果已经存在播放按钮，则不再创建新的按钮
        if (playButton) {
            return;
        }

        playButton = document.createElement('button');
        playButton.style.cssText = cssText;
        playButton.style.position = 'fixed';
        playButton.style.top = y + 'px';
        playButton.style.left = x + 'px';
        playButton.textContent = '播放';
        playButton.addEventListener('click', togglePlayback);

        document.body.appendChild(playButton);
    }

    // 删除播放按钮
    function removePlayButton() {
        if (playButton) {
            document.body.removeChild(playButton);
            playButton = null;
        }
    }

    // 使用浏览器的语音合成 API 播放文本
    function speakText(text) {
        // 如果已存在 Utterance 对象，则更新文本；否则创建新的 Utterance 对象
        if (speechSynthesisUtterance) {
            speechSynthesisUtterance.text = text;
        } else {
            speechSynthesisUtterance = new SpeechSynthesisUtterance(text);
        }

        // 根据文本语言设置语言
        speechSynthesisUtterance.lang = getLanguage(text);

        // 监听语音合成的 'start' 事件，在语音播放开始时更新按钮状态为“播放”
        speechSynthesisUtterance.addEventListener('start', function() {
            if (playButton) {
                playButton.textContent = '播放';
            }
        });

        // 监听语音合成的 'end' 事件，在语音播放结束时更新按钮状态为“播放”
        speechSynthesisUtterance.addEventListener('end', function() {
            isPlaying = false;
            if (playButton) {
                playButton.textContent = '播放';
            }
        });

        // 开始语音合成播放
        window.speechSynthesis.speak(speechSynthesisUtterance);
        isPlaying = true;
        // 在语音播放开始前，将按钮状态设置为“加载中”
        if (playButton) {
            playButton.textContent = '加载中';
        }
    }

    // 切换播放/停止状态
    function togglePlayback() {
        if (isPlaying) {
            // 暂停语音合成播放
            window.speechSynthesis.pause();
            isPlaying = false;
            playButton.textContent = '播放';
        } else {
            // 检查当前句子是否仍处于划线状态并且与之前的文本一致
            if (isLineSelected && speechSynthesisUtterance && speechSynthesisUtterance.text === selectedText) {
                // 当前句子还保持划线状态时，点击播放重新读取句子
                window.speechSynthesis.cancel();
                isPlaying = false;
                playButton.textContent = '播放';
                speakText(selectedText);
            } else {
                if (isPlaying) {
                    // 暂停语音合成播放
                    window.speechSynthesis.pause();
                    isPlaying = false;
                    playButton.textContent = '播放';
                } else {
                    // 开始播放选中的文本
                    speakText(selectedText);
                }
            }
        }
    }

    // 获取文本语言
    function getLanguage(text) {
        var regex = /[a-zA-Z]/; // 正则表达式，用于匹配字母字符

        if (regex.test(text)) {
            if (text.match(/[\u4e00-\u9fa5]/)) {
                return 'zh-CN'; // 中文（简体）
            } else {
                return 'en-US'; // 英文
            }
        } else {
            return 'zh-CN'; // 中文（简体）
        }
    }

    // 监听鼠标抬起事件，检查是否有文本被选中
    document.addEventListener('mouseup', function(event) {
        if (speechSynthesisSupported) {
            // 获取选中的文本并去除两端的空格
            selectedText = window.getSelection().toString().trim();

            // 检查是否有选中的文本
            if (selectedText !== '') {
                // 如果没有播放按钮，则创建一个
                if (!playButton) {
                    createPlayButton(event.clientX, event.clientY);
                    isLineSelected = true; // 标记当前句子处于划线状态
                }
            } else {
                // 没有选中的文本，移除播放按钮，并停止语音播放
                removePlayButton();
                if (isPlaying) {
                    window.speechSynthesis.cancel();
                    isPlaying = false;
                    isLineSelected = false;
                }
            }
        }
    });

    // 监听文本选中状态的变化
    document.addEventListener('selectionchange', function() {
        // 检查是否没有选中文本
        if (!window.getSelection().toString().trim() && playButton) {
            // 如果文本自动取消选中，则停止语音合成播放并移除播放按钮
            window.speechSynthesis.cancel();
            removePlayButton();
            isPlaying = false;
            isLineSelected = false;
        }
    });

})();

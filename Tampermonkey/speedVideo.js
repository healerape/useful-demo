// ==UserScript==
// @name         B站视频倍速调节（键盘自定义倍速版）
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  键盘输入自定义倍速调节的油猴脚本（小写字幕：d加速 a减速 c自定义输入）【注意：b站自身大写字幕D是开启关闭字幕的】
// @author       OHNII
// @match        *://www.bilibili.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
  'use strict';

  const MIN_SPEED = 0.5;
  const MAX_SPEED = 10;
  const SPEED_STEP = 0.25;

  // 获取倍速偏好，如果没有则设置默认值
  const getSpeedPreference = () => {
    const defaultSpeed = 1;
    return GM_getValue('speedPreference', defaultSpeed);
  };

  // 设置倍速偏好
  const setSpeedPreference = (speed) => {
    GM_setValue('speedPreference', speed);
  };

  // 添加键盘快捷键事件监听
  document.addEventListener('keydown', (event) => {
    const videoPlayer = document.querySelector('video');
    if (!videoPlayer) return;

    const currentSpeed = parseFloat(getSpeedPreference());

    // 快捷键: D键，增加倍速
    if (event.key === 'd') {
      const newSpeed = Math.min(currentSpeed + SPEED_STEP, MAX_SPEED);
      videoPlayer.playbackRate = newSpeed;
      setSpeedPreference(newSpeed);
    }
    // 快捷键: A键，减小倍速
    else if (event.key === 'a') {
      const newSpeed = Math.max(currentSpeed - SPEED_STEP, MIN_SPEED);
      videoPlayer.playbackRate = newSpeed;
      setSpeedPreference(newSpeed);
    }
    // 快捷键: C键，弹出输入框来自定义倍速
    else if (event.key === 'c') {
      event.preventDefault();
      const userInputSpeed = prompt(`请输入自定义倍速值（范围在${MIN_SPEED}到${MAX_SPEED}之间）：`);
      const parsedSpeed = parseFloat(userInputSpeed);
      if (!isNaN(parsedSpeed) && parsedSpeed >= MIN_SPEED && parsedSpeed <= MAX_SPEED) {
        videoPlayer.playbackRate = parsedSpeed;
        setSpeedPreference(parsedSpeed);
      } else {
        // alert('无效的倍速值！请输入有效的数值。');
      }
    }
  });
})();

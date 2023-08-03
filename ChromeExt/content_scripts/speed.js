
(function () {
  'use strict';

  const MIN_SPEED = 0.5;
  const MAX_SPEED = 10;
  const SPEED_STEP = 0.25;

  // 获取倍速偏好，如果没有则设置默认值
  const getSpeedPreference = () => {
    const defaultSpeed = 1;
  };

  // 设置倍速偏好
  const setSpeedPreference = (speed) => {
  };

  // 添加键盘快捷键事件监听
  document.addEventListener('keydown', (event) => {
    const videoPlayer = document.querySelector('video');
    if (!videoPlayer) return;

    const currentSpeed = parseFloat(getSpeedPreference());
    // 快捷键: C键，弹出输入框来自定义倍速
    if (event.key === 'c') {
      event.preventDefault();
      const userInputSpeed = prompt(`请输入自定义倍速值（范围在${MIN_SPEED}到${MAX_SPEED}之间）：`);
      const parsedSpeed = parseFloat(userInputSpeed);
      if (!isNaN(parsedSpeed) && parsedSpeed >= MIN_SPEED && parsedSpeed <= MAX_SPEED) {
        videoPlayer.playbackRate = parsedSpeed;
        // setSpeedPreference(parsedSpeed);
      } else {
        // alert('无效的倍速值！请输入有效的数值。');
      }
    }
  });
})();

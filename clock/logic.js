lbjs(document).ready(() => {
  const SPACE = 32;
  const ENTER = 13;

  let minutes = 0;
  let seconds = 0;
  let seperator = false;
  let c_time = c_start;

  let running = false;
  let timer;
  let doubleSpace = false;

  let timerFunc = () => {
    seperator = !seperator;

    seconds++;
    if (c_time > 0) {
      c_time--;
    }
    if (seconds >= 60) {
      seconds = 0;
      minutes++;
    }

    doubleSpace = false;

    app.update(minutes, seconds, c_time, seperator);
  };

  lbjs(document).event('keypress', (e) => {
    switch (e.which) {
      case SPACE:
        if (!running) {
          timer = setInterval(timerFunc, 1000);
          running = true;
        } else if (doubleSpace) {
          doubleSpace = false;
          running = false;
          clearInterval(timer);
        } else {
          doubleSpace = true;
        }
        break;
      case ENTER:
        if (!running) {
          minutes = 0;
          seconds = 0;
          c_time = c_start;
          app.resetClock();
        }
        break;
      default:
        break;
    }
  });

  app.resetClock();
});

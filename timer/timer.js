(() => {
  "use strict";

  const elements = {
    settingsView: document.querySelector("#settingsView"),
    timerView: document.querySelector("#timerView"),
    minutes: document.querySelector("#minutes"),
    minutesOutput: document.querySelector("#minutesOutput"),
    modeInputs: [...document.querySelectorAll('input[name="mode"]')],
    seconds: document.querySelector("#seconds"),
    start: document.querySelector("#startButton"),
    urlNote: document.querySelector("#urlNote"),
    pause: document.querySelector("#pauseButton"),
    reset: document.querySelector("#resetButton"),
    display: document.querySelector("#timerDisplay"),
    modeLabel: document.querySelector("#timerMode"),
    status: document.querySelector("#timerStatus")
  };

  const defaults = { time: 5, mode: "down", seconds: true };
  const initialNavigationSearch = location.search;
  let config = readConfig();
  let startedAt = 0;
  let pausedAt = 0;
  let pausedDuration = 0;
  let animationFrame = 0;
  let running = false;
  let finished = false;
  let audioContext = null;

  function readConfig() {
    const params = new URLSearchParams(location.search);
    const parsedTime = Number.parseInt(params.get("time"), 10);
    return {
      time: Number.isFinite(parsedTime) ? Math.min(60, Math.max(1, parsedTime)) : defaults.time,
      mode: params.get("mode") === "up" ? "up" : defaults.mode,
      seconds: params.get("seconds") !== "off"
    };
  }

  function currentFormConfig() {
    return {
      time: Number(elements.minutes.value),
      mode: elements.modeInputs.find((input) => input.checked)?.value || defaults.mode,
      seconds: elements.seconds.checked
    };
  }

  function writeUrl(nextConfig) {
    const url = new URL(location.href);
    url.search = "";
    url.searchParams.set("time", String(nextConfig.time));
    url.searchParams.set("mode", nextConfig.mode);
    url.searchParams.set("seconds", nextConfig.seconds ? "on" : "off");
    history.replaceState(null, "", url);
    window.ojappRefreshManifest?.();
    return url;
  }

  function canonicalSearch(nextConfig) {
    const params = new URLSearchParams();
    params.set("time", String(nextConfig.time));
    params.set("mode", nextConfig.mode);
    params.set("seconds", nextConfig.seconds ? "on" : "off");
    return `?${params.toString()}`;
  }

  function updatePrimaryAction() {
    const isCommitted = canonicalSearch(config) === initialNavigationSearch;
    elements.start.textContent = isCommitted ? "スタート" : "この設定にする";
    elements.urlNote.textContent = isCommitted
      ? "このURLをホーム画面に追加できます"
      : "設定後、クエリ入りURLへ移動します";
  }

  function syncForm() {
    elements.minutes.value = String(config.time);
    elements.minutesOutput.textContent = `${config.time}分`;
    elements.modeInputs.forEach((input) => { input.checked = input.value === config.mode; });
    elements.seconds.checked = config.seconds;
    writeUrl(config);
    updatePrimaryAction();
  }

  function onSettingChange() {
    config = currentFormConfig();
    elements.minutesOutput.textContent = `${config.time}分`;
    writeUrl(config);
    updatePrimaryAction();
  }

  function initializeAudio() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioContext ||= new AudioContextClass();
    if (audioContext.state === "suspended") audioContext.resume();
  }

  function formatTime(milliseconds) {
    const safeMs = Math.max(0, milliseconds);
    const totalSeconds = config.mode === "down"
      ? Math.ceil(safeMs / 1000)
      : Math.floor(safeMs / 1000);

    if (config.seconds) {
      return String(totalSeconds);
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function elapsedAt(now) {
    const effectiveNow = running ? now : pausedAt;
    return Math.max(0, effectiveNow - startedAt - pausedDuration);
  }

  function render(now = Date.now()) {
    const duration = config.time * 60000;
    const elapsed = Math.min(duration, elapsedAt(now));
    const shown = config.mode === "down" ? duration - elapsed : elapsed;
    elements.display.textContent = formatTime(shown);

    if (elapsed >= duration && !finished) finish();
  }

  function tick() {
    render(Date.now());
    if (running) animationFrame = requestAnimationFrame(tick);
  }

  function startTimer() {
    config = currentFormConfig();
    const configuredUrl = writeUrl(config);

    if (configuredUrl.search !== initialNavigationSearch) {
      location.assign(configuredUrl.href);
      return;
    }

    initializeAudio();
    startedAt = Date.now();
    pausedAt = 0;
    pausedDuration = 0;
    running = true;
    finished = false;
    document.body.classList.remove("finished");
    elements.settingsView.hidden = true;
    elements.timerView.hidden = false;
    elements.display.classList.toggle("seconds-only", config.seconds);
    elements.modeLabel.textContent = `${config.time}分・カウント${config.mode === "down" ? "DOWN" : "UP"}`;
    elements.status.textContent = "計測中";
    elements.pause.textContent = "一時停止";
    tick();
  }

  function togglePause() {
    if (finished) return;
    if (running) {
      running = false;
      pausedAt = Date.now();
      cancelAnimationFrame(animationFrame);
      elements.status.textContent = "一時停止中";
      elements.pause.textContent = "再開";
      render(pausedAt);
    } else {
      pausedDuration += Date.now() - pausedAt;
      running = true;
      elements.status.textContent = "計測中";
      elements.pause.textContent = "一時停止";
      tick();
    }
  }

  function playFinishSound() {
    if (!audioContext) return;
    const now = audioContext.currentTime;
    [0, .22, .44].forEach((delay) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.frequency.value = 880;
      gain.gain.setValueAtTime(.0001, now + delay);
      gain.gain.exponentialRampToValueAtTime(.22, now + delay + .015);
      gain.gain.exponentialRampToValueAtTime(.0001, now + delay + .16);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(now + delay);
      oscillator.stop(now + delay + .18);
    });
  }

  function finish() {
    finished = true;
    running = false;
    cancelAnimationFrame(animationFrame);
    elements.status.textContent = "時間になりました";
    elements.pause.hidden = true;
    document.body.classList.add("finished");
    playFinishSound();
    if (navigator.vibrate) navigator.vibrate([250, 120, 250, 120, 400]);
  }

  function resetTimer() {
    running = false;
    finished = false;
    cancelAnimationFrame(animationFrame);
    document.body.classList.remove("finished");
    elements.pause.hidden = false;
    elements.timerView.hidden = true;
    elements.settingsView.hidden = false;
    config = readConfig();
    syncForm();
  }

  elements.minutes.addEventListener("input", onSettingChange);
  elements.modeInputs.forEach((input) => input.addEventListener("change", onSettingChange));
  elements.seconds.addEventListener("change", onSettingChange);
  elements.start.addEventListener("click", startTimer);
  elements.pause.addEventListener("click", togglePause);
  elements.reset.addEventListener("click", resetTimer);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && !elements.timerView.hidden) render(Date.now());
  });

  syncForm();
})();
